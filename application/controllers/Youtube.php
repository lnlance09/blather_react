<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class YouTube extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->load->helper('common_helper');
			$this->load->model('YouTubeModel', 'youtube');
		}

		public function authorize() {
			$url = $this->youtube->getTokenUrl();
			redirect($url, 'redirect');
		}

		public function comment() {
			$id = $this->input->get('id');
			$videoId = $this->input->get('videoId');
			if(!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'You must provide an id'
				]);
				exit;
			}

			$auth = $this->user ? $this->user->linkedYoutube : false;
			$token = $auth ? $this->user->youtubeAccessToken : null;
			$comment = $this->youtube->getCommentExtended($id, $videoId, $auth, $token);
			if($comment['error']) {
				$this->output->set_status_header($comment['code']);
				echo json_encode($comment);
				exit;
			}

			echo json_encode([
				'data' => $comment['data'],
				'is_live_search' => $auth,
				'type' => 'youtube_comment'
			]);
		}

		public function getCommentReplies() {
			if(!($this->user ? $this->user->linkedYoutube : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 101,
					'error' => 'You have not linked your YouTube account'
				]);
				exit;
			}

			$id = $this->input->get('id');
			$replies = $this->youtube->getCommentReplies($id, $this->token, true);
			echo json_encode([
				'error' => false,
				'replies' => $replies,
			]);
		}

		public function getComments() {
			if(!($this->user ? $this->user->linkedYoutube : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 101,
					'error' => 'You have not linked your YouTube account'
				]);
				exit;
			}

			$token = $this->user->youtubeAccessToken;
			$id = $this->input->get('id');
			$page = $this->input->get('page');
			$nextPageToken = $this->input->get('nextPageToken');
			$comments = $this->youtube->getVideoComments($token, $id, null, $nextPageToken, 20);

			if(array_key_exists('error', $comments)) {
				$this->output->set_status_header($comments['error']['code']);
				echo json_encode([
					'code' => $comments['error']['code'],
					'error' => strip_tags($comments['error']['message'])
				]);
				exit;
			}

			$comments['count'] = $comments['pageInfo']['totalResults'];
			echo json_encode([
				'comments' => $comments,
				'error' => false,
				'page' => $page
			]);
		}

		public function insertComment() {

		}

		public function redirect() {
			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must login'
				]);
				exit;
			}

			$linkedYouTube = false;
			$code = $this->input->post('code');
			$data = $this->youtube->GetToken($code);
			$accessToken = $data['access_token'];
			$refreshToken = $data['refresh_token'];
			if($accessToken && $refreshToken) {
				$linkedYouTube = true;
			}

			$data = [];
			$data['linked_youtube'] = $linkedYouTube;
			$this->users->updateUser($this->user->id, $data);

			$data['youtube_access_token'] = $accessToken;
			$data['youtube_refresh_token'] = $refreshToken;
			$data['youtube_date'] = ($linkedYouTube ? date('Y-m-d H:i:s') : null);
			$data['youtube_id'] = null;

			if($linkedYouTube) {
				$info = $this->youtube->getMyInfo($accessToken);
				$channelId = $info['items'][0]['id'];
				$userData = [
					'youtube_id' => $channelId,
					'youtube_access_token' => $accessToken,
					'youtube_refresh_token' => $refreshToken
				];
				$this->users->setYouTubeDetails($this->user->id, $userData);
				$data['youtube_id'] = $channelId;
			}

			echo json_encode($data);
		}

		public function refresh() {
			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => true,
					'errorCode' => 101
				]);
				exit;
			}

			if(!$this->user->linkedYoutube) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => true,
					'errorCode' => 102
				]);
				exit;
			}

			$token = $this->youtube->refreshToken($this->user->youtubeRefreshToken, $this->user->id);
			if(!$token) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => true,
					'errorCode' => 103
				]);
				exit;
			}

			echo json_encode([
				'error' => false,
				'refreshToken' => $token
			]);
		}

		public function remove() {
			if(!($this->user ? $this->user->linkedYoutube : false)) {
				$this->output->set_status_header(401);
				exit;
			}

			$this->users->updateUser($this->user->id, [
				'linked_youtube' => null,
			]);
			echo json_encode([
				'error' => false,
				'youtubeUrl' => $this->youtube->getTokenUrl()
			]);
		}

		public function video() {
			$id = $this->input->get('id');
			if(!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'You must provide an id'
				]);
				exit;
			}

			$auth = $this->user ? $this->user->linkedYoutube : false;
			$token = $auth ? $this->user->youtubeAccessToken : null;
			$video = $this->youtube->getVideoExtended($id, $auth, $token);

			if($video['error']) {
				$this->output->set_status_header($video['code']);
				echo json_encode($video);
				exit;
			}

			$archive = false;
			if($this->user) {
				$archive = $this->users->getArchivedLinks([
					'object_id' => $id,
					'user_id' => $this->user->id
				]);
			}

			echo json_encode([
				'archive' => $archive,
				'data' => $video['data'],
				'is_live_search' => $auth,
				'type' => 'video'
			]);
		}
	}