<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Twitter extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->load->helper('common');
		$this->load->helper('validation');

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

		if (!array_key_exists('oauth_token', $access)) {
			$this->output->set_status_header(401);
			echo json_encode([
				'error' => 'Your twitter account could not be linked'
			]);
			exit;
		}

		$oauthToken = $access['oauth_token'];
		$oauthSecret = $access['oauth_token_secret'];

		$linkedTwitter = true;
		$twitterDate = date('Y-m-d H:i:s');
		$twitterId = $access['user_id'];
		$twitterUsername = $access['screen_name'];

		if ($user) {
			$date_created = date('Y-m-d H:i:s');
			$linkedYoutube = false;
			$user_id = $user->id;
		} else {
			$userInfo = $this->twitter->verifyCredentials($oauthToken, $oauthSecret);
			if (empty($userInfo)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your twitter account could not be linked'
				]);
				exit;
			}

			$bio = $userInfo['description'];
			$name = $userInfo['name'];
			$username = $userInfo['screen_name'];


			// Save pic
			$s3Path = 'users/'.$twitterId.'.jpg';
			$path = './public/img/profile_pics/'.$twitterId.'.jpg';
			$img = str_replace('_normal', '', $userInfo['profile_image_url_https']);
			$content = file_get_contents($img);
			file_put_contents($path, $content);
			$s3Link = $this->media->addToS3($s3Path, $path);


			$exists = $this->users->userLookupByEmail($username);
			if ($exists) {
				$bio = $exists['bio'];
				$date_created = $exists['date_created'];
				$img = $s3Link;
				$linkedYoutube = (int)$exists['linked_youtube'];
				$user_id = $exists['id'];
			} else {
				$register = $this->users->register([
					'bio' => $bio,
					'email' => null,
					'img' => $s3Path,
					'name' => $name,
					'password' => null,
					'username' => $username,
					'verification_code' => null
				]);

				validateIsFalse($register['error'], $register['msg'], 100, 401, $this->output);

				$date_created = $register['user']['dateCreated'];
				$img = $s3Link;
				$user_id = $register['user']['id'];

				$this->users->updateUser($user_id, [
					'img' => $s3Path
				]);
			}

			$linkedTwitter = true;
			$linkedYoutube = false;
			$data = [
				'bio' => $bio,
				'id' => $user_id,
				'img' => $img,
				'name' => $name,
				'username' => $username
			];
		}

		$data['dateCreated'] = $date_created;
		$data['email'] = null;
		$data['emailVerified'] = true;
		$data['linkedTwitter'] = $linkedTwitter;
		$data['linkedYoutube'] = $linkedYoutube;
		$data['twitterAccessSecret'] = $oauthSecret;
		$data['twitterAccessToken'] = $oauthToken;
		$data['twitterDate'] = $twitterDate;
		$data['twitterId'] = $twitterId;
		$data['twitterUsername'] = $twitterUsername;
		$data['youtubeUrl'] = $this->youtube->getTokenUrl();

		$this->users->updateUser($user_id, [
			'linked_twitter' => $linkedTwitter
		]);

		if ($linkedTwitter) {
			$this->users->setTwitterDetails($user_id, [
				'twitter_access_secret' => $oauthSecret,
				'twitter_access_token' => $oauthToken,
				'twitter_id' => $access['user_id'],
				'twitter_username' => $access['screen_name'],
				'user_id' => $user_id
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

		$linkedTwitter = $user ? $user->linkedTwitter : false;
		validateIsTrue($linkedTwitter, 'You must link your twitter account', 100, 401, $this->output);

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

		$linkedTwitter = $user ? $user->linkedTwitter : false;
		validateIsTrue($linkedTwitter, 'You must link your twitter account', 100, 401, $this->output);

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

		validateEmptyField($token, 'Cannot generate token', 100, 401, $this->output);

		echo json_encode([
			'error' => false,
			'secret' => $token['oauth_token_secret'],
			'url' => $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token']
		]);
	}

	public function tweet() {
		$id = $this->input->get('id');
		$user = $this->user;

		validateEmptyField($id, 'This tweet does not exist', 100, 404, $this->output);

		$auth = $user ? $user->linkedTwitter : false;
		$token = $auth ? $user->twitterAccessToken : null;
		$secret = $auth ? $user->twitterAccessSecret : null;

		// See if the tweet exists in the DB first since it may have been deleted
		$tweet = $this->twitter->getTweetExtended($id, false, $token, $secret);

		// Get tweet data from API
		if ($tweet['error'] && $auth) {
			$tweet = $this->twitter->getTweetExtended($id, true, $token, $secret);
		}

		$archive = false;
		if (!$tweet['error'] && $user) {
			$archive = $this->users->getArchivedLinks([
				'object_id' => $id,
				'user_id' => $user->id
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
		$user = $this->user;

		validateEmptyField($id, 'This tweet does not exist', 100, 404, $this->output);

		$auth = $user ? $user->linkedTwitter : false;
		if ($auth) {
			$token = $auth ? $user->twitterAccessToken : null;
			$secret = $auth ? $user->twitterAccessSecret : null;
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