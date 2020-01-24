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

		$user = $this->user;
		$data = [];
		$error = true;
		$user_id = $user ? $user->id : 6;
		$archive = $this->users->alreadyArchived([
			'end_time' => $end_time,
			'object_id' => $id,
			'start_time' => $start_time,
			'user_id' => $user_id
		]);

		if ($archive) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'You have already archived this time frame',
			]);
			exit;
		}

		$error = false;

		$output_file = 'youtube_videos/'.$id.'_'.$start_time.'_'.$end_time.'.mp4';
		$data = [
			'code' => null,
			'description' => $description,
			'end_time' => $end_time,
			'link' => 'https://www.youtube.com/watch?v='.$id,
			'network' => 'youtube',
			'object_id' => $id,
			'page_id' => $video['data']['channel']['db_id'],
			's3_link' => $output_file,
			'start_time' => $start_time,
			'type' => 'video',
			'user_id' => $user_id
		];
		$archive = $this->users->createArchive($data);
		$data['id'] = $this->users->alreadyArchived($data, true);
		$data['s3_link'] = S3_PATH.$output_file;

		echo json_encode([
			'archive' => $data,
			'error' => $error
		]);
	}

	public function archiveComment() {
		$id = $this->input->post('id');
		$comment_id = $this->input->post('commentId');

		if (empty($id)) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'You must include a video id',
			]);
			exit;
		}

		if (empty($comment_id)) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'You must include a comment id',
			]);
			exit;
		}

		$comment = $this->youtube->getCommentFromDB($comment_id);
		if (!$comment) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'This comment does not exist',
			]);
			exit;
		}

		$user = $this->user;
		if (!$user) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'You must login',
			]);
			exit;
		}

		$url = 'https://www.youtube.com/watch?v='.$id.'&lc='.$comment_id;
		$code = createArchive($url);
		$data = [];
		if ($code) {
			$archive = $this->users->alreadyArchived([
				'comment_id' => $comment_id,
				'object_id' => $id,
				'type' => 'comment',
				'user_id' => $user->id
			]);

			if ($archive) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You have already archived this comment',
				]);
				exit;
			}


			$commenter_id = $comment['commenter']['id'];
			$page = $this->youtube->getPageInfoFromDB($commenter_id);
			if (!$page) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You commenter does not exist',
				]);
				exit;
			}

			$data = [
				'code' => $code,
				'comment_id' => $comment_id,
				'link' => $url,
				'network' => 'youtube',
				'object_id' => $id,
				'page_id' => $page['id'],
				'type' => 'comment',
				'user_id' => $user->id
			];
			$this->users->createArchive($data);
		}
		echo json_encode([
			'archive' => $data,
			'error' => false
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

		if (empty($videoId)) {
			$videoId = null;
		}

		$user = $this->user;
		$auth = $user ? $user->linkedYoutube : false;
		$token = $auth ? $this->user->youtubeAccessToken : null;

		// See if the comment exists in the DB first
		$comment = $this->youtube->getCommentExtended($id, $videoId);

		if ($comment['error'] && $auth) {
			$comment = $this->youtube->getCommentExtended($id, $videoId, true, $token);
		}

		if ($comment['error']) {
			$this->output->set_status_header($comment['code']);
			echo json_encode($comment);
			exit;
		}

		$archive = null;
		if ($user) {
			$archive = $this->users->getArchivedLinks([
				'a.comment_id' => $id,
				'user_id' => $user->id
			]);
		}

		echo json_encode([
			'archive' => $archive,
			'data' => $comment['data'],
			'is_live_search' => $auth,
			'type' => 'comment'
		]);
	}

	public function deleteArchive() {
		$user = $this->user;
		$id = $this->input->post('id');

		if (!$id) {
			$this->output->set_status_header(404);
			echo json_encode([
				'error' => 'You must provide an id'
			]);
			exit;
		}

		if (!$user) {
			$this->output->set_status_header(404);
			echo json_encode([
				'error' => 'You must be logged in'
			]);
			exit;
		}

		$archive = $this->users->alreadyArchived([
			'id' => $id,
			'user_id' => $user->id
		]);

		if ($archive) {
			$this->users->deleteArchive($id);
		}

		echo json_encode([
			'error' => false,
			'id' => $id
		]);
	}

	public function download() {
		header("Access-Control-Allow-Origin: *");
		header("Access-Control-Allow-Headers: origin, content-type, accept, authorization");
		header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD");

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
		$key = 'youtube_videos/'.$id.'.'.$ext;
		$video = $this->media->downloadYouTubeVideo($id, $audio);
		$s3Link = $this->media->addToS3($key, $video);
		$this->youtube->insertVideo([
			's3_link' => $key,
			'video_id' => $id
		]);

		echo json_encode([
			'error' => false,
			's3_link' => $s3Link
		]);
	}

	public function getCommentReplies() {
		$user = $this->user;
		$linkedYoutube = $user ? $user->linkedYoutube : false;
		if (!$linkedYoutube) {
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
		$user = $this->user;
		$linkedYoutube = $user ? $user->linkedYoutube : false;
		if (!$linkedYoutube) {
			$this->output->set_status_header(401);
			echo json_encode([
				'code' => 101,
				'error' => 'You have not linked your YouTube account'
			]);
			exit;
		}

		$token = $user->youtubeAccessToken;
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

	public function getVideoArchives() {
		$id = $this->input->get('id');
		$user_id = $this->input->get('userId');

		if (!$id) {
			$this->output->set_status_header(404);
			echo json_encode([
				'error' => 'You must provide an id'
			]);
			exit;
		}

		$archives = $this->youtube->getVideoArchives($id, $user_id);
		echo json_encode([
			'archives' => $archives,
			'error' => false
		]);
	}

	public function redirect() {
		$user = $this->user;
		$code = $this->input->post('code');
		if (!$user) {
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
		$this->users->updateUser($user->id, $data);

		$data['youtube_access_token'] = $accessToken;
		$data['youtube_refresh_token'] = $refreshToken;
		$data['youtube_date'] = $linkedYouTube ? date('Y-m-d H:i:s') : null;
		$data['youtube_id'] = null;

		if ($linkedYouTube) {
			$info = $this->youtube->getMyInfo($accessToken);
			$channelId = $info['items'][0]['id'];
			$userData = [
				'youtube_id' => $channelId,
				'youtube_access_token' => $accessToken,
				'youtube_refresh_token' => $refreshToken
			];
			$this->users->setYouTubeDetails($user->id, $userData);
			$data['youtube_id'] = $channelId;
		}

		echo json_encode($data);
	}

	public function refresh() {
		$user = $this->user;
		if (!$user) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => true,
				'errorCode' => 101
			]);
			exit;
		}

		if (!$user->linkedYoutube) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => true,
				'errorCode' => 102
			]);
			exit;
		}

		$token = $this->youtube->refreshToken($user->youtubeRefreshToken, $user->id);
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
		$user = $this->user;
		$linkedYoutube = $user ? $user->linkedYoutube : false;
		if (!$linkedYoutube) {
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
		if (substr($id, -1) == '&') {
			$id = rtrim($id, '&');
		}

		if (!$id) {
			$this->output->set_status_header(404);
			echo json_encode([
				'error' => 'You must provide an id'
			]);
			exit;
		}

		$user = $this->user;
		$auth = $user ? $user->linkedYoutube : false;
		$token = $auth ? $user->youtubeAccessToken : null;
		$exists_on_yt = true;
		$need_to_refresh = false;

		if ($auth) {
			$video = $this->youtube->getVideoExtended($id, true, $token);
			if ($video['error']) {
				if ($video['code'] === 401) {
					$exists_on_yt = false;
					$need_to_refresh = true;
				} else {
					// get video from db
					$video = $this->youtube->getVideoExtended($id, false);
					$exists_on_yt = false;
				}
			}
		} else {
			$video = $this->youtube->getVideoExtended($id, false);
			$exists_on_yt = false;
		}

		if ($video['error']) {
			$this->output->set_status_header($video['code']);
		}

		$archives = [];
		if (!$video['error']) {
			$archives = $this->youtube->getVideoArchives($id);
		}

		echo json_encode([
			'archives' => $archives,
			'code' => $video['error'] ? $video['code'] : 0,
			'data' => !$video['error'] ? $video['data'] : [],
			'error' => $video['error'] ? true : false,
			'exists_on_yt' => $exists_on_yt,
			'is_live_search' => $auth,
			'need_to_refresh' => $need_to_refresh && $auth,
			'type' => 'video'
		]);
	}
}