<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Fb extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->baseUrl = $this->config->base_url();
			$this->imgUrl = $this->baseUrl.'api/public/img/';
			$this->load->helper('common_helper');
			$this->load->model('DiscussionsModel', 'discussions');
			$this->load->model('FacebookModel', 'fb');
			$this->load->model('TwitterModel', 'twitter');
			$this->load->model('YouTubeModel', 'youtube');
		}

		public function getCommentFallacies() {
			if(!$this->user) {
				$this->output->set_status_header(401);
				exit;
			}

			$commentId = $this->input->get('comment_id');
			$page = $this->input->get('page');
			$statusId = $this->input->get('status_id');
			$type = $this->input->get('type');

			$data = [
				'fb_comment_fallacies.comment_id' => $commentId,
				'fb_comment_fallacies.media_id' => $statusId,
			];

			if($type === 'count') {
				$already = $this->fb->getCommentFallacyCount($data);
				echo json_encode([
					'count' => $already,
				]);
			} 

			if($type === 'fallacies') {
				$count = $this->fb->getCommentFallacyCount($data);	
				$perPage = 10;
				$pages = ceil($count/$perPage);
				$start = $page*$perPage;
				if(($page+1) == $pages) {
					$end = $count;
					$hasMore = false;
				} else {
					$end = $start+$perPage;
					$hasMore = true;
				}

				$fallacies = $this->fb->getCommentFallacies($data, true);	
				echo json_encode([
					'count' => count($fallacies),
					'fallacies' => $fallacies,
					'pagination' => [
						'end' => $end,
						'hasMore' => $hasMore,
						'nextPage' => $page+1,
						'page' => $page,
						'start' => $start,
					],
				]);
			}
		}

		public function getCredentials() {
			$code = $this->input->post('code');

			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'you must be logged in'
				]);
				exit;
			}

			if(empty($code)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'you must include a code to get an access token'
				]);
				exit;
			}

			$token = $this->fb->getAccessToken($code);
			if(empty($token)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'cannot get a token with that code'
				]);
				exit;
			}

			$user = $this->fb->getMyInfo($token);
			if(empty($token)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'your facebook profile cannot be parsed'
				]);
				exit;
			}

			$data['linked_fb'] = 1;
			$this->users->updateUser($this->user->id, $data);
			$data['fb_access_token'] = $token;
			$data['fb_date'] = date('Y-m-d H:i:s');
			$data['fb_id'] = $user['id'];

			$this->users->setFbDetails($this->user->id, [
				'fb_access_token' => $token,
				'fb_id' => $user['id'],
				'user_id' => $this->user->id
			]);

			echo json_encode($data);
		}

		public function getReplies() {
			if(!$this->user->linkedFb) {
				$this->output->set_status_header(401);
				exit;
			}

			$commentId = $this->input->get('comment_id');
			$statusId = $this->input->get('status_id');
			$token = $this->session->fb_access_token;
			$id = $statusId.'_'.$commentId;

			$comments = $this->fb->getComments($id, $token, 100);
			echo json_encode([
				'comments' => $comments,
				'fallacies' => $this->database->getFallacyNames(),
			]);
		}

		public function nextCommentsPage() {
			if(!$this->user->linkedFb) {
				$this->output->set_status_header(401);
				exit;
			}

			$url = $this->input->post('url');
			$data = $this->fb->getCommentsLink($url);
			$comments = @json_decode($data, true);

			echo json_encode([
				'comments' => $comments
			]);
		}

		public function nextPostsPage() {
			if(!$this->user->linkedFb) {
				$this->output->set_status_header(401);
				exit;
			}

			$url = $this->input->post('url');
			$posts = $this->fb->parsePostsData(false, false, $url);
			echo json_encode($posts);
		}

		public function remove() {
			if(!$this->user ? $this->user->linkedFb : false) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must link your fb account'
				]);
				exit;
			}

			$this->users->updateUser($this->user->id, [
				'linked_fb' => 0
			]);
			echo json_encode([
				'success' => true,
				'fbAccessToken' => null,
				'fbUrl' => $this->fb->loginUrl()
			]);
		}

		public function search() {
			if(!$this->user->linkedFb) {
				$this->output->set_status_header(401);
				exit;
			}

			$q = $this->input->get('q');
			$data = $this->fb->searchPages($q, $session->fb_access_token);
			if(array_key_exists('error', $data)) {
				echo 'refresh';
			} else {
				echo json_encode($data);
			}
		}

		public function status() {
			$id = $this->input->get('id');
			if(!$userId || !$userData->data->linkedFb) {
				$this->output->set_status_header(401);
				exit;
			}

			if(empty($id)) {
				$this->output->set_status_header(404);
				exit;
			}

			$mediaId = parseCommentStr($id);
			if($this->auth && $this->user->linkedFb) {
				$post = $this->fb->getPostInfo($this->user->fbAccessToken, $id);
				if(!$post) {
					$this->output->set_status_header(403);
					exit;
				}

				$this->fb->insertPost($post);
				$page = $this->fb->getPageInfo($post['page']['id'], $token);
				$page['is_user'] = false;
				$post['page']['username'] = (array_key_exists('username', $page) ? $page['username'] : null);
				$post['page']['picture'] = $page['picture']['data']['url'];
				$this->fb->updatePageInfo($page);
			} else {
				$post = $this->fb->getPostFromDB($mediaId);
				if(!$post) {
					$this->output->set_status_header(403);
					exit;
				}

				$post['post']['comments'] = null; 
			}

			$fallacyCount = $this->fb->getPageFallacyCount([
				'fb_page_fallacies.media_id' => $mediaId,
			]);

			echo json_encode([
				'fallacyCount' => $fallacyCount,
				'page' => $post['page'],
				'post' => $post['post'],
			]);
		}
	}