<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Fallacies extends CI_Controller {
	public function __construct() {
		parent:: __construct();
		
		$this->baseUrl = $this->config->base_url();
		$this->imgUrl = $this->baseUrl.'api/public/img/';
		$this->screenshotPath = BASE_PATH.'public/img/screenshots/';

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->library('aws');

		$this->load->model('FallaciesModel', 'fallacies');
		$this->load->model('MediaModel', 'media');
		$this->load->model('TagsModel', 'tags');
		$this->load->model('TwitterModel', 'twitter');
		$this->load->model('UsersModel', 'users');
		$this->load->model('YouTubeModel', 'youtube');
	}

	public function index() {
		$id = $this->input->get('id');
		$user = $this->user;

		$fallacy = $this->fallacies->getFallacy($id);
		validateEmptyField($fallacy, 'This fallacy does not exist', 100, 404, $this->output);

		$archive = false;
		$contradiction_archive = false;
		$similar_count = 0;
		$similar_search_type = 'fallacy_type';

		if ($user) {
			if ($fallacy['ref_id'] == 1) {
				$archive = $this->users->getArchivedLinks([
					'object_id' => $fallacy['media_id'],
					'user_id' => $user->id
				]);
			}

			if ($fallacy['ref_id'] == 2 || $fallacy['ref_id'] == 8) {
				$contradiction_archive = $this->users->getArchivedLinks([
					'object_id' => $fallacy['contradiction_media_id'],
					'user_id' => $user->id
				]);
			}
		}

		$similar_search_type = 'page';
		$similar_count = $this->fallacies->search([
			'assigned_by' => null,
			'assigned_to' => $fallacy['page_id'],
			'comment_id' => null,
			'fallacies' => null,
			'fallacy_id' => null,
			'network' => null,
			'object_id' => null,
			'page' => null,
			'q' => null,
			'tag_id' => null
		], true);

		if ($similar_count < 6) {
			$similar_search_type = 'fallacy_type';
			$similar_count = $this->fallacies->search([
				'assigned_by' => null,
				'assigned_to' => null,
				'comment_id' => null,
				'fallacies' => null,
				'fallacy_id' => $fallacy['fallacy_id'],
				'network' => null,
				'object_id' => null,
				'page' => null,
				'q' => null,
				'tag_id' => null
			], true);
		}

		$this->fallacies->updateViewCount($id);

		echo json_encode([
			'archive' => $archive,
			'contradictionArchive' => $contradiction_archive,
			'error' => !$fallacy,
			'fallacy' => $fallacy,
			'similarCount' => $similar_count,
			'similarSearchType' => $similar_search_type
		]);
	}

	public function assign() {
		$commentId = $this->input->post('commentId');
		$contradiction = $this->input->post('contradiction');
		$endTime = $this->input->post('endTime');
		$explanation = $this->input->post('explanation');
		$fallacyId = $this->input->post('fallacyId');
		$highlightedText = $this->input->post('highlightedText');
		$network = $this->input->post('network');
		$pageId = $this->input->post('pageId');
		$objectId = $this->input->post('objectId');
		$startTime = $this->input->post('startTime');
		$title = $this->input->post('title');

		$user = $this->user;
		$userId = $user ? $user->id : 6;

		$fallacyTypeExists = $this->fallacies->fallacyTypeExists($fallacyId);
		$pageExists = $this->fallacies->pageExists($pageId);

		validateIsTrue($fallacyTypeExists, 'You must specify which kind of fallacy this is', 102, 401, $this->output);
		validateEmptyField($title, 'You must provide a title', 103, 401, $this->output);
		validateEmptyField($explanation, 'You must explain why this is a fallacy', 104, 401, $this->output);
		validateIsTrue($pageExists, 'You must assign this to someone', 104, 401, $this->output);

		if ($user) {
			switch ($network) {
				case 'twitter':
					$tweet = $this->twitter->getTweetExtended($objectId);

					if ($tweet['error']) {
						$token = $user->linkedTwitter ? $user->twitterAccessToken : null;
						$secret = $user->linkedTwitter ? $user->twitterAccessSecret : null;
						$tweet = $this->twitter->getTweetExtended($objectId, true, $token, $secret);

						if ($tweet['error']) {
							$this->output->set_status_header($tweet['code']);
							echo json_encode($tweet);
							exit;
						}
					}

					$pageId = $tweet['data']['user']['id'];
					break;

				case 'youtube':

					break;

			}
		}

		$id = $this->fallacies->assignFallacy(
			$userId,
			$commentId,
			$endTime,
			$explanation,
			$fallacyId,
			$highlightedText,
			$objectId,
			$network,
			$pageId,
			$startTime,
			$title,
			$contradiction
		);

		echo json_encode([
			'error' => false,
			'fallacy' => [
				'assigned_by' => $userId,
				'contradiction' => @json_decode($contradiction),
				'explanation' => strip_tags($explanation),
				'fallacy_id' => $fallacyId,
				'id' => $id,
				'page_id' => $pageId,
				'title' => $title,
				'tweet_id' => $objectId
			]
		]);
	}

	public function createVideo() {
		$id = $this->input->post('id');
		$img = $this->input->post('img');
		$ref_id = (int)$this->input->post('refId');
		$duration = $this->input->post('duration');
		$original = $this->input->post('original');
		$contradiction = $this->input->post('contradiction');
		$fallacy_name = $this->input->post('fallacyName');

		$text = empty($duration) ? $fallacy_name : $duration;
		$video = $this->fallacies->createVideo(
			$id,
			$ref_id,
			$original,
			$contradiction,
			$img,
			$text
		);

		$this->fallacies->update($id, [
			's3_link' => $video['key']
		]);

		echo json_encode([
			'error' => false,
			'video' => $video['src']
		]);
	}

	public function getCommentCount() {
		$id = $this->input->get('id');

		$count = $this->fallacies->getComments($id, null, true);

		echo json_encode([
			'count' => (int)$count
		]);
	}

	public function getComments() {
		$id = $this->input->get('id');
		$page = $this->input->get('page');
		$user = $this->user;

		$count = $this->fallacies->getComments($id, null, null, true);
		$comments = $this->fallacies->getComments($id, $user->id, null, $page);

		$per_page = 10;
		$pages = ceil($count/$per_page);
		$has_more = ($page+1) < $pages ? true : false;

		echo json_encode([
			'comments' => $comments,
			'count' => count($comments),
			'pagination' => [
				'has_more' => $has_more,
				'next_page' => $page+1,
			]
		], true);
	}

	public function getConversation() {
		$id = $this->input->get('id');

		$convo = $this->fallacies->getConversation($id);

		echo json_encode([
			'conversation' => $convo
		]);
	}

	public function getFallacyRefs() {
		$fallacies = $this->fallacies->getFallacyRefs();
		echo json_encode([
			'fallacies' => $fallacies
		]);
	}

	public function getReview() {
		$userId = (int)$this->input->get('userId');
		$pageId = (int)$this->input->get('pageId');
		$review = $this->fallacies->getReview($userId, $pageId, null);

		if (empty($review)) {
			$user = $this->users->userExists($userId);
			$page = $this->fallacies->pageExists($pageId);

			if ($user && $page) {
				$this->fallacies->createReview([
					'page_id' => $pageId,
					'user_id' => $userId
				]);
				$review = $this->fallacies->getReview($userId, $pageId);
			} else {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'The user or page does not exist'
				]);
				exit;
			}
		}

		$params = [
			'assigned_by' => $userId,
			'assigned_to' => $review[0]['social_media_id'],
			'comment_id' => null,
			'fallacies' => null,
			'fallacy_id' => null,
			'network' => null,
			'object_id' => null,
			'page' => null,
			'q' => null,
			'tag_id' => null
		];
		$count = $this->fallacies->search($params, true);
		echo json_encode([
			'fallacyCount' => $count,
			'review' => $review[0]
		]);
	}

	public function getTargets() {
		$id = (int)$this->input->get('id');
		validateEmptyField($id, 'You need to specify a user', 100, 401, $this->output);

		$targets = $this->fallacies->getTargetsData($id);

		echo json_encode([
			'targets' => $targets
		]);
	}

	public function mostFallacious() {
		$results = $this->fallacies->getMostFallacious();

		echo json_encode([
			'results' => $results
		]);
	}

	public function parseUrl() {
		$url = $this->input->post('url');
		$user = $this->user;

		$parse = false;
		if (filter_var($url, FILTER_VALIDATE_URL)) {
			$parse = parseUrl(rawurldecode($url));
		}

		validateIsTrue($parse, 'Please link to a Tweet or a comment or a video on YouTube', 100, 400, $this->output);

		$network = $parse['network'];

		switch ($network) {
			case 'twitter':

				$auth = $user ? $user->linkedTwitter : false;
				if (!$auth) {
					$tokens = $this->users->getDefaultTwitterTokens();
					$token = $tokens->twitter_access_token;
					$secret = $tokens->twitter_access_secret;
				} else {
					$token = $user->twitterAccessToken;
					$secret = $user->twitterAccessSecret;
				}

				$object = $this->twitter->getTweetExtended($parse['object_id'], false, $token, $secret);

				if ($object['error']) {
					$object = $this->twitter->getTweetExtended($parse['object_id'], true, $token, $secret);
				}

				if ($object['error']) {
					$this->output->set_status_header($object['code']);
					echo json_encode($object);
					exit;
				}

				echo json_encode([
					'commentId' => null,
					'data' => !$object['error'] ? $object['data'] : null,
					'error' => $object['error'],
					'endTime' => null,
					'mediaId' => $parse['object_id'],
					'network' => 'twitter',
					'pageId' => !$object['error'] ? $object['data']['user']['id_str'] : null,
					'startTime' => null,
					'type' => 'tweet',
					'username' => !$object['error'] ? $object['data']['user']['screen_name'] : null
				]);
				break;

			case 'youtube':
			case 'youtu.be':

				$auth = $user ? $user->linkedYoutube : false;
				$token = $auth ? $user->youtubeAccessToken : null;
				$commentId = $parse['comment_id'];
				$videoId = $parse['object_id'];
				$startTime = $parse['start_time'];
				$endTime = $parse['end_time'];

				if ($commentId) {
					$type = 'comment';
					$object = $this->youtube->getCommentExtended($commentId, $videoId, $auth, $token);
				} else {
					$type = 'video';
					$object = $this->youtube->getVideoExtended($videoId, $auth, $token);
				}
				
				if ($object['error']) {
					$this->output->set_status_header($object['code']);
					$object['type'] = $type;
					echo json_encode($object);
					exit;
				}

				if ($parse['a']) {
					$archive = $this->youtube->getVideoArchive($parse['a']);
					if ($archive) {
						$endTime = $archive['end_time'];
						$startTime = $archive['start_time'];
					}
				}

				echo json_encode([
					'commentId' => $commentId,
					'data' => $object['data'],
					'error' => $object['error'],
					'endTime' => $endTime,
					'mediaId' => $videoId,
					'network' => 'youtube',
					'pageId' => $type === 'comment' ? $object['data']['commenter']['id'] : $object['data']['channel']['id'],
					'startTime' => $startTime,
					'type' => $type,
					'username' => null
				]);
				break;

			default:

				$this->output->set_status_header(400);
				echo json_encode([
					'error' => 'Please link to a Tweet or a comment or a video on YouTube'
				]);
				break;
		}
	}

	public function postComment() {
		$id = $this->input->post('id');
		$msg = $this->input->post('message');
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($msg, 'Your comment cannot be blank', 100, 401, $this->output);

		$this->fallacies->createComment([
			'created_at' => date('Y-m-d H:i:s'),
			'fallacy_id' => $id,
			'message' => strip_tags($msg),
			'user_id' => $user->id
		]);

		echo json_encode([
			'comment' => [
				'created_at' => date('Y-m-d H:i:s'),
				'img' => $user->img,
				'message' => strip_tags($msg),
				'name' => $user->name,
				'user_id' => $user->id
			],
			'error' => false
		]);
	}

	public function removeTag() {
		$id = $this->input->post('id');
		$tagId = $this->input->post('tagId');
		$user = $this->user;

		$fallacy = $this->fallacies->getFallacy($id);

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($tagId, 'You must include a tag', 100, 401, $this->output);
		validateIsTrue($fallacy, 'This fallacy does not exist', 100, 401, $this->output);
		validateItemsMatch($fallacy['assigned_by'], $user->id, 'You do not have permission to edit this fallacy', 100, 401, $this->output);

		$this->tags->removeTag($id, $tagId, 'fallacy');
		echo json_encode([
			'error' => false
		]);
	}

	public function retractLogic() {
		$id = $this->input->post('id');
		$type = $this->input->post('type');
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($id, 'You must include a fallacy ID', 100, 401, $this->output);

		$pageId = $type == 'twitter' ? $user->twitterId : $user->youtubeId;
		$canRetract = $this->fallacies->canRetract($id, $pageId);
		validateIsTrue($canRetract, 'You do not have permission to retract this logic', 100, 401, $this->output);

		$this->fallacies->update($id, [
			'retracted' => 1
		]);

		echo json_encode([
			'error' => false
		]);
	}

	public function saveScreenshot() {
		$id = $this->input->post('id');
		$img = $this->input->post('img');
		$slug = $this->input->post('slug');

		$imgFile = $slug.'.png';
		$key = 'screenshots/'.$imgFile;

		$this->media->createPicFromData($imgFile, $this->screenshotPath, $img);
		$this->aws->upload($key, $this->screenshotPath.$imgFile);
		$s3Link = S3_PATH.$key;

		$this->fallacies->update($id, [
			's3_link' => $key,
			's3_updated' => date('Y-m-d H:i:s')
		]);
		$this->fallacies->updateViewCount($id);

		echo json_encode([
			'error' => false,
			's3Link' => $s3Link,
			's3Updated' => date('Y-m-d H:i:s')
		]);
	}

	public function search() {
		$shuffle = (int)$this->input->get('shuffle');
		$page = $this->input->get('page');

		$results = null;
		$limit = 10;
		$start = $page*$limit;

		$params = [
			'assigned_by' => $this->input->get('assignedBy'),
			'assigned_to' => $this->input->get('assignedTo'),
			'comment_id' => $this->input->get('commentId'),
			'fallacies' => $this->input->get('fallacies'),
			'exclude' => $this->input->get('exclude'),
			'fallacy_id' => $this->input->get('fallacyId'),
			'network' => $this->input->get('network'),
			'object_id' => $this->input->get('objectId'),
			'page' => $page,
			'q' => trim($this->input->get('q')),
			'sort' => $this->input->get('sort'),
			'tag_id' => trim($this->input->get('tagId'))
		];

		if ($shuffle === 1) {
			$params['shuffle'] = true;
		}

		$count = $this->fallacies->search($params, true);
		$pages = ceil($count/$limit);
		$results = $this->fallacies->search($params);

		echo json_encode([
			'count' => $count,
			'error' => false,
			'hasMore' => $page+1 < $pages,
			'page' => (int)$page,
			'pages' => $pages,
			'results' => !$results ? [] : $results
		]);
	}

	public function submitConversation() {
		$id = $this->input->post('id');
		$msg = $this->input->post('msg');
		$status = (int)$this->input->post('status');
		$user = $this->user;

		$fallacy = $this->fallacies->getFallacy($id);

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateInArray($status, [1,2,3], 'That status is not supported', 100, 401, $this->output);
		validateEmptyField($fallacy, 'This fallacy does not exist', 100, 401, $this->output);
		validateItemsDifferent($fallacy['status'], 2, 'This conversation has ended', 100, 401, $this->output);
		validateItemsDifferent($fallacy['status'], 3, 'This conversation has ended', 100, 401, $this->output);

		$lastPost = $this->fallacies->lastConvoExchange($id);
		if (!$lastPost) {
			validateItemsDifferent($fallacy['assigned_by'], $user->id, 'You cannot have a conversation with yourself', 100, 401, $this->output);
		}

		validateItemsDifferent($lastPost['user_id'], $user->id, 'You have to wait your turn', 100, 401, $this->output);
		validateEmptyField($msg, 'Your response cannot be blank', 100, 401, $this->output);

		$acceptedBy = (int)$fallacy['status'] === 0 ? $user->id : null;
		$this->fallacies->updateStatus($id, $status, $acceptedBy);
		$this->fallacies->submitConversation($id, $user->id, $msg);

		echo json_encode([
			'conversation' => [
				[
					'date_created' => date('Y-m-d H:i:s'),
					'img' => $user->img ? $this->imgUrl.'profile_pics/'.$user->img : null,
					'message' => $msg,
					'name' => $user->name,
					'status' => 1,
					'user_id' => $user->id
				]
			],
			'error' => false
		]);
	}

	public function uniqueFallacies() {
		$id = $this->input->get('id');
		$assigned_by = $this->input->get('assignedBy');
		$type = $this->input->get('type');
		$network = $this->input->get('network');

		validateEmptyField($id, 'You need to specify a page', 100, 401, $this->output);

		$fallacies = $this->fallacies->getUniqueFallacies($id, $assigned_by, $type, $network);

		echo json_encode([
			'fallacies' => $fallacies
		]);
	}

	public function update() {
		$id = (int)$this->input->post('id');
		$contradictionEndTime = $this->input->post('contradictionEndTime');
		$contradictionStartTime = $this->input->post('contradictionStartTime');
		$endTime = $this->input->post('endTime');
		$explanation = $this->input->post('explanation');
		$fallacyId = $this->input->post('fallacyId');
		$startTime = $this->input->post('startTime');
		$tags = $this->input->post('tags');
		$title = $this->input->post('title');
		$user = $this->user;

		$fallacy = $this->fallacies->getFallacy($id);

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($fallacy, 'This fallacy does not exist', 100, 404, $this->output);

		if ($fallacy['assigned_by'] != 6) {
			validateItemsMatch($fallacy['assigned_by'], $user->id, 'You do not have permission to edit this fallacy', 100, 401, $this->output);
		}

		$fallacyName = $this->fallacies->fallacyTypeExists($fallacyId);
		if (!$fallacyName) {
			$fallacyId = $fallacy['fallacy_id'];
			$fallacyName = $fallacy['fallacy_name'];
		}

		$title = empty($title) ? $fallacy['title'] : $title; 
		$explanation = empty($explanation) ? $fallacy['explanation'] : $explanation;
		$startTime = empty($startTime) ? $fallacy['start_time'] : $startTime;
		$endTime = empty($endTime) ? $fallacy['end_time'] : $endTime;
		$contradictionStartTime = empty($contradictionStartTime) ? $fallacy['contradiction_start_time'] : $contradictionStartTime;
		$contradictionEndTime = empty($contradictionEndTime) ? $fallacy['contradiction_end_time'] : $contradictionEndTime;
		$slug = slugify($title.' '.$fallacyName.' logical fallacy');

		$data = [
			'end_time' => $endTime,
			'explanation' => $explanation,
			'fallacy_id' => $fallacyId,
			'last_updated' => date('Y-m-d H:i:s'),
			'slug' => $slug.'-'.$id,
			'start_time' => $startTime,
			'title' => $title
		];
		$this->fallacies->update(
			$id,
			$data,
			$user->id,
			$tags
		);

		$this->fallacies->updateContradiction($id, [
			'end_time' => $contradictionEndTime,
			'start_time' => $contradictionStartTime
		]);

		$fallacy = $this->fallacies->getFallacy($id);

		echo json_encode([
			'error' => false,
			'fallacy' => $fallacy
		]);
	}

	public function updateReview() {
		$id = (int)$this->input->post('id');
		$summary = $this->input->post('summary');
		$sincerity = $this->input->post('sincerity');
		$sincerityExplanation = $this->input->post('sincerityExplanation');
		$turingTest = $this->input->post('turingTest');
		$turingTestExplanation = $this->input->post('turingTestExplanation');
		$user = $this->user;

		$review = $this->fallacies->getReview(null, null, $id, true);

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateEmptyField($review, 'This review does not exist', 100, 401, $this->output);
		validateItemsMatch($review[0]['user_id'], $user->id, 'You cannot edit this review', 100, 401, $this->output);

		$params = [
			'assigned_by' => $review[0]['user_id'],
			'assigned_to' => $review[0]['social_media_id'],
			'comment_id' => null,
			'fallacies' => null,
			'fallacy_id' => null,
			'network' => null,
			'object_id' => null,
			'page' => null,
			'q' => null,
			'tag_id' => null
		];
		$count = $this->fallacies->search($params, true);

		validateGreaterThan($count, 5, 'You must assign at least 5 fallacies first', 100, 401, $this->output);

		if (empty($sincerity) && $sincerity != '0') {
			$sincerity = null;
		}

		if (empty($turingTest) && $turingTest != '0') {
			$turingTest = null;
		}

		$data = [
			'summary' => $summary,
			'sincerity' => $sincerity,
			'sincerity_explanation' => $sincerityExplanation,
			'turing_test' => $turingTest,
			'turing_test_explanation' => $turingTestExplanation
		];
		$this->fallacies->updateReview($id, $data);

		echo json_encode([
			'review' => $data
		]);
	}

	public function uploadBackgroundPic() {
		$this->load->library('upload', [
			'allowed_types' => 'jpg|jpeg|png',
			'file_ext_tolower' => true,
			'max_height' => 0,
			'max_size' => 25000,
			'max_width' => 0,
			'upload_path' => './public/img/backgrounds/'
		]);

		if (!$this->upload->do_upload('file')) {
			$this->output->set_status_header(403);
			$data = $this->upload->display_errors();
			echo json_encode([
				'error' => $data
			]);
			exit;
		} 

		$data = $this->upload->data();
		$file = $data['file_name'];
		$path = $data['full_path'];

		$s3Path = 'backgrounds/'.time().'_'.$file;
		$s3Link = $this->media->addToS3($s3Path, $path);

		echo json_encode([
			'error' => false,
			'img' => $s3Link
		]);
	}

	public function likeComment() {
		$commentId = $this->input->post('commentId');
		$responseId = $this->input->post('responseId');
		$user = $this->user;

		$commentCount = $this->fallacies->getComment($commentId, true);
		$likeCount = $this->fallacies->getCommentLikedBy($commentId, $responseId, $user->id); 

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateItemsMatch($commentCount, 1, 'That comment does not exist', 100, 401, $this->output);
		validateItemsMatch($likeCount, 0, 'You already like that comment', 100, 401, $this->output);

		$this->fallacies->likeComment($commentId, $responseId, $user->id);

		echo json_encode([
			'error' => false
		]);
	}

	public function unlikeComment() {
		$commentId = $this->input->post('commentId');
		$responseId = $this->input->post('responseId');
		$user = $this->user;

		$commentCount = $this->fallacies->getComment($commentId, true);
		$likeCount = $this->fallacies->getCommentLikedBy($commentId, $responseId, $user->id); 

		validateLoggedIn($user, 'You must be logged in', 100, 401, $this->output);
		validateItemsMatch($commentCount, 1, 'That comment does not exist', 100, 401, $this->output);
		validateItemsMatch($likeCount, 1, 'You do not like that comment', 100, 401, $this->output);

		$this->fallacies->unlikeComment($commentId, $responseId, $user->id);

		echo json_encode([
			'error' => false
		]);
	}
}