<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class YouTube extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->load->helper('common_helper');
			$this->load->model('MediaModel', 'media');
			$this->load->model('YouTubeModel', 'youtube');
		}

		public function archive() {
			$description = $this->input->post('description');
			$end_time = timeToSecs($this->input->post('endTime'));
			$id = $this->input->post('id');
			$start_time = timeToSecs($this->input->post('startTime'));

			if (empty($id)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must include a video id',
				]);
				exit;
			}

			if (empty($description)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must include a description',
				]);
				exit;
			}

			if (strlen($description) > 250) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your description is too long',
				]);
				exit;
			}

			$video = $this->youtube->getVideoExtended($id, false);
			if ($video['error']) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'This video does not exist',
				]);
				exit;
			}


			if ($start_time > $video['data']['duration']) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your start time is incorrect',
				]);
				exit;
			}

			if ($end_time <= 0 || $end_time > $video['data']['duration'] || $end_time <= $start_time) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your end time is incorrect',
				]);
				exit;
			}

			$error = true;
			$data = [];
			if ($this->user) {
				$error = false;
				$data = [
					'description' => $description,
					'end_time' => $end_time,
					'link' => 'https://www.youtube.com/watch?v='.$id,
					'network' => 'youtube',
					'object_id' => $id,
					'page_id' => $video['data']['channel']['db_id'],
					'start_time' => $start_time,
					'user_id' => $this->user->id
				];
				$archive = $this->users->createArchive($data);
			}

			echo json_encode([
				'archive' => $data,
				'error' => $error
			]);
		}

		public function authorize() {
			$url = $this->youtube->getTokenUrl();
			redirect($url, 'redirect');
		}

		public function comment() {
			$id = $this->input->get('id');
			$videoId = $this->input->get('videoId');
			if (!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'You must provide an id'
				]);
				exit;
			}

			$auth = $this->user ? $this->user->linkedYoutube : false;
			$token = $auth ? $this->user->youtubeAccessToken : null;
			$comment = $this->youtube->getCommentExtended($id, $videoId, $auth, $token);
			if ($comment['error']) {
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

		public function download() {
			$id = $this->input->post('id');
			$audio = (int)$this->input->post('audio');
			if (!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'You must provide an id'
				]);
				exit;
			}

			$ext = $audio ? 'mp3' : 'mp4';
			$s3_path = 'youtube_videos/'.$id.'.'.$ext;
			$s3_link = 'https://s3.amazonaws.com/blather22/'.$s3_path;
			if (!$this->media->existsInS3($s3_path)) {
				// download the video
				$video = $this->media->downloadYouTubeVideo($id, $audio);
				// var_dump($video);

				// add to s3
				$this->media->addToS3($s3_path, $video);

				// update the s3 link to the video in the DB
				$this->youtube->insertVideo([
					's3_link' => $s3_link,
					'video_id' => $id
				]);

				// remove locally
				exec('rm '.$video);
			}

			echo json_encode([
				'error' => false,
				's3_link' => $s3_link
			]);
		}

		public function getCommentReplies() {
			if (!($this->user ? $this->user->linkedYoutube : false)) {
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
			if (!($this->user ? $this->user->linkedYoutube : false)) {
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

			if (array_key_exists('error', $comments)) {
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

		public function redirect() {
			$code = $this->input->post('code');
			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must login'
				]);
				exit;
			}

			$linkedYouTube = false;
			$data = $this->youtube->GetToken($code);
			$accessToken = $data['access_token'];
			$refreshToken = $data['refresh_token'];
			if ($accessToken && $refreshToken) {
				$linkedYouTube = true;
			}

			$data = [];
			$data['linked_youtube'] = $linkedYouTube;
			$this->users->updateUser($this->user->id, $data);

			$data['youtube_access_token'] = $accessToken;
			$data['youtube_refresh_token'] = $refreshToken;
			$data['youtube_date'] = ($linkedYouTube ? date('Y-m-d H:i:s') : null);
			$data['youtube_id'] = null;

			if ($linkedYouTube) {
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
			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => true,
					'errorCode' => 101
				]);
				exit;
			}

			if (!$this->user->linkedYoutube) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => true,
					'errorCode' => 102
				]);
				exit;
			}

			$token = $this->youtube->refreshToken($this->user->youtubeRefreshToken, $this->user->id);
			if (!$token) {
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
			if (!($this->user ? $this->user->linkedYoutube : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must link your youtube account'
				]);
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
			if (!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'You must provide an id'
				]);
				exit;
			}

			$auth = $this->user ? $this->user->linkedYoutube : false;
			$token = $auth ? $this->user->youtubeAccessToken : null;

			// get live version
			$video = $this->youtube->getVideoExtended($id, true, $token);
			$exists_on_yt = true;
			$need_to_refresh = false;
			// FormatArray($video);
			// die;

			if ($video['error']) {
				if ($video['code'] === 401) {
					$need_to_refresh = true;
				}

				// get video from db
				$video = $this->youtube->getVideoExtended($id, false, $token);
				$exists_on_yt = false;
			}

			if ($video['error'] && $auth) {
				$this->output->set_status_header($video['code']);
				echo json_encode($video);
				exit;
			}

			$archive = false;
			if ($this->user) {
				$archives = $this->users->getArchivedLinks([
					'object_id' => $id,
					'user_id' => $this->user->id
				]);
			}

			echo json_encode([
				'archives' => empty($archives) ? false : $archives,
				'data' => $video['data'],
				'error' => $video['error'] ? $video['code'] : false,
				'exists_on_yt' => $exists_on_yt,
				'need_to_refresh' => $need_to_refresh && $auth,
				'is_live_search' => $auth,
				'type' => 'video'
			]);
		}
	}