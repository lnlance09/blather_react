<?php
defined('BASEPATH') OR exit('No direct script access allowed');

function validateCvc($cvc, $msg, $code, $error_code, $output) {
	if (strlen($cvc) > 4 || strlen($cvc) < 3 || !is_numeric($cvc)) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateEmail($email, $msg, $code, $error_code, $output) {
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateEmptyField($str, $msg, $code, $error_code, $output) {
	if (empty($str)) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateExpDate($expiry, $msg, $code, $error_code, $output) {
	if (strlen($expiry) !== 4) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}

	$month = substr($expiry, 0, 2);
	$year = substr($expiry, 2);

	if ($month > 12 || $month < 1) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => 'Please enter a valid expiration month'
		]);
		exit;
	}

	if ($year < date('y')) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => 'This card has expired'
		]);
		exit;
	}
}

function validateGreaterThan($value, $amount, $msg, $code, $error_code, $output) {
	if ($value < $amount) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateInArray($value, $array, $msg, $code, $error_code, $output) {
	if (!in_array($value, $array)) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateIsFalse($str, $msg, $code, $error_code, $output) {
	if ($str) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateIsTrue($str, $msg, $code, $error_code, $output) {
	if (!$str) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateItemsDifferent($item_one, $item_two, $msg, $code, $error_code, $output) {
	if ($item_one == $item_two) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateItemsMatch($item_one, $item_two, $msg, $code, $error_code, $output) {
	if ($item_one != $item_two) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateLoggedIn($user, $msg, $code, $error_code, $output) {
	if (!$user) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateName($username, $msg, $code, $error_code, $output) {
	if (preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $username)) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateNumber($number, $msg, $code, $error_code, $output) {
	if (!is_numeric($number)) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validatePassword($password, $msg, $code, $error_code, $output) {
	if (strlen($password) < 7) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateRating($rating, $msg, $code, $error_code, $output) {
	if ($rating < 1 || $rating > 5) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}

function validateUsername($username, $msg, $code, $error_code, $output) {
	if (preg_match('/[\'^£$%&*()}{@#~?><>,|=_+¬-]/', $username)
	|| strpos($username, " ")) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}

	if (strlen($username) > 18) {
		$output->set_status_header($error_code);
		echo json_encode([
			'code' => $code,
			'error' => $msg
		]);
		exit;
	}
}
