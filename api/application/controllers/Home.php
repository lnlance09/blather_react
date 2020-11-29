<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->baseUrl = $this->config->base_url();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('FallaciesModel', 'fallacies');
		$this->load->model('YouTubeModel', 'youtube');
		$this->load->model('TagsModel', 'tags');
		$this->load->model('UsersModel', 'users');
	}

	public function createArchive() {
		$url = $this->input->post('url');

		$parse = parseUrl($url);
		validateIsTrue($parse, 'This URL cannot be parsed', 100, 401, $this->output);

		$code = createArchive($url);

		echo json_encode([
			'code' => $code,
			'error' => $code ? false : true
		]);
	}

	public function feed() {
		$filter = $this->input->get('filter');
		$lastId = $this->input->get('lastId');
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
			'last_id' => $lastId,
			'network' => null,
			'object_id' => null,
			'page' => $page,
			'q' => null,
			'tag_id' => null
		];

		if ($filter === 'newest') {
			$params['sort'] = 'date';
		}

		if ($filter === 'views') {
			$params['sort'] = 'views';
		}

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