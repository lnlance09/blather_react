<?php
    class MediaModel extends CI_Model {
        public function __construct() {
            parent:: __construct();

            // Define the paths
            $this->basePath = '/var/www/html/api/';
            $this->archivePath = $this->basePath.'public/img/archive_pics/';
            $this->commentPath = $this->basePath.'public/img/comments/';
            $this->fallacyPath = $this->basePath.'public/videos/fallacies/';
            $this->tweetPath = $this->basePath.'public/img/tweet_pics/';
            $this->watermarkPath = $this->basePath.'public/img/watermark.png';
            $this->youtubePath = $this->basePath.'public/videos/youtube/';

            // $this->ffmpeg = APPPATH.'ffmpeg/ffmpeg';
            $this->ffmpeg = 'sudo /usr/bin/ffmpeg';
            $this->s3Path = 'https://s3.amazonaws.com/blather22/';

            // Load s3 library
            $this->load->library('s3');
        }

        /**
         * Add a file to s3
         * @param [string] $key         The path/name of the file that will be stored in s3
         * @param [string] $file        The path to the file on the local server
         */
        public function addToS3($key, $file, $remove = true) {
            if (!$this->existsInS3($key)) {
                $this->s3->upload($key, $file);
            }

            if ($remove) {
                unlink($file);
            }

            return $this->s3Path.$key;
        }

        /**
         * [clipVideo description]
         * @param  [type] $fallacy_id [description]
         * @param  [type] $video_id   [description]
         * @param  [type] $start      [description]
         * @param  [type] $end        [description]
         * @return [type]             [description]
         */
        public function clipVideo(
            $fallacy_id,
            $video_id,
            $start,
            $end
        ) {
            $length = $end-$start;
            $path = $this->fallacyPath.$fallacy_id;
            $file = $video_id.'_'.$start.'_'.$length.'.mp4';
            $output = $path.'/'.$file;

            if (!file_exists($output)) {
                if (!is_dir($path)) {
                    exec('sudo mkdir '.$path);
                    exec('sudo chmod 777 '.$path);
                }

                $command = $this->ffmpeg.' -i '.$this->youtubePath.$video_id.'.mp4 -ss '.gmdate('H:i:s', $start).' -t '.gmdate('H:i:s', $length).' -async 1 '.$output;
                exec($command);

                $key = 'fallacy_videos/'.$fallacy_id.'/'.$file;
                $this->addToS3($key, $output, false);
            }
            return $output;
        }

        /**
         * [concatImgAndVideo description]
         * @param  [type] $id         [description]
         * @param  string $img        [description]
         * @param  array  $video      [description]
         * @param  array  $video_info [description]
         * @return [type]             [description]
         */
        public function concatImgAndVideo(
            $id,
            string $img,
            array $video,
            array $video_info
        ) {
            $path = $this->fallacyPath.$id.'/';
            $file = 'video_'.date('Y-m-d_H_i_s').'.mp4';

            $width = $video_info['width'];
            $height = $video_info['height'];
            $sar = $video_info['sar'];

            $command = $this->ffmpeg.' \
                -loop 1 -framerate 25 -t 5 -i '.$img.' \
                -f lavfi -t 1 -i anullsrc \
                '.$this->createInputCommand($video).' \
                -i '.$this->watermarkPath.' \
                -filter_complex " \
                    [0:v]scale='.$width.':'.$height.',setsar='.$sar.'[pic]; \
                    [2:v][pic]scale2ref[video][pic]; \
                    [video]setsar='.$sar.'[video]; \
                    [pic][1:a][video][2:a]concat=n=2:v=1:a=1[final_video]; \
                    [final_video][3:v]overlay=x=(main_w-overlay_w):y=(main_h-overlay_h)
                " \ '.$file;
            exec($command, $output);
            exec("sudo mv ' ".$file."' ".$path.$file);
            return $id.'/'.$file;
        }

        /**
         * [concatVideo description]
         * @param  [type] $id         [description]
         * @param  array  $source_one [description]
         * @param  array  $source_two [description]
         * @param  array  $video_info [description]
         * @return [type]             [description]
         */
        public function concatVideo(
            $id,
            array $source_one,
            array $source_two
        ) {
            $path = $this->fallacyPath.$id.'/';
            $file = 'video_'.date('Y-m-d_H_i_s').'.mp4';

            $source_one_is_img = $source_one['type'] == 'tweet' || $source_one['type'] == 'comment';
            $source_two_is_img = $source_two['type'] == 'tweet' || $source_two['type'] == 'comment';

            $source_one_cmd = $this->createInputCommand($source_one);
            $source_two_cmd = $this->createInputCommand($source_two);
            $time_pic_cmd = ' -loop 1 -framerate 24 -t 5 -i '.$path.'time.png \
                            -f lavfi -t 1 -i anullsrc ';

            $command = $this->ffmpeg.' \
                '.$source_one_cmd.' \
                '.$time_pic_cmd.' \
                '.$source_two_cmd.' \
                -i '.$this->watermarkPath.' \
                -filter_complex " ';

            if ($source_one_is_img && !$source_two_is_img) {
                $src_two_video_info = $source_two['video_info'];
                $src_two_width = $src_two_video_info['width'];
                $src_two_height = $src_two_video_info['height'];
                $src_two_sar = $src_two_video_info['sar'];

                $command .= '[0:v]scale='.$src_two_width.':'.$src_two_height.',setsar='.$src_two_sar.'[pic_one]; \
                            [2:v][pic_one]scale2ref[pic_two][pic_one]; \
                            [pic_two]scale='.$src_two_width.':'.$src_two_height.',setsar='.$src_two_sar.'[pic_two]; \
                            [pic_two][4:v]scale2ref[pic_two][video]; \
                            [video]setsar='.$src_two_sar.'[video]; \
                            [pic_one][1:a][pic_two][3:a][video][4:a]concat=n=3:v=1:a=1[final_video]; \
                            [final_video][5:v]overlay=x=(main_w-overlay_w):y=(main_h-overlay_h)';
            }

            if (!$source_one_is_img && $source_two_is_img) {
                $src_one_video_info = $source_one['video_info'];
                $src_one_width = $src_one_video_info['width'];
                $src_one_height = $src_one_video_info['height'];
                $src_one_sar = $src_one_video_info['sar'];

                $command .= '[1:v][0:v]scale2ref[duration][video]; \
                            [video]setsar='.$src_one_sar.'[video]; \
                            [duration]setsar='.$src_one_sar.'[duration]; \
                            [3:v]scale='.$src_one_width.':'.$src_one_height.',setsar='.$src_one_sar.'[pic_one]; \
                            [duration][pic_one]scale2ref[duration][pic_one]; \
                            [video][0:a][duration][2:a][pic_one][4:a]concat=n=3:v=1:a=1[final_video]; \
                            [final_video][5:v]overlay=x=(main_w-overlay_w):y=(main_h-overlay_h)';
            }

            if (!$source_one_is_img && !$source_two_is_img) {
                $src_one_video_info = $source_one['video_info'];
                $src_one_sar = $src_one_video_info['sar'];
                $src_two_video_info = $source_two['video_info'];
                $src_two_sar = $src_two_video_info['sar'];

                $command .= '[1:v][0:v]scale2ref[logo][video]; \
                            [logo]setsar='.$src_one_sar.'[logo]; \
                            [logo][3:v]scale2ref[logo][video_two]; \
                            [video_two]setsar='.$src_two_sar.'[video_two]; \
                            [video][0:a][logo][2:a][video_two][3:a]concat=n=3:v=1:a=1[final_video]; \
                            [final_video][4:v]overlay=x=(main_w-overlay_w):y=(main_h-overlay_h)';
            }

            $command .= '" \ '.$file;
            exec($command, $output);
            exec("sudo mv ' ".$file."' ".$path.$file);
            return $id.'/'.$file;
        }

        /**
         * [createInputCommand description]
         * @param  [type] $source [description]
         * @return [type]         [description]
         */
        public function createInputCommand($source) {
            if ($source['type'] == 'tweet' || $source['type'] == 'comment') {
                $img_path = $source['type'] == 'tweet' ? $this->tweetPath : $this->commentPath;
                return ' -loop 1 -framerate 25 -t 5 -i '.$img_path.$source['id'].'.png \
                    -f lavfi -t 1 -i anullsrc ';
            }

            return ' -i '.$source['file'];
        }

        public function createPicFromData(
            $path,
            $content,
            $remove = false
        ) {
            if (!file_exists($path)) {
                list($type, $data) = explode(';', $content);
                list(, $data) = explode(',', $data);
                file_put_contents($path, base64_decode($data));

                if ($remove) {
                    unlink($path);
                }
            }
        }

        /**
         * Create an image with text
         * @param  [type] $id
         * @param  [int] $img_width
         * @param  [int] $img_height
         * @param  [string] $text      The text to be written in the image
         * @param  [array] $color      The RGB value
         * @param  [string] $file_name The path to the image
         * @return [string]            The path to the image
         */
        public function createTextPic(
            $id,
            $img_width,
            $img_height,
            $text,
            $color,
            $font_size = 36,
            $file_name = 'time.png'
        ) {
            $path = $this->fallacyPath.$id;
            $file = $path.'/'.$file_name;
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
            return $this->s3->exist($file);
        }

        /**
         * [getImgFromVideo description]
         * @param  [type] $id   [description]
         * @param  [type] $time [description]
         * @return [type]       [description]
         */
        public function getImgFromVideo($id, $time) {
            $img = $id.'_'.$time.'.jpg';
            $path = $this->archivePath;
            $command = $this->ffmpeg."-i ".$this->youtubePath.$id.".mp4 -ss ".gmdate('H:i:s', $time)." -vframes 1 ".$path.$img;
            exec($command, $output);
            return $img;
        }

        /**
         * Get the width, height, SAR and codec of a video
         * @param  [string] $video The path to the video
         * @return [array]         Info including dimensions and SAR of the video
         */
        function getVideoAttributes($video) {
            $command = 'sudo ffprobe -i '.$video.' 2>&1';
            exec($command, $output);

            foreach ($output as $o) {
                $regex_sizes = "/Video: ([^\r\n]*), ([^,]*), ([0-9]{1,4})x([0-9]{1,4})/"; 
                if (preg_match($regex_sizes, $o, $regs)) {
                    $codec = $regs[1] ? $regs[1] : null;
                    $width = $regs[3] ? $regs[3] : null;
                    $height = $regs[4] ? $regs[4] : null;
                }

                $regex_sar = "/SAR ([^,]*)/";
                $sar_str = '1:1';
                if (preg_match($regex_sar, $o, $regs)) {
                    $sar_str = $regs[1] ? $regs[1] : null;
                }
            }

            $sar_arr = explode(' ', $sar_str);
            $sar = $sar_arr[0];
            return [
                'codec' => $codec,
                'height' => $height,
                'sar' => str_replace(':', '/', $sar),
                'width' => $width
            ];
        }
    }