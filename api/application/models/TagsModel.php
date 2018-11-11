<?php 
    class TagsModel extends CI_Model {
        public function __construct() {       
            parent:: __construct();

            $this->baseUrl = $this->config->base_url();
            $this->imgUrl = $this->baseUrl.'api/public/img/';
            $this->load->database();
            $this->load->helper('common_helper');
            $this->db->query("SET time_zone='+0:00'");
        }

        public function getHistory($id) {
            $this->db->select("tv.description, CONCAT('".$this->imgUrl."tag_pics/', tv.img) AS tag_img,
                tv.date_updated, tv.updated_by,tv.version,

                u.id AS user_id, u.name AS user_name, CONCAT('".$this->imgUrl."profile_pics/', u.img) AS user_img, u.username");
            $this->db->join('users u', 'tv.updated_by = u.id');
            $this->db->where('tv.tag_id', $id);
            $this->db->order_by('tv.date_updated DESC');
            $results = $this->db->get('tag_versions tv')->result_array();
            return $results;
        }

        public function getTagInfo($id) {
            $this->db->select("t.id AS tag_id, t.value AS tag_name, t.date_created,

                tv.description, CONCAT('".$this->imgUrl."tag_pics/', tv.img) AS tag_img,
                tv.date_updated, tv.updated_by,

                u.id AS user_id, u.name AS user_name, CONCAT('".$this->imgUrl."profile_pics/', u.img) AS user_img, u.username");
            $this->db->join('users u', 't.created_by = u.id');
            $this->db->join('tag_versions tv', 't.id = tv.tag_id');
            $this->db->where('t.id', $id);
            $this->db->where("tv.version = (SELECT MAX(version) FROM tag_versions WHERE tag_id = ".$id.")");
            $result = $this->db->get('tags t')->result_array();
            return count($result) === 1 ? $result[0] : false;
        }

        public function getTags() {
            $this->db->select('id, value, value AS text');
            return $this->db->get('tags')->result_array();
        }

        public function insertTags($id, $tags, $type, $userId) {
            foreach($tags as $tag) {
                $tagName = is_array($tag) ? $tag['name'] : $tag;
                $this->db->select('id');
                $this->db->where('value', $tagName);
                $query = $this->db->get('tags');
                $result = $query->result_array();
                if(count($result) === 0) {
                    $this->db->insert('tags', [
                        'created_by' => $userId,
                        'date_created' => date('Y-m-d H:i:s'),
                        'value' => $tagName
                    ]);
                    $tagId = $this->db->insert_id();

                    $this->db->insert('tag_versions', [
                        'date_updated' => date('Y-m-d H:i:s'),
                        'tag_id' => $tagId,
                        'updated_by' => $userId,
                        'version' => 1
                    ]);

                    $this->db->insert($type.'_tags', [
                        $type.'_id' => $id,
                        'tag_id' => $tagId
                    ]);
                } else {
                    $tag_id = $result[0]['id'];
                    $this->db->select('COUNT(*) AS count');
                    $this->db->where([
                        $type.'_id' => $id,
                        'tag_id' => $tag_id
                    ]);
                    $query = $this->db->get($type.'_tags');
                    $result = $query->result_array();
                    
                    if($result[0]['count'] == 0) {
                        $this->db->insert($type.'_tags', [
                            'date_created' => date('Y-m-d H:i:s'),
                            $type.'_id' => $id,
                            'tag_id' => $tag_id
                        ]);
                    }
                }
            }
        }

        public function removeTag($id, $tagId, $type) {
            $this->db->where([
                $type.'_id' => $id,
                'tag_id' => $tagId
            ]);
            $this->db->delete($type.'_tags');
        }

        public function updateTag($id, $data) {
            $subquery = "SELECT description, img, version
                        FROM tag_versions 
                        WHERE tag_id = ?
                        ORDER BY version DESC 
                        LIMIT 1";
            $query = $this->db->query($subquery, [$id])->result();
            if(!empty($query)) {
                if(!array_key_exists('img', $data)) {
                    $data['img'] = $query[0]->img;
                }
                if(!array_key_exists('description', $data)) {
                    $data['description'] = $query[0]->description;
                }
                $data['version'] = $query[0]->version+1;
            }

            $this->db->insert('tag_versions', $data);
        }
    }