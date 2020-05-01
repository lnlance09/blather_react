<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class YouTube extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('MediaModel', 'media');
		$this->load->model('YouTubeModel', 'youtube');
	}

	public function archive() {
		$description = $this->input->post('description');
		$end_time = timeToSecs($this->input->post('endTime'));
		$id = $this->input->post('id');
		$start_time = timeToSecs($this->input->post('startTime'));
		$user = $this->user;

		validateEmptyField($id, 'You must include a video id', 100, 401, $this->output);
		validateEmptyField($description, 'You must include a description', 100, 401, $this->output);

		if (strlen($description) > 250) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'Your description is too long',
			]);
			exit;
		}

		$video = $this->youtube->getVideoExtended($id, false);
		validateIsFalse($video['error'], 'This video does not exist', 100, 401, $this->output);

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

		$data = [];
		$error = true;
		$user_id = $user ? $user->id : 6;
		$archive = $this->users->alreadyArchived([
			'end_time' => $end_time,
			'object_id' => $id,
			'start_time' => $start_time,
			'user_id' => $user_id
		]);

		validateIsFalse($archive, 'You have already archived this time frame', 100, 401, $this->output);

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
		$commentId = $this->input->post('commentId');
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($id, 'You must include a video id', 100, 401, $this->output);
		validateEmptyField($commentId, 'You must include a comment id', 100, 401, $this->output);

		$comment = $this->youtube->getCommentFromDB($commentId);
		validateEmptyField($comment, 'This comment does not exist', 100, 401, $this->output);

		$url = 'https://www.youtube.com/watch?v='.$id.'&lc='.$commentId;
		$code = createArchive($url);
		$data = [];

		if ($code) {
			$archive = $this->users->alreadyArchived([
				'comment_id' => $commentId,
				'object_id' => $id,
				'type' => 'comment',
				'user_id' => $user->id
			]);
			validateIsFalse($archive, 'You have already archived this comment', 100, 401, $this->output);

			$commenterId = $comment['commenter']['id'];
			$page = $this->youtube->getPageInfoFromDB($commenter_id);
			validateEmptyField($page, 'Commenter does not exist', 100, 401, $this->output);

			$data = [
				'code' => $code,
				'comment_id' => $commentId,
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
		$user = $this->user;

		validateEmptyField($id, 'You must provide a video id', 100, 401, $this->output);

		if (empty($videoId)) {
			$videoId = null;
		}

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
		$id = $this->input->post('id');
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($id, 'You must provide an id', 100, 401, $this->output);

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
		$id = $this->input->post('id');
		$audio = (int)$this->input->post('audio');

		validateEmptyField($id, 'You must provide an id', 100, 401, $this->output);

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
		$id = $this->input->get('id');
		$user = $this->user;

		$linkedYoutube = $user ? $user->linkedYoutube : false;
		validateIsTrue($linkedYoutube, 'You have not linked your YouTube account', 101, 401, $this->output);

		$replies = $this->youtube->getCommentReplies($id, $this->token, true);

		echo json_encode([
			'error' => false,
			'replies' => $replies
		]);
	}

	public function getComments() {
		$id = $this->input->get('id');
		$page = $this->input->get('page');
		$nextPageToken = $this->input->get('nextPageToken');
		$user = $this->user;

		$linkedYoutube = $user ? $user->linkedYoutube : false;
		validateIsTrue($linkedYoutube, 'You have not linked your YouTube account', 101, 401, $this->output);

		$token = $user->youtubeAccessToken;
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
		$userId = $this->input->get('userId');

		validateEmptyField($id, 'You must provide an id', 100, 401, $this->output);

		$archives = $this->youtube->getVideoArchives($id, $userId);

		echo json_encode([
			'archives' => $archives,
			'error' => false
		]);
	}

	public function redirect() {
		$code = $this->input->post('code');
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);

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

		validateIsTrue($linkedYoutube, 'You have not linked your YouTube account', 101, 401, $this->output);

		$this->users->updateUser($user->id, [
			'linked_youtube' => null,
		]);

		echo json_encode([
			'error' => false,
			'youtubeUrl' => $this->youtube->getTokenUrl()
		]);
	}

	public function searchVideosForText() {
		$q = $this->input->get('q');
		$page = $this->input->get('page');
		$channelId = $this->input->get('channelId');
		$videoId = $this->input->get('videoId');

		$per_page = 50;
		$from = $page*$per_page;

		$results = $this->youtube->searchVideosForTerms($per_page, $from, $q, $channelId, $videoId);
		$results['page'] = (int)$page;

		echo json_encode($results);
	}

	public function translateChannelVideos() {
		ini_set('max_execution_time', 0);

		$channelId = $this->input->get('channelId');
		$token = $this->input->get('token');
		$page = 1;

		/*
		$token = 'ya29.a0Adw1xeU5ba2h49QvaN1QMn4cmt2MdiTKXgAaCIybvdPwQAmE63TfKHXZZkTO9EvGmPp8V1bJzP8QocPDGkVEdfqIB3TZTRtCAxaxkGWMo7fa2bYn_4m64VODcN-w08PUZi9pvX67UFy0gE7RXOY9v4NSCK-GJfiYiFS6qQ';
		$channelId = 'UCG749Dj4V2fKa143f8sE60Q';
		*/

		$videos = $this->insertTranslations($token, $channelId, $page);
		$pages = $videos['pages'];

		for ($i=0;$i<$pages;$i++) {
			if ($videos['hasMore']) {
				$page++;
				echo 'Page: '.$page.'<br><br>';

				$videos = $this->insertTranslations($token, $channelId, $page, $videos['nextPageToken']);
				FormatArray($videos);

				sleep(1);
			} else {
				break;
			}
		}
	}

	private function insertTranslations($access_token, $channel_id, $page, $next_page_token = null) {
		$per_page = 50;
		$posts = $this->youtube->getVideos([
			'channelId' => $channel_id,
			'maxResults' => $per_page,
			'pageToken' => $next_page_token,
			'order' => 'date',
			'part' => 'id,snippet',
			'type' => 'video'
		], $access_token, $page, true, true);

		$nextPageToken = $posts['nextPageToken'];
		$data = $posts['data'];
		$count = $posts['count'];

		if (empty($data)) {
			echo json_encode([
				'error' => 'There are no results'
			]);
			exit;
		}

		$data_count = count($data);
		$hasMore = $data_count >= $per_page;
		$pages = ceil($count/$per_page);

		for ($i=0;$i<$data_count;$i++) {
			$item = $data[$i];
			$channel_title = $item['channelTitle'];
			$date_created = $item['date_created'];
			$description = $item['description'];
			$img = $item['img'];
			$video_id = $item['id'];
			$video_title = $item['title'];

			$captions = $this->youtube->getCaptions($video_id);

			if ($captions) {
				$text = implode(' ', $captions);

				$body = [
					'channel_id' => $channel_id,
					'channel_title' => $channel_title,
					'date_created' => $date_created,
					'description' => $description,
					'img' => $img,
					'text' => $text,
					'video_id' => $video_id,
					'video_title' => $video_title
				];
				$this->elasticsearch->indexDoc(ES_INDEX, $video_id, $body);
			}
		}

		return [
			'hasMore' => $hasMore,
			'nextPageToken' => $nextPageToken,
			'pages' => $pages
		];
	}

	public function video() {
		$id = $this->input->get('id');

		if (substr($id, -1) == '&') {
			$id = rtrim($id, '&');
		}

		validateEmptyField($id, 'You must provide an id', 100, 401, $this->output);

		$existsOnYt = false;
		$video = $this->youtube->getStandardVideoInfo($id);

		if (is_array($video) ? array_key_exists('status', $video) : false) {
			if ($video['status'] == 'ok') {
				$player_response = $video['player_response'];
				$decode = @json_decode($player_response, true);
				$existsOnYt = array_key_exists('videoDetails', $decode);
			}
		}

		if ($existsOnYt) {
			$video_details = $decode['videoDetails'];
			$microformat = $decode['microformat'];

			$channelId = $video_details['channelId'];
			$channelName = $video_details['author'];
			$dateCreated = $microformat['playerMicroformatRenderer']['uploadDate'];
			$description = $video_details['shortDescription'];
			$duration = $video_details['lengthSeconds'];
			$img = $video_details['thumbnail']['thumbnails'][0]['url'];
			$title = $video_details['title'];
			$viewCount = (int)$video_details['viewCount'];

			$this->youtube->insertVideo([
				'channel_id' => $channelId,
				'date_created' => $dateCreated,
				'description' => $description,
				'duration' => $duration,
				'dislike_count' => null,
				'img' => $img,
				'like_count' => null,
				'title' => $title,
				'video_id' => $id,
				'view_count' => $viewCount
			]);

			$this->youtube->insertPage([
				'about' => null,
				'is_verified' => null,
				'name' => $channelName,
				'social_media_id' => $channelId,
				'type' => 'youtube',
				'username' => null
			]);

			$data = [
				'channel' => [
					'about' => null,
					'db_id' => null,
					'id' => $channelId,
					'img' => null,
					'title' => $channelName
				],
				'date_created' => $dateCreated,
				'description' => $description,
				'duration' => $duration,
				'id' => $id,
				'img' => $img,
				's3_link' => null,
				'stats' => [
					'commentCount' => 0,
					'dislikeCount' => null,
					'likeCount' => null,
					'likePct' => null,
					'viewCount' => $viewCount
				],
				'title' => $title
			];
		} else {
			$data = $this->youtube->getVideoFromDB($id);
			if (!$data) {
				$this->output->set_status_header(404);
				echo json_encode([
					'code' => 404,
					'error' => true
				]);
				exit;
			}
		}

		$transcript = '';
		$captions = $this->youtube->searchVideosForTerms(null, null, null, null, $id);

		if ($captions['hits']['total']['value'] == 1) {
			$transcript = $captions['hits']['hits'][0]['_source']['text'];
		} else {
			$captions = $this->youtube->getCaptions($id);

			if ($captions) {
				$transcript = implode(' ', $captions);
				$body = [
					'channel_id' => $channelId,
					'channel_title' => $title,
					'date_created' => $dateCreated,
					'description' => $description,
					'img' => $img,
					'text' => $transcript,
					'video_id' => $id,
					'video_title' => $title
				];
				$this->elasticsearch->indexDoc(ES_INDEX, $id, $body);
			}
		}

		echo json_encode([
			'archives' => [],
			'code' => 200,
			'data' => $data,
			'error' => false,
			'exists_on_yt' => $existsOnYt,
			'transcript' => $transcript,
			'type' => 'video'
		]);
	}
}