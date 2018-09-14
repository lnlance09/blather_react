<?php
	if(!defined('BASEPATH')) {
		exit('No direct script access allowed');
	} else {
		class Seo extends CI_Controller {
			public function __construct() {
				parent:: __construct();

				$this->base_url = $this->config->base_url();
				$this->load->model('DiscussionsModel', 'discussions');
				$this->load->model('FacebookModel', 'fb');
				$this->load->model('TwitterModel', 'twitter');
				$this->load->model('YouTubeModel', 'youtube');
			}

			public function index() {
				$fallacies = $this->database->getFeed('all');
				$pages = $this->database->getPages();
				$users = $this->users->getUsers();
				$fbPosts = $this->fb->getPostFromDB(null);
				$twitterPosts = $this->twitter->getTweetFromDB(null);
				$youtubePosts = $this->youtube->getVideoFromDB(null);
				$fallacyList = $this->database->getFallacyNames();

				$this->load->view('sitemap', [
					'fallacies' => $fallacies,
					'fallacyList' => $fallacyList,
					'fbPosts' => $fbPosts,
					'pages' => $pages,
					'twitterPosts' => $twitterPosts,
					'users' => $users,
					'youtubePosts' => $youtubePosts,
				]);
			}
		}
	}
