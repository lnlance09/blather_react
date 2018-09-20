<?php
    defined('BASEPATH') OR exit('No direct script access allowed');

    class Tags extends CI_Controller {
        public function __construct() {       
            parent:: __construct();
            
            $this->baseUrl = $this->config->base_url();
            $this->load->model('TagsModel', 'tags');
        }

        public function index() {
            
        }

        public function getTags() {
            $tags = $this->tags->getTags();
            echo json_encode([
                'error' => false,
                'tags' => $tags
            ]);
        }
    }