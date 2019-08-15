<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Twitter extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->load->helper('common_helper');
			$this->load->model('TwitterModel', 'twitter');
			$this->load->model('UsersModel', 'users');
			$this->load->model('YouTubeModel', 'youtube');
		}

		public function getCredentials() {
			$user = $this->user;

			$token = $this->input->post('oauth_token');
			$secret = $this->input->post('oauth_secret');
			$verifier = $this->input->post('oauth_verifier');
			$access = $this->twitter->getAccessToken($verifier, $token, $secret);

			if ($access) {
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

				if ($token) {
					$oauthToken = $token['oauth_token'];
					$oauthSecret = $token['oauth_token_secret'];
					/*TODO */
					// Is this needed?
					$twitterUrl = $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token'];
				}
			}

			if ($user) {
				$user_id = $user->id;
			}

			if (!$user) {
				$userInfo = $this->twitter->verifyCredentials($oauthToken, $oauthSecret);
				if (empty($userInfo)) {
					$this->output->set_status_header(401);
					echo json_encode([
						'error' => 'Your twitter account could not be linked'
					]);
					exit;
				}

				$name = $userInfo['name'];
				$username = $userInfo['screen_name'];
				$bio = $userInfo['description'];
				$exists = $this->users->userLookupByEmail($username);

				if ($exists) {
					$date_created = $exists['date_created'];
					$user_id = $exists['id'];
					$bio = $exists['bio'];
					$img = $exists['img'];
					$linkedYoutube = (int)$exists['linked_youtube'];
				} else {
					$register = $this->users->register([
						'bio' => $bio,
						'email' => null,
						'name' => $name,
						'password' => null,
						'username' => $username,
						'verification_code' => null
					]);

					if ($register['error']) {
						$this->output->set_status_header(401);
						echo json_encode([
							'error' => $register['msg']
						]);
						exit;
					}

					$date_created = $register['user']['dateCreated'];
					$user_id = $register['user']['id'];
					$img = null;
				}

				$linkedYoutube = false;
				$linkedTwitter = true;
				$data['id'] = $user_id;
				$data['bio'] = $bio;
				$data['img'] = $img;
				$data['name'] = $name;
				$data['username'] = $username;
			}

			$data['dateCreated'] = $date_created;
			$data['email'] = null;
			$data['emailVerified'] = true;
			$data['linkedYoutube'] = $linkedYoutube;
			$data['linkedTwitter'] = $linkedTwitter;
			$data['twitterAccessSecret'] = $oauthSecret;
			$data['twitterAccessToken'] = $oauthToken;
			$data['twitterDate'] = $twitterDate;
			$data['twitterId'] = $twitterId;
			$data['twitterUsername'] = $twitterUsername;
			$data['youtubeUrl'] = $this->youtube->getTokenUrl();

			$this->users->updateUser($user_id, [
				'linked_twitter' => $linkedTwitter,
			]);

			if ($linkedTwitter) {
				$this->users->setTwitterDetails($user_id, [
					'user_id' => $user_id,
					'twitter_access_secret' => $oauthSecret,
					'twitter_access_token' => $oauthToken,
					'twitter_id' => $access['user_id'],
					'twitter_username' => $access['screen_name']
				]);
			}

			echo json_encode([
				'error' => false,
				'user' => $data
			]);
		}

		public function nextTweetsPage() {
			$id = $this->input->post('id');
			$since = $this->input->post('since');

			$user = $this->user;
			if (!($user ? $user->linkedTwitter : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must link your twitter account'
				]);
				exit;
			}

			$token = $user->twitterAccessToken;
			$secret = $user->twitterAccessSecret;
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
			$user = $this->user;
			if (!($user ? $user->linkedTwitter : false)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must link your twitter account'
				]);
				exit;
			}

			$this->users->updateUser($user->id, [
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
			$token = $this->twitter->getRequestToken();
			if (!$token) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Cannot generate token'
				]);
				exit;
			}

			echo json_encode([
				'error' => false,
				'secret' => $token['oauth_token_secret'],
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
			if (!$tweet['error'] && $this->user) {
				$archive = $this->users->getArchivedLinks([
					'object_id' => $id,
					'user_id' => $this->user->id
				]);
			}

			echo json_encode([
				'archive' => empty($archive) ? false : $archive,
				'code' => $tweet['error'] ? $tweet['code'] : 0,
				'data' => $tweet['error'] ? null : $tweet['data'],
				'error' => $tweet['error'] ? true : false,
				'is_live_search' => $auth,
				'profile_pic' => array_key_exists('profile_pic', $tweet) ? $tweet['profile_pic'] : null,
				'type' => 'tweet'
			]);
		}

		public function tweetFromExtension() {
			$id = $this->input->get('id');

			if (!$id) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'This tweet does not exist'
				]);
				exit;
			}

			$auth = $this->user ? $this->user->linkedTwitter : false;

			if ($auth) {
				$token = $auth ? $this->user->twitterAccessToken : null;
				$secret = $auth ? $this->user->twitterAccessSecret : null;
			} else {
				$tokens = $this->users->getDefaultTwitterTokens();
				$token = $tokens->twitter_access_token;
				$secret = $tokens->twitter_access_secret;
			}

			$tweet = $this->twitter->getTweetExtended($id, true, $token, $secret);

			if ($tweet['error']) {
				$code = $tweet['code'];
				$data = null;
				$error = true;
			} else {
				$code = 0;
				$data = $tweet['data'];
				$error = false;
			}

			echo json_encode([
				'code' => $code,
				'data' => $data,
				'error' => $error,
				'is_live_search' => $auth
			]);
		}
	}