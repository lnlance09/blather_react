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
                $this->insertDiscussionTags($id, $tags, $userId);
            }
            $discussion = $this->getDiscussion($id, false, true, true);
            return $discussion;
        }

        public function getDiscussion($id, $just_count = false, $include_user = false, $include_tags = false) {
            $select = "d.id AS discussion_id, title, description, extra, d.created_by AS discussion_created_by, d.date_created AS discussion_created_at";

            if($include_tags) {
                $select .= ", GROUP_CONCAT(DISTINCT t.id SEPARATOR ', ') tag_ids, GROUP_CONCAT(DISTINCT t.value SEPARATOR ', ') AS tag_names";
            }

            if($include_user) {
                $select .= ", u.name, u.username, u.id AS user_id, CONCAT('http://localhost:3000/img/profile_pics/', u.img) AS profile_pic";
            }

            if($just_count) {
                $select = "d.id AS discussion_id, created_by";
            }

            $this->db->select($select);
            $this->db->where(['d.id' => $id]);

            if(!$just_count) {
                if($include_user) {
                    $this->db->join('users u', 'd.created_by=u.id');
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
                $select .= ", CONCAT('http://localhost:3000/img/profile_pics/', u.img) AS img";
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

        public function searchDiscussions($q = null, $by = null, $with = null, $status = null, $tags = null, $page = 0, $just_count = false) {
            $select = "d.id AS discussion_id, 
                description, 
                d.date_created AS discussion_date, 
                title, 
                cu.name AS creator_user_name, 
                CONCAT('http://localhost:3000/img/profile_pics/', cu.img) AS creator_img, 
                au.name AS acceptor_user_name, 
                CONCAT('http://localhost:3000/img/profile_pics/', au.img) AS acceptor_img";

            if($tags) {
                $select .= ",GROUP_CONCAT(t.text) AS tags";
            }

            if($just_count) {
                $select = 'COUNT(DISTINCT(d.id)) AS count';
            }

            $this->db->select($select);

            if($tags) {
                $this->db->join('discussion_tags dt', 'd.id = dt.discussion_id', 'left');
                $this->db->join('tags t', 'dt.tag_id = t.id', 'left');
            }

            $this->db->join('users cu', 'd.created_by = cu.id');
            $this->db->join('users au', 'd.accepted_by = au.id', 'left');

            if($q) {
                $this->db->where("title LIKE '%".$q."%' OR description LIKE '%".$q."%' OR cu.username LIKE '%".$q."%' OR au.username LIKE '%".$q."%'");
            }

            if($by) {
                $this->db->where('d.created_by', $by);
            }

            if($with) {
                $this->db->where('d.accepted_by', $with);
            }

            if($status) {
                $this->db->where('d.status', $status);
            }

            if(is_array($tags)) {
                $this->db->where_in('t.value', $tags);
            }

            if(!$just_count) {
                $limit = 10;
                $start = $page*$limit;
                $this->db->order_by('d.id DESC');
                $this->db->limit($limit, $start);
            }

            if($just_count) {
                $result = $this->db->get('discussions d')->result();
                return $result[0]->count;
            }
            
            $this->db->group_by('discussion_id, description, discussion_date, title, creator_user_name');
            $results = $this->db->get('discussions d')->result_array();
            return $results;
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
    }