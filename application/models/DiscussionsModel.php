<?php 
    class DiscussionsModel extends CI_Model {
        public function __construct() {       
            parent:: __construct();

            $this->baseUrl = $this->config->base_url();
            $this->load->database();
            $this->load->helper('common_helper');
            $this->db->query("SET time_zone='+0:00'");
        }

        public function createDiscussion($title, $description, $extra, $userId, $tags = null) {
            $insert = $this->db->insert('discussions', [
                'created_by' => $userId,
                'date_created' => date('Y-m-d H:i:s'),
                'description' => $description,
                'extra' => $extra,
                'title' => $title
            ]);

            if(!$insert) {
                return false;
            }

            $id = $this->db->insert_id();
            if($tags) {
                $this->tags->insertTags($id, $tags, 'discussion', $userId);
            }
            $discussion = $this->getDiscussion($id, false, true, true);
            return $discussion;
        }

        public function getConversation($id) {
            $this->db->select("dc.date_created, dc.message, dc.user_id, u.name, CONCAT('".$this->baseUrl."img/profile_pics/', u.img) AS img, u.username");
            $this->db->join('users u', 'dc.user_id = u.id');
            $this->db->where('dc.discussion_id', $id);
            $this->db->order_by('date_created', 'ASC');
            return $this->db->get('discussion_conversations dc')->result_array();
        }

        public function getDiscussion($id, $just_count = false, $include_user = false, $include_tags = false) {
            $select = "d.id AS discussion_id, title, d.description, extra, status, d.created_by AS discussion_created_by, d.accepted_by AS accepted_by, d.date_created AS discussion_created_at";

            if($include_tags) {
                $select .= ", GROUP_CONCAT(DISTINCT t.id SEPARATOR ', ') tag_ids, GROUP_CONCAT(DISTINCT t.value SEPARATOR ', ') AS tag_names";
            }

            if($include_user) {
                $select .= ", cu.name AS created_by_name, cu.username AS created_by_username, CONCAT('".$this->baseUrl."img/profile_pics/', cu.img) AS created_by_profile_pic,

                    au.name AS accepted_by_name, au.username AS accepted_by_username, CONCAT('http://localhost:3000/img/profile_pics/', au.img) AS accepted_by_profile_pic";
            }

            if($just_count) {
                $select = "d.id AS discussion_id, accepted_by, created_by, status";
            }

            $this->db->select($select);
            $this->db->where(['d.id' => $id]);

            if(!$just_count) {
                if($include_user) {
                    $this->db->join('users cu', 'd.created_by=cu.id');
                    $this->db->join('users au', 'd.accepted_by=au.id', 'left');
                }

                if($include_tags) {
                    $this->db->join('discussion_tags dt', 'd.id=dt.discussion_id', 'left');
                    $this->db->join('tags t', 'dt.tag_id=t.id', 'left');
                }
            }

            $query = $this->db->get('discussions d');
            $results = $query->result_array();
            return count($results) === 1 ? $results[0] : false;
        }

        public function getDiscussionUsers($startedBy = true, $withUser = false, $both = false, $img = true) {
            $select = 'u.name AS text, u.id AS value';
            if($img) {
                $select .= ", CONCAT('".$this->baseUrl."img/profile_pics/', u.img) AS img";
            }

            $this->db->select($select);
            $join = 'u.id = d.created_by';
            if($withUser) {
                $join = 'u.id = d.accepted_by';
            }
            if($both) {
                $join = 'u.id = d.created_by OR u.id = d.accepted_by';
            }

            $this->db->join('discussions d', $join);
            $this->db->group_by('u.id');
            $query = $this->db->get('users u');
            $results = $query->result_array();

            if($img) {
                for($i=0;$i<count($results);$i++) {
                    $results[$i]['image'] = [
                        'avatar' => true,
                        'src' => $results[$i]['img']
                    ];
                    unset($results[$i]['img']);
                }
            }
            return $results;
        }

        public function lastConvoExchange($id) {
            $this->db->select('*');
            $this->db->where('discussion_id', $id);
            $this->db->order_by('date_created', 'DESC');
            $this->db->limit(1);
            $results = $this->db->get('discussion_conversations')->result_array();
            return count($results) === 1 ? $results[0] : false;
        }

        public function search($data, $just_count = false) {
            $select = "d.id AS discussion_id, 
                d.description, 
                d.date_created AS discussion_date, 
                status,
                title, 
                cu.name AS creator_user_name, 
                CONCAT('".$this->baseUrl."img/profile_pics/', cu.img) AS creator_img, 
                au.name AS acceptor_user_name, 
                CONCAT('".$this->baseUrl."img/profile_pics/', au.img) AS acceptor_img";

            if($data['tags']) {
                $select .= ",GROUP_CONCAT(t.value) AS tags";
            }

            if($just_count) {
                $select = 'COUNT(DISTINCT(d.id)) AS count';
            }

            $this->db->select($select);

            if($data['tags']) {
                $this->db->join('discussion_tags dt', 'd.id = dt.discussion_id', 'left');
                $this->db->join('tags t', 'dt.tag_id = t.id', 'left');
            }

            $this->db->join('users cu', 'd.created_by = cu.id');
            $this->db->join('users au', 'd.accepted_by = au.id', 'left');

            if($data['q']) {
                $this->db->where("title LIKE '%".$data['q']."%' OR d.description LIKE '%".$data['q']."%' OR cu.username LIKE '%".$data['q']."%' OR au.username LIKE '%".$data['q']."%'");
            }

            if($data['by']) {
                if($data['both']) {
                    $this->db->group_start();
                    $this->db->where('d.created_by', (int)$data['by']);
                    $this->db->or_where('d.accepted_by', (int)$data['by']);
                    $this->db->group_end();
                } else {
                    $this->db->where('d.created_by', (int)$data['by']);
                }
            }

            if($data['with']) {
                $this->db->where('d.accepted_by', (int)$data['with']);
            }

            if($data['status'] !== null) {
                $this->db->where('d.status', $data['status']);
            }

            if(is_array($data['tags'])) {
                $this->db->where_in('t.value', $data['tags']);
            }

            if(!$just_count) {
                $limit = 10;
                $start = $data['page']*$limit;
                $this->db->order_by('d.id DESC');
                $this->db->limit($limit, $start);
            }

            if($just_count) {
                $result = $this->db->get('discussions d')->result();
                return (int)$result[0]->count;
            }
            
            $this->db->group_by('discussion_id, description, discussion_date, title, creator_user_name');
            $results = $this->db->get('discussions d')->result_array();
            return $results;
        }

        public function submitConversation($id, $userId, $msg) {
            $this->db->insert('discussion_conversations', [
                'date_created' => date('Y-m-d H:i:s'),
                'discussion_id' => $id,
                'message' => $msg,
                'user_id' => $userId
            ]);
        }

        public function updateDiscussion($id, $title, $description, $extra, $userId, $tags = null) {
            $this->db->where('id', $id);
            $this->db->update('discussions', [
                'description' => $description,
                'extra' => $extra,
                'last_updated' => date('Y-m-d H:i:s'),
                'title' => $title
            ]);

            if($tags) {
                $this->tags->insertTags($id, $tags, 'discussion', $userId);
            }
        }

        public function updateStatus($id, $status, $accepted_by = null) {
            $data['status'] = $status;
            if($accepted_by) {
                $data['accepted_by'] = $accepted_by;
            }
            $this->db->where('id', $id);
            $this->db->update('discussions', $data);
        }
    }