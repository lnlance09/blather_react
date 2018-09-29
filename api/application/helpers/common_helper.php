<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	function camelCase($array) {
		$newArray = [];
		foreach($array as $key => $val) {
			$key = lcfirst(implode('', array_map('ucfirst', explode('_', $key))));
			$newArray[$key] = $val;
		}
		return $newArray;
	}

	function createArchive($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'http://archive.is/submit/');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, true);
		curl_setopt($ch, CURLOPT_REFERER, 'http://archive.is/');
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
			'url' => $url
		]));
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			'Accept-Encoding: gzip, deflate',
			'Content-Type: application/x-www-form-urlencoded',
			'Host: archive.is',
			'Origin: http://archive.is',
			'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
		]);
		$data = curl_exec($ch);
		$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		// print_r($data);
		curl_close($ch);

		$location = false;
		if($code === 302) {
			if(preg_match('~Location: (.*)~i', $data, $match)) {
				$location = trim($match[1]);
			}
		}

		if($code === 200) {
			if(preg_match('~Refresh: (.*)~i', $data, $match)) {
				$location = trim($match[1]);
			}
		}

		$code = null;
		if($location) {
			$exp = explode('/', $location);
			$code = end($exp);
		}

		return $code;
	}

	/**
	 * Format the default text for the 'about' section of a page
	 * @param  [string] $about [description]
	 * @param  [string] $name  [description]
	 * @return [string]        [description]
	 */
	function defaultPageAbout($about, $name) {
		return $about == '' ? "We don't know what ".$name."'s beliefs are yet..." : $about;
	}

	/**
	 * Format an array and style it if necessary
	 * @param {array} [array] The array to be preformatted
	 * @param {boolean} [style] Whether or not to style the preformatted array
	 */
	function FormatArray($array, $style = false) {
		if($style) {
			echo '<div style="color:#090127;text-shadow:none;text-align:left;">';
		}

		echo '<pre>';
		print_r($array);
		echo '</pre>';

		if($style) {
			echo '</div>';
		}
	}

	function generateAlphaNumString($length) {
		$characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		$string = '';
		$max = strlen($characters) - 1;
		for($i=0;$i<$length;$i++) {
			$string .= $characters[mt_rand(0, $max)];
		}

		return $string;
	}

	function getArticle($word) {
		$vowels = ['a','e','i','o','u'];
		$subStr = substr(strtolower($word), 0, 1);
		return (in_array($subStr, $vowels) ? 'an' : 'a');
	}

	/**
	 * Return the HTTP code of a request to a given URL
	 * @param {string} [url] The URL to send a request to
	 */
	function GetHTTPCode($url) {
		$ch = curl_init($url);
		curl_setopt($ch, CURLOPT_NOBODY, 1);
		curl_exec($ch);
		$http = curl_getinfo($ch, CURLINFO_HTTP_CODE);  
		curl_close($ch);
		return $http;
	} 

	/**
	 * Get the meta tags associated with a given link that has been featured in a Tweet or FB post
	 * @param  [string] $url         [The link that's featured in the post or tweet]
	 * @return [array|boolean]       [Either false for an incomplete request or an array containing the meta tags info]
	 */
	function getMetaTags($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, 'https://api.urlmeta.org/?url='.$url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$data = curl_exec($ch);
		$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);
		if($code == 200) {
			return @json_decode($data, true);
		}
		return false;
	}

	function parseCommentStr($commentStr) {
		$exp = explode('_', $commentStr);
		return count($exp) == 2 ? $exp[1] : $commentStr;
	}

	function parseUrl($url) {
		$parse = parse_url($url);
		$network = null;
		$username = null;
		$object_id = null;
		$comment_id = null;
		$start_time = null;
		$end_time = null;
		$type = 'tweet';

		switch($parse['host']) {
			case'www.facebook.com':
			case'facebook.com':
				$network = 'facebook';
				$exp = explode('/', $parse['path']);
				if(count($exp) > 3) {
					$username = $exp[1];
					$object_id = $exp[3];
				}

				if(array_key_exists('query', $parse)) {
					parse_str($parse['query'], $query);
					$comment_id = array_key_exists('comment_id', $query) ? $query['comment_id'] : null;
				}
				break;
			case'www.twitter.com':
			case'twitter.com':
				$network = 'twitter';
				$exp = explode('/', $parse['path']);
				array_shift($exp);
				if(count($exp) === 3) {
					$username = $exp[1];
					$object_id = $exp[2];
					$type = 'tweet';
				}
				break;
			case'www.youtube.com':
			case'youtube.com':
				$network = 'youtube';
				if(array_key_exists('query', $parse)) {
					parse_str($parse['query'], $query);
					$type = 'video';
					$object_id = array_key_exists('v', $query) ? $query['v'] : null;
					$comment_id = array_key_exists('lc', $query) ? $query['lc'] : null;
					$start_time = array_key_exists('t', $query) ? $query['t'] : null;
					if($comment_id) {
						$type = 'comment';
					}
				}
				break;
			case'youtu.be':
				$network = 'youtube';
				if(array_key_exists('path', $parse)) {
					$exp = explode('/', $parse['path']);
					array_shift($exp);
					if(count($exp) === 1) {
						$object_id = $exp[0];
						$type = 'video';
					}
					if(array_key_exists('query', $parse)) {
						parse_str($parse['query'], $query);
						$comment_id = array_key_exists('lc', $query) ? $query['lc'] : null;
						$start_time = array_key_exists('t', $query) ? $query['t'] : null;
						$type = 'comment';
					}
				}
				break;
		}

		if($network) {
			return [
				'comment_id' => $comment_id,
				'end_time' => $end_time,
				'network' => $network,
				'object_id' => $object_id,
				'start_time' => $start_time,
				'type' => $type,
				'username' => $username
			];
		}

		return false;
	}