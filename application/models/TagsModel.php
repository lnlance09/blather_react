<?php 
    class TagsModel extends CI_Model {
        public function __construct() {       
            parent:: __construct();

            $this->baseUrl = $this->config->base_url();
            $this->load->database();
            $this->load->helper('common_helper');
            $this->db->query("SET time_zone='+0:00'");
        }

        public function getTags() {
            $this->db->select('id, text, value');
            $query = $this->db->get('tags');
            return $query->result_array();
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
                        'text' => $tagName,
                        'value' => $tagName
                    ]);
                    $tagId = $this->db->insert_id();

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
    }