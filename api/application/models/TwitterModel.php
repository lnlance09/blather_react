<?php
class TwitterModel extends CI_Model {
	public $twitter;

	public function __construct() {
		parent::__construct();

		// Load the models
		$this->load->model('MediaModel', 'media');

		// Define the API settings
		$this->appId = 'XSipJjO7jW6XUK1bgIF6FrZze';
		$this->appSecret = 'tacMq6YGC1MIzc98X8Cq2cDGiIOM8ooCC4s40DQne2ctoCqfEv';
		$this->version = '1.0';
		$this->hash = 'HMAC-SHA1';
		$this->redirectUrl = $this->config->base_url().'settings/twitter';

		// Define the OAuth API endpoints
		$this->accessUrl = 'https://api.twitter.com/oauth/access_token';
		$this->authorizeUrl = 'https://api.twitter.com/oauth/authenticate';
		$this->refreshUrl = 'https://api.twitter.com/oauth/token';
		$this->tokenUrl = 'https://api.twitter.com/oauth/request_token';
		$this->verifyUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json';

		// Define the regular API endpoints
		$this->listFeedUrl = 'https://api.twitter.com/1.1/lists/statuses.json';
		$this->mentionsUrl = 'https://api.twitter.com/1.1/statuses/mentions_timeline.json';
		$this->searchUrl = 'https://api.twitter.com/1.1/users/search.json';
		$this->statusesUrl = 'https://api.twitter.com/1.1/statuses/user_timeline.json';
		$this->tweetUrl = 'https://api.twitter.com/1.1/statuses/show.json';
		$this->usersUrl = 'https://api.twitter.com/1.1/users/show.json';
		$this->postTweetUrl = 'https://api.twitter.com/1.1/statuses/update.json';

		$this->db->query("SET time_zone='+0:00'");
	} 

	/**
	 * Send an API request to the authorize URL
	 * @param  [string] $token  [An app token]
	 * @param  [string] $secret [The predefined app secrey]
	 * @return [array]          [description]
	 */
	public function authorizeApp($token, $secret) {
		$nonce = $this->generateNonce();
		$data = [
			'force_login' => 'false',
			'oauth_token' => $token
		];
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => $this->hash,
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		return $this->sendRequest($this->authorizeUrl, false, $data, $headers, $token, $secret);
	}

	/**
	 * [cryptoRandSecure description]
	 * @param  [type] $min [description]
	 * @param  [type] $max [description]
	 * @return [type]      [description]
	 */
	public function cryptoRandSecure($min, $max) {
		$range = $max - $min;
		if ($range < 1) {
			return $min;
		}

		$log = ceil(log($range, 2));
		$bytes = (int)($log/8) + 1;
		$bits = (int)$log+1;
		$filter = (int)(1 << $bits)-1;

		do {
			$rnd = hexdec(bin2hex(openssl_random_pseudo_bytes($bytes)));
			$rnd = $rnd & $filter;
		} while ($rnd >= $range);
		return $min + $rnd;
	}

	/**
	 * Generate the base signature that will be used for encryption
	 * @param  [boolen] $post   [true for post, false for get]
	 * @param  [type] $url    [The URL where the request will be sent]
	 * @param  [type] $params []
	 * @return [type]         [description]
	 */
	public function generateBaseString($post, $url, $params) {
		$status = false;
		if (array_key_exists('status', $params)) {
			$status = $params['status'];
			unset($params['status']);
		}
		$string = ($post ? 'POST' : 'GET').'&'.rawurlencode($url).'&';
		$string .= rawurlencode(http_build_query($params));
		if ($status) {
			$string .= rawurlencode('&status='.$status);
		}
		return $string;
	}

	/**
	 * Generate a 'nonce' parameter that is included in each request header
	 * @return [string] [description]
	 */
	public function generateNonce() {
		$token = '';
		$codeAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$codeAlphabet.= 'abcdefghijklmnopqrstuvwxyz';
		$codeAlphabet.= '0123456789';
		$max = strlen($codeAlphabet)-1;
		for ($i=0;$i<32;$i++) {
			$token .= $codeAlphabet[$this->cryptoRandSecure(0, $max)];
		}
		return $token;
	}

	/**
	 * Generate the singature that is sent along with each API request
	 * @param  [string] $string [The query string for the request]
	 * @param  [string] $token  [The access token]
	 * @return [string]         [The base 64 encoded signature]
	 */
	public function generateSignature($string, $token) {
		$key = rawurlencode($this->appSecret).'&';
		if ($token) {
			$key .= rawurlencode($token);
		}
		return rawurlencode(base64_encode(hash_hmac('sha1', $string, $key, true)));
	}

	/**
	 * Make a request to retrieve an access token that is needed for each API request
	 * @param  [string] $verifier [The OAuth verifier]
	 * @param  [string] $token    [The request token]
	 * @param  [string] $secret   [The app secret]
	 * @return [array]            [An array containing the access token]
	 */
	public function getAccessToken($verifier, $token, $secret = null) {
		$nonce = $this->generateNonce();
		$data = [
			'oauth_verifier' => $verifier
		];
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		$info = $this->sendRequest($this->accessUrl, true, $data, $headers, $token, $secret);
		if ($info === 'Reverse auth credentials are invalid') {
			return false;
		}

		parse_str($info, $array);
		return $array;
	}

	public function getAllPages($only_with_fallacies = false) {
		$this->db->select('p.*');

		if ($only_with_fallacies) {
			$this->db->join('fallacy_entries fe', 'p.social_media_id=fe.page_id');
		}

		$this->db->where('p.type', 'twitter');

		if ($only_with_fallacies) {
			$this->db->group_by('p.id');
		}

		return $this->db->get('pages p')->result_array();
	}

	public function getAllStars($q, $page, $just_count = false) {
		$params = [];
		$select = "p.type, p.social_media_id, p.about, p.name, CONCAT('".S3_PATH."', s3_pic) AS profile_pic, p.username, fallacy_count";
		if ($just_count) {
			$select = "COUNT(*) AS count";
		}

		$sql = "SELECT ".$select."
				FROM pages p
				LEFT JOIN (
					SELECT COUNT(*) AS fallacy_count, page_id
					FROM fallacy_entries f
					GROUP BY page_id
				) f ON p.social_media_id = f.page_id ";
		
		if ($q) {
			$params = ['%'.$q.'%', '%'.$q.'%', '%'.$q.'%'];
			$sql .= " WHERE (p.name LIKE ? OR p.username LIKE ? OR p.about LIKE ?)";
		}

		$sql .= " ".($q ? " AND " : " WHERE ")." fallacy_count > 5 ";
		$sql .= " ORDER BY fallacy_count DESC";

		if (!$just_count) {
			$limit = 25;
			$start = $page*$limit;
			$sql .= " LIMIT ".$start.", ".$limit;
		}

		$results = $this->db->query($sql, $params)->result_array();

		if (empty($results)) {
			return false;
		}

		if ($just_count) {
			return $results[0]['count'];
		}

		return $results;
	}

	public function getAllTweets() {
		$this->db->select('*');
		return $this->db->get('twitter_posts')->result_array();
	}

	public function getAuthUrl() {
		$token = $this->getRequestToken();
		if ($token) {
			return $this->authorizeUrl.'?oauth_token='.$token['oauth_token'];
		}
		return false;
	}

	public function getGrifters() {

	}

	public function getListFeed($id, $lastId, $token, $secret, $decode = true) {
		$data = [
			'count' => 25,
			'include_rts' => false,
			'list_id' => $id,
			'tweet_mode' => 'extended'
		];

		if ($lastId) {
			$data['max_id'] = $lastId;
		}

		$nonce = $this->generateNonce();
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		$info = $this->sendRequest($this->listFeedUrl, false, $data, $headers, $token, $secret);
		return $decode ? @json_decode($info, true) : $info;
	}

	public function getPageExtended($id, $auth, $token, $secret) {
		if ($auth) {
			$page = $this->getPageInfo($id, $token, $secret);
			if (array_key_exists('errors', $page)) {
				return [
					'code' => 404,
					'error' => 'This twitter page does not exist'
				];
			}

			$page_id = $page['id_str'];
			$page_name = $page['name'];
			$page_pic = $page['profile_image_url_https'];
			$page = $this->insertPage([
				'about' => $page['description'],
				'is_verified' => $page['verified'],
				'name' => $page['name'],
				'profile_pic' => str_replace('_normal', '', $page_pic),
				'social_media_id' => $page_id,
				'type' => 'twitter',
				'username' => $page['screen_name']
			]);
			$page['external_url'] = 'https://www.twitter.com/'.$page['username'];
			$page['profile_pic'] = $this->saveUserPic($page_id, $page_name, $page_pic);

			return [
				'data' => $page,
				'error' => false
			];
		} else {
			$page = $this->getPageInfoFromDB($id);
			if (!$page) {
				return [
					'code' => 404,
					'error' => 'That twitter page does not exist'
				];
			}
			$page['external_url'] = 'https://www.twitter.com/'.$page['username'];
			return [
				'data' => $page,
				'error' => false
			];
		}
	}

	/**
	 * Make a request to Twitter's API to get info about a given page
	 * @param  [string] $id     [Either the screen name or user ID of the given page]
	 * @param  [string] $token  [The access token]
	 * @param  [string] $secret [The app secret]
	 * @return [array]          [An array containing info about the given page]
	 */
	public function getPageInfo($id, $token, $secret, $decode = true) {
		$nonce = $this->generateNonce();
		$data['screen_name'] = $id;
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		$info = $this->sendRequest($this->usersUrl, false, $data, $headers, $token, $secret);
		return $decode ? @json_decode($info, true) : $info;
	}

	/**
	 * Query the DB to get the page info for a given page from the DB
	 * @param  [string] $id         [The page ID of the page]
	 * @return [array|boolan]       [An array containing data about the given page OR false if no rows are returned]
	 */
	public function getPageInfoFromDB($id, $just_count = false) {
		$select = "about, name, id, social_media_id, username, CONCAT('".S3_PATH."', s3_pic) AS profile_pic";
		if ($just_count) {
			$select = 'COUNT(*) AS count';
		}

		$sql = "SELECT ".$select."
				FROM pages 
				WHERE type = 'twitter'
				AND (social_media_id = ? OR username = ?)";
		$params = [$id, $id];
		$results = $this->db->query($sql, $params)->result_array();
		
		if ($just_count) {
			return $results[0]['count'] > 0;
		}

		if (empty($results)) {
			return false;
		}

		return $results[0];
	}

	/**
	 * Make a request to the API to retrieve a request token
	 * @return [array] [The request token that is used to retrieve an access token]
	 */
	public function getRequestToken() {
		$nonce = $this->generateNonce();
		$data = [
			'oauth_callback' => $this->redirectUrl,
			'x_auth_access_type' => 'read-write'
		];
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_version' => $this->version
		];
		$info = $this->sendRequest($this->tokenUrl, true, $data, $headers, false, false);
		parse_str($info, $array);
		return $array;
	}

	/**
	 * Get the statuses of a particular Twitter user
	 * @param  [array] $data    [Array containing query string data that will be sent along with the request]
	 * @param  [string] $token  [The access token]
	 * @param  [string] $secret [The app secret]
	 * @return [array]          [An array containing the given user's Tweets]
	 */
	public function getStatuses($data, $token, $secret) {
		$nonce = $this->generateNonce();
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		$info = $this->sendRequest($this->statusesUrl, false, $data, $headers, $token, $secret);
		return @json_decode($info, true);
	}

	public function getTweetExtended($id, $auth = false, $token = null, $secret = null) {
		if ($auth) {
			$tweet = $this->getTweetInfo($id, $token, $secret);
			if (array_key_exists('errors', $tweet)) {
				return [
					'code' => 404,
					'error' => 'This tweet does not exist'
				];
			}

			$original_tweet = $tweet;
			$data['created_at'] = date('Y-m-d H:i:s', strtotime($tweet['created_at']));
			$data['favorite_count'] = $tweet['favorite_count'];
			$data['full_text'] = $tweet['full_text'];
			$data['retweet_count'] = $tweet['retweet_count'];
			$data['page_id'] = $tweet['user']['id'];
			$data['tweet_id'] = $tweet['id'];
			if (array_key_exists('extended_entities', $tweet)) {
				$data['extended_entities'] = json_encode($tweet['extended_entities'], true);
			}
			if (array_key_exists('entities', $tweet)) {
				$data['entities'] = json_encode($tweet['entities'], true);
			}
			$this->insertPage([
				'about' => $tweet['user']['description'],
				'is_verified' => $tweet['user']['verified'],
				'name' => $tweet['user']['name'],
				'profile_pic' => str_replace('_normal', '', $tweet['user']['profile_image_url_https']),
				'social_media_id' => $tweet['user']['id'],
				'type' => 'twitter',
				'username' => $tweet['user']['screen_name']
			]);

			if (array_key_exists('retweeted_status', $tweet)) {
				$retweet = $tweet['retweeted_status'];
				$data['retweeted_created_at'] = date('Y-m-d H:i:s', strtotime($retweet['created_at']));
				$data['retweeted_favorite_count'] = $retweet['favorite_count'];
				$data['retweeted_full_text'] = $retweet['full_text'];
				$data['retweeted_retweet_count'] = $retweet['retweet_count'];
				$data['retweeted_page_id'] = $retweet['user']['id'];
				$data['retweeted_status'] = true;
				$data['retweeted_tweet_id'] = $retweet['id'];
				if (array_key_exists('extended_entities', $retweet)) {
					$data['retweeted_extended_entities'] = json_encode($retweet['extended_entities'], true);
				}
				if (array_key_exists('entities', $retweet)) {
					$data['retweeted_entities'] = json_encode($retweet['entities'], true);
				}
				$this->insertPage([
					'about' => $retweet['user']['description'],
					'is_verified' => $retweet['user']['verified'],
					'name' => $retweet['user']['name'],
					'profile_pic' => str_replace('_normal', '', $retweet['user']['profile_image_url_https']),
					'social_media_id' => $retweet['user']['id'],
					'type' => 'twitter',
					'username' => $retweet['user']['screen_name']
				]);
			}

			if (array_key_exists('quoted_status', $tweet)) {
				$quoted_tweet = $tweet['quoted_status'];
				$data['quoted_created_at'] = date('Y-m-d H:i:s', strtotime($quoted_tweet['created_at']));
				$data['quoted_favorite_count'] = $quoted_tweet['favorite_count'];
				$data['quoted_full_text'] = $quoted_tweet['full_text'];
				$data['quoted_retweet_count'] = $quoted_tweet['retweet_count'];
				$data['quoted_page_id'] = $quoted_tweet['user']['id'];
				$data['quoted_status'] = true;
				$data['quoted_tweet_id'] = $quoted_tweet['id'];
				$this->insertPage([
					'about' => $quoted_tweet['user']['description'],
					'is_verified' => $quoted_tweet['user']['verified'],
					'name' => $quoted_tweet['user']['name'],
					'profile_pic' => str_replace('_normal', '', $quoted_tweet['user']['profile_image_url_https']),
					'social_media_id' => $quoted_tweet['user']['id'],
					'type' => 'twitter',
					'username' => $quoted_tweet['user']['screen_name']
				]);
			}

			$data['tweet_json'] = json_encode($tweet);
			$this->insertTweet($data);
			return [
				'data' => $original_tweet,
				'error' => false
			];
		} else {
			$tweet = $this->getTweetFromDB($id);
			if (!$tweet) {
				return [
					'code' => 404,
					'error' => 'That tweet does not exist'
				];
			}

			return [
				'data' => json_decode($tweet['tweet_json'], true),
				'error' => false,
				'profile_pic' => $tweet['profile_pic']
			];
		}
	}

	/**
	 * Query the DB to get info about a given Tweet
	 * @param  [int] $id           [The ID of the Tweet]
	 * @param  [boolean] $archive [Whether or not to get the archive code]
	 * @return [array|boolean]     [An array containing data about the given Tweet OR false if the row doesn't exist]
	 */
	public function getTweetFromDB($id, $archive = false) {
		$select = "tweet_json, CONCAT('".S3_PATH."', p.s3_pic) AS profile_pic";
		if ($archive) {
			$select .= ', a.code, a.date_created';
		}

		$this->db->select($select);

		if ($archive) {
			$this->db->join('archive_links a', 'a.object_id=tp.tweet_id AND a.page_id=tp.page_id', 'left');
		}

		$this->db->join('pages p', 'tp.page_id=p.social_media_id');
		$this->db->where('tweet_id', $id);
		$data = $this->db->get('twitter_posts tp')->result_array();
		return count($data) === 1 ? $data[0] : false;
	}

	/**
	 * Get the info about a particular tweet
	 * @param  [array] $data    [Array containing query string data that will be sent along with the request]
	 * @param  [string] $token  [The access token]
	 * @param  [string] $secret [The app secret]
	 * @return [type]         [description]
	 */
	public function getTweetInfo($id, $token, $secret, $decode = true) {
		$nonce = $this->generateNonce();
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		$data = [
			'id' => (int)$id,
			'include_entities' => true,
			'tweet_mode' => 'extended'
		];
		$info = $this->sendRequest($this->tweetUrl, false, $data, $headers, $token, $secret);
		return $decode ? @json_decode($info, true) : $info;
	}

	/**
	 * Insert or updata row in the `pages` table
	 * @param  [array] $data [An array containing data for the row to insert/update]
	 * @return [array]       [An array that is an updated version of the array that was provided as input]
	 */
	public function insertPage($page) {
		$this->db->select('COUNT(*) AS count');
		$this->db->where([
			'social_media_id' => $page['social_media_id'],
			'type' => 'twitter'
		]);
		$query = $this->db->get('pages')->result_array();
		if ($query[0]['count'] == 0) {
			$this->db->insert('pages', $page);
		} else {
			$this->db->where([
				'social_media_id' => $page['social_media_id'],
				'type' => 'twitter'
			]);
			$this->db->update('pages', $page);
		}

		$this->db->select('id');
		$this->db->where('social_media_id', $page['social_media_id']);
		$row = $this->db->get('pages')->row();
		$page['id'] = $row->id;
		$page['about'] = defaultPageAbout($page['about'], $page['name']);
		return $page;
	}

	/**
	 * Insert/update a tweet into the DB
	 * @param  [array] $tweet [An array containing data about a tweet]
	 */
	public function insertTweet($data) {
		$this->db->select('COUNT(*) AS count');
		$this->db->where('tweet_id', $data['tweet_id']);
		$query = $this->db->get('twitter_posts')->result_array();
		if ($query[0]['count'] == 0) {
			$this->db->insert('twitter_posts', $data);
		} else {
			$this->db->where('tweet_id', $data['tweet_id']);
			$this->db->update('twitter_posts', $data);
		}
	}

	public function parseExtendedEntities($tweet) {
		if (array_key_exists('extended_entities', $tweet)) {
			for ($i=0;$i<count($tweet['extended_entities']['media']);$i++) {
				$pic = $tweet['extended_entities']['media'][$i]['media_url_https'];
				$path = 'public/img/tweets/'.$tweet['id'].'/'.basename($pic);
				savePic($pic, $path);

				$key = 'tweets/'.$tweet['id'].'/'.basename($pic);
				$s3Link = $this->media->addToS3($key, $path);
				$tweet['extended_entities']['media'][$i]['media_url_https'] = $s3Link;
			}
		}
		return json_encode($tweet, true);
	}

	public function parseSearchResults($results) {
		if (array_key_exists('errors', $results)) {
			return false;
		}

		$return = [];
		for ($i=0;$i<count($results);$i++) {
			$return[$i] = [
				'about' => $results[$i]['description'],
				'id' => $results[$i]['id_str'],
				'is_verified' => $results[$i]['verified'],
				'like_count' => $results[$i]['followers_count'],
				'name' => $results[$i]['name'],
				'profile_pic' => str_replace('_normal', '', $results[$i]['profile_image_url']),
				'social_media_id' => $results[$i]['id_str'],
				'username' => $results[$i]['screen_name'],
				'type' => 'twitter'
			];
		}
		return $return;
	}

	/**
	 * Post a tweet to Twitter
	 * @param  [array] $data   [An array containing the post payload]
	 * @param  [string] $token  [Access token]
	 * @param  [string] $secret [Token secret]
	 * @return [array]         [description]
	 */
	public function postTweet($data, $token, $secret) {
		$nonce = $this->generateNonce();
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => $this->hash,
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version
		];
		return $this->sendRequest($this->postTweetUrl, true, $data, $headers, $token, $secret);
	}

	/**
	 * Send a request to Twitter's API to refresh a current access token
	 * @return [type] [description]
	 */
	public function refreshToken() {
		$token = $this->getRequestToken();
		$nonce = $this->generateNonce();
		$data = [
			'oauth_token' => $token['oauth_token'],
		];
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_timestamp' => time(),
			'oauth_version' => $this->version,
		];

		$info = $this->sendRequest('https://api.twitter.com/oauth/authenticate', false, $data, $headers, false, false);
	}

	public function saveUserPic($id, $name, string $pic) {
		$pic = str_replace('_normal', '', $pic);
		$path = 'public/img/pages/twitter/'.$id.'.jpg';
		$name = preg_replace("/[^A-Za-z0-9 ]/", '', $name);
		$name = str_replace(' ', '-', $name);
		savePic($pic, $path, true);

		$key = 'pages/twitter/'.$name.'-'.$id.'-'.time().'.jpg';
		if (filesize($path) == 0) {
			return 'https://s3.amazonaws.com/blather22/'.$key;
		}

		$s3Link = $this->media->addToS3($key, $path, true, true);

		$this->db->where([
			'social_media_id' => $id,
			'type' => 'twitter'
		]);
		$this->db->update('pages', [
			's3_pic' => $key
		]);

		return $s3Link;
	}

	public function search($data, $token, $secret, $parse = false) {
		$nonce = $this->generateNonce();
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => $this->hash,
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version,
		];
		$results = $this->sendRequest($this->searchUrl, false, $data, $headers, $token, $secret);
		if ($parse) {
			return $this->parseSearchResults(@json_decode($results, true));
		}

		return $results;
	}

	public function searchPagesFromDb($q, $page = 0, $just_count = false) {
		$select = "about, name, CONCAT('".S3_PATH."', s3_pic) AS profile_pic, social_media_id, type, username";
		if ($just_count) {
			$select = 'COUNT(*) AS count';
		}

		$sql = "SELECT ".$select." FROM pages WHERE type = 'twitter' ";
		$params = [];
		if ($q) {
			$sql .= "AND (name LIKE ? OR username LIKE ? OR about LIKE ?)";
			$params[] = '%'.$q.'%';
			$params[] = '%'.$q.'%';
			$params[] = '%'.$q.'%';
		}

		if (!$just_count) {
			$limit = 10;
			$start = $page*$limit;
			$sql .= " LIMIT ".$start.", ".$limit;
		}

		$results = $this->db->query($sql, $params)->result_array();
		if ($just_count) {
			return $results[0]['count'];
		}

		return $results;
	}

	public function searchTweets($q, $page, $just_count = false) {
		$select = 'tweet_json';
		if ($just_count) {
			$select = 'COUNT(*) AS count';
		}

		$this->db->select($select);
		$this->db->like('full_text', $q);

		if (!$just_count) {
			$limit = 10;
			$start = $page*$limit;
			$this->db->limit($limit, $start);
		}

		$results = $this->db->get('twitter_posts')->result_array();
		if ($just_count) {
			return $results[0]['count'];
		}

		return $results;
	}

	/**
	 * Send a request to Twitter's API
	 * @param [string]  $url     [The URL to send a request to]
	 * @param [bookean] $post    [Whether or not this is a POST request]
	 * @param [array]   $data    [Array containing either POST or GET data that will be sent along with the request]
	 * @param [array]   $headers [An array containing the request headers]
	 * @param [string]  $token   [The access token]
	 * @param [string]  $secret  [The app secret]
	 */
	public function sendRequest($url, $post, $data, $headers, $token, $secret) {
		if ($data) {
			$params = array_merge($data, $headers);
			ksort($params);
		} else {
			$params = $headers;
		}

		// Generate the base string and the signature
		$string = $this->generateBaseString($post, $url, $params);
		$signature = $this->generateSignature($string, $secret);
		$authHeader = 'Authorization: OAuth oauth_consumer_key="'.$this->appId.'", 
					oauth_nonce="'.$headers['oauth_nonce'].'", 
					oauth_signature="'.$signature.'", 
					oauth_signature_method="'.$this->hash.'", 
					oauth_timestamp="'.$headers['oauth_timestamp'].'",';
		if ($token) {
			$authHeader .= 'oauth_token="'.$token.'", ';
		}
		$authHeader .= 'oauth_version="'.$this->version.'"';
		$header = [$authHeader];
		
		if (!$post && $data) {
			$url .= '?'.http_build_query($data);
		}

		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		
		if ($post) {
			curl_setopt($ch, CURLOPT_POST, true);
			if (array_key_exists('status', $data)) {
				curl_setopt($ch, CURLOPT_POSTFIELDS, 'status='.$data['status']);
			} else {
				curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
			}
		}

		$data = curl_exec($ch);
		curl_close($ch);
		return $data;
	}

	/**
	 * [verifyCredentials description]
	 * @param  [string] $token  [description]
	 * @param  [string] $secret [description]
	 * @return [type]         [description]
	 */
	public function verifyCredentials($token, $secret, $decode = true) {
		$nonce = $this->generateNonce();
		$headers = [
			'oauth_consumer_key' => $this->appId,
			'oauth_nonce' => $nonce,
			'oauth_signature_method' => $this->hash,
			'oauth_timestamp' => time(),
			'oauth_token' => $token,
			'oauth_version' => $this->version,
		];
		$info = $this->sendRequest($this->verifyUrl, false, false, $headers, $token, $secret);
		return $decode ? @json_decode($info, true) : $info;
	}
}