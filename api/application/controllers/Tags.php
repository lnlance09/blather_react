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

			echo json_encode([
				'error' => false,
				'tag' => $tag
			]);
		}

		public function changePic() {
			$id = $this->input->get('id');

			if (!$this->user) {
				$this->output->set_status_header(401);
				echo json_encode([
					'error' => 'You must be logged in to edit tags'
				]);
				exit;
			}

			$this->load->library('upload', [
				'allowed_types' => 'jpg|jpeg|png',
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

			/*
			if ($data['image_width'] !== $data['image_height']) {
				$config['height'] = 250;
				$config['maintain_ratio'] = false;
				$config['new_image'] = $path;
				$config['source_image'] = $path;
				$config['width'] = 250;

				$this->load->library('image_lib', $config);
				$this->image_lib->resize();
				$this->image_lib->clear();
			}
			*/

			$s3Path = 'tags/'.$id.'_'.$file;
			$s3Link = $this->media->addToS3($s3Path, $path);

			$this->tags->updateTag($id, [
				'date_updated' => date('Y-m-d H:i:s'),
				'img' => $s3Path,
				'tag_id' => $id,
				'updated_by' => $this->user->id
			]);
			echo json_encode([
				'error' => false,
				'img' => $s3Link
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

		public function getTags() {
			$tags = $this->tags->getTags();
			echo json_encode([
				'error' => false,
				'tags' => $tags
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