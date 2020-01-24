<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Discussions extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->baseUrl = $this->config->base_url();
		$this->imgUrl = $this->baseUrl.'api/public/img/';
		$this->load->helper('common_helper');
		$this->load->model('DiscussionsModel', 'discussions');
		$this->load->model('TagsModel', 'tags');
	}

	public function index() {
		$id = $this->input->get('id');
		$discussion = $this->discussions->getDiscussion($id, false, true, true);
		if(!$discussion['discussion_id']) {
			echo json_encode([
				'error' => true,
				'errorMsg' => 'This discussion does not exist'
			]);
			exit;
		}

		echo json_encode([
			'discussion' => $discussion,
			'error' => false
		]);
	}

	public function accept() {
		if(!$this->user) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'Sign in to update this discussion'
			]);
		}

		$id = $this->input->post('id');
		$acceptance = $this->input->post('acceptance');

		$exists = $this->discussions->getDiscussion($id);
		if(empty($exists)) {
				echo json_encode([
				'error' => true,
				'errorMsg' => 'This discussion does not exist',
				'errorType' => 101
			]);
			exit;
		}

		if($exists['status'] > 0) {
			echo json_encode([
				'error' => true,
				'errorMsg' => 'This conversation is already in progress',
				'errorType' => 106
			]);
			exit;
		}
		
		if(empty($acceptance)) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => true,
				'errorMsg' => "You must explain your opponent's argument",
				'errorType' => 102
			]);
			exit;
		}

		$this->discussions->acceptConvo($id, $acceptance);
		$this->discussions->updateStatus($id, 1, $this->user->id);
		echo json_encode([
			'acceptance' => $acceptance,
			'accepted_by' => [
				'id' => (int)$this->user->id,
				'img' => $this->imgUrl."profile_pics/".$this->user->img,
				'name' => $this->user->name,
				'username' => $this->user->username
			],
			'error' => false,
			'status' => 1
		]);
	}

	public function create() {
		$title = $this->input->post('title');
		$description = $this->input->post('description');
		$extra = $this->input->post('extra');
		$tags = $this->input->post('tags');

		if(!$this->user) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'Sign in to create a discussion'
			]);
		}

		if(empty($title)) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => true,
				'errorMsg' => 'You must provide a title',
				'errorType' => 101
			]);
			exit;
		}

		if(strlen($title) > 250) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => true,
				'errorMsg' => 'Your title is too long',
				'errorType' => 102
			]);
			exit;
		}

		if(empty(strip_tags($description))) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => true,
				'errorMsg' => 'Your must provide evidence',
				'errorType' => 103
			]);
			exit;
		}

		if(empty($extra)) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => true,
				'errorMsg' => 'You must reveal what it would take for you to be proven wrong',
				'errorType' => 104
			]);
			exit;
		}

		$discussion = $this->discussions->createDiscussion($title, $description, $extra, $this->user->id, $tags);
		echo json_encode([
			'discussion' => $discussion,
			'error' => $discussion ? false : true
		]);
	}

	public function getConversation() {
		$id = $this->input->get('id');
		$convo = $this->discussions->getConversation($id);
		echo json_encode([
			'conversation' => $convo
		]);
	}

	public function getUsers() {
		$startedBy = $this->input->get('startedBy');
		$withUser = $this->input->get('withUser');
		$both = $this->input->get('both');
		$img = $this->input->get('img');

		$users = $this->discussions->getDiscussionUsers($startedBy, $withUser, $both, $img);
		echo json_encode([
			'error' => false,
			'users' => $users
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

		$discussion = $this->discussions->getDiscussion($id);
		if(empty($discussion)) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'This discussion does not exist'
			]);
		}

		if($discussion['discussion_created_by'] !== $this->user->id) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'You do not have permission to edit this discussion'
			]);
		}

		$this->tags->removeTag($id, $tagId, 'discussion');
		echo json_encode([
			'error' => false
		]);
	}

	public function search() {
		$page = $this->input->get('page');
		$params = [
			'both' => $this->input->get('both'),
			'by' => $this->input->get('startedBy'),
			'page' => $page,
			'q' => $this->input->get('q'),
			'status' => $this->input->get('status'),
			'tags' => $this->input->get('tags') ? $this->input->get('tags') : true,
			'with' => $this->input->get('withUser')
		];
		$count = $this->discussions->search($params, true);
		$discussions = $this->discussions->search($params);
		echo json_encode([
			'count' => $count,
			'discussions' => $discussions,
			'error' => false,
			'hasMore' => $page < ceil($count/10),
			'page' => (int)$page,
			'pages' => ceil($count/10)
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

		$discussion = $this->discussions->getDiscussion($id, true);
		if(!$discussion) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'This discussion does not exist'
			]);
			exit;
		}

		if((int)$discussion['status'] === 2 || (int)$discussion['status'] === 3) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'This discussion has ended'
			]);
			exit;
		}

		$lastPost = $this->discussions->lastConvoExchange($id);
		if(!$lastPost && (int)$discussion['created_by'] === $this->user->id) {
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

		$accepted_by = (int)$discussion['status'] === 0 ? $this->user->id : null;
		$this->discussions->updateStatus($id, $status, $accepted_by);
		$this->discussions->submitConversation($id, $this->user->id, $msg);
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

	public function update() {
		if(!$this->user) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'Sign in to update this discussion'
			]);
		}

		$id = $this->input->post('id');
		$title = $this->input->post('title');
		$description = $this->input->post('description');
		$extra = $this->input->post('extra');
		$tags = $this->input->post('tags');

		$exists = $this->discussions->getDiscussion($id);
		if(empty($exists)) {
				echo json_encode([
				'error' => true,
				'errorMsg' => 'This discussion does not exist',
				'errorType' => 101
			]);
			exit;
		}

		if($exists['discussion_created_by'] !== $this->user->id) {
			echo json_encode([
				'error' => true,
				'errorMsg' => 'You do not have permission to edit this discussion',
				'errorType' => 106
			]);
			exit;
		}
		
		$title = empty($title) ? $exists['title'] : $title;
		if(strlen($title) > 250) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => true,
				'errorMsg' => 'Your title is too long',
				'errorType' => 102
			]);
			exit;
		}

		$description = empty($description) ? $exists['description'] : $description;
		$extra = empty($extra) ? $exists['extra'] : $extra;
		$this->discussions->updateDiscussion($id, $title, $description, $extra, $this->user->id, $tags);
		$discussion = $this->discussions->getDiscussion($id, false, true, true);
		echo json_encode([
			'error' => $discussion ? false : true,
			'discussion' => $discussion
		]);
	}
}