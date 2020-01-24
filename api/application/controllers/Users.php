<?php
	defined('BASEPATH') OR exit('No direct script access allowed');
	date_default_timezone_set('UTC');

	class Users extends CI_Controller {
		public function __construct() {
			parent:: __construct();

			$this->baseUrl = $this->config->base_url();

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

			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in to change your password'
				]);
				exit;
			}
			
			if (empty($currentPassword)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must enter your current password'
				]);
				exit;
			}

			$exists = $this->users->getUserByCurrentPassword($this->user->id, $currentPassword);
			if (!$exists) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your current password is incorrect'
				]);
				exit;
			}

			if (strlen($newPassword) < 7) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your password must be at least 7 characters long'
				]);
				exit;
			}

			if ($newPassword !== $confirmPassword) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your passwords do not match'
				]);
				exit;
			}

			if ($newPassword === $currentPassword) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your password must be different than your old one'
				]);
				exit;
			}

			$this->users->updateUser($this->user->id, [
				'password' => sha1($newPassword),
			]);

			echo json_encode([
				'error' => false
			]);
		}

		public function changeProfilePic() {
			$user = $this->user;
			if (!$user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in to change your picture'
				]);
				exit;
			}

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

			$user = $this->user;
			$code = createArchive($url);
			$data = [];
			if ($code && $user) {
				$page = null;
				$network = $parse['network'];
				if ($network == 'twitter') {
					$page = $this->twitter->getPageInfoFromDB($parse['username']);
				}

				if (!$page) {
					$this->output->set_status_header(401);
					echo json_encode([
						'error' => 'This page does not exist',
					]);
					exit;
				}

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
				$archive = $this->users->createArchive($data);
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

			if (!$info) {
				$this->output->set_status_header(404);
				echo json_encode([
					'error' => 'That user does not exist'
				]);
				exit;
			}

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

			if (empty($email)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Username or email is required'
				]);
				exit;
			}

			if (empty($password)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Password is required'
				]);
				exit;
			}

			$login = $this->users->login($email, $password);
			if (!$login) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Incorrect login credentials'
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
				'verification_code' => generateAlphaNumString(10)
			];

			if (empty($params['name'])) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'A name is required'
				]);
				exit;
			}

			if (preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $params['name'])) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your name cannot contain special characters'
				]);
				exit;
			}

			if (!filter_var($params['email'], FILTER_VALIDATE_EMAIL)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'A valid email is required'
				]);
				exit;
			}

			if (empty($params['username'])) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'A username is required'
				]);
				exit;
			}

			if (preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $params['username'])
			|| strpos($params['username'], " ")) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your username cannot contain special characters or spaces'
				]);
				exit;
			}

			if (strlen($params['username']) > 18) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your username is too long'
				]);
				exit;
			}

			if (strlen($params['password']) < 7) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Your password is not long enough'
				]);
				exit;
			}

			$register = $this->users->register($params);
			if (!$register) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Something went wrong. Please try again.'
				]);
				exit;
			}

			if ($register['error']) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => $register['msg']
				]);
				exit;
			}
			
			$msg = "Hi ".$params['name'].',<br><br>Your verification code is '.$params['verification_code'];
			$this->load->library('My_PHPMailer');
			$mail = new PHPMailer();
			$mail->IsSMTP();
			$mail->SMTPAuth = true;
			$mail->SMTPSecure = 'ssl';
			$mail->Host = 'smtpout.secureserver.net';
			$mail->Port = 465;
			$mail->Username = 'admin@blather.io';
			$mail->Password = 'Jl8RdSLz7DF8:PJ';
			$mail->SetFrom('admin@blather.io', 'Blather');
			$mail->Subject = 'Please verify your email';
			$mail->Body = $msg;
			$mail->AltBody = $msg;
			$mail->AddAddress($params['email'], $params['name']);
			
			if ($mail->Send()) {
				echo json_encode($register);
				exit;
			}
		}

		public function registerWithGoogle() {
			$access_token = $this->input->post('accessToken');
			$email = $this->input->post('email');
			$id = $this->input->post('id');
			$id_token = $this->input->post('idToken');
			$img = $this->input->post('img');
			$name = $this->input->post('name');

			if (!is_numeric($id)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'A valid Google ID is required'
				]);
				exit;
			}

			if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'A valid email is required'
				]);
				exit;
			}

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

			if ($register['error']) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => $register['msg']
				]);
				exit;
			}

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
			if (empty($id)) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You need to specify a user'
				]);
				exit;
			}

			$fallacies = $this->fallacies->getUniqueFallacies($id);
			echo json_encode([
				'fallacies' => $fallacies
			]);
		}

		public function update() {
			$bio = $this->input->post('bio');
			$patreonUsername = $this->input->post('patreonUsername');

			$user = $this->user;
			if (!$user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must login to update your account'
				]);
				exit;
			}

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
			$user = $this->user;
			if (!$user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must login to verify your account'
				]);
				exit;
			}

			if ($this->input->post('code') !== $user->verificationCode) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'Incorrect verification code'
				]);
				exit;
			}

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