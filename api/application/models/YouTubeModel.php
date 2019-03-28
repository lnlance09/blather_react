<?php
    class YouTubeModel extends CI_Model {
        public function __construct() {
            parent::__construct();

            $this->baseUrl = $this->config->base_url();
            $this->imgUrl = $this->baseUrl.'api/public/img/';

            $this->apiKey = 'AIzaSyAxGMJJB1_uUQWHBXZG9TCCwjsVTPBIDLE';
            $this->clientId = '208834451570-uhnsvk3tb5cqr6uoipnrl9ks68cmeicp.apps.googleusercontent.com';
            $this->clientSecret = 'La5tIudFHoDWMz62OWzOl8xg';
            $this->redirectUrl = $this->config->base_url().'settings/youtube';

            // Define the API endpoints
            $this->commentUrl = 'https://www.googleapis.com/youtube/v3/comments';
            $this->commentsUrl = 'https://www.googleapis.com/youtube/v3/commentThreads';
            $this->loginUrl = 'https://accounts.google.com/o/oauth2/auth';
            $this->repliesUrl = 'https://www.googleapis.com/youtube/v3/comments';
            $this->searchUrl = 'https://www.googleapis.com/youtube/v3/search';
            $this->subscriptionsUrl = 'https://www.googleapis.com/youtube/v3/subscriptions';
            $this->tokenUrl = 'https://accounts.google.com/o/oauth2/token';
            $this->userUrl = 'https://www.googleapis.com/youtube/v3/channels';
            $this->videosUrl = 'https://www.googleapis.com/youtube/v3/videos';

            $this->db->query("SET time_zone='+0:00'");
        }

        public function getAllPages() {
            $this->db->select('*');
            $this->db->where('type', 'youtube');
            return $this->db->get('pages')->result_array();
        }

        public function getAllVideos() {
            $this->db->select('*');
            return $this->db->get('youtube_videos')->result_array();
        }

        public function getCommentExtended($id, $videoId, $auth, $token) {
            if ($auth) {
                $comment = $this->getCommentInfo($id, $token, true);
                if (array_key_exists('error', $comment)) {
                    return [
                        'code' => $comment['error']['code'],
                        'error' => 'Refresh token'
                    ];
                }

                if (count($comment['items']) === 0) {
                    return [
                        'code' => 404,
                        'error' => 'That comment does not exist'
                    ];
                }

                $item = $comment['items'][0];
                $snippet = $item['snippet'];
                $channelId = $snippet['authorChannelId']['value'];
                $dateCreated = $snippet['publishedAt'];
                $likeCount = $snippet['likeCount'];
                $message = $snippet['textOriginal'];
                $parentId = array_key_exists('parentId', $snippet) ? $snippet['parentId'] : null;
                
                if ($parentId) {
                    $parentComment = $this->getCommentInfo($parentId, $token, true);
                    if (array_key_exists('error', $parentComment)) {
                        return [
                            'code' => $parentComment['error']['code'],
                            'error' => 'Refresh token'
                        ];
                    }

                    if (count($parentComment['items']) === 0) {
                        return [
                            'code' => 404,
                            'error' => 'That comment does not exist'
                        ];
                    }

                    $item = $parentComment['items'][0];
                    $snippet = $item['snippet'];
                    $pChannelId = $snippet['authorChannelId']['value'];
                    $pDateCreated = $snippet['publishedAt'];
                    $pLikeCount = $snippet['likeCount'];
                    $pMessage = $snippet['textOriginal'];
                    $this->insertComment([
                        'channel_id' => $pChannelId,
                        'comment_id' => $parentId,
                        'date_created' => $pDateCreated,
                        'like_count' => $pLikeCount,
                        'message' => $pMessage,
                        'parent_id' => null,
                        'video_id' => $videoId
                    ]);
                    $this->getPageExtended($pChannelId, null, true, $token);
                }

                $this->insertComment([
                    'channel_id' => $channelId,
                    'comment_id' => $id,
                    'date_created' => $dateCreated,
                    'like_count' => $likeCount,
                    'message' => $message,
                    'parent_id' => $parentId,
                    'video_id' => $videoId
                ]);
                $page = $this->getPageExtended($channelId, null, true, $token);
                
                return [
                    'data' => [
                        'commenter' => [
                            'about' => $page['data']['about'],
                            'id' => $page['data']['social_media_id'],
                            'img' => $page['data']['profile_pic'],
                            'title' => $page['data']['name']
                        ],
                        'date_created' => $dateCreated,
                        'id' => $id,
                        'like_count' => (int)$likeCount,
                        'message' => $message
                    ],
                    'error' => false
                ];
            } else {
                $comment = $this->getCommentFromDB($id);
                return [
                    'data' => $comment,
                    'error' => false
                ];
            }
        }

        /**
         * Query the DB to get info about a given comment on a video
         * @param  [string] $id [The comment ID]
         * @param  [boolean] $archive [Whether or not to get the archive code]
         * @return [array|boolean]     [An array containing data about the video | false]
         */
        public function getCommentFromDB($id, $archive = false) {
            $select = 'yc.*, p.about AS commenter_about, p.name AS commenter_page_name, p.profile_pic AS commenter_profile_pic, p.social_media_id AS commenter_social_media_id, p.username AS commenter_username,yv.date_created AS video_date_created, yv.description AS video_description, yv.dislike_count AS video_dislike_count, yv.img AS video_img, yv.like_count AS video_like_count, yv.title AS video_title, yv.view_count AS video_view_count,
                    vp.about AS channel_about, vp.name AS channel_name, vp.profile_pic AS channel_profile_pic, vp.social_media_id AS channel_social_media_id';
            $this->db->select($select);
            $this->db->join('pages p', 'yc.channel_id=p.social_media_id');
            $this->db->join('youtube_videos yv', 'yc.video_id=yv.video_id');
            $this->db->join('pages vp', 'yv.channel_id=vp.social_media_id');

            if($archive) {
                $this->db->join('youtube_comment_fallacies f', 'yc.comment_id=f.comment_id', 'left');
            }

            $this->db->where('p.type', 'youtube');
            $this->db->where('yc.comment_id', $id);
            $data = $this->db->get('youtube_comments yc')->result_array();

            if(empty($data)) {
                return false;
            }

            $item = $data[0];
            $likeCount = $item['video_like_count'];
            $dislikeCount = $item['video_dislike_count'];
            $totalCount = $likeCount+$dislikeCount;
            $likePct = $totalCount > 0 ? ($likeCount/$totalCount)*100 : 100;
            
            return [
                'commenter' => [
                    'about' => $item['commenter_about'],
                    'id' => $item['commenter_social_media_id'],
                    'img' => $item['commenter_profile_pic'],
                    'title' => $item['commenter_page_name']
                ],
                'date_created' => $item['date_created'],
                'id' => $item['comment_id'],
                'like_count' => $item['like_count'],
                'message' => $item['message'],
                'video' => [
                    'channel' => [
                        'about' => $item['channel_about'],
                        'id' => $item['channel_social_media_id'],
                        'img' => $item['channel_profile_pic'],
                        'title' => $item['channel_name']
                    ],
                    'date_created' => $item['video_date_created'],
                    'description' => $item['video_description'],
                    'id' => $item['video_id'],
                    'img' => $item['video_img'],
                    'stats' => [
                        'commentCount' => 0,
                        'dislikeCount' => (int)$dislikeCount,
                        'likeCount' => (int)$likeCount,
                        'likePct' => (int)$likePct,
                        'viewCount' => (int)$item['video_view_count']
                    ],
                    'title' => $item['video_title']
                ]
            ];
        }

        /**
         * Make a request to the API to get info about a particular comment
         * @return [string] [The ID of the comment]
         */
        public function getCommentInfo($id, $token, $decode) {
            $data = [
                'id' => $id,
                'part' => 'id,snippet'
            ];
            return $this->sendRequest($this->commentUrl, false, $data, $token, $decode);
        }

        /**
         * Get all the replies to a particular comment
         * @param  [string] $id      [The ID of the comment]
         * @param  [string] $token   [The API access token]
         * @param  [boolean] $decode [Whether or not the JSON response should be decoded]
         * @return [JSON|array]      [The response from the API]
         */
        public function getCommentReplies($id, $token, $decode) {
            $data = [
                'maxResults' => 100,
                'order' => 'relevance',
                'parentId' => $id,
                'part' => 'id,snippet'
            ];
            return $this->sendRequest($this->repliesUrl, false, $data, $token, $decode);
        }

        public function getMyInfo($token) {
            $data = [
                'key' => $this->apiKey,
                'mine' => 'true',
                'part' => 'id,contentDetails,contentOwnerDetails,statistics,status,snippet,invideoPromotion,brandingSettings,localizations',
            ];
            return $this->sendRequest($this->userUrl, false, $data, $token);
        }

        public function getPageExtended($id, $username, $auth = false, $token = null) {
            if ($auth) {
                $page = $this->getPageInfo($id, $username, $token);
                if (!$page) {
                    return [
                        'code' => 404,
                        'error' => 'This channel does not exist'
                    ];
                }

                if (array_key_exists('error', $page)) {
                    return [
                        'code' => 401,
                        'error' => 'Refresh token'
                    ];
                }

                if (count($page['items']) === 0) {
                    return [
                        'code' => 404,
                        'error' => 'That channel does not exist'
                    ];
                }

                $item = $page['items'][0];
                $snippet = $item['snippet'];
                $channelDescription = $snippet['description'];
                $channelImg = $snippet['thumbnails']['high']['url'];
                $channelTitle = $snippet['title'];
                $page = $this->insertPage([
                    'about' => $channelDescription,
                    'is_verified' => null,
                    'name' => $channelTitle,
                    'profile_pic' => $channelImg,
                    'social_media_id' => $id,
                    'type' => 'youtube',
                    'username' => array_key_exists('customUrl', $snippet) ? $snippet['customUrl'] : null
                ]);
                $page['profile_pic'] = '/api/'.$this->saveChannelPic($id, $channelImg);
                $page['external_url'] = 'https://www.youtube.com/channel/'.$id;
                return [
                    'data' => $page,
                    'error' => false
                ];
            } else {
                $page = $this->getPageInfoFromDB($id);
                if (!$page) {
                    return [
                        'code' => 404,
                        'error' => 'That channel does not exist'
                    ];
                }

                $page['external_url'] = 'https://www.youtube.com/channel/'.$id;
                return [
                    'data' => $page,
                    'error' => false
                ];
            }
        }

        /**
         * Get data from the API about a particular user
         * @param  [boolean] $me        [Whether or not to fetch info about the user who is currently logged in]
         * @param  [string] $id         [The ID of the user whose infinrmation will be retrieved]
         * @param  [string] $username   [The username of the user whose infinrmation will be retrieved]
         * @param  [string] $token      [The access token for the API request]
         * @return [JSON]               [Info about the given user]
         */
        public function getPageInfo($id, $username, $token) {
            $data = [
                'key' => $this->apiKey,
                'part' => 'id,contentDetails,contentOwnerDetails,statistics,status,snippet,invideoPromotion,brandingSettings,localizations'
            ];
            if($username) {
                $data['forUsername'] = $username;
            } else {
                $data['id'] = $id;
            }
            return $this->sendRequest($this->userUrl, false, $data, $token);
        }

        /**
         * Query the DB to get the page info for a given page from the DB
         * @param  [string] $id         [The channel ID of the page]
         * @return [array|boolan]       [An array containing data about the given page OR false if no rows are returned]
         */
        public function getPageInfoFromDB($id) {
            $sql = "SELECT * 
                    FROM pages
                    WHERE type = 'youtube'
                    AND (social_media_id = ? OR username = ?)";
            $query = $this->db->query($sql, [$id, $id])->result_array();
            if(!empty($query)) {
                return $query[0];
            }
            return false;
        }

        /**
         * Get videos that are related to a particular video
         * @param  [The ID of the video]  $id     [description]
         * @param  [string]               $token  [The API access token]
         * @param  [boolean]              $decode [Whether or not the JSON response should be decoded]
         * @return [JSON|array]          [The response from the API]
         */
        public function getSuggestions($id, $token, $decode = false) {
            $data = [
                'maxResults' => 20,
                'part' => 'id,snippet',
                'relatedToVideoId' => $id,
                'type' => 'video'
            ];
            return $this->sendRequest($this->searchUrl, false, $data, $token, $decode);
        }

        /**
         * Get an access token that will be used for each API request
         * @param  [string] $code [The authorization code]
         * @return [array]       [An array containing the access token]
         */
        public function getToken($code) {
            $data = [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'code' => $code, 
                'grant_type' => 'authorization_code',
                'redirect_uri' => $this->redirectUrl
            ];
            return $this->sendRequest($this->tokenUrl, true, $data, false);
        }

        /**
         * Return the URL to the page that will prompt the user to accept the permissions for this app
         * @return [string] [Return the URL to the page that will prompt the user to accept the permissions for this app]
         */
        public function getTokenUrl() {
            $data = [
                'access_type' => 'offline',
                'approval_prompt' => 'force',
                'client_id' => $this->clientId,
                'redirect_uri' => $this->redirectUrl,
                'response_type' => 'code',
                'scope' => 'https://www.googleapis.com/auth/youtube.force-ssl'
            ];
            return $this->loginUrl.'?'.http_build_query($data);
        }

        public function getVideoArchives($id, $user_id) {
            $this->db->select('a.description, a.end_time, a.img, a.start_time');
            $this->db->where([
                'network' => 'youtube',
                'object_id' => $id,
                'user_id' => $user_id
            ]);
            $this->db->order_by('start_time');
            $results = $this->db->get('archived_links a')->result_array();
            return $results;
        }

        /**
         * Get all of the comments on a particular YouTube video
         * @param  [string]  $token     [The access token]
         * @param  [string]  $id        [The video ID]
         * @param  [string]  $q         [The term to seach for. Search comment that contain a particular phrase]
         * @param  [string]  $pageToken [The page token. This will be used for pagination to fetch the next page of results]
         * @param  [integer] $count     [How many comments to return]
         * @return [array]              [An array containing all of the comments on the given video]
         */
        public function getVideoComments($token, $id, $q = null, $pageToken = null, $count = 20) {
            $data = [
                'key' => $this->apiKey,
                'maxResults' => $count,
                'order' => 'relevance',
                'pageToken' => $pageToken,
                'part' => 'id,snippet,replies',
                'searchTerms' => $q,
                'videoId' => $id
            ];
            return $this->sendRequest($this->commentsUrl, false, $data, $token, true);
        }

        public function getVideoExtended($id, $auth = false, $token = null) {
            if($auth) {
                $video = $this->getVideoInfo($id, $token);
                if(array_key_exists('error', $video)) {
                    return [
                        'code' => 401,
                        'error' => 'Refresh token'
                    ];
                }

                if(count($video['items']) === 0) {
                    return [
                        'code' => 404,
                        'error' => 'That video does not exist'
                    ];
                }

                $item = $video['items'][0];
                $stats = array_key_exists('statistics', $item) ? $item['statistics'] : [];
                $dislikeCount = array_key_exists('dislikeCount', $stats) ? $stats['dislikeCount'] : null;
                $likeCount = array_key_exists('likeCount', $stats) ? $stats['likeCount'] : null;
                $viewCount = array_key_exists('viewCount', $stats) ? $stats['viewCount'] : null;
                $totalCount = $dislikeCount+$likeCount;
                $likePct = $totalCount > 0 ? ($likeCount/$totalCount)*100 : 100;
                $snippet = $item['snippet'];
                $channelId = $snippet['channelId'];
                $duration = parseDuration($item['contentDetails']['duration']);
                $videoDescription = $snippet['description'];
                $videoDateCreated = $snippet['publishedAt'];
                $videoImg = $snippet['thumbnails']['default']['url'];
                $videoTitle = $snippet['title'];

                $this->insertVideo([
                    'channel_id' => $channelId,
                    'date_created' => $videoDateCreated,
                    'description' => $videoDescription,
                    'duration' => $duration,
                    'dislike_count' => $dislikeCount,
                    'img' => $videoImg,
                    'like_count' => $likeCount,
                    'title' => $videoTitle,
                    'video_id' => $id,
                    'view_count' => $viewCount
                ]);

                $channel = $this->getPageExtended($channelId, null, $auth, $token);
                if($channel['error']) {
                    return $channel;
                }

                return [
                    'data' => [
                        'channel' => [
                            'about' => $channel['data']['about'],
                            'db_id' => null,
                            'id' => $channelId,
                            'img' => $channel['data']['profile_pic'],
                            'title' => $channel['data']['name']
                        ],
                        'date_created' => $videoDateCreated,
                        'description' => $videoDescription,
                        'duration' => $duration,
                        'id' => $id,
                        'img' => $videoImg,
                        's3_link' => null,
                        'stats' => [
                            'commentCount' => 0,
                            'dislikeCount' => (int)$dislikeCount,
                            'likeCount' => (int)$likeCount,
                            'likePct' => (int)$likePct,
                            'viewCount' => (int)$viewCount
                        ],
                        'title' => $videoTitle
                    ],
                    'error' => false
                ];
            } else {
                $video = $this->getVideoFromDB($id);
                if(!$video) {
                    return [
                        'code' => 404,
                        'error' => 'That video does not exist'
                    ];
                }

                return [
                    'data' => $video,
                    'error' => false
                ];
            }
        }

        /**
         * Query the DB to get info about a given video
         * @param  [string] $id [The video ID]
         * @param  [boolean] $archive [Whether or not to get the archive code]
         * @return [array|boolean]     [An array containing data about the video | false]
         */
        public function getVideoFromDB($id, $archive = false) {
            $this->db->select('yv.*, p.id AS page_db_id, p.about, p.name AS page_name, p.profile_pic, p.social_media_id, p.username');
            $this->db->join('pages p', 'yv.channel_id=p.social_media_id');

            if($archive) {
                $this->db->join('youtube_video_fallacies f', 'yv.video_id=f.video_id', 'left');
            }

            $this->db->where('p.type', 'youtube');
            $this->db->where('yv.video_id', $id);
            $data = $this->db->get('youtube_videos yv')->result_array();

            if(empty($data)) {
                return false;
            }

            $item = $data[0];
            $likeCount = $item['like_count'];
            $dislikeCount = $item['dislike_count'];
            $totalCount = $likeCount+$dislikeCount;
            $likePct = $totalCount > 0 ? ($likeCount/$totalCount)*100 : 100;

            return [
                'channel' => [
                    'about' => $item['about'],
                    'db_id' => $item['page_db_id'],
                    'id' => $item['channel_id'],
                    'img' => $item['profile_pic'],
                    'title' => $item['page_name']
                ],
                'date_created' => $item['date_created'],
                'description' => $item['description'],
                'duration' => $item['duration'],
                'id' => $item['video_id'],
                'img' => $item['img'],
                's3_link' => $item['s3_link'],
                'stats' => [
                    'commentCount' => 0,
                    'dislikeCount' => (int)$dislikeCount,
                    'likeCount' => (int)$likeCount,
                    'likePct' => (int)$likePct,
                    'viewCount' => (int)$item['view_count']
                ],
                'title' => $item['title']
            ];
        }

        /**
         * Get info about a particular YouTube video
         * @param  [string] $id    [The ID of the video]
         * @param  [string] $token [The access token]
         * @return [array]         [An array containing info about the given video]
         */
        public function getVideoInfo($id, $token) {
            $data = [
                'id' => $id,
                'part' => 'snippet,statistics,contentDetails'
            ];
            return $this->sendRequest($this->videosUrl, false, $data, $token);
        }

        public function getVideos($data, $token, $page = 0, $decode = false, $parse = false) {
            $results = $this->sendRequest($this->searchUrl, false, $data, $token, $decode);
            if(array_key_exists('error', $results)) {
                return false;
            }

            if($parse) {
                $count = $results['pageInfo']['totalResults'];
                $return = [];
                for($i=0;$i<count($results['items']);$i++) {
                    $item = $results['items'][$i];
                    $snippet = $item['snippet'];
                    $return[$i] = [
                        'channelTitle' => $snippet['channelTitle'],
                        'date_created' => $snippet['publishedAt'],
                        'description' => $snippet['description'],
                        'id' => $item['id']['videoId'],
                        'img' => $snippet['thumbnails']['high']['url'],
                        'title' => $snippet['title']
                    ];
                }

                $data['count'] = $count;
                $data['hasMore'] = $count > ($page+1)*18;
                $data['nextPageToken'] = array_key_exists('nextPageToken', $results) ? $results['nextPageToken'] : null;
                $data['data'] = $return;
                return $data;
            }

            return $results;
        }

        /**
         * Insert a comment into the DB
         * @param  [type] $data [description]
         * @return [type]       [description]
         */
        public function insertComment($data) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where('comment_id', $data['comment_id']);
            $query = $this->db->get('youtube_comments');
            $result = $query->result();
            $count = $result[0]->count;

            if($count == 0) {
                $this->db->insert('youtube_comments', $data);
            } else {
                unset($data['video_id']);
                $this->db->where('comment_id', $data['comment_id']);
                $this->db->update('youtube_comments', $data);
            }
        }

        /**
         * Either update or insert a row in the `pages` table
         * @param  [array] $data [An array containing data about the page to update/insert]
         * @return [array]       [An array that is an updated version of the array that was provided as input]
         */
        public function insertPage($data) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where([
                'social_media_id' => $data['social_media_id'],
                'type' => 'youtube'
            ]);
            $query = $this->db->get('pages')->result();

            if($query[0]->count == 0) {
                $this->db->insert('pages', $data);
            } else {
                $this->db->where([
                    'social_media_id' => $data['social_media_id'],
                    'type' => 'youtube'
                ]);
                $this->db->update('pages', $data);
            }

            $data['about'] = defaultPageAbout($data['about'], $data['name']);
            return $data;
        }

        /**
         * Insert/Update the info about a video in the DB
         * @param  [array] $data [An array containing the data for each column to insert/update]
         */
        public function insertVideo($data) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where('video_id', $data['video_id']);
            $query = $this->db->get('youtube_videos');
            $result = $query->result();
            $count = $result[0]->count;

            if($count == 0) {
                $this->db->insert('youtube_videos', $data);
            } else {
                $this->db->where('video_id', $data['video_id']);
                unset($data['video_id']);
                $this->db->update('youtube_videos', $data);
            }
        }

        /**
         * Refresh the access token
         * @param  [string] $token [The refresh token]
         * @return [type]        [description]
         */
        public function refreshToken($refreshToken, $userId) {
            $data = [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshToken
            ];
            $request = $this->sendRequest($this->tokenUrl, true, $data, null);
            if(array_key_exists('access_token', $request)) {
                $this->db->where('user_id', $userId);
                $this->db->update('youtube_users', [
                    'youtube_access_token' => $request['access_token'],
                ]);
                return $request['access_token'];
            }
            return false;
        }

        public function saveChannelPic(string $id, string $pic) {
            $path = 'public/img/pages/youtube/'.$id.'.png';
            savePic($pic, $path);
            return $path;
        }

        /**
         * Search YouTube for channels or videos
         * @param  [array]   $data   [An array containing request parameters]
         * @param  [string]  $token  [The access token]
         * @param  [boolean] $decode [Whether or not to decode the response]
         * @return [JSON|array]      [The response from the API containing relevant info to the search]
         */
        public function searchPages($data, $token, $decode = false, $parse = false) {
            $results = $this->sendRequest($this->searchUrl, false, $data, $token, $decode);
            if(array_key_exists('error', $results)) {
                return false;
            }

            if($parse) {
                $count = $results['pageInfo']['totalResults'];
                $return = [];
                for($i=0;$i<count($results['items']);$i++) {
                    $item = $results['items'][$i];
                    $snippet = $item['snippet'];
                    $return[$i] = [
                        'about' => $snippet['description'],
                        'id' => $snippet['channelId'],
                        'is_verified' => null,
                        'like_count' => 0,
                        'name' => $snippet['channelTitle'],
                        'profile_pic' => $snippet['thumbnails']['high']['url'],
                        'social_media_id' => $snippet['channelId'],
                        'type' => 'youtube',
                        'username' => $snippet['channelTitle']
                    ];
                }

                $data['count'] = $count;
                $data['data'] = $return;
                $data['nextPageToken'] = array_key_exists('nextPageToken', $results) ? $results['nextPageToken'] : null; 
                return $data;
            }

            return $results;
        }

        public function searchPagesFromDb($q, $page = 0, $just_count = false) {
            $select = 'about, name, profile_pic, social_media_id, type, username';
            if($just_count) {
                $select = 'COUNT(*) AS count';
            }

            $sql = "SELECT ".$select." FROM pages WHERE type = 'youtube' ";
            $params = [];
            if($q) {
                $sql .= "AND (name LIKE ? OR username LIKE ? OR about LIKE ?)";
                $params[] = '%'.$q.'%';
                $params[] = '%'.$q.'%';
                $params[] = '%'.$q.'%';
            }

            if(!$just_count) {
                $limit = 10;
                $start = $page*$limit;
                $sql .= " LIMIT ".$start.", ".$limit;
            }

            $results = $this->db->query($sql, $params)->result_array();
            if($just_count) {
                return $results[0]['count'];
            }

            return empty($results) ? false : $results;
        }

        /**
         * Send a request to YouTube's API
         * @param [string]   $url    [The URL to send a request to]
         * @param [boolean]  $post   [Whether or not the request is a POST request]
         * @param [array]    $data   [Array containing either POST or GET data that will be sent along with the request]
         * @param [string]   $token  [The access token]
         * @param [boolean]  $decode [Whether or not to decode the JSON response]
         */
        public function sendRequest($url, $post, $data, $token, $decode = true) {
            if(!$post && $data) {
                $url .= '?'.http_build_query($data);
            }

            $headers = [];
            if($token) {
                $headers = ['Authorization: Bearer '.$token];
            }

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_REFERER, 'http://localhost:8888/blather');

            if($post) {
                $header = 'Content-Type: application/x-www-form-urlencoded';
                array_push($headers, $header);
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
            }

            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
            $data = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            return $decode ? @json_decode($data, true) : $data;
        }
    }