<?php
class MediaModel extends CI_Model {
	public function __construct() {
		parent:: __construct();

		$this->commentPath = BASE_PATH.'public/img/comments/';
		$this->placeholderVideoPath = BASE_PATH.'public/videos/placeholders/';
		$this->placeholderImgPath = BASE_PATH.'public/img/placeholders/';
		$this->tweetPath = BASE_PATH.'public/img/tweet_pics/';
		$this->youtubePath = BASE_PATH.'public/videos/youtube/';

		$this->load->library('aws');
	}

	public function addImageOverlay($video, $image, $output) {
		$command = FFMPEG.' 
				-i '.BASE_PATH.$image.' 
				-i '.BASE_PATH.$video.' 
				-filter_complex "[0]crop=352:480:144:0[bg];[bg][1]overlay=main_w-overlay_w-10:main_h-overlay_h-10[v]" 
				-map "[v]" 
				-map 0:a 
				-c:a copy '.BASE_PATH.$output;
		exec($command, $output);
		// echo $command;
		// print_r($output);
	}

	public function addMusicToClip($clip_file, $music_file, $output) {
		$command = '/usr/local/bin/ffmpeg -i /Applications/MAMP/htdocs/blather/api/public/videos/fallacies/489.mp4 -i /Applications/MAMP/htdocs/blather/api/public/videos/placeholders/horlepiep.mp3 -filter_complex "[0:a]volume=0.99[a0];[1:a]volume=0.08[a1];[a0][a1]amerge,pan=stereo|c0<c0+c2|c1<c1+c3[out]" -map 0:v -map "[out]" -c:v copy -c:a aac -shortest /Applications/MAMP/htdocs/blather/api/public/videos/fallacies/489_n.mp4';

		$command = FFMPEG.' 
				-i '.BASE_PATH.$clip_file.'
				-i '.BASE_PATH.$music_file;

		$command .= '-codec:v copy
					-codec:a aac
					-b:a 192k \
					-strict experimental
					-filter_complex "[0:a]volume=0.390625[a1];[1:a]volume=0.781250[a2];amerge,pan=stereo|c0<c0+c2|c1<c1+c3" \
					-shortest '.$output;
				/*
				'-filter_complex "[0:a][1:a]amerge,pan=stereo|c0<c0+c2|c1<c1+c3[out]"
				-map 1:v
				-map "[out]"
				-c:v copy
				-c:a libfdk_aac 
				-shortest '.$output;
				*/
		exec($command, $output);
	}

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

		return S3_PATH.$key;
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
		$img_width = 1280,
		$img_height = 720,
		$color = [25, 25, 112],
		$text_color = [255, 255, 255],
		$font_size = 48,
		$background_transparent = false,
		$center_text = true,
		$font = 'public/fonts/Spongebob.ttf'
	) {
		$file = $path.$file_name;
		if (!file_exists($file)) {
			if (!is_dir($path)) {
				exec('mkdir '.$path);
			}

			$angle = 0;

			if ($background_transparent) {
				$im = imagecreatetruecolor($img_width, $img_height);
				imagesavealpha($im, true);
			} else {
				$im = imagecreatefromjpeg('public/img/placeholders/spongebob.jpg');
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
			imagejpeg($im, $file);
		}

		return $file;
	}

	public function createTextVideo($text) {
		$text_dash = str_replace(' ', '-', $text);
		$text_dash = str_replace("'", '', $text_dash);
		$text_pic = $this->media->createTextPic(
			$this->placeholderImgPath,
			$text_dash.'.png',
			$text,
			1280,
			720,
			[25, 25, 112],
			[255, 255, 77],
			72
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
		$command = FFMPEG.' \
				-i '.$input.' \
				-i '.$this->placeholderVideoPath.'spongebob_fail.mp3 \
				-loop 1 -framerate 20 -t 3 \
				-c:v copy -map 0:v:0 -map 1:a:0 -c:a aac -b:a 192k '.$output;
		exec($command, $output);
	}

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
		$key = $folder.'/'.$img_file;
		$this->createPicFromData($img_file, $path, $img);
		$this->addToS3($key, $path.$img_file, false);
		return $key;
	}
}