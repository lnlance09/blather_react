<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Contact extends CI_Controller {
	public function __construct() {
		parent:: __construct();

		$this->baseUrl = $this->config->base_url();

		$this->load->helper('common');
		$this->load->helper('validation');

		$this->load->model('MediaModel', 'media');
	}

	public function send() {
		$msg = $this->input->post('msg');
		validateEmptyField($msg, 'you must include a message', 100, 400, $this->output);

		$subject = 'Someone from Blather has contacted you';
		$from = EMAILS_SENT_FROM;
		$to = [
			[
				'email' => 'lnlance09@gmail.com',
				'name' => 'Lance Newman'
			]
		];
		$mail = $this->media->sendEmail($subject, $msg, $from, $to);
		validateIsTrue($mail, 'your message could not be sent', 100, 400, $this->output);

		echo json_encode([
			'error' => false,
			'msg' => 'your message has been sent'
		]);
	}
}