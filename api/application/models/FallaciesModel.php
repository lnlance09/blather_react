<?php 
    class FallaciesModel extends CI_Model {
        public function __construct() {       
            parent:: __construct();

            $this->baseUrl = $this->config->base_url();
            $this->imgUrl = $this->config->img_url();
            $this->load->database();
            $this->db->query("SET time_zone='+0:00'");
        }

        public function assignedAlready($assigned_by, $comment_id, $media_id, $page_id) {
            $this->db->select('id');
            $this->db->where([
                'assigned_by' => $assigned_by,
                'comment_id' => $comment_id,
                'media_id' => $media_id,
                'page_id' => $page_id
            ]);
            $result = $this->db->get('fallacy_entries')->result_array();
            return count($result) === 0 ? false : $result[0]['id'];
        }

        public function assignContradiction($id, $contradiction) {
            $decode = @json_decode($contradiction, true);
            $commentId = array_key_exists('commentId', $decode) ? $decode['commentId'] : null;
            $endTime = array_key_exists('endTime', $decode) ? $decode['endTime'] : null;
            $mediaId = $decode['mediaId'];
            $network = $decode['network'];
            $pageId = $decode['pageId'];
            $startTime = array_key_exists('currentTime', $decode['data']) ? $decode['data']['currentTime'] : null;

            $exists = $this->contradictionExists($id);
            if($exists) {
                $this->db->where('id', $id);
                $this->db->update('contradictions', [
                    'comment_id' => $commentId,
                    'end_time' => $endTime,
                    'media_id' => $mediaId,
                    'network' => $network,
                    'page_id' => $pageId,
                    'start_time' => $startTime
                ]);
            } else {
                $this->db->insert('contradictions', [
                    'comment_id' => $commentId,
                    'end_time' => $endTime,
                    'fallacy_entry_id' => $id,
                    'media_id' => $mediaId,
                    'network' => $network,
                    'page_id' => $pageId,
                    'start_time' => $startTime
                ]);
            }
        }

        public function assignFallacy(
            $assigned_by, 
            $comment_id, 
            $endTime,
            $explanation, 
            $fallacy_id, 
            $media_id, 
            $network, 
            $page_id, 
            $startTime, 
            $title, 
            $contradiction = null
        ) {
            $this->db->insert('fallacy_entries', [
                'assigned_by' => $assigned_by,
                'comment_id' => $comment_id,
                'date_created' => date('Y-m-d H:i:s'),
                'end_time' => $endTime,
                'explanation' => strip_tags($explanation),
                'fallacy_id' => $fallacy_id,
                'media_id' => $media_id,
                'network' => $network,
                'page_id' => $page_id,
                'start_time' => $startTime,
                'title' => $title
            ]);
            $id = $this->db->insert_id();

            if($contradiction) {
                $this->assignContradiction($id, $contradiction);
            }

            return $id;
        }

        public function contradictionExists($id) {
            $this->db->select('id');
            $this->db->where('fallacy_entry_id', $id);
            $result = $this->db->get('contradictions')->result_array();
            return count($result) === 0 ? false : $result[0]['id'];
        }

        /**
         * [postCommentFallacy description]
         * @param  [type] $data [description]
         * @return [type]       [description]
         */
        public function createComment($data) {
            $this->db->insert('fallacy_comments', $data);
        }

        public function fallacyTypeExists($id) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where('id', $id);
            $result = $this->db->get('fallacies')->result_array();
            return $result[0]['count'] == 0 ? false : true;
        }

        /**
         * [getFallacyComments description]
         * @param  [type] $id      [description]
         * @param  [type] $page    [description]
         * @return [type]          [description]
         */
        public function getComments($id, $page = null, $just_count = false) {
            $select = "f.created_at, f.message, f.user_id, CONCAT('".$this->imgUrl."profile_pics/', u.img) AS img, u.name, u.username";
            if($just_count) {
                $select = 'COUNT(*) AS count';
            }

            $this->db->select($select);
            $this->db->join('users u', 'f.user_id=u.id');
            $this->db->where('fallacy_id', $id);
            if(!$just_count) {
                $this->db->order_by('created_at', 'DESC');
                if($page !== null) {
                    $perPage = 10;
                    $limit = $page*$perPage;
                }
            }

            $query = $this->db->get('fallacy_comments f');
            if($just_count) {
                $result = $query->result_array();
                return $result[0]['count'];
            }
            return $query->result_array();
        }

        public function getConversation($id) {
            $this->db->select("fc.date_created, fc.message, fc.user_id, u.name, CONCAT('".$this->imgUrl."profile_pics/', u.img) AS img, u.username");
            $this->db->join('users u', 'fc.user_id = u.id');
            $this->db->where('fc.fallacy_id', $id);
            $this->db->order_by('date_created', 'ASC');
            return $this->db->get('fallacy_conversations fc')->result_array();
        }

        public function getFallacies() {
            $this->db->select('*');
            return $this->db->get('fallacy_entries')->result_array();
        }

        public function getFallacy($id, $just_count = false) {
            $select = "f.name AS fallacy_name,

                fe.id AS id,
                fe.assigned_by,
                fe.date_created,
                fe.end_time,
                fe.explanation,
                fe.fallacy_id,
                fe.network,
                fe.start_time,
                fe.status,
                fe.title,
                fe.view_count,

                p.name AS page_name,
                p.profile_pic AS page_profile_pic,
                p.social_media_id AS page_id,
                p.type AS page_type,
                p.username AS page_username,

                u.name AS user_name, 
                u.username AS user_username, 
                CONCAT('".$this->imgUrl."profile_pics/', u.img) AS user_img, 
                u.id AS user_id,

                a.code AS archive_code,
                a.object_id AS archive_object_id,
                a.date_created AS archive_date_created,

                GROUP_CONCAT(DISTINCT t.id SEPARATOR ', ') tag_ids, 
                GROUP_CONCAT(DISTINCT t.value SEPARATOR ', ') AS tag_names,

                tp.tweet_json,

                yv.channel_id AS video_channel_id, 
                yv.date_created AS video_created_at, 
                yv.description AS video_description, 
                yv.dislike_count AS video_dislike_count, 
                yv.img AS video_img, 
                yv.like_count AS video_like_count, 
                yv.title AS video_title, 
                yv.video_id AS video_video_id, 
                yv.view_count AS video_view_count,

                yvp.name AS video_channel_name,
                yvp.profile_pic AS video_channel_img,

                yc.channel_id AS comment_channel_id, 
                yc.comment_id AS comment_id,
                yc.date_created AS comment_created_at, 
                yc.like_count AS comment_like_count, 
                yc.message AS comment_message,
                yc.video_id AS comment_video_id,


                c.comment_id AS contradiction_comment_id, 
                c.end_time AS contradiction_end_time, 
                c.media_id AS contradiction_media_id, 
                c.network AS contradiction_network, 
                c.page_id AS contradiction_page_id, 
                c.start_time AS contradiction_start_time,

                cp.name AS contradiction_page_name,
                cp.profile_pic AS contradiction_page_profile_pic,
                cp.type AS contradiction_page_type,
                cp.username AS contradiction_page_username,


                ctp.tweet_json AS contradiction_tweet_json,

                cyv.channel_id AS contradiction_video_channel_id, 
                cyv.date_created AS contradiction_video_created_at, 
                cyv.description AS contradiction_video_description, 
                cyv.dislike_count AS contradiction_video_dislike_count, 
                cyv.img AS contradiction_video_video_img, 
                cyv.like_count AS contradiction_video_like_count, 
                cyv.title AS contradiction_video_video_title, 
                cyv.video_id AS contradiction_video_video_id, 
                cyv.view_count AS contradiction_video_view_count,

                cyc.channel_id AS contradiction_comment_channel_id, 
                cyc.date_created AS contradiction_comment_created_at, 
                cyc.like_count AS contradiction_comment_like_count, 
                cyc.message AS contradiction_comment_message,
                cyc.video_id AS contradiction_comment_video_id";

            if($just_count) {
                $select = "assigned_by, page_id AS assigned_to, explanation, fallacy_id, status, title";
            }

            $this->db->select($select);

            if(!$just_count) {
                $this->db->join('fallacies f', 'fe.fallacy_id = f.id');
                $this->db->join('pages p', 'fe.page_id = p.social_media_id');
                $this->db->join('users u', 'fe.assigned_by = u.id');
                $this->db->join('archived_links a', 'a.object_id = fe.media_id AND a.user_id = fe.assigned_by', 'left');

                $this->db->join('fallacy_tags ft', 'fe.id = ft.fallacy_id', 'left');
                $this->db->join('tags t', 'ft.tag_id = t.id', 'left');

                $this->db->join('twitter_posts tp', 'fe.media_id = tp.tweet_id', 'left');
                $this->db->join('youtube_videos yv', 'fe.media_id = yv.video_id', 'left');
                $this->db->join('pages yvp', 'yv.channel_id = yvp.social_media_id', 'left');
                $this->db->join('youtube_comments yc', 'fe.comment_id = yc.comment_id', 'left');

                $this->db->join('contradictions c', 'fe.id = c.fallacy_entry_id', 'left');
                $this->db->join('pages cp', 'c.page_id = cp.social_media_id', 'left');

                $this->db->join('twitter_posts ctp', 'c.media_id = ctp.tweet_id', 'left');
                $this->db->join('youtube_comments cyc', 'c.comment_id = cyc.comment_id', 'left');
                $this->db->join('youtube_videos cyv', 'c.media_id = cyv.video_id', 'left');
            }

            $this->db->where('fe.id', $id);
            $result = $this->db->get('fallacy_entries fe')->result_array();
            return empty($result) ? false : $result[0];
        }

        public function getFallacyCount($id) {
            $this->db->select('COUNT(*) AS count');
            $this->db->where('page_id', $id);
            $result = $this->db->get('fallacy_entries')->result_array();
            return (int)$result[0]['count'];
        }

        public function getFallacyTypes() {
            $this->db->select('*');
            return $this->db->get('fallacies')->result_array();
        }

        public function getUniqueFallacies($id, $type = 'user', $network = 'twitter') {
            $this->db->select("f.id AS value, f.name AS key, CONCAT(f.name, ' (', COUNT(*), ')') AS text");
            $this->db->join('fallacies f', 'fe.fallacy_id = f.id');
            
            if($type === 'pages') {
                $this->db->where('fe.page_id', $id);
            } 
            if($type === 'post') {
                $this->db->where('fe.media_id', $network === 'twitter' ? (int)$id : $id);
            } 
            if($type === 'users') {
                $this->db->where('fe.assigned_by', $id);
            }

            $this->db->group_by('f.id');
            $this->db->order_by('COUNT(*)', 'DESC');
            return $this->db->get('fallacy_entries fe')->result_array();
        }

        public function insertFallacyRefs() {
            $file = file_get_contents(getcwd().'/public/js/blather/src/fallacies.json');
            $json = @json_decode($file, true);
            for($i=0;$i<count($json);$i++) {
                $this->db->insert('fallacies', [
                    'description' => $json[$i]['description'],
                    'name' => $json[$i]['name']
                ]);
            }
        }

        public function lastConvoExchange($id) {
            $this->db->select('*');
            $this->db->where('fallacy_id', $id);
            $this->db->order_by('date_created', 'DESC');
            $this->db->limit(1);
            $results = $this->db->get('fallacy_conversations')->result_array();
            return count($results) === 1 ? $results[0] : false;
        }

        public function search($data, $just_count = false) {
            
            $select = "f.name AS fallacy_name,

                fe.id AS id,
                fe.assigned_by,
                fe.date_created,
                fe.explanation,
                fe.fallacy_id,
                fe.network,
                fe.start_time,
                fe.status,
                fe.title,
                fe.view_count,

                p.name AS page_name,
                p.profile_pic AS page_profile_pic,
                p.social_media_id AS page_id,
                p.type AS page_type,
                p.username AS page_username,

                u.name AS user_name, 
                u.username AS user_username, 
                CONCAT('".$this->imgUrl."profile_pics/', u.img) AS user_img, 
                u.id AS user_id,

                a.code AS archive_code,
                a.object_id AS archive_object_id,
                a.date_created AS archive_date_created,

                GROUP_CONCAT(DISTINCT t.id SEPARATOR ', ') tag_ids, 
                GROUP_CONCAT(DISTINCT t.value SEPARATOR ', ') AS tag_names, ";

            if($just_count) {
                $select = 'COUNT(DISTINCT(fe.id)) AS count';
            }

            $this->db->select($select);
            $this->db->join('fallacies f', 'fe.fallacy_id = f.id');
            $this->db->join('pages p', 'fe.page_id = p.social_media_id');
            $this->db->join('users u', 'fe.assigned_by = u.id');
            $this->db->join('archived_links a', 'a.object_id = fe.media_id AND a.user_id = fe.assigned_by', 'left');

            $this->db->join('fallacy_tags ft', 'fe.id = ft.fallacy_id', 'left');
            $this->db->join('tags t', 'ft.tag_id = t.id', 'left');

            if($data['object_id'] && $data['network'] === 'twitter') {
                $this->db->join('twitter_posts tp', 'fe.media_id = tp.tweet_id');
            }

            if($data['network'] === 'youtube') {
                if($data['comment_id']) {
                    $this->db->join('youtube_comments yc', 'fe.comment_id = yc.comment_id');
                } else {
                    $this->db->join('youtube_videos yv', 'fe.media_id = yv.video_id');
                }
            }

            if($data['q']) {
                $this->db->where("title LIKE '%".$data['q']."%' OR explanation LIKE '%".$data['q']."%' ");
            }

            if($data['fallacies']) {
                $this->db->where_in('fe.fallacy_id', $data['fallacies']);
            }

            if($data['assigned_by']) {
                $this->db->where('fe.assigned_by', $data['assigned_by']);
            }

            if($data['assigned_to']) {
                $this->db->where('p.social_media_id', $data['assigned_to']);
            }

            if($data['object_id']) {
                $this->db->where([
                    'fe.network' => $data['network'],
                    'fe.media_id' => $data['network'] === 'twitter' ? (int)$data['object_id'] : $data['object_id']
                ]);
            }

            if(!$just_count) {
                $limit = 10;
                $start = $data['page']*$limit;
                $this->db->order_by('fe.id DESC');
                $this->db->limit($limit, $start);
                $this->db->group_by('fe.id');
            }

            if($just_count) {
                $result = $this->db->get('fallacy_entries fe')->result();
                return (int)$result[0]->count;
            }

            $results = $this->db->get('fallacy_entries fe')->result_array();
            return $results;
        }

        public function submitConversation($id, $userId, $msg) {
            $this->db->insert('fallacy_conversations', [
                'date_created' => date('Y-m-d H:i:s'),
                'fallacy_id' => $id,
                'message' => $msg,
                'user_id' => $userId
            ]);
        }

        public function updateFallacy($id, $explanation, $fallacy_id, $tags = null, $title, $userId, $contradiction = null) {
            $this->db->where('id', $id);
            $this->db->update('fallacy_entries', [
                'explanation' => $explanation,
                'fallacy_id' => $fallacy_id,
                'last_updated' => date('Y-m-d H:i:s'),
                'title' => $title
            ]);

            if($tags) {
                $this->tags->insertTags($id, $tags, 'fallacy', $userId);
            }
        }

        public function updateStatus($id, $status) {
            $sql = "UPDATE fallacy_entries SET status = ? WHERE id = ?";
            $this->db->query($sql, [$status, $id]);
        }

        public function updateViewCount($id) {
            $sql = "UPDATE fallacy_entries SET view_count = view_count+1 WHERE id = ?";
            $this->db->query($sql, [$id]);
        }
    }