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
		curl_setopt($ch, CURLOPT_URL, 'http://archive.vn/submit/');
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_HEADER, true);
		curl_setopt($ch, CURLOPT_REFERER, 'http://archive.vn/');
		curl_setopt($ch, CURLOPT_POST, true);
		curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
			'url' => $url
		]));
		curl_setopt($ch, CURLOPT_HTTPHEADER, [
			'Accept-Encoding: gzip, deflate',
			'Content-Type: application/x-www-form-urlencoded',
			'Host: archive.vn',
			'Origin: http://archive.is',
			'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
		]);
		$data = curl_exec($ch);
		$code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
		curl_close($ch);

		$location = false;
		if ($code === 302) {
			if (preg_match('~Location: (.*)~i', $data, $match)) {
				$location = trim($match[1]);
			}
		}

		if ($code === 200) {
			if (preg_match('~Refresh: (.*)~i', $data, $match)) {
				$location = trim($match[1]);
			}
		}

		$code = null;
		if ($location) {
			$exp = explode('/', $location);
			$code = end($exp);
		}

		return $code;
	}

	function curlGetContents($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($ch, CURLOPT_ENCODING, 'gzip, deflate');

		$headers = [];
		$headers[] = 'Authority: www.youtube.com';
		$headers[] = 'Pragma: no-cache';
		$headers[] = 'Cache-Control: no-cache';
		$headers[] = 'X-Youtube-Device: cbr=Chrome&cbrver=80.0.3987.149&ceng=WebKit&cengver=537.36&cos=Macintosh&cosver=10_15_3';
		$headers[] = 'X-Youtube-Page-Label: youtube.ytfe.desktop_20200423_6_RC0';
		$headers[] = 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.149 Safari/537.36';
		$headers[] = 'X-Youtube-Variants-Checksum: 433bb42f710dedc85fdce1a9a46183e7';
		$headers[] = 'X-Youtube-Page-Cl: 308102149';
		$headers[] = 'X-Youtube-Utc-Offset: -240';
		$headers[] = 'X-Youtube-Client-Name: 1';
		$headers[] = 'X-Youtube-Client-Version: 2.20200424.06.00';
		$headers[] = 'Sec-Fetch-Dest: empty';
		$headers[] = 'X-Youtube-Identity-Token: QUFFLUhqbTNodUJzYnpqNUxTbklLYVBDMkluMkJrSE9nZ3w=';
		$headers[] = 'X-Youtube-Time-Zone: America/New_York';
		$headers[] = 'X-Youtube-Ad-Signals: dt=1587788132862&flash=0&frm&u_tz=-240&u_his=3&u_java&u_h=900&u_w=1440&u_ah=877&u_aw=1410&u_cd=24&u_nplug=3&u_nmime=4&bc=31&bih=374&biw=1395&brdim=30%2C23%2C30%2C23%2C1410%2C23%2C1410%2C877%2C1410%2C374&vis=1&wgl=true&ca_type=image&bid=ANyPxKoC6Z6-Fl9IDpBiYv0paGahm-x_QH3ZBCD6z29ytfD_WlKbIyT_XQ0_gxvas5BYBZKcZrq4mJWLOkEoe00UuiwDnFSS1Q';
		$headers[] = 'Accept: */*';
		$headers[] = 'X-Client-Data: CJe2yQEIorbJAQjBtskBCKmdygEIt6rKAQjLrsoBCM+vygEIvLDKAQiGtcoBCJe1ygEI7bXKAQiOusoBCMC6ygEI6bvKAQjnxsoBGK+zygE=';
		$headers[] = 'Sec-Fetch-Site: same-origin';
		$headers[] = 'Sec-Fetch-Mode: cors';
		$headers[] = 'Referer: https://www.youtube.com/watch?v=C92LlAnGScc';
		$headers[] = 'Accept-Language: en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7';
		$headers[] = 'Cookie: VISITOR_INFO1_LIVE=1t8tc8sO0QM; LOGIN_INFO=AFmmF2swRAIgRWMRfcRyKTyl9cMXnvC07pXonhDYxdpy5tVpZN4Dk8oCIDSHUpGXc8Ks0E8K9GzLSbwj1XvaGGQEeKegvS0kVWfO:QUQ3MjNmeV85emp2ZkdzWktLQnNEOHozVDMyb3NRMDBsZ0dpWUlWVUd1UjBxZUZ2bzNCZ3dVWklFMldyeU8ybVVkUVB1YVE1Qnl3VmRpMVRxaERmRHVEbks4QWdaUzVsb2NHejgzbERHd2ZWTzFaUlVfWGFVdmJLN2tCV1dIQUpGZlNuaE02RFNCSTZsR3g1THdvcHQzWWQxMU5MZmxqZ055SXVCeDhZSUkySElVaVlhbFFiZXZB; _ga=GA1.2.234000833.1580862792; YSC=ltAs996Ym_w; wide=1; SID=vwc6CA4Fa92yUf1UBqHgcMXTjHm4tKgRwMPnAkHonadk8IqMbPX9QZx3R_LY18LHEW6ooQ.; __Secure-3PSID=vwc6CA4Fa92yUf1UBqHgcMXTjHm4tKgRwMPnAkHonadk8IqMraOpwV3KU4_fZYLvIlzFGQ.; HSID=AUgUvK2x0pObbJ80p; SSID=A6KAPo--wd5Ih3wOq; APISID=rQT6b7QvfKi0QHnB/AkHAe8xmC6lh_1Dpv; SAPISID=TF2MmAi7i89gsEky/As9sLwYtHTPL22mP0; __Secure-HSID=AUgUvK2x0pObbJ80p; __Secure-SSID=A6KAPo--wd5Ih3wOq; __Secure-APISID=rQT6b7QvfKi0QHnB/AkHAe8xmC6lh_1Dpv; __Secure-3PAPISID=TF2MmAi7i89gsEky/As9sLwYtHTPL22mP0; PREF=f6=80&f5=30&al=en&f4=4000000; SIDCC=AJi4QfGUITBSol-yEDbkINCSTV5RIjvkA7q77QYykkuepwFinJxyZs9sJYXVpKMVJcUQA1SSRaw';
		curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

		$data = curl_exec($ch);
		curl_close($ch);
		return $data
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
		if ($style) {
			echo '<div style="color:#090127;text-shadow:none;text-align:left;">';
		}

		echo '<pre>';
		print_r($array);
		echo '</pre>';

		if ($style) {
			echo '</div>';
		}
	}

	function generateAlphaNumString($length) {
		$characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
		$string = '';
		$max = strlen($characters) - 1;
		for ($i=0;$i<$length;$i++) {
			$string .= $characters[mt_rand(0, $max)];
		}

		return $string;
	}

	function getArticle($word) {
		$vowels = ['a','e','i','o','u'];
		$subStr = substr(strtolower($word), 0, 1);
		return in_array($subStr, $vowels) ? 'an' : 'a';
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
		if ($code == 200) {
			return @json_decode($data, true);
		}
		return false;
	}

	function parseCommentStr($commentStr) {
		$exp = explode('_', $commentStr);
		return count($exp) == 2 ? $exp[1] : $commentStr;
	}

	function parseDuration($duration) {
		preg_match("/PT(\d+)M(\d+)S/", $duration, $matches);
		if (count($matches) > 1) {
			return ($matches[1]*60)+$matches[2];
		}

		preg_match("/PT(\d+)H(\d+)M/", $duration, $matches);
		if (count($matches) > 1) {
			return ($matches[1]*3600)+($matches[2]*60);
		}

		preg_match("/PT(\d+)S/", $duration, $matches);
		if (count($matches) > 1) {
			return $matches[1];
		}

		return null;
	}

	function parseUrl($url) {
		$parse = parse_url($url);
		$a = null;
		$network = null;
		$username = null;
		$object_id = null;
		$comment_id = null;
		$start_time = null;
		$end_time = null;
		$type = 'tweet';

		$host = $parse['host'];

		switch ($host) {
			case 'www.facebook.com':
			case 'facebook.com':

				$network = 'facebook';
				$exp = explode('/', $parse['path']);
				if (count($exp) > 3) {
					$username = $exp[1];
					$object_id = $exp[3];
				}

				if (array_key_exists('query', $parse)) {
					parse_str($parse['query'], $query);
					$comment_id = array_key_exists('comment_id', $query) ? $query['comment_id'] : null;
				}
				break;

			case 'mobile.twitter.com':
			case 'www.twitter.com':
			case 'twitter.com':

				$network = 'twitter';
				$exp = explode('/', $parse['path']);
				array_shift($exp);
				if (count($exp) >= 3) {
					$username = $exp[0];
					$object_id = $exp[2];
					$type = 'tweet';
				}
				break;

			case 'www.youtube.com':
			case 'youtube.com':

				$network = 'youtube';
				if (array_key_exists('query', $parse)) {
					parse_str($parse['query'], $query);
					$type = 'video';
					$object_id = array_key_exists('v', $query) ? $query['v'] : null;
					$comment_id = array_key_exists('lc', $query) ? $query['lc'] : null;
					$start_time = array_key_exists('t', $query) ? $query['t'] : null;
					if ($comment_id) {
						$type = 'comment';
					}
				}
				break;

			case 'youtu.be':

				$network = 'youtube';
				if (array_key_exists('path', $parse)) {
					$exp = explode('/', $parse['path']);
					array_shift($exp);
					if (count($exp) === 1) {
						$object_id = $exp[0];
						$type = 'video';
					}
					if (array_key_exists('query', $parse)) {
						parse_str($parse['query'], $query);
						$comment_id = array_key_exists('lc', $query) ? $query['lc'] : null;
						$start_time = array_key_exists('t', $query) ? $query['t'] : null;
						$type = 'comment';
					}
				}
				break;
		}

		if (($host == 'blather.io' || $host == 'localhost') && array_key_exists('path', $parse)) {
			$exp = explode('/', $parse['path']);
			array_shift($exp);
			if (count($exp) === 2) {
				$type = $exp[0];
				$object_id = $exp[1];

				if ($type == 'comment') {
					$network = 'youtube';
					$comment_id = $object_id;
				}

				if ($type == 'tweet') {
					$network = 'twitter';
				}

				if ($type == 'video') {
					$network = 'youtube';
				}

				if (array_key_exists('query', $parse)) {
					parse_str($parse['query'], $query);
					$a = array_key_exists('a', $query) ? $query['a'] : null;
				}
			}
		}

		if ($network) {
			return [
				'a' => $a,
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

	function removeStopWords($string) {
		require('stop_words.php');
		$exp = explode(' ', strtolower($string));
		for ($i=0;$i<count($exp);$i++) {
			if (in_array($exp[$i], $stop_words)) {
				unset($exp[$i]);
			}
		}

		$unique = array_unique($exp);
		return implode(' ', $unique);
	}

	function savePic($pic, $path) {
		if (!file_exists($path)) {
			if (!is_dir(dirname($path))) {
				mkdir(dirname($path));
			}

			$img = @file_get_contents($pic);
			file_put_contents($path, $img);
		}
	}

	function slugify($text) {
		$text = removeStopWords($text);
		$text = str_replace("'", '', $text);
		$text = str_replace('"', '', $text);
		$text = preg_replace('~[^\\pL\d]+~u', '-', $text);
		$text = trim($text, '-');
		$text = iconv('utf-8', 'us-ascii//TRANSLIT', $text);
		$text = strtolower($text);
		$text = preg_replace('~[^-\w]+~', '', $text);
		if (empty($text)) {
			return 'n-a';
		}

		return $text;
	}

	function timeToSecs($time) {
		$exp = explode(':', $time);
		if (count($exp) === 2) {
			return ($exp[0]*60)+$exp[1];
		}
		if (count($exp) === 3) {
			return ($exp[0]*3600)+($exp[1]*60)+$exp[2];
		}
		return null;
	}