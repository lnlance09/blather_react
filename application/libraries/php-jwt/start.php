<?php
	require_once('src/BeforeValidException.php');
	require_once('src/ExpiredException.php');
	require_once('src/SignatureInvalidException.php');
	require_once('src/JWT.php');
	use Firebase\JWT\JWT;

	function encode($token, $key) {
		return JWT::encode($token, $key);
	}

	function decode($jwt, $key) {
		return JWT::decode($jwt, $key, ['HS256']);
	}

	function sign($jwt, $key) {
		return JWT::sign($jwt, $key);
	}