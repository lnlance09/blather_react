<?php
    defined('BASEPATH') OR exit('No direct script access allowed');

    class Search extends CI_Controller {
        public function __construct() {
            parent:: __construct();

            $this->base_url = $this->config->base_url();
            $this->load->model('DiscussionsModel', 'discussions');
            $this->load->model('FallaciesModel', 'fallacies');
            $this->load->model('FacebookModel', 'fb');
            $this->load->model('TagsModel', 'tags');
            $this->load->model('TwitterModel', 'twitter');
            $this->load->model('YouTubeModel', 'youtube');
        }

        public function advanced() {
            $fallacies = $this->input->get('fallacies');
            $network = $this->input->get('network');
            $nextPageToken = $this->input->get('nextPageToken');
            $page = $this->input->get('page');
            $q = $this->input->get('q');
            $type = $this->input->get('type');

            $user = $this->user;
            $hasMore = false;
            $is_live_search = false;
            $q = trim($q);
            $results = null;
            $error = false;
            $limit = 10;

            switch ($type) {
                case 'channels':

                    if ($user ? $user->linkedYoutube : false) {
                        $is_live_search = true;
                        $token = $user->youtubeAccessToken;
                        $pages = $this->youtube->searchPages([
                            'maxResults' => 10,
                            'order' => 'relevance',
                            'pageToken' => $nextPageToken,
                            'part' => 'id,snippet',
                            'q' => $q,
                            'type' => 'channel'
                        ], $token, true, true);

                        if (!$pages) {
                            $count = 0;
                            $error = true;
                            $results = [];
                        } else {
                            $hasMore = !$pages['nextPageToken'];
                            $nextPageToken = $pages['nextPageToken'];
                            $count = $pages['count'];
                            $results = $pages['data'];
                        }
                    } else {
                        $count = $this->youtube->searchPagesFromDb($q, $page, true);
                        $results = $this->youtube->searchPagesFromDb($q, $page, false);
                    }
                    break;

                case'fallacies':

                    $fallacies = $fallacies ? array_map('intval', explode(',', $fallacies)) : null;
                    $params = [
                        'assigned_by' => null,
                        'assigned_to' => null,
                        'comment_id' => null,
                        'fallacies' => $fallacies,
                        'fallacy_id' => null,
                        'network' => null,
                        'object_id' => null,
                        'page' => $page,
                        'q' => $q,
                        'tag_id' => null
                    ];
                    $count = $this->fallacies->search($params, true);
                    $results = $this->fallacies->search($params, false);
                    break;

                case 'facebook':

                    if($user ? $user->linkedFb : false) {
                        $is_live_search = true;
                        $results = $this->fb->searchPages($q, $this->user->fbAccessToken);
                        FormatArray($results);
                    } else {
                        $count = $this->database->searchPages($q, 'fb', true, $page);
                        $results = $this->database->searchPages($q, 'fb', false, $page);
                    }
                    break;

                case 'profiles':

                    if ($user ? $user->linkedTwitter && !empty($q) : false) {
                        $is_live_search = true;
                        $token = $user->twitterAccessToken;
                        $secret = $user->twitterAccessSecret;
                        $results = $this->twitter->search([
                            'count' => 10,
                            'page' => $page+1,
                            'q' => rawurlencode($q)
                        ], $token, $secret, true);
                        $count = count($results);
                        $hasMore = $count === $limit;
                        
                        if (!$results) {
                            $error = true;
                            $results = [];
                        }
                    } else {
                        $count = $this->twitter->searchPagesFromDb($q, $page, true);
                        $results = $this->twitter->searchPagesFromDb($q, $page, false);
                    }
                    break;

                case 'tags':

                    $count = $this->tags->searchTags($q, $page, true);
                    $results = $this->tags->searchTags($q, $page);
                    $limit = 25;
                    break;

                case 'tweets':

                    $count = $this->twitter->searchTweets($q, $page, true);
                    $results = $this->twitter->searchTweets($q, $page);
                    break;

                case'users':

                    $count = $this->users->searchUsers($q, $page, true);
                    $results = $this->users->searchUsers($q, $page);
                    break;

                case 'videos':

                    $count = $this->youtube->searchVideos($q, $page, true);
                    $results = $this->youtube->searchVideos($q, $page);
                    break;
            }

            $pages = ceil($count/$limit);
            echo json_encode([
                'count' => (int)$count,
                'error' => $error,
                'hasMore' => $hasMore ? $hasMore : $page+1 < $pages,
                'is_live_search' => $is_live_search,
                'nextPageToken' => $nextPageToken,
                'page' => (int)$page,
                'pages' => $pages,
                'results' => !$results ? [] : $results
            ]);
        }

        public function basic() {
            $q = $this->input->get('q');
            $category = (int)$this->input->get('category');

            $youtubeResults = $this->youtube->searchPagesFromDb($q);
            $twitterResults = $this->twitter->searchPagesFromDb($q);

            if (empty($youtubeResults)) {
                $youtubeResults = [];
            }

            if (empty($twitterResults)) {
                $twitterResults = [];
            }

            $pages = array_merge($youtubeResults, $twitterResults);
            $pages = array_slice($pages, 0, 7);

            for ($i=0;$i<count($pages);$i++) {
                $pages[$i]['image'] = $pages[$i]['profile_pic'];
                $pages[$i]['key'] = $pages[$i]['social_media_id'];
                $pages[$i]['title'] = $pages[$i]['name'];
                unset($pages[$i]['name']);
                unset($pages[$i]['profile_pic']);
            }

            $results = $pages;

            if ($category) {
                $tags = $this->tags->searchTags($q);
                if (empty($tags)) {
                    $tags = [];
                }

                for ($i=0;$i<count($tags);$i++) {
                    $tags[$i]['image'] = null;
                    $tags[$i]['key'] = $tags[$i]['id'];
                    $tags[$i]['title'] = $tags[$i]['value'];
                }

                $results = [];
                if (count($pages) > 0) {
                    $results['pages'] = [
                        'name' => 'Pages',
                        'results' => $pages
                    ];
                }

                if (count($tags) > 0) {
                    $results['tags'] = [
                        'name' => 'Tags',
                        'results' => $tags
                    ];
                }
            }

            echo json_encode([
                'results' => $results
            ]);
        }
    }