<?php 
	class TagsModel extends CI_Model {
		public function __construct() {
			parent:: __construct();

			$this->baseUrl = $this->config->base_url();
			$this->imgUrl = $this->baseUrl.'api/public/img/';
			$this->s3Path = 'https://s3.amazonaws.com/blather22/';

			$this->load->database();
			$this->load->helper('common_helper');
			$this->db->query("SET time_zone='+0:00'");
		}

		public function addPic($data) {
			$this->db->insert('tag_images', $data);
		}

		public function getHistory($id) {
			$this->db->select("tv.description, CONCAT('".$this->s3Path."', tv.img) AS tag_img,
				tv.date_updated, tv.updated_by,tv.version,

				u.id AS user_id, u.name AS user_name, CONCAT('".$this->s3Path."', u.img) AS user_img, u.username");
			$this->db->join('users u', 'tv.updated_by = u.id');
			$this->db->where('tv.tag_id', $id);
			$this->db->order_by('tv.date_updated DESC');
			$results = $this->db->get('tag_versions tv')->result_array();
			return $results;
		}

		public function getImages($id) {
			$this->db->select("CONCAT('".$this->s3Path."', s3_path) AS src, CONCAT('".$this->s3Path."', s3_path) AS thumbnail, CONVERT(`height`, UNSIGNED INTEGER) AS thumbnailHeight, CONVERT(`width`, UNSIGNED INTEGER) AS thumbnailWidth, caption");
			$this->db->where('tag_id', $id);
			$results = $this->db->get('tag_images')->result_array();
			return count($results) === 0 ? false : $results;
		}

		public function getTaggedUsers($id) {
			$this->db->select("CONCAT('".$this->s3Path."', p.s3_pic) AS img, CONCAT(p.name, ' (', COUNT(*), ')') AS text, COUNT(*) AS count, p.social_media_id AS value, p.name AS name, p.type");
			$this->db->join('fallacy_entries fe', 'p.social_media_id = fe.page_id');
			$this->db->join('fallacy_tags ft', 'fe.id = ft.fallacy_id');
			$this->db->where('ft.tag_id', $id);
			$this->db->order_by('count DESC');
			$this->db->group_by('p.social_media_id');
			$results = $this->db->get('pages p')->result_array();
			return count($results) === 0 ? false : $results;
		}

		public function getTagInfo($id) {
			$this->db->select("

				t.id AS tag_id, t.value AS tag_name, t.date_created,

				tv.description, CONCAT('".$this->s3Path."', tv.img) AS tag_img,
				tv.date_updated, tv.updated_by,

				u.id AS user_id, u.name AS user_name, CONCAT('".$this->s3Path."', u.img) AS user_img, u.username
				");
			$this->db->join('users u', 't.created_by = u.id');
			$this->db->join('tag_versions tv', 't.id = tv.tag_id');
			$this->db->where('t.id', $id);
			$this->db->where("tv.version = (SELECT MAX(version) FROM tag_versions WHERE tag_id = ".$id.")");
			$result = $this->db->get('tags t')->result_array();
			return count($result) === 1 ? $result[0] : false;
		}

		public function getTags() {
			$this->db->select('id, value, slug, value AS text');
			return $this->db->get('tags')->result_array();
		}

		public function insertTags($id, $tags, $type, $userId) {
			foreach ($tags as $tag) {
				$tagName = is_array($tag) ? $tag['name'] : $tag;
				$this->db->select('id');
				$this->db->where('value', $tagName);
				$query = $this->db->get('tags');
				$result = $query->result_array();
				if (count($result) === 0) {
					$this->db->insert('tags', [
						'created_by' => $userId,
						'date_created' => date('Y-m-d H:i:s'),
						'value' => $tagName
					]);
					$tagId = $this->db->insert_id();

					$this->update($tagId, [
						'slug' => slugify($tagName).'-'.$tagId
					]);

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
					
					if ($result[0]['count'] == 0) {
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

		public function update($id, $data) {
			$this->db->where('id', $id);
			$this->db->update('tags', $data);
		}

		public function updateTag($id, $data) {
			$subquery = "SELECT description, img, version
						FROM tag_versions 
						WHERE tag_id = ?
						ORDER BY version DESC 
						LIMIT 1";
			$query = $this->db->query($subquery, [$id])->result();
			if (!empty($query)) {
				if (!array_key_exists('img', $data)) {
					$data['img'] = $query[0]->img;
				}
				if (!array_key_exists('description', $data)) {
					$data['description'] = $query[0]->description;
				}
				$data['version'] = $query[0]->version+1;
			}

			$this->db->insert('tag_versions', $data);
		}
	}