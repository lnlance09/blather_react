<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Fallacies extends CI_Controller {
		public function __construct() {       
			parent:: __construct();
			
			$this->baseUrl = $this->config->base_url();
			$this->imgUrl = $this->config->img_url();
			$this->load->model('FallaciesModel', 'fallacies');
			$this->load->model('FacebookModel', 'fb');
			$this->load->model('TagsModel', 'tags');
			$this->load->model('TwitterModel', 'twitter');
			$this->load->model('YouTubeModel', 'youtube');
		}

		public function index() {
			$id = $this->input->get('id');
			$fallacy = $this->fallacies->getFallacy($id);
			if(!$fallacy) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'Fallacy not found'
				]);
				exit;
			}

			$this->fallacies->updateViewCount($id);
			echo json_encode([
				'error' => $fallacy['id'] === null,
				'fallacy' => $fallacy
			]);
		}

		public function assign() {
			$commentId = $this->input->post('commentId');
			$contradiction = $this->input->post('contradiction');
			$endTime = $this->input->post('endTime');
			$explanation = $this->input->post('explanation');
			$fallacyId = $this->input->post('fallacyId');
			$network = $this->input->post('network');
			$pageId = $this->input->post('pageId');
			$objectId = $this->input->post('objectId');
			$startTime = $this->input->post('startTime');
			$title = $this->input->post('title');

			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 101,
					'error' => 'You must login' 
				]);
				exit;
			}

			$userId = $this->user->id;
			if(!$this->fallacies->fallacyTypeExists($fallacyId)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 102,
					'error' => 'You must specify which kind of fallacy this is'
				]);
				exit;
			}

			if(empty($title)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 103,
					'error' => 'You must provide a title'
				]);
				exit;
			}

			if(empty($explanation)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'code' => 104,
					'error' => 'You must explain why this is a fallacy'
				]);
				exit;
			}

			switch($network) {
				case'twitter':
					$token = $this->user->linkedTwitter ? $this->user->twitterAccessToken : null;
					$secret = $this->user->linkedTwitter ? $this->user->twitterAccessSecret : null;
					$tweet = $this->twitter->getTweetExtended($objectId, true, $token, $secret);
					if($tweet['error']) {
						$this->output->set_status_header($tweet['code']);
						echo json_encode($tweet);
						exit;
					}

					$pageId = $tweet['data']['user']['id'];
					break;
			}

			$id = $this->fallacies->assignFallacy(
				$userId,
				$commentId,
				$endTime,
				$explanation,
				$fallacyId,
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
					'assigned_by' => $this->user->id,
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
			$perPage = 10;
			$pages = ceil($count/$perPage);
			$hasMore = ($page+1) < $pages ? true : false;

			echo json_encode([
				'comments' => $comments,
				'count' => count($comments),
				'pagination' => [
					'has_more' => $hasMore,
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

		public function insertReference() {
			$this->fallacies->insertFallacyRefs();
		}

		public function parseUrl() {
			$url = $this->input->post('url');
			$parse = false;
			if(filter_var($url, FILTER_VALIDATE_URL)) {
				$parse = parseUrl(rawurldecode($url));
			}

			if(!$parse) {
				$this->output->set_status_header(400);
				echo json_encode([
					'error' => 'Please link to a Tweet or a comment or a video on YouTube'
				]);
				exit;
			}

			switch($parse['network']) {
				case'twitter':
					$auth = $this->user ? $this->user->linkedTwitter : false;
					$token = $auth ? $this->user->twitterAccessToken : null;
					$secret = $auth ? $this->user->twitterAccessSecret : null;
					$object = $this->twitter->getTweetExtended($parse['object_id'], $auth, $token, $secret);

					if($object['error']) {
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

					if($commentId) {
						$type = 'comment';
						$object = $this->youtube->getCommentExtended($commentId, $videoId, $auth, $token);
					} else {
						$type = 'video';
						$object = $this->youtube->getVideoExtended($videoId, $auth, $token);
					}
					
					if($object['error']) {
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

			$fallacy = $this->fallacies->getFallacy($id, true);
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
				'network' => $this->input->get('network'),
				'object_id' => $this->input->get('objectId'),
				'page' => $page,
				'q' => trim($this->input->get('q'))
			];
			$count = $this->fallacies->search($params, true);
			$results = $this->fallacies->search($params);
			echo json_encode([
				'count' => $count,
				'error' => false,
				'hasMore' => $page < ceil($count/$limit),
				'page' => (int)$page,
				'pages' => ceil($count/$limit),
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

			$fallacy = $this->fallacies->getFallacy($id, true);
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
			$type = $this->input->get('type');
			$network = $this->input->get('network');

			if(empty($id)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You need to specify a page'
				]);
				exit;
			}

			$fallacies = $this->fallacies->getUniqueFallacies($id, $type, $network);
			echo json_encode([
				'fallacies' => $fallacies
			]);
		}

		public function update() {
			$id = (int)$this->input->post('id');
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

			$fallacy = $this->fallacies->getFallacy($id, true);
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
			$this->fallacies->updateFallacy($id, $explanation, $fallacyId, $tags, $title, $this->user->id);
			$fallacy = $this->fallacies->getFallacy($id);
			echo json_encode([
				'error' => false,
				'fallacy' => $fallacy
			]);
		}
	}