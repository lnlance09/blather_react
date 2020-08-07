<?php
defined('BASEPATH') OR exit('No direct script access allowed');
date_default_timezone_set('UTC');

class Users extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->baseUrl = $this->config->base_url();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('DiscussionsModel', 'discussions');
		$this->load->model('FallaciesModel', 'fallacies');
		$this->load->model('FacebookModel', 'fb');
		$this->load->model('MediaModel', 'media');
		$this->load->model('TwitterModel', 'twitter');
		$this->load->model('YouTubeModel', 'youtube');
	}

	public function changePassword() {
		$currentPassword = $this->input->post('current_password');
		$newPassword = $this->input->post('new_password');
		$confirmPassword = $this->input->post('confirm_password');
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in to change your password', 100, 401, $this->output);
		validateEmptyField($currentPassword, 'You must enter your current password', 100, 401, $this->output);

		$exists = $this->users->getUserByCurrentPassword($user->id, $currentPassword);
		validateIsTrue($exists, 'Your current password is incorrect', 100, 401, $this->output);

		validatePassword($newPassword, 'Your password must be at least 7 characters long', 100, 401, $this->output);
		validateItemsMatch($newPassword, $confirmPassword, 'Your passwords do not match', 100, 401, $this->output);
		validateItemsDifferent($newPassword, $currentPassword, 'Your password must be different than your old one', 100, 401, $this->output);

		$this->users->updateUser($this->user->id, [
			'password' => sha1($newPassword),
		]);

		echo json_encode([
			'error' => false
		]);
	}

	public function changeProfilePic() {
		$user = $this->user;

		validateLoggedIn($user, 'You must be logged in to change your picture', 100, 401, $this->output);

		$this->load->library('upload', [
			'allowed_types' => 'jpg|jpeg|png',
			'file_ext_tolower' => true,
			'max_height' => 0,
			'max_size' => 25000,
			'max_width' => 0,
			'upload_path' => './public/img/profile_pics/'
		]);

		if (!$this->upload->do_upload('file')) {
			$this->output->set_status_header(403);
			$data = $this->upload->display_errors();
			echo json_encode([
				'error' => $data
			]);
			exit;
		} 

		$data = $this->upload->data();
		$file = $data['file_name'];
		$path = $data['full_path'];

		if ($data['image_width'] !== $data['image_height']) {
			$original_path = $path;
			$path = './public/img/profile_pics/resized_'.$file;

			$this->load->library('image_lib', [
				'height' => 220,
				'maintain_ratio' => false,
				'new_image' => $path,
				'source_image' => $original_path,
				'width' => 220
			]);
			$this->image_lib->resize();
			$this->image_lib->clear();
			unlink($original_path);
		}

		$s3Path = 'users/'.$user->id.'_'.$file;
		$s3Link = $this->media->addToS3($s3Path, $path);

		$this->users->updateUser($user->id, [
			'img' => $s3Path
		]);

		echo json_encode([
			'error' => false,
			'img' => $s3Link
		]);
	}

	public function create() {
		$id = $this->input->post('id');
		$name = $this->input->post('name');
		$network = $this->input->post('network');

		$data = [
			'name' => $name
		];
		$this->users->createUser($id, $network, $data);
	}

	public function createArchive() {
		$url = $this->input->post('url');
		$user = $this->user;

		$parse = parseUrl($url);
		validateEmptyField($parse, 'This URL cannot be parsed', 100, 401, $this->output);

		$code = createArchive($url);
		$data = [];

		if ($code && $user) {
			$page = null;
			$network = $parse['network'];
			if ($network == 'twitter') {
				$page = $this->twitter->getPageInfoFromDB($parse['username']);
			}

			validateEmptyField($page, 'This page does not exist', 100, 401, $this->output);

			$data = [
				'code' => $code,
				'comment_id' => $parse['comment_id'],
				'link' => $url,
				'network' => $network,
				'object_id' => $parse['object_id'],
				'page_id' => $page['id'],
				'type' => 'tweet',
				'user_id' => $this->user->id
			];
			$this->users->createArchive($data);
		}

		echo json_encode([
			'archive' => $data,
			'error' => $code ? false : true
		]);
	}

	public function getArchivedLinks() {
		$id = $this->input->get('id');
		$page = $this->input->get('page');
		$pageId = $this->input->get('pageId');
		$q = $this->input->get('q');
		$unique = (int)$this->input->get('unique');

		$where = [
			'q' => $q,
			'user_id' => $id
		];

		if ($pageId) {
			$where['p.id'] = $pageId;
		}

		$links = $this->users->getArchivedLinks($where, $unique, $page);
		$count = count($links);
		$per_page = 10;
		$has_more = $count === $per_page;

		echo json_encode([
			'count' => $count,
			'links' => $links,
			'pagination' => [
				'hasMore' => $has_more,
				'nextPage' => (int)$page+1,
				'page' => (int)$page
			],
		]);
	}

	public function getInfo() {
		$username = $this->input->get('username');

		$select = "bio, date_created, email_verified AS emailVerified, u.id AS id, CONCAT('".S3_PATH."', u.img) AS img, linked_twitter AS linkedTwitter, linked_youtube AS linkedYoutube, patreon_username AS patreonUsername, name, username";
		$info = $this->users->getUserInfo($username, $select);
		validateEmptyField($info, 'That user does not exist', 100, 404, $this->output);

		if (empty($info['bio'])) {
			$info['bio'] = $info['name']." does not have a bio yet";
		}

		$info['discussion_count'] = 0;
		$info['fallacy_count'] = $this->fallacies->search([
			'assigned_by' => $info['id'],
			'assigned_to' => null,
			'comment_id' => null,
			'fallacies' => null,
			'fallacy_id' => null,
			'network' => null,
			'object_id' => null,
			'page' => null,
			'q' => null,
			'tag_id' => null
		], true);
		$info['archive_count'] = $this->users->getArchivedLinks([
			'user_id' => $info['id']
		], false, 0, true);

		echo json_encode([
			'error' => false,
			'user' => $info
		]);
	}

	public function login() {
		$email = $this->input->post('email');
		$password = $this->input->post('password');

		validateEmptyField($email, 'Username or email is required', 100, 401, $this->output);
		validateEmptyField($password, 'Password is required', 100, 401, $this->output);

		$login = $this->users->login($email, $password);
		validateEmptyField($login, 'Incorrect login credentials', 100, 401, $this->output);

		$user = $login[0];
		$user['emailVerified'] = $user['emailVerified'] === '1';
		$user['fbUrl'] = null;
		$user['img'] = $user['img'] ? $user['img'] : null;
		$user['linkedFb'] = $user['linkedFb'] === '1';
		$user['linkedTwitter'] = $user['linkedTwitter'] === '1';
		$user['linkedYoutube'] = $user['linkedYoutube'] === '1';
		$user['twitterOauthSecret'] = null;
		$user['twitterOauthToken'] = null;
		$user['twitterUrl'] = null;
		$user['youtubeUrl'] = $this->youtube->getTokenUrl();

		if (!$user['linkedTwitter']) {
			$token = $this->twitter->getRequestToken();
			if ($token) {
				$user['twitterAccessToken'] = $token['oauth_token'];
				$user['twitterAccessSecret'] = $token['oauth_token_secret'];
				$user['twitterUrl'] = $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token'];
			}
		}

		echo json_encode([
			'error' => false,
			'user' => $user
		]);
	}

	public function lookUp() {
		$id = $this->input->get('id');
		$type = $this->input->get('type');

		$user = $this->users->userLookUp([
			'id' => $id,
			'type' => $type
		]);

		echo json_encode([
			'exists' => $user ? true : false
		]);
	}

	public function register() {
		$params = [
			'email' => $this->input->post('email'),
			'name' => $this->input->post('name'),
			'password' => $this->input->post('password'),
			'username' => $this->input->post('username'),
			'verification_code' => generateVerificationCode()
		];

		validateEmptyField($params['name'], 'A name is required', 100, 401, $this->output);
		validateName($params['name'], 'Your name cannot contain special characters', 100, 401, $this->output);
		validateEmail($params['email'], 'A valid email is required', 100, 401, $this->output);
		validateEmptyField($params['username'], 'A username is required', 100, 401, $this->output);
		validateUsername($params['username'], 'Your username cannot contain special characters or spaces', 100, 401, $this->output);
		validatePassword($params['password'], 'Your password is not long enough', 100, 401, $this->output);

		$register = $this->users->register($params);
		validateEmptyField($register, 'Something went wrong. Please try again.', 100, 401, $this->output);
		validateIsFalse($register['error'], $register['msg'], 100, 401, $this->output);

		$subject = 'Please verify your email';
		$from = EMAILS_SENT_FROM;
		$to = [
			[
				'email' => $params['email'],
				'name' => $params['name']
			]
		];
		require(BASE_PATH.'application/models/emails/signUp.php');
		$template = str_replace('{NAME}', $params['name'], $template);
		$template = str_replace('{CODE}', $params['verification_code'], $template);

		$mail = $this->media->sendEmail($subject, $template, $from, $to);
		validateIsTrue($mail, 'Something went wrong. Please try again.', 100, 400, $this->output);

		echo json_encode($register);
	}

	public function registerWithGoogle() {
		$access_token = $this->input->post('accessToken');
		$email = $this->input->post('email');
		$id = $this->input->post('id');
		$id_token = $this->input->post('idToken');
		$img = $this->input->post('img');
		$name = $this->input->post('name');

		validateNumber($id, 'A valid Google ID is required', 100, 401, $this->output);
		validateEmail($email, 'A valid email is required', 100, 401, $this->output);

		$exists = $this->users->userLookupByEmail($email);
		if ($exists) {
			$login = $this->users->login($email, null);
			if (empty($login)) {
				echo json_encode([
					'error' => true,
					'user' => []
				]);
				exit;
			}

			$user = $login[0];
			$user['emailVerified'] = $user['emailVerified'] === '1';
			$user['fbUrl'] = null;
			$user['img'] = $user['img'] ? $user['img'] : null;
			$user['linkedFb'] = $user['linkedFb'] === '1';
			$user['linkedTwitter'] = $user['linkedTwitter'] === '1';
			$user['linkedYoutube'] = $user['linkedYoutube'] === '1';
			$user['twitterOauthSecret'] = null;
			$user['twitterOauthToken'] = null;
			$user['twitterUrl'] = null;
			$user['youtubeUrl'] = $this->youtube->getTokenUrl();

			if (!$user['linkedTwitter']) {
				$token = $this->twitter->getRequestToken();
				if ($token) {
					$user['twitterAccessToken'] = $token['oauth_token'];
					$user['twitterAccessSecret'] = $token['oauth_token_secret'];
					$user['twitterUrl'] = $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token'];
				}
			}

			$this->users->setGoogleDetails($user['id'], [
				'access_token' => $access_token,
				'google_id' => $id,
				'id_token' => $id_token,
				'user_id' => $user['id']
			]);

			echo json_encode([
				'error' => false,
				'user' => $user
			]);
			exit;
		}

		// Save pic
		$img = str_replace('s96-c/photo.jpg', 's240-c/photo.jpg', $img);
		$s3Path = 'users/'.$id.'.jpg';
		$path = './public/img/profile_pics/'.$id.'.jpg';
		$content = file_get_contents($img);
		file_put_contents($path, $content);
		$s3Link = $this->media->addToS3($s3Path, $path);

		$username = $this->users->generateUsername($name);
		$register = $this->users->register([
			'bio' => null,
			'email' => $email,
			'email_verified' => 1,
			'img' => $s3Path,
			'name' => $name,
			'password' => null,
			'username' => $username,
			'verification_code' => null
		]);

		validateIsFalse($register['error'], $register['msg'], 100, 401, $this->output);

		$date_created = $register['user']['dateCreated'];
		$user_id = $register['user']['id'];

		$data['id'] = $user_id;
		$data['bio'] = null;
		$data['img'] = $s3Link;
		$data['name'] = $name;
		$data['username'] = $username;
		$data['dateCreated'] = $date_created;
		$data['email'] = $email;
		$data['emailVerified'] = true;
		$data['linkedYoutube'] = false;
		$data['linkedTwitter'] = false;
		$data['twitterAccessSecret'] = false;
		$data['twitterAccessToken'] = false;
		$data['twitterDate'] = false;
		$data['twitterId'] = false;
		$data['twitterUsername'] = false;
		$data['youtubeUrl'] = $this->youtube->getTokenUrl();

		$this->users->setGoogleDetails($user_id, [
			'access_token' => $access_token,
			'google_id' => $id,
			'id_token' => $id_token,
			'user_id' => $user_id
		]);

		echo json_encode([
			'error' => false,
			'user' => $data
		]);
	}

	public function uniqueFallacies() {
		$id = $this->input->get('id');

		validateEmptyField($id, 'You need to specify a user', 100, 401, $this->output);

		$fallacies = $this->fallacies->getUniqueFallacies($id);
		echo json_encode([
			'fallacies' => $fallacies
		]);
	}

	public function update() {
		$bio = $this->input->post('bio');
		$patreonUsername = $this->input->post('patreonUsername');
		$user = $this->user;

		validateLoggedIn($user, 'You must login to update your account', 100, 401, $this->output);

		$data = [];
		if (!empty($bio)) {
			$data['bio'] = $bio;
		}

		if (!empty($patreonUsername)) {
			$data['patreon_username'] = $patreonUsername;
		}

		$this->users->updateUser($user->id, $data);

		echo json_encode([
			'data' => $data,
			'error' => false
		]);
	}

	public function verifyEmail() {
		$code = $this->input->post('code');
		$user = $this->user;

		validateLoggedIn($user, 'You must login to verify your account', 100, 401, $this->output);
		validateItemsMatch($code, $user->verificationCode, 'Incorrect verification code', 100, 401, $this->output);

		$this->users->updateUser($user->id, [
			'email_verified' => 1
		]);
		$this->user->emailVerified = true;

		echo json_encode([
			'error' => false,
			'user' => $user
		]);
	}
}