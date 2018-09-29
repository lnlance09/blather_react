<?php
    class FacebookModel extends CI_Model {
        public $fb;

        public function __construct() {
            parent::__construct();

            $this->appId = 498572440350555;
            $this->appSecret = '5c8ad8b23b664b383b91c026d9e07b8a';
            $this->permissions = ['email', 'user_posts'];
            $this->redirectUrl = 'http://localhost:3000/settings/facebook';
            $this->userAgent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
            $this->load->library('facebook');
        }

        /**
         * Insert a row into the `fb_page_fallacies` table
         * @param [array] $data [An array containing data for each column to insert into the table]
         */
        public function assignFallacy($data, $type) {
            $table = ($type === 'comment' ? 'fb_comment_fallacies' : 'fb_page_fallacies');
            $this->db->insert($table, $data);
        }

        /**
         * Destroy a session
         */
        public function destroySession() {
            $this->facebook->destroy_session();
        }

        /**
         * Return data (json|array) containing info from the next page of pagination results
         * @param  [string]  $url    [The URL linking to the next page of results]
         * @param  [boolean] $decode [Whether or not to decode the respone]
         * @return [json|array]      [The response from the request]
         */
        public function fetchData($url, $decode = true) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $data = curl_exec($ch);
            curl_close($ch);
            if($decode) {
                return @json_decode($data, true);
            }

            return $data;
        }

        /**
         * Make an HTTP request to get an access token
         * @param  [string] $code [The code that is fetched from the URL of FB redirect page]
         * @return [string]       [An access token]
         */
        public function getAccessToken($code) {
            $data = [
                'client_id' => $this->appId,
                'client_secret' => $this->appSecret,
                'client_url' => $this->redirectUrl,
                'code' => $code,
                'redirect_uri' => $this->redirectUrl,
            ];
            $url = 'https://graph.facebook.com/oauth/access_token?'.http_build_query($data);
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $data = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if($code == 200) {
                $decode = @json_decode($data, true);
                return $decode['access_token'];
            }

            return false;
        }

        /**
         * Query the DB to get all of the fallacies that have been assigned to a given comment on a status on Facebook
         * @param  [array]  $data   [An array contianing date for the WHERE clause of the query]
         * @param  [boolean] $users [Whehter or not to get the corresponding user info for each person that has assigned a fallacy to a given comment]
         * @return [array]          [An array containing data from the query]
         */
        public function getCommentFallacies($data, $users = false) {
            $data['p.type'] = 'fb';

            if($users) {
                $this->db->select('fb_comment_fallacies.*, fb_comment_fallacies.id AS fallacy_id,
                    fb_comment_fallacies.fallacy_id AS fallacy_table_id,
                    f.name AS fallacy_name, 
                    u.name, u.img, 
                    i.*,
                    posts.permalink_url,
                    p.name AS page_name, p.profile_pic, p.username, p.type AS post_network');
            } else {
                $this->db->select('fb_comment_fallacies.*, f.name');
            }

            $this->db->join('fallacies f', 'fb_comment_fallacies.fallacy_id=f.id');
            
            if($users) {
                $this->db->join('users u', 'fb_comment_fallacies.assigned_by=u.id');
            }

            $this->db->join('fb_comments i', 'fb_comment_fallacies.comment_id=i.comment_id');
            $this->db->join('fb_posts posts', 'i.media_id=posts.media_id');
            $this->db->join('pages p', 'i.left_by=p.social_media_id');
            
            // Add the WHERE clause if necessary
            if($data) {
                $this->db->where($data);
            }

            $this->db->order_by('fb_comment_fallacies.date_created', 'DESC');
            $query = $this->db->get('fb_comment_fallacies');
            return $query->result_array();
        }

        /**
         * Query the DB to find out the number of fallacies that have been assigned to a given comment
         * @param  [array] $where [An array contianing date for the WHERE clause of the query]
         * @return [int]          [A number representing the number of rows returned]
         */
        public function getCommentFallacyCount($where) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where($where);
            $query = $this->db->get('fb_comment_fallacies');
            $result = $query->result();
            return $result[0]->count;
        }

        /**
         * Query the DB to get info about a given comment
         * @param  [int] $id           [The comment ID]
         * @param  [boolean] $archive  [Whether or not to get the archive code]
         * @return [array|boolean]     [An array containing data about the given status OR false if the row doesn't exist]
         */
        public function getCommentFromDB($id, $archive = false) {
            $select = 'fb_comments.*, p.name AS page_name, p.profile_pic, p.username, p.social_media_id AS page_id, i.permalink_url';

            if($archive) {
                $select .= ', f.archive_code';
            }

            $this->db->select($select);
            $this->db->join('pages p', 'fb_comments.left_by=p.social_media_id', 'left');
            $this->db->join('fb_posts i', 'fb_comments.media_id=i.media_id', 'left');

            if($archive) {
                $this->db->join('fb_comment_fallacies f', 'fb_comments.comment_id=f.comment_id', 'left');
            }

            $this->db->where([
                'fb_comments.comment_id' => $id,
                'p.type' => 'fb',
            ]);
            $data = $this->db->get('fb_comments')->result_array();

            if(empty($data)) {
                return false;
            }

            $item = $data[0];
            $info['page'] = [
                'id' => $item['page_id'],
                'name' => $item['page_name'],
                'picture' => $item['profile_pic'],
                'username' => $item['username'],
            ];

            unset($item['page_id']);
            unset($item['page_name']);
            unset($item['profile_pic']);
            unset($item['username']);

            $item['id'] = $item['media_id'];
            unset($item['media_id']);
            $info['post'] = $item;

            if($archive) {
                $info['archive_code'] = $item['archive_code'];
            }
            return $info;
        }

        /**
         * Make an API request to get info about a given comment
         * @param  [string] $id     [The comment ID]
         * @param  [string] $token  [The access token]
         * @return [json]           [JSON containing info about all of the comments on the given comment]
         */
        public function getCommentInfo($id, $token) {
            $with = [
                'created_time',
                'from{id,name,picture}',
                'like_count',
                'message',
            ];
            $url = '/'.$id.'/?fields='.implode($with, ',');
            return $this->facebook->request('get', $url, $token);
        }

        /**
         * Return json of comments from FB's API
         * @param  [int] $id        [The ID of the post]
         * @param  [string] $token  [The API's access token]
         * @return [json]           [JSON containing info about all of the comments on the given post]
         */
        public function getComments($id, $token, $limit = null) {
            $with = [
                'attachment',
                'comment_count',
                'created_time',
                'from{id,name,picture}',
                'likes.summary(1)',
                'message',
                'summary',
            ];
            $url = '/'.$id.'/comments?fields='.implode($with, ',');
            if($limit) {
                $url .= '&limit=100';
            }

            return $this->facebook->request('get', $url, $token);
        }

        /**
         * Get the next page of comments with the 'next' pagination URL
         * @param  [string] $url    [The URL linking to the next page of comments results]
         * @return [array]          [An array containing info about all of the comments on the given post]
         */
        public function getCommentsLink($url) {
            return $this->fetchData($url, false);
        }

        /**
         * Get data about the user who has just authenticated themself
         * @param  [string] $token  [The access token from the API]
         * @return [array]          [An array containing the name and user ID of the given user]
         */
        public function getMyInfo($token) {
            return $this->facebook->request('get', '/me', $token);
        }

        /**
         * Make an API request to fetch certain info about a specific page
         * @param  [integer] $id    [The FB ID of the targetted page]
         * @param  [string] $token  [A valid access token]
         * @return [array]          [An array of data containing info about the given page]
         */
        public function getPageInfo($id, $token) {
            $with = [
                'about',
                'bio',
                'category',
                'description',
                'fan_count',
                'is_verified',
                'location',
                'name',
                'picture.width(160).height(160)',
                'screennames',
                'username',
                'website',
            ];
            $url = '/'.$id.'/?fields='.implode($with, ',');
            return $this->facebook->request('get', $url, $token);
        }

        /**
         * Query the DB to get the page info for a given page from the DB
         * @param  [string] $id         [The page ID of the page]
         * @return [array|boolan]       [An array containing data about the given page OR false if no rows are returned]
         */
        public function getPageInfoFromDB($id) {
            $where = [
                'social_media_id' => $id,
                'type' => 'fb',
            ];
            $this->db->select('*');
            $this->db->where($where);
            $this->db->or_where('username', $id);
            $query = $this->db->get('pages')->result_array();
            if(!empty($query)) {
                return $query[0];
            }

            return false;
        }

        /**
         * Query the DB to get all of the fallacies that have been assigned to a given page
         * @param  [array]  $data    [An array contianing date for the WHERE clause of the query]
         * @param  [boolean] $users  [Whehter or not to get the corresponding user info for each person that has assigned a fallacy to a given comment]
         * @return [array]           [An array containing data from the query]
         */
        public function getPageFallacies($data, $fallacies = [], $users = false, $page = 0, $just_count = false) {
            $data['p.type'] = 'fb';

            $select = 'fbp.id, fbp.date_created, fbp.explanation, fbp.title, fbp.view_count, f.name AS fallacy_name, p.name AS page_name, p.type AS page_type, p.username, p.profile_pic';
            if($just_count) {
                $select = 'COUNT(*) AS count';
            }
            if($users) {
                $select .= ',u.name, u.img';
            }

            $this->db->select($select);
            $this->db->join('fallacies f', 'fbp.fallacy_id = f.id');
            if($users) {
                $this->db->join('users u', 'fbp.assigned_by = u.id');
            }

            $this->db->join('fb_posts i', 'fbp.media_id = i.media_id');
            $this->db->join('pages p', 'fbp.page_id = p.social_media_id');
            if($data) {
                $this->db->where($data);
            }

            if(!empty($fallacies)) {
                $this->db->where_in('fallacy_id', $fallacies);
            }

            if($just_count) {
                $results = $this->db->get('fb_page_fallacies fbp')->result();
                return $results[0]->count;
            }

            if(!$just_count) {
                $limit = 10;
                $start = $page*$limit;
                $this->db->order_by('fbp.date_created', 'DESC');
                $this->db->limit($limit, $start);
                $results = $this->db->get('fb_page_fallacies fbp')->result_array();
                if(empty($results)) {
                    return false;
                }

                return $results;
            }
        }

        /**
         * Query the DB to find out the number of fallacies that have been assigned to a given page on Facebook
         * @param  [array] $where [An array contianing date for the WHERE clause of the query]
         * @return [int]          [A number representing the number of rows returned]
         */
        public function getPageFallacyCount($where) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where($where);
            $query = $this->db->get('fb_page_fallacies');
            $result = $query->result();
            return $result[0]->count;
        }

        /**
         * Query the DB to get info about a given status
         * @param  [int] $id           [The media ID of the status]
         * @param  [boolean] $archive  [Whether or not to get the archive code]
         * @return [array|boolean]     [An array containing data about the given status OR false if the row doesn't exist]
         */
        public function getPostFromDB($id, $archive = false) {
            $select = 'fb_posts.*, p.name AS page_name, p.profile_pic, p.username';
            if($archive) {
                $select .= ', f.archive_code';
            }

            $this->db->select($select);
            $this->db->join('pages p', 'fb_posts.page_id=p.social_media_id', 'left');

            if($archive) {
                $this->db->join('fb_page_fallacies f', 'fb_posts.media_id=f.media_id', 'left');
            }

            $where = [
                'p.type' => 'fb',
            ];

            if($id) {
                $where['fb_posts.media_id'] = $id;
            }

            $this->db->where($where);
            $data = $this->db->get('fb_posts')->result_array();
            if(empty($data)) {
                return false;
            }

            if($id) {
                $item = $data[0];
                $info['page'] = [
                    'id' => $item['page_id'],
                    'name' => $item['page_name'],
                    'picture' => $item['profile_pic'],
                    'username' => $item['username'],
                ];

                unset($item['page_id']);
                unset($item['page_name']);
                unset($item['profile_pic']);
                unset($item['username']);
                
                $item['id'] = $item['media_id'];
                unset($item['media_id']);
                $info['post'] = $item;

                if($archive) {
                    $info['archive_code'] = $item['archive_code'];
                }
                return $info;
            }

            return $data;
        }

        /**
         * Get the information that is part of a FB post that was done either by a page or a user
         * @param [string] $token   [A valid access token]
         * @param [integer] $postId [The FB ID of the page or the user]
         */
        public function getPostInfo($token, $postId) {
            $with = [
                'attachments',
                'comments.summary(1).limit(10){attachment,from{id,name,picture.width(48).height(48)},message,created_time,likes.summary(1),comment_count}',
                'created_time',
                'description',
                'from',
                'likes.summary(1).limit(10)',
                'link',
                'message',
                'name',
                'permalink_url',
                'picture',
                'properties',
                'source',
                'status_type',
                'story',
                'type',
            ];
            $url = '/'.$postId.'/?fields='.implode(',', $with);
            $data = $this->facebook->request('get', $url, $token);

            if(array_key_exists('error', $data)) {
                return false;
            }
            $data['comment_count'] = $data['comments']['summary']['total_count'];
            $data['like_count'] = $data['likes']['summary']['total_count'];
            $info['page'] = [
                'id' => $data['from']['id'],
                'name' => $data['from']['name'],
            ];
            unset($data['from']);
            
            $info['post'] = $data;
            $info['post']['attachments'] = (array_key_exists('attachments', $data) ? $data['attachments'] : null);
            $info['post']['description'] = (array_key_exists('description', $data) ? $data['description'] : null);
            $info['post']['title'] = (array_key_exists('name', $data) ? $data['name'] : null);
            return $info;
        }

        /**
         * Get the user info of the user who is currently logged in
         * @param [string] $token [A valid access token]
         */
        public function getUserInfo($id, $token) {
            $with = [
                'email', 
                'first_name', 
                'last_name', 
                'name', 
                'picture.width(160).height(160)',
            ];
            $url = '/'.$id.'/?fields='.implode(',', $with);
            return $this->facebook->request('get', $url, $token);
        }

        /**
         * Get the Facbeook user's username from their user ID
         * @param  [int] $id    [The targetted user's user ID]
         * @return [string]     [The user's username]
         */
        public function getUsername($id) {
            $cookies = getcwd().'/cookies/lnlance09.txt';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://www.facebook.com/'.$id);
            curl_setopt($ch, CURLOPT_HEADER, true);
            curl_setopt($ch, CURLOPT_USERAGENT, $this->userAgent);
            curl_setopt($ch, CURLOPT_COOKIEJAR, $cookies); 
            curl_setopt($ch, CURLOPT_COOKIEFILE, $cookies);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_REFERER, 'https://www.facebook.com');
            $data = curl_exec($ch);
            curl_close($ch);
            preg_match('/Location:(.*?)\n/', $data, $matches);
            if(empty($matches)) {
                return false;
            }

            $exp = explode('/', $matches[1]);
            return trim($exp[3]);
        }

        /**
         * Query the DB to get the names and numbers of each fallacies that have been assigned to a given page
         * @param  [string] $id     [The page ID of the page]
         * @return [array]          [An array containing data returned form the query]
         */
        public function getUniqueFallacies($id) {
            $this->db->select('fallacies.name, fallacies.id, COUNT(*) AS count');
            $this->db->join('fb_page_fallacies v', 'fallacies.id=v.fallacy_id');
            $this->db->where([
                'page_id' => $id,
            ]);
            $this->db->order_by('count', 'DESC');
            $this->db->group_by('fallacies.id');
            $pData = $this->db->get('fallacies')->result_array();

            $this->db->select('fallacies.name, fallacies.id, COUNT(*) AS count');
            $this->db->join('fb_comment_fallacies v', 'fallacies.id=v.fallacy_id');
            $this->db->where([
                'page_id' => $id,
            ]);
            $this->db->order_by('count', 'DESC');
            $this->db->group_by('fallacies.id');
            $cData = $this->db->get('fallacies')->result_array();

            $data = array_merge($pData, $cData);
            $info['data'] = $data;
            $info['fullCount'] = array_sum(array_column($data, 'count'));
            return $info;
        }

        /**
         * Get the posts of the user who is logged in
         * @param [string] $token [A valid access token]
         */
        public function getUserPosts($id, $token) {
            $with = [
                'attachments',
                'caption',
                'comments.summary(1)',
                'created_time',
                'description',
                'full_picture',
                'likes.summary(1)',
                'link',
                'message',
                'name',
            ];
            $url = '/'.$id.'/posts?fields='.implode(',', $with).'&limit=18';
            return $this->facebook->request('get', $url, $token);
        }

        /**
         * Insert a comment into the DB
         * @param  [type] $data [description]
         * @return [type]       [description]
         */
        public function insertComment($data) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where([
                'comment_id' => $data['comment_id'],
            ]);
            $query = $this->db->get('fb_comments');
            $result = $query->result();
            $count = $result[0]->count;

            if($count == 0) {
                $this->db->insert('fb_comments', $data);
            } else {
                unset($data['video_id']);
                $this->db->where([
                    'comment_id' => $data['comment_id'],
                ]);
                $this->db->update('fb_comments', $data);
            }
        }

        /**
         * Insert/Update the info about a video in the DB
         * @param  [array] $data [An array containing the data for each column to insert/update]
         */
        public function insertPost($post) {
            $exp = explode('_', $post['post']['id']);
            $mediaId = $exp[1];

            $this->db->select('COUNT(*) AS count');
            $this->db->where([
                'media_id' => $mediaId,
            ]);
            $query = $this->db->get('fb_posts')->result();

            $data['attachments'] = (array_key_exists('attachments', $post['post']) ? json_encode($post['post']['attachments'], true) : null);
            $data['comment_count'] = $post['post']['comment_count'];
            $data['created_time'] = date('Y-m-d H:i:s', strtotime($post['post']['created_time']));
            $data['description'] = $post['post']['description'];
            $data['like_count'] = $post['post']['like_count'];
            $data['link'] = (array_key_exists('link', $post['post']) ? $post['post']['link'] : null);
            $data['media_id'] = $mediaId;
            $data['message'] = (array_key_exists('message', $post['post']) ? $post['post']['message'] : null);
            $data['name'] = $post['page']['name'];
            $data['page_id'] = $post['page']['id'];
            $data['permalink_url'] = $post['post']['permalink_url'];
            $data['picture'] = (array_key_exists('picture', $post['post']) ? $post['post']['picture'] : null);
            $data['source'] = (array_key_exists('source', $post['post']) ? $post['post']['source'] : null);
            $data['status_type'] = $post['post']['status_type'];
            $data['title'] = (array_key_exists('title', $post['post']) ? $post['post']['title'] : null);
            $data['type'] = $post['post']['type'];

            if($query[0]->count == 0) {
                $this->db->insert('fb_posts', $data);
            } else {
                $this->db->where($where);
                $this->db->update('fb_posts', $data);
            }
        }

        /**
         * Check to see if the client has been authenticated
         * @return boolean [If the user is logged in or not]
         */
        public function isAuthenticated() {
            return $this->facebook->is_authenticated();
        }

        /**
         * Generate and return the login URL to initiate the oAuth dialogue
         * @return [string] [The login URL]
         */
        public function loginUrl() {
             return 'https://www.facebook.com/v3.1/dialog/oauth?client_id='.$this->appId.'&redirect_uri='.$this->redirectUrl.'&state=st=state123abc,ds=123456789';
        }

        /**
         * Generate and return the URL to logout
         * @return [string] [The logout URL]
         */
        public function logoutUrl() {
            return $this->facebook->logout_url();
        }

        /**
         * [pageExistsInDB description]
         * @param  [int]      $pageId [The page ID of the page]
         * @return [boolean]          [Either TRUE or FALSE depending on whether or not a row was returned]
         */
        public function pageExistsInDB($pageId) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where([
                'social_media_id' => $pageId,
                'type' => 'fb',
            ]);
            $query = $this->db->get('pages');
            $result = $query->result();
            $count = $result[0]->count;
            return $count == 0;
        }

        /**
         * [parsePostsData description]
         * @param  [type]  $id    [description]
         * @param  [type]  $token [description]
         * @param  boolean $url   [description]
         * @return [type]         [description]
         */
        public function parsePostsData($id, $token, $url = false) {
            if(!$url) {
                $posts = $this->getUserPosts($id, $token);
            } else {
               $posts = $this->fetchData($url);
            }

            if(empty($posts['data'])) {
                return false;
            }
            
            $full = [
                'data' => [],
            ];

            // Parse the data returned from the API so that it works perfectly with the home/getPagePosts endpoint
            $keys = [
                'attachments',
                'caption',
                'description',
                'message', 
                'picture',
            ];

            for($i=0;$i<count($posts['data']);$i++) {
                $post = $posts['data'][$i];
                foreach($keys as $key) {
                    $post[$key] = (array_key_exists($key, $post) ? $post[$key] : false);
                    if($key === 'message') {
                        $post['msg'] = parseAllText($post['message'], 'fb');
                    }
                }

                $post['time_ago'] = FormatTime($post['created_time']);
                $post['type'] = (array_key_exists('link', $post) ? 'link' : 'status');
                array_push($full['data'], $post);
            }

            $full['paging'] = $posts['paging'];
            return $full;
        }

        /**
         * Search FB for pages matching a given query term
         * @param  [string] $q     [A query to search for]
         * @param  [string] $token [A valid access token]
         * @return [array]         [An array of data containing info about the matching pages]
         */
        public function searchPages($q, $token) {
            $with = [
                'cover',
                'description', 
                'name', 
                'picture',
                'username',
                'website',
            ];
            $url = '/search/?q='.$q.'&type=page&fields='.implode($with, ',');
            return $this->facebook->request('get', $url, $token);
        }

        /**
         * Update a fallacy in the DB
         * @param  [string] $id   [The fallacy ID]
         * @param  [string] $type ['post' or 'comment']
         * @param  [array] $data [An array containing data for the columms to be updated]
         * @return [type]       [description]
         */
        public function updateFallacy($id, $type = 'post', $data) {
            $table = ($type === 'post' || $type === 'status' ? 'fb_page_fallacies' : 'fb_comment_fallacies');
            $this->db->where([
                'id' => $id,
            ]);
            $this->db->update($table, $data);
        }

        /**
         * Either insert or update a row in the pages table
         * @param  [array] $data [An array containing data about the given page]
         * @return [array]       [A formatted array containing data about the given page]
         */
        public function updatePageInfo($data) {   
            $page = [
                'about' => (array_key_exists('about', $data) ? $data['about'] : null),
                'is_user' => $data['is_user'],
                'is_verified' => (array_key_exists('is_verified', $data) ? $data['is_verified'] : null),
                'like_count' => (array_key_exists('fan_count', $data) ? $data['fan_count'] : null),
                'name' => $data['name'],
                'profile_pic' => $data['picture']['data']['url'],
                'social_media_id' => $data['id'],
                'type' => 'fb',
                'username' => (array_key_exists('username', $data) ? $data['username'] : null),
                'website' => (array_key_exists('website', $data) ? $data['website'] : null),
            ];

            $this->db->select('COUNT(*) AS count');
            $this->db->where([
                'social_media_id' => $page['social_media_id'],
                'type' => 'fb', 
            ]);
            $query = $this->db->get('pages')->result();

            if($query[0]->count == 0) {
                $this->db->insert('pages', $page);
            } else {
                $this->db->where([
                    'social_media_id' => $page['social_media_id'],
                    'type' => 'fb', 
                ]);
                $this->db->update('pages', $page);
            }

            $page['about'] = defaultPageAbout($page['about'], $page['name']);
            $page['about'] = parseAllText($page['about'], 'fb');
            return $page;
        }
    }