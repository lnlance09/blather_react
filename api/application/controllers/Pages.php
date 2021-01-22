<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Pages extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->base_url = $this->config->base_url();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('FallaciesModel', 'fallacies');
		$this->load->model('FacebookModel', 'fb');
		$this->load->model('TwitterModel', 'twitter');
		$this->load->model('YouTubeModel', 'youtube');
	}

	public function index() {
		$id = $this->input->get('id');
		$type = $this->input->get('type');
		$user = $this->user;

		$networks = ['twitter', 'youtube'];

		validateEmptyField($id, 'This page does not exist', 101, 400, $this->output);
		validateInArray($type, $networks, 'This page does not exist', 101, 400, $this->output);

		switch ($type) {
			case 'twitter':

				$auth = $user ? $user->linkedTwitter : false;
				$token = $auth ? $user->twitterAccessToken : null;
				$secret = $auth ? $user->twitterAccessSecret : null;
				$this->twitter->getPageExtended($id, $auth, $token, $secret);
				$page = $this->twitter->getPageExtended($id, false, $token, $secret);
				break;

			case 'youtube':

				$auth = $user ? $user->linkedYoutube : false;
				$token = $auth ? $user->youtubeAccessToken : null;
				$page = $this->youtube->getPageExtended($id, false, false, $token);
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
		$user = $this->user;

		validateLoggedIn($user, 'Please sign in to view', 101, 401, $this->output);

		switch ($type) {
			case'fb':

				validateIsTrue($user->linkedFb, 'You have not linked your Facebook account', 102, 401, $this->output);

				$token = $user->fbAccessToken;
				$posts = $this->fb->parsePostsData($id, $token, false);
				echo $posts;
				break;

			case 'twitter':

				validateIsTrue($user->linkedTwitter, 'You have not linked your Facebook account', 103, 401, $this->output);

				$error = false;
				$token = $user->twitterAccessToken;
				$secret = $user->twitterAccessSecret;
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

				validateIsTrue($user->linkedYoutube, 'You have not linked your Facebook account', 104, 401, $this->output);

				$error = false;
				$token = $user->youtubeAccessToken;
				$posts = $this->youtube->getVideos([
					'channelId' => $id,
					'maxResults' => 50,
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
