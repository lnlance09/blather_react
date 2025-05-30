<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Seo extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->base_url = $this->config->base_url();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('DiscussionsModel', 'discussions');
		$this->load->model('FallaciesModel', 'fallacies');
		$this->load->model('TagsModel', 'tags');
		$this->load->model('TwitterModel', 'twitter');
		$this->load->model('UsersModel', 'users');
		$this->load->model('YouTubeModel', 'youtube');
	}

	public function index() {
		$arguments = @file_get_contents('./public/js/blather/src/options/arguments.json');
		$arguments = @json_decode($arguments, true);
		$fallacies = $this->fallacies->getFallacies();
		$fallacyTypes = $this->fallacies->getFallacyTypes();
		$reviews = $this->fallacies->getReviews();
		$tags = $this->tags->getTags();
		$tweets = $this->twitter->getAllTweets();
		$twitterPages = $this->twitter->getAllPages(true);
		$users = $this->users->getUsers();
		$videos = $this->youtube->getAllVideos();
		$youtubePages = $this->youtube->getAllPages(true);

		$this->load->view('sitemap', [
			'arguments' => $arguments,
			'fallacies' => $fallacies,
			'fallacyTypes' => $fallacyTypes,
			'reviews' => $reviews,
			'tags' => $tags,
			'twitterPages' => $twitterPages,
			'users' => $users,
			'youtubePages' => $youtubePages
		]);
	}
}
