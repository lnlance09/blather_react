<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Twitter extends CI_Controller {
		public function __construct() {       
			parent:: __construct();

			$this->load->helper('common_helper');
			$this->load->model('TwitterModel', 'twitter');
		}

		public function getCredentials() {
			if(!($this->user ? $this->user->twitterAccessSecret : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => true
				]);
				exit;
			}

			$token = $this->input->post('oauth_token');
			$verifier = $this->input->post('oauth_verifier');
			$access = $this->twitter->getAccessToken($verifier, $token, $this->user->twitterAccessSecret);

			if($access) {
				$linkedTwitter = true;
				$oauthToken = $access['oauth_token'];
				$oauthSecret = $access['oauth_token_secret'];
				$twitterDate = date('Y-m-d H:i:s');
				$twitterId = $access['user_id'];
				$twitterUsername = $access['screen_name'];
			} else {
				$linkedTwitter = false;
				$twitterDate = null;
				$twitterId = null;
				$twitterUsername = null;
				$token = $this->twitter->getRequestToken();

				if($token) {
					$oauthToken = $token['oauth_token'];
					$oauthSecret = $token['oauth_token_secret'];
					/*TODO */
					//I this needed?
					$twitterUrl = $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token'];
				}
			}

			$data['linked_twitter'] = $linkedTwitter;
			$this->users->updateUser($this->user->id, $data);

			$data['twitter_access_secret'] = $oauthSecret;
			$data['twitter_access_token'] = $oauthToken;
			$data['twitter_date'] = $twitterDate;
			$data['twitter_id'] = $twitterId;
			$data['twitter_username'] = $twitterUsername;

			if($linkedTwitter) {
				$this->users->setTwitterDetails($this->user->id, [
					'user_id' => $this->user->id,
					'twitter_access_secret' => $oauthSecret,
					'twitter_access_token' => $oauthToken,
					'twitter_id' => $access['user_id'],
					'twitter_username' => $access['screen_name']
				]);
			}

			echo json_encode($data);
		}

		public function nextTweetsPage() {
			$id = $this->input->post('id');
			$since = $this->input->post('since');

			if(!($this->user ? $this->user->linkedTwitter : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must link your twitter account'
				]);
				exit;
			}

			$token = $this->user->twitterAccessToken;
			$secret = $this->user->twitterAccessSecret;
			$data = [
				'count' => 18,
				'exclude_replies' => false,
				'include_rts' => true,
				'max_id' => $since,
				'screen_name' => $id,
				'tweet_mode' => 'extended'
			];
			$posts['data'] = $this->twitter->getStatuses($data, $token, $secret);
			$posts['count'] = count($posts['data']);
			$posts['lastId'] = $posts['data'][$posts['count']-1]['id'];
			echo json_encode($posts);
		}

		public function remove() {
			if(!($this->user ? $this->user->linkedTwitter : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must link your twitter account'
				]);
				exit;
			}

			$this->users->updateUser($this->user->id, [
				'linked_twitter' => 0
			]);
			$token = $this->twitter->getRequestToken();
			echo json_encode([
				'error' => false,
				'twitterAccessSecret' => $token['oauth_token_secret'],
				'twitterAccessToken' => $token['oauth_token'],
				'twitterUrl' => $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token']
			]);
		}

		public function requestToken() {
			if(!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must login'
				]);
				exit;
			}

			$token = $this->twitter->getRequestToken();
			if(!$token) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Cannot generate token'
				]);
				exit;
			}

			echo json_encode([
				'error' => false,
				'url' => $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token']
			]);
		}

		public function tweet() {
			$id = $this->input->get('id');
			if (!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'This tweet does not exist'
				]);
				exit;
			}

			$auth = $this->user ? $this->user->linkedTwitter : false;
			$token = $auth ? $this->user->twitterAccessToken : null;
			$secret = $auth ? $this->user->twitterAccessSecret : null;

			// See if the tweet exists in the DB first since it may have been deleted
			$tweet = $this->twitter->getTweetExtended($id, false, $token, $secret);

			// Get tweet data from API
			if ($tweet['error'] && $auth) {
				$tweet = $this->twitter->getTweetExtended($id, true, $token, $secret);
			}

			$archive = false;
			if ($this->user) {
				$archive = $this->users->getArchivedLinks([
					'object_id' => $id,
					'user_id' => $this->user->id
				]);
			}

			echo json_encode([
				'archive' => empty($archive) ? false : $archive,
				'data' => $tweet['error'] ? null : $tweet['data'],
				'error' => $tweet['error'] ? $tweet['code'] : false,
				'is_live_search' => $auth,
				'type' => 'tweet'
			]);
		}
	}