<?php 
    class MediaModel extends CI_Model {
        public function __construct() {
            parent:: __construct();

            $this->baseUrl = $this->config->base_url();
            $this->imgPath = APPPATH.'assets/img/';
            $this->s3Path = 'https://s3.amazonaws.com/blather22/';
            $this->archivePath = 'public/img/archive_pics/';
            $this->fallacyPath = 'public/videos/fallacies/';
            $this->youtubePath = 'public/videos/youtube/';

            $this->load->library('s3');
        }

        public function addToS3($key, $source_file) {
            $this->s3->upload($key, $source_file);
            // exec('rm '.$source_file);
        }

        public function clipVideo($fallacy_id, $video_id, $file, $start, $length) {
            $new_file = $video_id.'_'.$start.'_'.$length.'.mp4';
            $path = $this->fallacyPath.$fallacy_id;
            if (!is_dir($path)) {
                exec('mkdir '.$path);
            }

            $command = './ffmpeg -i '.$file.' -ss '.gmdate('H:i:s', $start).' -t '.gmdate('H:i:s', $length).' -async 1 '.$path.'/'.$new_file;
            exec($command, $output);
            return $new_file;
        }

        public function concatVideo($id, $video_one, $video_two) {
            $path = $this->fallacyPath.$id.'/';
            /* This one works! */
            // For one video
            $command = './ffmpeg \
                        -loop 1 -framerate 24 -t 5 -i img.png \
                        -f lavfi -t 1 -i anullsrc \
                        -i video.mp4 \
                        -filter_complex " \
                            [0:v][2:v]scale2ref[logo][video]; \
                            [logo]setsar=sar=1[logo]; \
                            [logo][1:a][video][2:a]concat=n=2:v=1:a=1
                        " \
                        output.mp4';
            // For two videos
            $command = './ffmpeg \
                        -i '.$path.$video_one.' \
                        -loop 1 -framerate 24 -t 5 -i '.$path.'time.png \
                        -f lavfi -t 1 -i anullsrc \
                        -i '.$path.$video_two.' \
                        -filter_complex " \
                            [1:v][0:v]scale2ref[logo][video]; \
                            [logo]setsar=sar=1[logo]; \
                            [logo][3:v]scale2ref[logo][video_two]; \
                            [video_two]setsar=sar=1[video_two]; \
                            [video][0:a][logo][2:a][video_two][3:a]concat=n=3:v=1:a=1
                        " \
                        '.$path.'video.mp4';
            exec($command, $output);
        }

        public function createTimePic($id, $image_width, $image_height, $text) {
            $font_size = 20;
            $angle = 0;
            $font = 'public/fonts/arial.ttf';
            $im = imagecreatetruecolor($image_width, $image_height);
            $white = imagecolorallocate($im, 255, 255, 255);
            $grey = imagecolorallocate($im, 128, 128, 128);
            $black = imagecolorallocate($im, 0, 0, 0);
            imagefilledrectangle($im, 0, 0, $image_width, $image_height, $black);

            $text_box = imagettfbbox($font_size, $angle, $font, $text);
            $text_width = $text_box[2]-$text_box[0];
            $text_height = $text_box[7]-$text_box[1];
            $x = ($image_width/2) - ($text_width/2);
            $y = ($image_height/2) - ($text_height/2);

            imagettftext($im, $font_size, 0, $x, $y+1, $grey, $font, $text);
            imagettftext($im, $font_size, 0, $x, $y, $white, $font, $text);

            $path = $this->fallacyPath.$id;
            if (!is_dir($path)) {
                exec('mkdir '.$path);
            }

            $file = $path.'/time.png';
            imagepng($im, $file);
            // imagedestroy($im);
            return $file;
        }

        public function downloadYouTubeVideo($video_id, $audio_only = false) {
            $file_type = $audio_only ? 'mp3' : 'mp4';
            $file = $this->youtubePath.$video_id.'.'.$file_type;
            if (!file_exists($file)) {
                $command = 'youtube-dl -o "'.$file.'" ';
                if ($audio_only) {
                    $command .= '--extract-audio --audio-format '.$file_type.' ';
                }

                if (!$audio_only) {
                    $command .= ' -f best ';
                }

                $command .= ' https://www.youtube.com/watch\?v\='.$video_id;
                exec($command, $output);
                // FormatArray($output);
            }

            return $file;
        }

        public function existsInS3($file) {
            return $this->s3->exist($file);
        }

        public function getImgFromVideo($id, $time) {
            $img = $id.'_'.$time.'.jpg';
            $command = "ffmpeg -i ".$this->youtubePath.$id.".mp4 -ss ".gmdate('H:i:s', $time)." -vframes 1 ".$this->archivePath.$img;
            exec($command, $output);
            return $img;
        }
    }