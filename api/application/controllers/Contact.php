<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Contact extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->baseUrl = $this->config->base_url();
		$this->load->helper('common_helper');
	}

	public function send() {
		$msg = $this->input->post('msg');
		if (empty($msg)) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => 'you must include a message'
			]);
			exit;
		}

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
		$mail->Subject = 'Someone from Blather has contacted you';
		$mail->Body = $msg;
		$mail->AltBody = $msg;
		$mail->AddAddress('lnlance09@gmail.com', 'Lance Newman');

		if (!$mail->Send()) {
			$this->output->set_status_header(400);
			echo json_encode([
				'error' => 'your message could not be sent'
			]);
			exit;
		}

		echo json_encode([
			'error' => false,
			'msg' => 'your message has been sent'
		]);
	}
}