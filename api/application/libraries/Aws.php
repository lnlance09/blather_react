<?php
defined('BASEPATH') OR exit('No direct script access allowed');
/**
 *  CodeIgniter Amazon S3 library in PHP by zairwolf
 * 
 *  Source: https://github.com/zairwolf/CodeIgniter-AmazonS3/blob/master/S3.php
 *
 *  Author: Hai Zheng @ https://www.linkedin.com/in/zairwolf/
 *
 */

require_once APPPATH.'vendor/autoload.php';
use Aws\S3\S3Client;
use Aws\ElasticTranscoder\ElasticTranscoderClient;

class Aws {
	public $s3hd = false;
	public $etc = false;
	protected $CI;
	protected $encryption;

	public function __construct() {
		$this->CI =& get_instance();
		$this->CI->config->load('s3config');

		if (!$this->etc) {
			$this->etc = ElasticTranscoderClient::factory([
				'credentials' => [
					'key' => $this->CI->config->item('s3key'),
					'secret' => $this->CI->config->item('s3secret')
				],
				'region'  => 'us-east-1',
				'version' => 'latest'
			]);
		}

		if (!$this->s3hd) {
			$this->s3hd = S3Client::factory([
				'version' => 'latest',
				'region'  => 'us-east-1',
				'credentials' => [
					'key' => $this->CI->config->item('s3key'),
					'secret' => $this->CI->config->item('s3secret')
				]
			]);
		}

		$this->encryption = [
			'Mode' => 'S3',
			'Key' => 'AKIAISRMDIVGRE72JKIA',
			'KeyMd5' => md5('AKIAISRMDIVGRE72JKIA'),
			'InitializationVector' => 'string'
		];
	}

	public function createJob($input, $output) {
		$data = [
			'PipelineId' => '1554521791877-sairfr',
			'Output' => [
				'Key' => $output['name'],
				'Rotate' => '0',
				'PresetId' => '1556047671318-ockbm9',
				// 'ThumbnailPattern' => 'string',
				// 'ThumbnailEncryption' => $encryption,
				// 'SegmentDuration' => '00:00:12',
				// 'Encryption' => $this->encryption
			],
			'UserMetadata' => [
				// 'String' => 'string'
			]
		];

		if ($output['thumbnail']) {
			$data['Output']['ThumbnailPattern'] = 'thumbnails/'.$output['thumbnail'].'/thumbnails-{count}';
		}

		if (array_key_exists('watermark', $output)) {
			$data['Output']['Watermarks'] = [
				[
					'PresetWatermarkId' => 'TopRight',
					'InputKey' => $output['watermark'],
					// 'Encryption' => $this->encryption
				]
			];
		}

		if ($output['start_time'] && $output['duration']) {
			$data['Output']['Composition'] = [
				[
					'TimeSpan' => [
						'StartTime' => $input[$i]['start_time'],
						'Duration' => $input[$i]['duration']
					]
				]
			];
		}

		$input_count = count($input);
		if ($input_count > 1) {
			$inputs = [];
			for ($i=0;$i<$input_count;$i++) {
				$array = [
					'Key' => $input[$i]['name'],
					'FrameRate' => 'auto',
					'Resolution' => 'auto',
					'AspectRatio' => '16:9',
					'Interlaced' => 'auto',
					'Container' => 'mp4',
					// 'Encryption' => $encryption,
					/*
					'DetectedProperties' => [
						'Width' => integer,
						'Height' => integer,
						'FrameRate' => 'string',
						'FileSize' => integer,
						'DurationMillis' => integer,
					]
					*/
				];

				if ($input[$i]['start_time'] && $input[$i]['duration']) {
					$array['TimeSpan'] = [
						'StartTime' => $input[$i]['start_time'],
						'Duration' => $input[$i]['duration']
					];
				}
				$inputs[] = $array;
			}

			$data['Inputs'] = $inputs;
		}

		if ($input_count === 1) {
			$data['Input'] = [
				'Key' => $input[0]['name'],
				'FrameRate' => 'auto',
				'Resolution' => 'auto',
				'AspectRatio' => 'auto',
				'Interlaced' => 'auto',
				'Container' => 'mp4',
				'TimeSpan' => [
					'StartTime' => $input[0]['start_time'],
					'Duration' => $input[0]['duration']
				]
			];
		}

		$job = $this->etc->createJob($data);
		return $job;
	}

	public function copyFile($src, $target, $bucket = false) {
		if (!$bucket) {
			$bucket = $this->CI->config->item('s3bucket');
		}
		$info = $this->s3hd->copyObject([
			'Bucket' => $bucket,
			'CopySource' => $bucket.'/'.$src,
			'Key' => $target
		]);
		return $info;
	}

	public function del($name, $bucket = false) {
		if (!$bucket) {
			$bucket = $this->CI->config->item('s3bucket');
		}
		$info = $this->s3hd->deleteObject([
			'Bucket' => $bucket,
			'Key' => $name
		]);
		return $info;
	}

	public function exist($name, $bucket = false) {
		if (!$bucket) {
			$bucket = $this->CI->config->item('s3bucket');
		}
		return $this->s3hd->doesObjectExist($bucket, $name);
	}

	public function read($name, $bucket = false) {
		if (!$bucket) {
			$bucket = $this->CI->config->item('s3bucket');
		}
		if (!$this->exist($name, $bucket)) {
			exit("File not exist: ".$name);
		}
		$info = $this->s3hd->getObject([
			'Bucket' => $bucket,
			'Key' => $name
		]);
		return $info['Body'];
	}

	public function upload($name, $file, $bucket = false) {
		if (!$bucket) {
			$bucket = $this->CI->config->item('s3bucket');
		}

		try {
			$result = $this->s3hd->putObject([
				'Bucket' => $bucket,
				'Key' => $name,
				'SourceFile' => $file,
				'StorageClass' => 'REDUCED_REDUNDANCY'
			]);
		} catch (S3Exception $e) {
			echo $e->getMessage();
		}

		$this->s3hd->waitUntil('ObjectExists', [
			'Bucket' => $bucket,
			'Key' => $name
		]);
		return $result;
	}

	public function url($name, $expire = '+1 day') {
		return $this->s3hd->getObjectUrl($this->CI->config->item('s3bucket'), $name, $expire);
	}

	public function write($name, $info, $bucket = false) {
		if (!$bucket) {
			$bucket = $this->CI->config->item('s3bucket');
		}
		$result = $this->s3hd->upload($bucket, $name, $info);

		$this->s3hd->waitUntil('ObjectExists', [
			'Bucket' => $bucket,
			'Key' => $name
		]);
		return $result;
	}
}