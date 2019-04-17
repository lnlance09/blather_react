<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Firebasetoken {
	function __construct($permissions = false) {
		require_once('php-jwt/vendor/autoload.php');
		require_once('php-jwt/start.php');
		$this->codeigniter_instance =& get_instance();
	}

	public function encode($token, $key) {
		return encode($token, $key);
	}

	public function decode($jwt, $key) {
		return decode($jwt, $key);
	}

	 public function sign($jwt, $key) {
		return sign($jwt, $key);
	}
}