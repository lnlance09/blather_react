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

class S3 {
	public $s3hd = false;
	protected $CI;

	public function __construct(){
		$this->CI =& get_instance();
		$this->CI->config->load('s3config');
		if (!$this->s3hd) $this->s3hd = S3Client::factory([
			'version' => 'latest',
			'region'  => 'us-east-1',
			'credentials' => [
				'key' => $this->CI->config->item('s3key'),
				'secret' => $this->CI->config->item('s3secret')
			]
		]);
	}

	public function copyFile($src, $target, $bucket = false) {
		if (!$bucket) $bucket = $this->CI->config->item('s3bucket');
		$info = $this->s3hd->copyObject([
			'Bucket' => $bucket,
			'CopySource' => $bucket.'/'.$src,
			'Key' => $target,
		]);
		return $info;
	}

	public function del($name, $bucket = false) {
		if (!$bucket) $bucket = $this->CI->config->item('s3bucket');
		$info = $this->s3hd->deleteObject([
			'Bucket' => $bucket,
			'Key' => $name,
		]);
		return $info;
	}

	public function exist($name, $bucket = false) {
		if (!$bucket) $bucket = $this->CI->config->item('s3bucket');
		return $this->s3hd->doesObjectExist($bucket, $name);
	}

	public function read($name, $bucket = false) {
		if (!$bucket) $bucket = $this->CI->config->item('s3bucket');
		if (!$this->exist($name, $bucket)) exit("File not exist: ".$name);
		$info = $this->s3hd->getObject([
			'Bucket' => $bucket,
			'Key' => $name,
		]);
		return $info['Body'];
	}

	public function upload($name, $file, $bucket = false) {
		if (!$bucket) $bucket = $this->CI->config->item('s3bucket');
		try {
			$result = $this->s3hd->putObject([
				'Bucket' => $bucket,
				'Key' => $name,
				'SourceFile' => $file,
				'StorageClass' => 'REDUCED_REDUNDANCY',
			]);
		} catch (S3Exception $e) {
			echo $e->getMessage();
		}

		$this->s3hd->waitUntil('ObjectExists', [
			'Bucket' => $bucket,
			'Key' => $name,
		]);
		return $result;
	}

	public function url($name, $expire = '+1 day') {
		return $this->s3hd->getObjectUrl($this->CI->config->item('s3bucket'), $name, $expire);
	}

	public function write($name, $info, $bucket = false) {
		if (!$bucket) $bucket = $this->CI->config->item('s3bucket');
		$result = $this->s3hd->upload($bucket, $name, $info);

		$this->s3hd->waitUntil('ObjectExists', [
			'Bucket' => $bucket,
			'Key' => $name,
		]);
		return $result;
	}
}