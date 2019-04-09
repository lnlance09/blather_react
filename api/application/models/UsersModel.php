<?php 
	class UsersModel extends CI_Model {
		public function __construct() {
			parent:: __construct();

			$this->s3Path = 'https://s3.amazonaws.com/blather22/';

			$this->load->database();
			$this->load->helper('common_helper');
			$this->db->query("SET time_zone='+0:00'");
		}

		public function alreadyArchived($data, $return_id = false) {
			/* TODO */
			// Merge with getArchivedLinks
			$this->db->select('COUNT(*) AS count, id');
			$this->db->where($data);
			$result = $this->db->get('archived_links')->result_array();
			if ($return_id) {
				return $result[0]['id'];
			}
			return $result[0]['count'] == 1;
		}

		public function createArchive($data) {
			$code = $data['code'];
			$already = $this->alreadyArchived($data);
			if ($already) {
				$this->db->where('link', $data['link']);
				$this->db->where('user_id', $data['user_id']);
				$this->db->update('archived_links', $data);
			} else {
				$data['code'] = $code;
				$this->db->insert('archived_links', $data);
			}
		}

		/**
		 * Insert a new row into the `users` table
		 * @param  [int] $id   	   [The ID of the user]
		 * @param  [string] $type  [The network]
		 * @param  [array] $data   [An array containing data for the insert query]
		 * @return [boolean]       [TRUE if a row was inserted | FALSE if a row was not inserted]
		 */
		public function createUser($id, $type, $data) {
			$networks = ['fb', 'twitter', 'youtube'];
			if (in_array($type, $networks)) {
				$table = $type.'_users';
				$column = $table.'.'.$type.'_id';

				$this->db->select('COUNT(*) AS count');
				$this->db->join($table, 'users.id='.$table.'.user_id');
				$this->db->where($column, $id);
				$query = $this->db->get('users')->result();
				if ($query[0]->count == 0) {
					$this->db->insert('users', $data);
					return true;
				}

				return false;
			}
		}

		public function deleteArchive($id) {
			$this->db->where('id', $id);
			$this->db->delete('archived_links');
		}

		public function generateBearerToken($data, $token = null) {
			$this->load->library('firebasetoken');
			$secret = 'secret';
			if(!$token) {
				return $this->firebasetoken->encode($data, $secret);
			}
			return $this->firebasetoken->decode($token, $secret);
		}

		/**
		 * Query the `archived_links` table
		 * @param  [array] $data [An array containing data for the WHERE clause]
		 * @return [array]       [Results returned from the query]
		 */
		public function getArchivedLinks(
			$data,
			$unique = false,
			$page = 0,
			$just_count = false
		) {
			$post = array_key_exists('object_id', $data);
			$q = null;
			if (array_key_exists('q', $data)) {
				$q = empty($data['q']) ? null : $data['q'];
				unset($data['q']);
			}

			$select = 'a.code, a.date_created, a.description, a.end_time, a.link, a.network, a.start_time, a.type';
			if ($just_count) {
				$select = 'COUNT(*) AS count';
			}

			if (!$just_count && !$post) {
				$select .= ', t.full_text, t.tweet_id, ytv.title, ytc.message, ytv.video_id, ytc.comment_id,
					p.name AS page_name';
			}

			if ($unique) {
				$select = "p.id AS value, p.id AS key, CONCAT(p.name, ' (', COUNT(*), ')') AS text";
			}
			
			$this->db->select($select);
			$this->db->join('pages p', 'a.page_id = p.id');

			if (!$post) {
				$this->db->join('twitter_posts t', "a.object_id = t.tweet_id AND a.type = 'tweet'", 'left');
				$this->db->join('youtube_videos ytv', "a.object_id = ytv.video_id AND a.type = 'video'", 'left');
				$this->db->join('youtube_comments ytc', "a.object_id = ytc.comment_id AND a.type = 'comment'", 'left');
			}

			$this->db->where($data);

			if ($q && !$post) {
				$this->db->like('t.full_text', $q);
				$this->db->or_like('a.description', $q);
				$this->db->or_like('ytv.title', $q);
				$this->db->or_like('ytc.message', $q);
			}

			if (!$just_count && !$unique) {
				$per_page = 10;
				$start = $per_page*$page;
				$this->db->limit($per_page, $start);

				if (empty($q)) {
					$this->db->group_by('a.object_id');
				}

				$this->db->order_by('date_created', 'DESC');
			}

			if ($unique) {
				$this->db->group_by('p.id');
				$this->db->order_by('COUNT(*)', 'DESC');
			}

			$results = $this->db->get('archived_links a')->result_array();
			if ($just_count) {
				return (int)$results[0]['count'];
			}

			if ($post) {
				return empty($results) ? false : $results[0];
			}
			return $results;
		}

		public function getDefaultTwitterTokens() {
			$this->db->select('twitter_access_token, twitter_access_secret');
			$this->db->where('twitter_id', '1230606690');
			return $this->db->get('twitter_users')->row();
		}

		/**
		 * Query the DB to see if a user exists in the `users` table with the given ID/password combo
		 * @param  [int] $id       [The ID of the user]
		 * @param  [string] $password [The password of the user]
		 * @return [boolean]           [TRUE if a row exists | FALSE if a row doesn't exist]
		 */
		public function getUserByCurrentPassword($id, $password) {
			$sql = "SELECT COUNT(*) AS count 
					FROM users 
					WHERE id = ? 
					AND (password = ? OR password_reset = ?)";
			$params = [$id, sha1($password), sha1($password)];
			$result = $this->db->query($sql, $params)->result_array();
			if($result[0]['count'] == 1) {
				return true;
			}
			return false;
		}

		/**
		 * Query the `users` table to get info about a given user
		 * @param  [int] $id           [The ID of the targetted user]
		 * @return [array|bookean]     [If a row exists, then an array containing info about the given page. If not, then false]
		 */
		public function getUserInfo($id, $select = '*') {
			$this->db->select($select);
			if(is_numeric($id)) {
				$this->db->where('u.id', $id);
			} else {
				$this->db->where('u.username', $id);
			}
			$this->db->join('twitter_users t', 'u.id=t.user_id', 'left');
			$this->db->join('youtube_users y', 'u.id=y.user_id', 'left');
			$query = $this->db->get('users u')->result_array();
			if(empty($query)) {
				return false;
			}
			return $query[0];
		}

		/**
		 * Query the DB for all of the users in the `users` table
		 * @return [array] [An array containing data from the query]
		 */
		public function getUsers() {
			$this->db->select('*');
			return $this->db->get('users')->result_array();
		}

		/**
		 * Query the DB to see if a user exists
		 * @param  [string] $email    [The email address of the user who is trying to login]
		 * @param  [string] $password [The user's password]
		 * @return [array]            [An array containing data about the user who successfully logged in]
		 */
		public function login($email, $password) {
			$column = filter_var($email, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
			$select = "users.id, name, username, CONCAT('".$this->s3Path."', img) AS img, bio, email, email_verified AS emailVerified, linked_youtube AS linkedYoutube, linked_fb AS linkedFb, linked_twitter AS linkedTwitter, verification_code AS verificationCode, users.date_created AS dateCreated,
				twitter_users.date_linked AS twitterDate, twitter_users.twitter_access_token AS twitterAccessToken, twitter_users.twitter_access_secret AS twitterAccessSecret, twitter_users.twitter_id AS twitterId,
				youtube_users.youtube_access_token AS youtubeAccessToken, youtube_users.date_linked AS youtubeDate, youtube_users.youtube_refresh_token AS youtubeRefreshToken,youtube_users.youtube_id AS youtubeId";
			$this->db->select($select);
			$this->db->where($column.' = "'.$email.'" AND (password = "'.sha1($password).'" OR password_reset = "'.sha1($password).'")');
			$this->db->join('twitter_users', 'users.id=twitter_users.user_id', 'left');
			$this->db->join('youtube_users', 'users.id=youtube_users.user_id', 'left');
			return $this->db->get('users')->result_array();
		}

		/**
		 * Register a new user
		 * @param  [array] $data [An array containing data about a new user]
		 * @return [type]       [description]
		 */
		public function register($data) {
			$this->db->select('email, username');
			$this->db->where('email', $data['email']);
			$this->db->or_where('username', $data['username']);
			$query = $this->db->get('users')->result_array();

			if (count($query) === 0) {
				$password = $data['password'];
				$data['date_created'] = date('Y-m-d H:i:s');
				$data['password'] = sha1($password);
				$data['raw_password'] = $password;
				$this->db->insert('users', $data);
				
				$token = $this->twitter->getRequestToken();
				if ($token) {
					$twitterOauthToken = $token['oauth_token'];
					$twitterOauthSecret = $token['oauth_token_secret'];
					$twitterUrl = $this->twitter->authorizeUrl.'?oauth_token='.$token['oauth_token'];
				}

				return [
					'error' => false,
					'user' => [
						'bio' => null,
						'email' => $data['email'],
						'emailVerified' => false,
						'id' => $this->db->insert_id(),
						'img' => null,
						'name' => $data['name'],
						'twitterAccessSecret' => $twitterOauthSecret,
						'twitterAccessToken' => $twitterOauthToken,
						'twitterUrl' => $twitterUrl,
						'username' => $data['username'],
						'verificationCode' => $data['verification_code'],
						'youtubeUrl' => $this->youtube->getTokenUrl()
					]
				];
			}

			if ($query[0]['email'] === $data['email']) {
				return [
					'error' => true, 
					'msg' => 'A user with that email already exists'
				];
			}

			if ($query[0]['username'] === $data['username']) {
				return [
					'error' => true, 
					'msg' => 'A user with that username already exists'
				];
			}

			return false;
		}

		public function searchUsers($q = null, $page = 0, $just_count = false) {
			$params = [];
			$select = "u.id, u.name, username, bio AS about, 
					CASE
						WHEN img IS NOT NULL THEN CONCAT('".$this->s3Path."', img)
					END AS profile_pic,
					fallacy_count, discussion_count";
			if ($just_count) {
				$select = "COUNT(*) AS count";
			}

			$sql = "SELECT ".$select."
					FROM users u 
					LEFT JOIN (
						SELECT COUNT(*) as fallacy_count, assigned_by
						FROM fallacy_entries f
					) f ON u.id = f.assigned_by
					LEFT JOIN (
						SELECT COUNT(*) as discussion_count, created_by
						FROM discussions
					) d ON u.id = d.created_by ";
			
			if ($q) {
				$params = ['%'.$q.'%', '%'.$q.'%', '%'.$q.'%'];
				$sql .= " WHERE (u.name LIKE ? OR u.username LIKE ? OR u.bio LIKE ?)";
			}

			if (!$just_count) {
				$limit = 10;
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

		/**
		 * Either insert or update a row to the `facebook_users` table
		 * @param [int] $userId [The ID of the Blather user]
		 * @param [array] $data   [An array containing values for each of the columns in the `facebook_users` table]
		 */
		public function setFbDetails($userId, $data) {
			$this->db->select('COUNT(*) AS count');
			$this->db->where('user_id', $userId);
			$query = $this->db->get('fb_users')->result();

			if($query[0]->count == 0) {
				$this->db->insert('fb_users', $data);
			} else {
				$this->db->where('user_id', $data['user_id']);
				$this->db->update('fb_users', $data);
			}

			$this->updateUser($data['user_id'], [
				'linked_fb' => 1,
			]);
		}

		/**
		 * Either insert or update a row to the `twitter_users` table
		 * @param [int] $userId   [The ID of the Blather user]
		 * @param [array] $data   [An array containing values for each of the columns in the `twitter_users` table]
		 */
		public function setTwitterDetails($userId, $data) {
			$this->db->select('COUNT(*) AS count');
			$this->db->where('user_id', $userId);
			$query = $this->db->get('twitter_users')->result();

			if($query[0]->count == 0) {
				$this->db->insert('twitter_users', $data);
			} else {
				$this->db->where('user_id', $userId);
				$this->db->update('twitter_users', $data);
			}
		}

		/**
		 * Either insert or update a row to the `youtube_users` table
		 * @param [int] $userId [The ID of the Blather user]
		 * @param [array] $data   [An array containing values for each of the columns in the `youtube_users` table]
		 */
		public function setYouTubeDetails($userId, $data) {
			$this->db->select('COUNT(*) AS count');
			$this->db->where('user_id', $userId);
			$query = $this->db->get('youtube_users')->result();

			if($query[0]->count == 0) {
				$data['user_id'] = $userId;
				$this->db->insert('youtube_users', $data);
			} else {
				$this->db->where('user_id', $userId);
				$this->db->update('youtube_users', $data);
			}
		}

		/**
		 * Update a row in the `users` table containing the new password value
		 * @param [string] $email [The user's email]
		 * @param [array] $data 	[The columns and corresponding values to update]
		 */
		public function setNewPassword($email, $data) {
			$this->db->where('email', $email);
			$this->db->update('users', $data);
		}

		/**
		 * Update the row in the users table that belongs to the user with the specified ID
		 * @param  [int] $id   		[The user ID of the targetted user]
		 * @param  [array] $data 	[The columns and corresponding values to update]
		 */
		public function updateUser($id, $data) {
			$this->db->where('id', $id);
			$this->db->update('users', $data);
		}

		public function userExists($id) {
			$this->db->select('COUNT(*) AS count');
			$this->db->where('id', $id);
			$query = $this->db->get('users')->result();
			if($query[0]->count == 0) {
				return false;
			}
			return true;
		}

		/**
		 * Query the DB to get the user from the users table and JOIN one of the social networks table for their token info
		 * @param  [array] $data [An array containing data for the WHERE clause and column/table to join]
		 * @return [array]       [An array containing data about the user]
		 */
		public function userLookUp($data) {
			$this->db->select('bio, email, id, img, name, username');
			$this->db->join($data['type'].'_users', $data['type'].'_users.user_id=users.id');
			$this->db->where($data['type'].'_id', $data['id']);
			$query = $this->db->get('users')->result_array();
			if (empty($query)) {
				return false;
			}
			return $query;
		}

		/**
		 * Look up a user in the `user` table by their email
		 * @param  [string] $email 		[The user's email]
		 * @return [array|boolean]      [Either an array containing the user's first name or FALSE depending on whether or not a row was returned]
		 */
		public function userLookupByEmail($email) {
			$this->db->select('name');
			$this->db->where('email', $email);
			$query = $this->db->get('users')->result_array();
			if (empty($query)) {
				return false;
			}
			return [
				'name' => $query[0]['name'],
			];
		}
	}