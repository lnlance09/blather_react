<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Settings extends CI_Controller {
	public function __construct() {
		parent:: __construct();
		
		$this->baseUrl = $this->config->base_url();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('MediaModel', 'media');
		$this->load->model('UsersModel', 'users');
	}

	public function recover() {
		$email = $this->input->post('email');

		validateIsFalse($this->user, 'You must logout to recover your password', 100, 400, $this->output);
		validateEmail($email, 'You must provide a valid email', 100, 400, $this->output);

		$user = $this->users->userLookupByEmail($email);
		validateEmptyField($user, 'That user does not exist', 100, 400, $this->output);

		$password = generateAlphaNumString(12);
		$name = $user['name'];
		$msg = "Hi ".$name.',<br><br>
				Our records indicate that you recently request a new password. Your new password is '.$password.'. You can change this password once you login.';

		$subject = 'Your new password';
		$from = EMAILS_SENT_FROM;
		$to = [
			[
				'email' => $email,
				'name' => $name
			]
		];
		$mail = $this->media->sendEmail($subject, $msg, $from, $to);

		$this->users->setNewPassword($email, [
			'password_reset' => sha1($password)
		]);

		echo json_encode([
			'error' => false,
			'msg' => 'A temporary password has been sent to you'
		]);
	}
}