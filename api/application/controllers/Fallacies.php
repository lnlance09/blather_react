<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Fallacies extends CI_Controller {
		public function __construct() {
			parent:: __construct();
			
			$this->baseUrl = $this->config->base_url();
			$this->imgUrl = $this->baseUrl.'api/public/img/';

			$this->load->model('FallaciesModel', 'fallacies');
			$this->load->model('MediaModel', 'media');
			$this->load->model('TagsModel', 'tags');
			$this->load->model('TwitterModel', 'twitter');
			$this->load->model('UsersModel', 'users');
			$this->load->model('YouTubeModel', 'youtube');

			$this->load->helper('common_helper');
		}

		public function index() {
			$id = $this->input->get('id');
			$fallacy = $this->fallacies->getFallacy($id);

			$user = $this->user;
			$archive = false;
			$contradiction_archive = false;
			$similar_count = 0;

			if ($user && $fallacy) {
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

			if ($fallacy) {
				$similar_count = $this->fallacies->search([
					'assigned_by' => null,
					'assigned_to' => null,
					'comment_id' => null,
					'fallacies' => null,
					'fallacy_id' => $fallacy['fallacy_id'],
					'network' => null,
					'object_id' => null,
					'page' => null,
					'q' => null
				], true);
				$this->fallacies->updateViewCount($id);
			}

			if (!$fallacy) {
				$this->output->set_status_header(404);
			}

			echo json_encode([
				'archive' => $archive,
				'contradictionArchive' => $contradiction_archive,
				'error' => !$fallacy,
				'fallacy' => $fallacy,
				'similarCount' => $similar_count
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

			if (!$this->fallacies->fallacyTypeExists($fallacyId)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 102,
					'error' => 'You must specify which kind of fallacy this is'
				]);
				exit;
			}

			if (empty($title)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 103,
					'error' => 'You must provide a title'
				]);
				exit;
			}

			if (empty($explanation)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 104,
					'error' => 'You must explain why this is a fallacy'
				]);
				exit;
			}

			if ($this->user) {
				switch ($network) {
					case'twitter':
						$token = $user->linkedTwitter ? $user->twitterAccessToken : null;
						$secret = $user->linkedTwitter ? $user->twitterAccessSecret : null;
						$tweet = $this->twitter->getTweetExtended($objectId, true, $token, $secret);
						if ($tweet['error']) {
							$this->output->set_status_header($tweet['code']);
							echo json_encode($tweet);
							exit;
						}

						$pageId = $tweet['data']['user']['id'];
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
			$ref_id = $this->input->post('refId');
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

			$count = $this->fallacies->getComments($id, null, true);
			$comments = $this->fallacies->getComments($id, $page);
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

		public function getReview() {
			$userId = (int)$this->input->get('userId');
			$pageId = (int)$this->input->get('pageId');
			$review = $this->fallacies->getReview($userId, $pageId, null);

			if(empty($review)) {
				$user = $this->users->userExists($userId);
				$page = $this->fallacies->pageExists($pageId);

				if($user && $page) {
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
				'q' => null
			];
			$count = $this->fallacies->search($params, true);
			echo json_encode([
				'fallacyCount' => $count,
				'review' => $review[0]
			]);
		}

		public function getTargets() {
			$id = (int)$this->input->get('id');
			$include_data = $this->input->get('include_data');

			if (empty($id)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You need to specify a user'
				]);
				exit;
			}

			$targets = $this->fallacies->getTargetsData($id);
			echo json_encode([
				'targets' => $targets
			]);
		}

		public function insertReference() {
			$this->fallacies->insertFallacyRefs();
		}

		public function mostFallacious() {
			$results = $this->fallacies->getMostFallacious();
			echo json_encode([
				'results' => $results
			]);
		}

		public function parseUrl() {
			$url = $this->input->post('url');
			$parse = false;
			if (filter_var($url, FILTER_VALIDATE_URL)) {
				$parse = parseUrl(rawurldecode($url));
			}

			if (!$parse) {
				$this->output->set_status_header(400);
				echo json_encode([
					'error' => 'Please link to a Tweet or a comment or a video on YouTube'
				]);
				exit;
			}

			switch ($parse['network']) {
				case'twitter':
					$auth = $this->user ? $this->user->linkedTwitter : false;
					if (!$auth) {
						$tokens = $this->users->getDefaultTwitterTokens();
						$token = $tokens->twitter_access_token;
						$secret = $tokens->twitter_access_secret;
					} else {
						$token = $this->user->twitterAccessToken;
						$secret = $this->user->twitterAccessSecret;
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
				case'youtube':
				case'youtu.be':
					$auth = $this->user ? $this->user->linkedYoutube : false;
					$token = $auth ? $this->user->youtubeAccessToken : null;
					$commentId = $parse['comment_id'];
					$videoId = $parse['object_id'];

					if ($commentId) {
						$type = 'comment';
						$object = $this->youtube->getCommentExtended($commentId, $videoId, $auth, $token);
					} else {
						$type = 'video';
						$object = $this->youtube->getVideoExtended($videoId, $auth, $token);
					}
					
					if ($object['error']) {
						$this->output->set_status_header($object['code']);
						echo json_encode($object);
						exit;
					}

					echo json_encode([
						'commentId' => $commentId,
						'data' => $object['data'],
						'error' => $object['error'],
						'endTime' => $parse['end_time'],
						'mediaId' => $videoId,
						'network' => 'youtube',
						'pageId' => $type === 'comment' ? $object['data']['commenter']['id'] : $object['data']['channel']['id'],
						'startTime' => $parse['start_time'],
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

			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in'
				]);
				exit;
			}

			$data = [
				'created_at' => date('Y-m-d H:i:s'),
				'fallacy_id' => $id,
				'message' => strip_tags($msg),
				'user_id' => $this->user->id
			];
			$this->fallacies->createComment($data);
			echo json_encode([
				'comment' => [
					'created_at' => date('Y-m-d H:i:s'),
					'img' => $this->user->img,
					'message' => strip_tags($msg),
					'name' => $this->user->name,
					'user_id' => $this->user->id
				],
				'error' => false
			]);
		}

		public function removeTag() {
			$id = $this->input->post('id');
			$tagId = $this->input->post('tagId');

			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in'
				]);
				exit;
			}

			if(empty($tagId)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must include a tag'
				]);
			}

			$fallacy = $this->fallacies->getFallacy($id);
			if(!$fallacy) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'This fallacy does not exist'
				]);
			}

			if($fallacy['assigned_by'] !== $this->user->id) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You do not have permission to edit this fallacy'
				]);
			}

			$this->tags->removeTag($id, $tagId, 'fallacy');
			echo json_encode([
				'error' => false
			]);
		}

		public function search() {
			$page = $this->input->get('page');
			$results = null;
			$limit = 10;
			$start = $page*$limit;

			$params = [
				'assigned_by' => $this->input->get('assignedBy'),
				'assigned_to' => $this->input->get('assignedTo'),
				'comment_id' => $this->input->get('commentId'),
				'fallacies' => $this->input->get('fallacies'),
				'fallacy_id' => $this->input->get('fallacyId'),
				'network' => $this->input->get('network'),
				'object_id' => $this->input->get('objectId'),
				'page' => $page,
				'q' => trim($this->input->get('q'))
			];
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

			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in'
				]);
				exit;
			}

			if(!in_array($status, [1,2,3])) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'That status is not supported'
				]);
				exit;
			}

			$fallacy = $this->fallacies->getFallacy($id);
			if(!$fallacy) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'This fallacy does not exist'
				]);
				exit;
			}

			if((int)$fallacy['status'] === 2 || (int)$fallacy['status'] === 3) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'This conversation has ended'
				]);
				exit;
			}

			$lastPost = $this->fallacies->lastConvoExchange($id);
			if(!$lastPost && (int)$fallacy['assigned_by'] === $this->user->id) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You cannot have a conversation with yourself'
				]);
				exit;
			}

			if((int)$lastPost['user_id'] === $this->user->id) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You have to wait your turn'
				]);
				exit;
			}

			if(empty($msg)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your response cannot be blank'
				]);
				exit;
			}

			$accepted_by = (int)$fallacy['status'] === 0 ? $this->user->id : null;
			$this->fallacies->updateStatus($id, $status, $accepted_by);
			$this->fallacies->submitConversation($id, $this->user->id, $msg);
			echo json_encode([
				'conversation' => [
					[
						'date_created' => date('Y-m-d H:i:s'),
						'img' => $this->user->img ? $this->imgUrl.'profile_pics/'.$this->user->img : null,
						'message' => $msg,
						'name' => $this->user->name,
						'status' => 1,
						'user_id' => $this->user->id
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

			if(empty($id)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You need to specify a page'
				]);
				exit;
			}

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

			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You are not logged in'
				]);
				exit;
			}

			$fallacy = $this->fallacies->getFallacy($id);
			if(!$fallacy) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'This fallacy does not exist'
				]);
				exit;
			}

			if($fallacy['assigned_by'] !== $this->user->id) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You do not have permission to edit this fallacy'
				]);
				exit;
			}

			$fallacyId = !$this->fallacies->fallacyTypeExists($fallacyId) ? $fallacy['fallacy_id'] : $fallacyId;
			$title = empty($title) ? $fallacy['title'] : $title; 
			$explanation = empty($explanation) ? $fallacy['explanation'] : $explanation;
			$startTime = empty($startTime) ? $fallacy['start_time'] : $startTime;
			$endTime = empty($endTime) ? $fallacy['end_time'] : $endTime;
			$contradictionStartTime = empty($contradictionStartTime) ? $fallacy['contradiction_start_time'] : $contradictionStartTime;
			$contradictionEndTime = empty($contradictionEndTime) ? $fallacy['contradiction_end_time'] : $contradictionEndTime;

			$data = [
				'end_time' => $endTime,
				'explanation' => $explanation,
				'fallacy_id' => $fallacyId,
				'last_updated' => date('Y-m-d H:i:s'),
				'start_time' => $startTime,
				'title' => $title
			];
			$this->fallacies->update(
				$id,
				$data,
				$this->user->id,
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

			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You are not logged in'
				]);
				exit;
			}

			$review = $this->fallacies->getReview(null, null, $id, true);
			if (empty($review)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'This review does not exist'
				]);
				exit;
			}

			if ($review[0]['user_id'] != $this->user->id) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You cannot edit this review'
				]);
				exit;
			}

			$params = [
				'assigned_by' => $review[0]['user_id'],
				'assigned_to' => $review[0]['social_media_id'],
				'comment_id' => null,
				'fallacies' => null,
				'fallacy_id' => null,
				'network' => null,
				'object_id' => null,
				'page' => null,
				'q' => null
			];
			$count = $this->fallacies->search($params, true);
			if ($count < 5) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must assign at least 5 fallacies first'
				]);
				exit;
			}

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
	}