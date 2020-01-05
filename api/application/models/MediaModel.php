<?php
class MediaModel extends CI_Model {
	public function __construct() {
		parent:: __construct();

		// Define the paths
		$this->basePath = '/Applications/MAMP/htdocs/blather/api/';
		$this->commentPath = $this->basePath.'public/img/comments/';
		$this->placeholderVideoPath = $this->basePath.'public/videos/placeholders/';
		$this->placeholderImgPath = $this->basePath.'public/img/placeholders/';
		$this->tweetPath = $this->basePath.'public/img/tweet_pics/';
		$this->youtubePath = $this->basePath.'public/videos/youtube/';

		// $this->ffmpeg = APPPATH.'ffmpeg/ffmpeg';
		$this->ffmpeg = '/usr/local/bin/ffmpeg';
		$this->s3Path = 'https://s3.amazonaws.com/blather22/';

		$this->load->library('aws');
	}

	/**
	 * Add a file to s3
	 * @param [string] $key         The path/name of the file that will be stored in s3
	 * @param [string] $file        The path to the file on the local server
	 */
	public function addToS3($key, $file, $remove = true, $update = false) {
		$exists = $this->existsInS3($key);
		if (!$exists) {
			$this->aws->upload($key, $file);
		}

		if ($exists && $update) {
			$this->aws->del($key);
			$this->aws->upload($key, $file);
		}

		if ($remove && file_exists($file)) {
			unlink($file);
		}

		return $this->s3Path.$key;
	}

	public function createPicFromData(
		$file,
		$path,
		$content,
		$remove = false
	) {
		list($type, $data) = explode(';', $content);
		list(, $data) = explode(',', $data);
		file_put_contents($path.$file, base64_decode($data));

		if ($remove) {
			unlink($path.$file);
		}
	}

	public function createTextPic(
		$path,
		$file_name,
		$text,
		$img_width = 1920,
		$img_height = 1080,
		$color = [25, 25, 112],
		$text_color = [255, 255, 255],
		$font_size = 48,
		$background_transparent = false,
		$center_text = true,
		$font = 'public/fonts/LaPresse.ttf'
	) {
		$file = $path.$file_name;
		if (!file_exists($file)) {
			if (!is_dir($path)) {
				exec('mkdir '.$path);
			}

			$angle = 0;
			$im = imagecreatetruecolor($img_width, $img_height);
			if ($background_transparent) {
				imagesavealpha($im, true);
			}

			$text_color = imagecolorallocate($im, $text_color[0], $text_color[1], $text_color[2]);
			if ($background_transparent) {
				$fill_color = imagecolorallocatealpha($im, $color[0], $color[1], $color[2], 127);
			} else {
				$fill_color = imagecolorallocate($im, $color[0], $color[1], $color[2]);
			}

			imagefill($im, 0, 0, $fill_color);
			$text_box = imagettfbbox($font_size, $angle, $font, $text);
			$text_width = $text_box[2]-$text_box[0];
			$text_height = $text_box[7]-$text_box[1];

			if ($center_text) {
				$x = ($img_width/2) - ($text_width/2);
				$y = ($img_height/2) - ($text_height/2);
			} else {
				$x = $img_width-$text_width;
				$y = $img_height;
			}

			imagettftext($im, $font_size, 0, $x, $y, $text_color, $font, $text);
			imagepng($im, $file);
		}

		return $file;
	}

	public function createTextVideo($text) {
		$text_dash = str_replace(' ', '-', $text);
		$text_dash = str_replace("'", '', $text_dash);
		$text_pic = $this->media->createTextPic(
			$this->placeholderImgPath,
			$text_dash.'.png',
			$text
		);
		$key = 'labels/'.$text_dash.'.mp4';
		$text_video = $this->placeholderVideoPath.$text_dash.'.mp4';
		$this->createVideoFromImg($text_pic, $text_video);
		$this->addToS3($key, $text_video);
		return [
			'key' => $key,
			'src' => $text_video
		];
	}

	public function createVideo($input, $output) {
		$video = $this->aws->createJob($input, $output);
		return $video;
	}

	public function createVideoFromImg($input, $output) {
		$command = $this->ffmpeg.' -loop 1 -framerate 20 -t 4 -i '.$input.' \
				-f lavfi -t 1 -i anullsrc '.$output;
		exec($command);
	}

	/**
	 * Download a youtube video and store it locally
	 * @param  [string]  $video_id
	 * @param  [boolean] $audio_only
	 * @return [string] The path to the youtube video that has been downloaded
	 */
	public function downloadYouTubeVideo($video_id, $audio_only = false) {
		$file_type = $audio_only ? 'mp3' : 'mp4';
		$file = $this->youtubePath.$video_id.'.'.$file_type;
		if (!file_exists($file)) {
			$command = '/usr/local/bin/youtube-dl -o "'.$file.'" ';
			if ($audio_only) {
				$command .= '--extract-audio --audio-format '.$file_type.' ';
			}

			if (!$audio_only) {
				$command .= ' -f best ';
			}

			$command .= ' https://www.youtube.com/watch\?v\='.$video_id;
			exec($command, $output);
		}

		return $file;
	}

	/**
	 * Check to see if a file exists in s3
	 * @param  [string] $file  The path to the file
	 * @return [boolean]       Whether or not the file exists
	 */
	public function existsInS3($file) {
		return $this->aws->exist($file);
	}

	public function renameS3Object($src, $target, $delete = false) {
		$this->aws->copyFile($src, $target);

		if ($delete) {
			$this->aws->del($src);
		}
	}

	public function saveScreenshot($id, $path, $img, $folder) {
		$img_file = $id.'.png';
		$mp4_file = $id.'.mp4';
		$key = $folder.'/'.$mp4_file;
		$this->createPicFromData($img_file, $path, $img);
		$this->createVideoFromImg($path.$img_file, $path.$mp4_file);
		$this->addToS3($key, $path.$mp4_file);
		return $key;
	}
}