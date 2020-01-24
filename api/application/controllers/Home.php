<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Home extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->baseUrl = $this->config->base_url();

		$this->load->model('FallaciesModel', 'fallacies');
		$this->load->model('TagsModel', 'tags');
		$this->load->model('UsersModel', 'users');
	}

	public function index() {
		/*
		$fallacies = $this->fallacies->getFallacies();
		for ($i=0;$i<count($fallacies);$i++) {
			$id = $fallacies[$i]['id'];
			$title = $fallacies[$i]['title'];
			$name = $fallacies[$i]['fallacy_name'];
			$slug = slugify($title.' '.$name.' logical fallacy');
			echo $slug.'-'.$id.'<br>';

			$this->fallacies->update($id, [
				'slug' => $slug.'-'.$id
			]);
		}
		*/
	}

	public function createArchive() {
		$url = $this->input->post('url');
		if (empty($url)) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'You must include a URL',
			]);
			exit;
		}

		$parse = parseUrl($url);
		if (!$parse) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'This URL cannot be parsed',
			]);
			exit;
		}

		$code = createArchive($url);
		echo json_encode([
			'code' => $code,
			'error' => $code ? false : true
		]);
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
			'q' => null,
			'tag_id' => null
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