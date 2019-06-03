<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Home extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->baseUrl = $this->config->base_url();

			$this->load->model('FallaciesModel', 'fallacies');
			$this->load->model('UsersModel', 'users');
		}

		public function index() {
			
		}

		public function feed() {
			$page = $this->input->get('page');

			$results = null;
			$limit = 10;
			$start = $page*$limit;

			$params = [
				'assigned_by' => null,
				'assigned_to' => null,
				'comment_id' => null,
				'fallacies' => null,
				'fallacy_id' => null,
				'network' => null,
				'object_id' => null,
				'page' => $page,
				'q' => null
			];
			$fallacies = $this->fallacies->search($params);
			$count = $this->fallacies->search($params, true);

			/*
			$archives = $this->users->getArchivedLinks([], false, $page);
			$fallacy_count = $this->users->getArchivedLinks([], false, 0, true);

			$results = array_merge($fallacies, $archives);
			$count = $fallacy_count+$fallacy_count;
			*/

			$pages = ceil($count/$limit);

			/*
			usort($results, function($a, $b) {
				return $b['date_created'] <=> $a['date_created'];
			});
			*/

			echo json_encode([
				'count' => $count,
				'error' => false,
				'hasMore' => $page+1 < $pages,
				'page' => (int)$page,
				'pages' => $pages,
				'results' => !$fallacies ? [] : $fallacies
			]);
		}
	}