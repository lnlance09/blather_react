<?php
    defined('BASEPATH') OR exit('No direct script access allowed');

    class Tags extends CI_Controller {
        public function __construct() {       
            parent:: __construct();
            
            $this->baseUrl = $this->config->base_url();
            $this->load->model('TagsModel', 'tags');
        }

        public function index() {
            $id = $this->input->get('id');
            $tag = $this->tags->getTagInfo($id);
            if(!$tag) {
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
            $this->tags->updateTag($id, $description);
            echo json_encode([
                'error' => false,
                'tag' => [
                    'description' => $description
                ]
            ]);
        }
    }