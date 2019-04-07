<?php
    class MediaModel extends CI_Model {
        public function __construct() {
            parent:: __construct();

            // Define the paths
            $this->basePath = '/var/www/html/api/';
            $this->commentPath = $this->basePath.'public/img/comments/';
            $this->placeholderVideoPath = $this->basePath.'public/videos/placeholders/';
            $this->placeholderImgPath = $this->basePath.'public/img/placeholders/';
            $this->tweetPath = $this->basePath.'public/img/tweet_pics/';
            $this->youtubePath = $this->basePath.'public/videos/youtube/';

            // $this->ffmpeg = APPPATH.'ffmpeg/ffmpeg';
            $this->ffmpeg = 'sudo /usr/bin/ffmpeg';
            $this->s3Path = 'https://s3.amazonaws.com/blather22/';

            $this->load->library('aws');
        }

        /**
         * Add a file to s3
         * @param [string] $key         The path/name of the file that will be stored in s3
         * @param [string] $file        The path to the file on the local server
         */
        public function addToS3($key, $file, $remove = true) {
            if (!$this->existsInS3($key)) {
                $this->aws->upload($key, $file);
            }

            if ($remove) {
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
            if (!file_exists($path.$file)) {
                list($type, $data) = explode(';', $content);
                list(, $data) = explode(',', $data);
                file_put_contents($path.$file, base64_decode($data));

                if ($remove) {
                    unlink($path.$file);
                }
            }
        }

        public function createTextPic(
            $path,
            $file_name,
            $text,
            $img_width = 1920,
            $img_height = 1080,
            $color = [211, 7, 100],
            $font_size = 36
        ) {
            $file = $path.$file_name;
            if (!file_exists($file)) {
                if (!is_dir($path)) {
                    exec('sudo mkdir '.$path);
                    exec('sudo chmod 777 '.$path);
                }

                $angle = 0;
                $font = 'public/fonts/ViceCitySans.otf';
                $im = imagecreatetruecolor($img_width, $img_height);
                $white = imagecolorallocate($im, 255, 255, 255);
                $grey = imagecolorallocate($im, 128, 128, 128);
                $black = imagecolorallocate($im, 0, 0, 0);
                $pink = imagecolorallocate($im, $color[0], $color[1], $color[2]);
                imagefilledrectangle($im, 0, 0, $img_width, $img_height, $pink);

                $text_box = imagettfbbox($font_size, $angle, $font, $text);
                $text_width = $text_box[2]-$text_box[0];
                $text_height = $text_box[7]-$text_box[1];
                $x = ($img_width/2) - ($text_width/2);
                $y = ($img_height/2) - ($text_height/2);

                imagettftext($im, $font_size, 0, $x, $y, $white, $font, $text);
                imagepng($im, $file);
            }

            return $file;
        }

        public function createTextVideo($text) {
            $text_dash = str_replace(' ', '-', $text);
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
            $this->aws->createJob($input, $output);
        }

        public function createVideoFromImg($input, $output) {
            $command = $this->ffmpeg.' -loop 1 -framerate 25 -t 5 -i '.$input.' \
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
                $command = 'sudo youtube-dl -o "'.$file.'" ';
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