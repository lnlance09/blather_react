<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once APPPATH.'vendor/autoload.php';
use Elasticsearch\ClientBuilder;

class ElasticSearch {
	public function indexDoc($index, $id, $body) {
		$client = ClientBuilder::create()->build();
		$params = [
			'index' => $index,
			'id' => $id,
			'body' => $body
		];

		$response = $client->index($params);
		return $response;
	}

	public function getDoc($index, $id) {
		$client = ClientBuilder::create()->build();
		$params = [
			'index' => $index,
			'id' => $id
		];

		$response = $client->get($params);
		return $response;
	}

	public function searchDocs($index, $body) {
		$client = ClientBuilder::create()->build();
		$params = [
			'index' => $index,
			'body' => $body
		];

		$response = $client->search($params);
		return $response;
	}
}