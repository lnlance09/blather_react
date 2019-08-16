<?php
	defined('BASEPATH') OR exit('No direct script access allowed');

	class Tags extends CI_Controller {
		public function __construct() {
			parent:: __construct();
			
			$this->baseUrl = $this->config->base_url();
			$this->imgUrl = $this->baseUrl.'api/public/img/';

			$this->load->model('MediaModel', 'media');
			$this->load->model('TagsModel', 'tags');
		}

		public function index() {
			$id = (int)$this->input->get('id');
			$tag = $this->tags->getTagInfo($id);

			if (!$tag) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'This tag does not exist'
				]);
				exit;
			}

			$images = $this->tags->getImages($id);
			$tag['images'] = $images;
			$tag['rawImages'] = !empty($images) ? array_column($images, 'src') : [];

			$related = $this->tags->getRelated();
			$tag['related'] = $related;

			echo json_encode([
				'error' => false,
				'tag' => $tag
			]);
		}

		public function addPic() {
			$id = $this->input->get('id');

			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in add pics'
				]);
				exit;
			}

			$this->load->library('upload', [
				'allowed_types' => 'jpg|jpeg|png|gif',
				'file_ext_tolower' => true,
				'max_height' => 0,
				'max_size' => 25000,
				'max_width' => 0,
				'upload_path' => './public/img/tag_pics/'
			]);

			if (!$this->upload->do_upload('file')) {
				$this->output->set_status_header(403);
				$data = $this->upload->display_errors();
				echo json_encode([
					'error' => $data
				]);
				exit;
			} 

			$data = $this->upload->data();
			$file = $data['file_name'];
			$path = $data['full_path'];
			$height = $data['image_height'];
			$width = $data['image_width'];

			$s3Path = 'tags/'.$id.'/'.$id.'_'.$file;
			$s3Link = $this->media->addToS3($s3Path, $path);

			$this->tags->addPic([
				'height' => $height,
				'width' => $width,
				's3_path' => $s3Path,
				'tag_id' => $id
			]);
			echo json_encode([
				'error' => false,
				'img' => [
					'thumbnailHeight' => $height,
					'thumbnailWidth' => $width,
					'thumbnailSrc' => $s3Link,
					'src' => $s3Link
				]
			]);
		}

		public function getHistory() {
			$id = $this->input->get('id');
			$history = $this->tags->getHistory($id);
			echo json_encode([
				'error' => false,
				'history' => $history
			]);
		}

		public function getRelatedTags() {
			$q = $this->input->get('q');
			$related = $this->tags->getRelated($q);

			echo json_encode([
				'error' => false,
				'related' => $related
			]);
		}

		public function getTags() {
			$tags = $this->tags->getTags();
			echo json_encode([
				'error' => false,
				'tags' => $tags
			]);
		}

		public function getTaggedUsers() {
			$id = $this->input->get('id');
			$pages = $this->tags->getTaggedUsers($id);
			echo json_encode([
				'error' => false,
				'users' => $pages
			]);
		}

		public function update() {
			$id = $this->input->post('id');
			$description = $this->input->post('description');

			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in to edit tags'
				]);
				exit;
			}

			$this->tags->updateTag($id, [
				'date_updated' => date('Y-m-d H:i:s'),
				'description' => $description,
				'tag_id' => $id,
				'updated_by' => $this->user->id
			]);
			echo json_encode([
				'error' => false,
				'tag' => [
					'description' => $description
				]
			]);
		}
	}