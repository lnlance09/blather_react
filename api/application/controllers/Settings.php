<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Settings extends CI_Controller {
		public function __construct() {
			parent:: __construct();
			
			$this->baseUrl = $this->config->base_url();

			$this->load->helper('common_helper');
			$this->load->model('UsersModel', 'users');
		}

		public function recover() {
			$email = $this->input->post('email');

			if ($this->user) {
				echo json_encode([
					'error' => true,
					'msg' => 'You must logout to recover your password'
				]);
				exit;
			}

			if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
				$this->output->set_status_header(400);
				echo json_encode([
					'error' => true,
					'msg' => 'You must provide a valid email'
				]);
				exit;
			}

			$exists = $this->users->userLookupByEmail($email);
			if ($exists) {
				$this->output->set_status_header(400);
				echo json_encode([
					'error' => true,
					'msg' => 'That user does not exist'
				]);
				exit;
			}

			$password = generateAlphaNumString(12);
			$name = $exists['name'];
			$msg = "Hi ".$name.',<br><br>
					Our records indicate that you recently request a new password. Your new password is '.$password.'. You can change this password once you login.';

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
			$mail->Subject = 'Your new password';
			$mail->Body = $msg;
			$mail->AltBody = $msg;
			$mail->AddAddress($email, $name);

			if (!$mail->Send()) {
				$this->output->set_status_header(403);
				exit;
			}

			$this->users->setNewPassword($email, [
				'password_reset' => sha1($password)
			]);

			echo json_encode([
				'error' => false,
				'msg' => 'A temporary password has been sent to you'
			]);
		}
	}