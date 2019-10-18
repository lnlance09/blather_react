<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Pages extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->base_url = $this->config->base_url();
			$this->load->model('FallaciesModel', 'fallacies');
			$this->load->model('FacebookModel', 'fb');
			$this->load->model('TwitterModel', 'twitter');
			$this->load->model('YouTubeModel', 'youtube');
		}

		public function index() {
			$id = $this->input->get('id');
			$type = $this->input->get('type');

			$networks = ['twitter', 'youtube'];
			if (!$id || !in_array($type, $networks)) {
				$this->output->set_status_header(400);
				echo json_encode([
					'error' => 'This page does not exist',
					'type' => 101
				]);
				exit;
			}

			$user = $this->user;

			switch ($type) {
				case 'twitter':

					$auth = $user ? $user->linkedTwitter : false;
					$token = $auth ? $user->twitterAccessToken : null;
					$secret = $auth ? $user->twitterAccessSecret : null;
					$this->twitter->getPageExtended($id, $auth, $token, $secret);
					$page = $this->twitter->getPageExtended($id, null, $token, $secret);
					break;

				case 'youtube':

					$auth = $user ? $user->linkedYoutube : false;
					$token = $auth ? $user->youtubeAccessToken : null;
					$page = $this->youtube->getPageExtended($id, null, $auth, $token);
					break;
			}

			$review = null;
			$review_placeholder = null;

			if (!$page['error']) {
				$review = $this->fallacies->getReviewStats($page['data']['social_media_id']);
				$review_placeholder = $this->fallacies->getReviewPlaceholder($page['data']['id']);
			}

			$page['review'] = $review;
			$page['review_placeholder'] = $review_placeholder;
			echo json_encode($page);
		}

		public function getFallacyCount() {
			$id = $this->input->get('id');
			$count = $this->fallacies->getFallacyCount($id);
			echo json_encode([
				'count' => (int)$count,
				'error' => false
			]);
		}

		public function getPageByDbId() {
			$id = $this->input->get('id');
			$page = $this->fallacies->getPageByDbId($id);
			echo json_encode([
				'error' => empty($page),
				'page' => $page
			]);
		}

		public function getPagePosts() {
			$id = $this->input->get('id');
			$lastId = $this->input->get('lastId');
			$nextPageToken = $this->input->get('nextPageToken');
			$page = $this->input->get('page');
			$type = $this->input->get('type');

			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Please sign in to view',
					'type' => 101
				]);
				exit;
			}

			switch ($type) {
				case'fb':

					if (!$this->user->linkedFb) {
						$this->output->set_status_header(401);
						echo json_encode([
							'error' => 'You have not linked your Facebook account',
							'type' => 102
						]);
						exit;
					}

					$token = $this->user->fbAccessToken;
					$posts = $this->fb->parsePostsData($id, $token, false);
					echo $posts;
					break;

				case 'twitter':

					if (!$this->user->linkedTwitter) {
						$this->output->set_status_header(401);
						echo json_encode([
							'error' => "You need to link your Twitter account to view this user's tweets.",
							'type' => 103
						]);
						exit;
					}

					$error = false;
					$token = $this->user->twitterAccessToken;
					$secret = $this->user->twitterAccessSecret;
					$data = [
						'count' => 18,
						'exclude_replies' => false,
						'include_rts' => true,
						'max_id' => $lastId,
						'screen_name' => $id,
						'tweet_mode' => 'extended'
					];
					$posts['data'] = $this->twitter->getStatuses($data, $token, $secret);
					$posts['blocked'] = false;

					if (!array_key_exists('errors', $posts['data'])) {
						$count = count($posts['data']);
						$posts['count'] = $count;
						if ($count > 0) {
							$posts['hasMore'] = $count === 18;
							$x = $count > 0 ? $count-1 : 0;
							$posts['lastId'] = $posts['data'][$x]['id'];
						}
					} else {
						$error = true;
						$posts['count'] = 0;
						if ($posts['data']['errors'][0]['code'] == 136) {
							$posts['blocked'] = true;
							$error = "This user has blocked you";
						}
					}
					break;

				case'youtube':

					if (!$this->user->linkedYoutube) {
						$this->output->set_status_header(401);
						echo json_encode([
							'error' => "You need to link your YouTube account to view this user's videos.",
							'type' => 104
						]);
						exit;
					}

					$error = false;
					$token = $this->user->youtubeAccessToken;
					$posts = $this->youtube->getVideos([
						'channelId' => $id,
						'maxResults' => 18,
						'pageToken' => $nextPageToken,
						'order' => 'date',
						'part' => 'id,snippet',
						'type' => 'video'
					], $token, $page, true, true);

					if (!$posts) {
						$error = true;
						$posts = [
							'data' => []
						];
					}
					break;
			}

			echo json_encode([
				'error' => $error,
				'posts' => $posts,
				'page' => $page,
				'token' => $token
			]);
		}

		public function getAllStars() {
			$pages = $this->twitter->getAllStars();

			echo json_encode([
				'error' => false,
				'pages' => $pages
			]);
		}
	}
