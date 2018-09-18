<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Discussions extends CI_Controller {
		public function __construct() {       
			parent:: __construct();

			$this->baseUrl = $this->config->base_url();
			$this->load->helper('common_helper');
			$this->load->model('DiscussionsModel', 'discussions');
		}

		public function index() {
			$id = $this->input->get('id');
			$discussion = $this->discussions->getDiscussion($id, false, true, true);
			if(empty($discussion)) {
				echo json_encode([
					'error' => true,
					'errorMsg' => 'This discussion does not exist',
					'errorType' => 101
				]);
				exit;
			}

			echo json_encode([
				'discussion' => $discussion,
				'error' => false
			]);
		}

		public function create() {
			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Sign in to create a discussion'
				]);
			}

			$title = $this->input->post('title');
			$description = $this->input->post('description');
			$extra = $this->input->post('extra');
			$tags = $this->input->post('tags');
			
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

			$discussion = $this->discussions->createDiscussion($title, $description, $extra, 52, $tags);
			echo json_encode([
				'error' => $discussion ? false : true,
				'discussion' => $discussion
			]);
		}

		public function getTags() {
			$tags = $this->discussions->getTags();
			echo json_encode([
				'error' => false,
				'tags' => $tags
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

			$this->discussions->removeTag($id, $tagId);
			echo json_encode([
				'error' => false
			]);
		}

		public function search() {
			$by = $this->input->get('startedBy');
			$page = $this->input->get('page');
			$q = $this->input->get('q');
			$status = $this->input->get('status');
			$tags = $this->input->get('tags');
			$with = $this->input->get('withUser');
			if(!$tags) {
				$tags = true;
			}

			$count = $this->discussions->searchDiscussions($q, $by, $with, $status, $tags, $page, true);
			$discussions = $this->discussions->searchDiscussions($q, $by, $with, $status, $tags, $page);
			echo json_encode([
				'count' => (int)$count,
				'discussions' => $discussions,
				'error' => false,
				'hasMore' => $page < ceil($count/10),
				'page' => (int)$page,
				'pages' => ceil($count/10)
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

			$description = empty($description) ? $exists['description'] : null;
			$extra = empty($extra) ? $exists['extra'] : null;

			$this->discussions->updateDiscussion($id, $title, $description, $extra, $this->user->id, $tags);
			$discussion = $this->discussions->getDiscussion($id, false, true, true);
			echo json_encode([
				'error' => $discussion ? false : true,
				'discussion' => $discussion
			]);
		}
	}
