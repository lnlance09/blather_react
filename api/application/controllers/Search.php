<?php
    defined('BASEPATH') OR exit('No direct script access allowed');

    class Search extends CI_Controller {
        public function __construct() {
            parent:: __construct();

            $this->base_url = $this->config->base_url();
            $this->load->model('DiscussionsModel', 'discussions');
            $this->load->model('FallaciesModel', 'fallacies');
            $this->load->model('FacebookModel', 'fb');
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

            $hasMore = false;
            $is_live_search = false;
            $q = trim($q);
            $results = null;
            $error = false;

            $limit = 10;
            $start = $page*$limit;

            switch ($type) {
                case 'facebook':

                    if($this->user ? $this->user->linkedFb : false) {
                        $is_live_search = true;
                        $results = $this->fb->searchPages($q, $this->user->fbAccessToken);
                        FormatArray($results);
                    } else {
                        $count = $this->database->searchPages($q, 'fb', true, $page);
                        $results = $this->database->searchPages($q, 'fb', false, $page);
                    }
                    break;

                case 'twitter':

                    if ($this->user ? $this->user->linkedTwitter && !empty($q) : false) {
                        $is_live_search = true;
                        $token = $this->user->twitterAccessToken;
                        $secret = $this->user->twitterAccessSecret;
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

                case 'youtube':

                    if ($this->user ? $this->user->linkedYoutube : false) {
                        $is_live_search = true;
                        $token = $this->user->youtubeAccessToken;
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

                case'users':

                    $count = $this->users->searchUsers($q, $page, true);
                    $results = $this->users->searchUsers($q, $page);
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
                        'q' => $q
                    ];
                    $count = $this->fallacies->search($params, true);
                    $results = $this->fallacies->search($params, false);
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
            $youtubeResults = $this->youtube->searchPagesFromDb($q, 0, false);
            $twitterResults = $this->twitter->searchPagesFromDb($q, 0, false);

            if (empty($youtubeResults)) {
                $youtubeResults = [];
            }

            if (empty($twitterResults)) {
                $twitterResults = [];
            }

            $merge = array_merge($youtubeResults, $twitterResults);
            for ($i=0;$i<count($merge);$i++) {
                $merge[$i]['description'] = $merge[$i]['about'];
                $merge[$i]['image'] = $merge[$i]['profile_pic'];
                $merge[$i]['key'] = $merge[$i]['social_media_id'];
                $merge[$i]['title'] = $merge[$i]['name'];
                unset($merge[$i]['about']);
                unset($merge[$i]['name']);
                unset($merge[$i]['profile_pic']);
            }

            echo json_encode([
                'results' => !$merge ? [] : $merge
            ]);
        }
    }