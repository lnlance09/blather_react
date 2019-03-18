<?php
	if(!defined('BASEPATH')) {
		exit('No direct script access allowed');
	} else {
		class Seo extends CI_Controller {
			public function __construct() {
				parent:: __construct();

				$this->base_url = $this->config->base_url();
				$this->load->model('DiscussionsModel', 'discussions');
				$this->load->model('FallaciesModel', 'fallacies');
				$this->load->model('TagsModel', 'tags');
				$this->load->model('TwitterModel', 'twitter');
				$this->load->model('UsersModel', 'users');
				$this->load->model('YouTubeModel', 'youtube');
			}

			public function index() {
				$fallacies = $this->fallacies->getFallacies();
				$fallacyTypes = $this->fallacies->getFallacyTypes();
				$reviews = $this->fallacies->getReviews();
				$tags = $this->tags->getTags();
				$tweets = $this->twitter->getAllTweets();
				$twitterPages = $this->twitter->getAllPages();
				$users = $this->users->getUsers();
				$videos = $this->youtube->getAllVideos();
				$youtubePages = $this->youtube->getAllPages();

				$this->load->view('sitemap', [
					'fallacies' => $fallacies,
					'fallacyTypes' => $fallacyTypes,
					'reviews' => $reviews,
					'tags' => $tags,
					'tweets' => $tweets,
					'twitterPages' => $twitterPages,
					'users' => $users,
					'videos' => $videos,
					'youtubePages' => $youtubePages
				]);
			}
		}
	}
