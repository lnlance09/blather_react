<?php
class FallaciesModel extends CI_Model {
	public function __construct() {
		parent:: __construct();

		$this->commentPath = BASE_PATH.'public/img/comments/';
		$this->tweetPath = BASE_PATH.'public/img/tweet_pics/';
		$this->placeholderVideoPath = BASE_PATH.'public/videos/placeholders/';
		$this->placeholderImgPath = BASE_PATH.'public/img/placeholders/';

		$this->load->database();
		$this->db->query("SET time_zone='+0:00'");

		$this->load->library('aws');
	}

	public function assignedAlready($assigned_by, $comment_id, $media_id, $page_id) {
		$this->db->select('id');
		$this->db->where([
			'assigned_by' => $assigned_by,
			'comment_id' => $comment_id,
			'media_id' => $media_id,
			'page_id' => $page_id
		]);
		$result = $this->db->get('fallacy_entries')->result_array();
		return count($result) === 0 ? false : $result[0]['id'];
	}

	public function assignContradiction($id, $contradiction) {
		$decode = @json_decode($contradiction, true);
		$commentId = array_key_exists('commentId', $decode) ? $decode['commentId'] : null;
		$highlightedText = array_key_exists('highlightedText', $decode) ? $decode['highlightedText'] : null;
		$startTime = array_key_exists('startTime', $decode) ? $decode['startTime'] : null;
		$endTime = array_key_exists('endTime', $decode) ? $decode['endTime'] : null;
		$startTime = timeToSecs($startTime);
		$endTime = timeToSecs($endTime);
		$mediaId = $decode['mediaId'];
		$network = $decode['network'];
		$pageId = $decode['pageId'];

		$exists = $this->contradictionExists($id);

		if ($exists) {
			$this->db->where('id', $id);
			$this->db->update('contradictions', [
				'comment_id' => $commentId,
				'end_time' => is_numeric($endTime) ? $endTime : null,
				'highlighted_text' => $highlightedText,
				'media_id' => $mediaId,
				'network' => $network,
				'page_id' => $pageId,
				'start_time' => is_numeric($startTime) ? $startTime : null
			]);
		} else {
			$this->db->insert('contradictions', [
				'comment_id' => $commentId,
				'end_time' => is_numeric($endTime) ? $endTime : null,
				'fallacy_entry_id' => $id,
				'highlighted_text' => $highlightedText,
				'media_id' => $mediaId,
				'network' => $network,
				'page_id' => $pageId,
				'start_time' => is_numeric($startTime) ? $startTime : null
			]);
		}
	}

	public function assignFallacy(
		$assigned_by,
		$comment_id,
		$endTime,
		$explanation,
		$fallacy_id,
		$highlightedText,
		$media_id,
		$network,
		$page_id,
		$startTime,
		$title,
		$contradiction = null
	) {
		$this->db->insert('fallacy_entries', [
			'assigned_by' => $assigned_by,
			'comment_id' => $comment_id,
			'date_created' => date('Y-m-d H:i:s'),
			'end_time' => is_numeric($endTime) ? $endTime : null,
			'explanation' => strip_tags($explanation),
			'fallacy_id' => $fallacy_id,
			'highlighted_text' => $highlightedText,
			'media_id' => $media_id,
			'network' => $network,
			'page_id' => $page_id,
			'start_time' => is_numeric($startTime) ? $startTime : null,
			'title' => $title
		]);

		$id = $this->db->insert_id();
		$name = $this->fallacyTypeExists($fallacy_id);
		$slug = slugify($title.' '.$name.' logical fallacy');

		$this->update($id, [
			'slug' => $slug.'-'.$id
		]);

		if ($contradiction) {
			$this->assignContradiction($id, $contradiction);
		}

		return $id;
	}

	public function canRetract($fallacy_id, $page_id) {
		$this->db->select('page_id');
		$this->db->where('id', $fallacy_id);
		$result = $this->db->get('fallacy_entries')->result_array();
		if (count($result) === 0) {
			return false;
		}

		if ($result[0]['page_id'] == $page_id) {
			return true;
		}

		return false;
	}

	public function contradictionExists($id) {
		$this->db->select('id');
		$this->db->where('fallacy_entry_id', $id);
		$result = $this->db->get('contradictions')->result_array();
		return count($result) === 0 ? false : $result[0]['id'];
	}

	public function createComment($data) {
		$this->db->insert('fallacy_comments', $data);
	}

	public function createCommentResponse($data) {
		$this->db->insert('fallacy_comment_responses', $data);
	}

	public function createReview($data) {
		$this->db->insert('criticisms', $data);
	}

	public function createVideo(
		int $id,
		int $ref_id,
		array $original,
		array $contradiction = null,
		string $img = null,
		string $text = null
	) {
		$output_file = 'fallacy_videos/'.$id.'/'.date('Y-m-d_H_i_s').'.mp4';

		$watermark_key = 'labels/'.$id.'.png';
		$watermark_pic = $this->media->createTextPic(
			'labels/',
			$id.'.png',
			'blather.io/fallacies/'.$id,
			600,
			50,
			[255, 255, 255],
			[255, 255, 255],
			18,
			true,
			false,
			'public/fonts/Courier-BoldRegular.ttf'
		);
		$this->media->addToS3($watermark_key, $watermark_pic);

		switch ($ref_id) {
			// Tweet with video as contradiction
			case 3:

				$path = $this->tweetPath;
				$screenshot = $this->media->saveScreenshot($original['id'], $path, $img, 'tweet_pics');

				$video = $this->media->downloadYouTubeVideo($contradiction['id']);
				$this->media->addToS3('youtube_videos/'.$contradiction['id'].'.mp4', $video);

				$input = [
					[
						'name' => 'youtube_videos/'.$contradiction['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $contradiction['startTime']),
						'duration' => gmdate('H:i:s', $contradiction['endTime']-$contradiction['startTime'])
					]
				];
				$output = [
					'name' => $output_file,
					'start_time' => null,
					'duration' => null,
					'watermark' => $screenshot,
					'thumbnail' => false
				];
				$this->media->createVideo($input, $output);
				break;

			// Just a video
			case 4:

			// A video but a twitter user assigned
			case 5:

				$video = $this->media->downloadYouTubeVideo($original['id']);
				$this->media->addToS3('youtube_videos/'.$original['id'].'.mp4', $video);

				$text_obj = $this->media->createTextVideo($text);

				$input = [
					[
						'name' => $text_obj['key'],
						'start_time' => null,
						'duration' => null
					],
					[
						'name' => 'youtube_videos/'.$original['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $original['startTime']),
						'duration' => gmdate('H:i:s', $original['endTime']-$original['startTime'])
					]
				];
				$output = [
					'name' => $output_file,
					'start_time' => null,
					'duration' => null,
					'thumbnail' => false
				];
				$this->media->createVideo($input, $output);
				break;

			// A video with a video as a contradiction
			case 6:

				$video_one = $this->media->downloadYouTubeVideo($original['id']);
				$this->media->addToS3('youtube_videos/'.$original['id'].'.mp4', $video_one);

				$video_two = $this->media->downloadYouTubeVideo($contradiction['id']);
				$this->media->addToS3('youtube_videos/'.$contradiction['id'].'.mp4', $video_two);

				$text_obj = $this->media->createTextVideo($text);

				$input = [
					[
						'name' => 'youtube_videos/'.$original['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $original['startTime']),
						'duration' => gmdate('H:i:s', $original['endTime']-$original['startTime'])
					],
					[
						'name' => $text_obj['key'],
						'start_time' => null,
						'duration' => null
					],
					[
						'name' => 'youtube_videos/'.$contradiction['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $contradiction['startTime']),
						'duration' => gmdate('H:i:s', $contradiction['endTime']-$contradiction['startTime'])
					]
				];
				$output = [
					'name' => $output_file,
					'start_time' => null,
					'duration' => null,
					'thumbnail' => false
				];
				$this->media->createVideo($input, $output);
				break;

			// A video with a comment as a contradiction
			case 7:

				$video = $this->media->downloadYouTubeVideo($original['id']);
				$screenshot = $this->media->addToS3('youtube_videos/'.$original['id'].'.mp4', $video);

				$path = $this->commentPath;
				$screenshot = $this->media->saveScreenshot($contradiction['id'], $path, $img, 'comments');

				$input = [
					[
						'name' => 'youtube_videos/'.$original['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $original['startTime']),
						'duration' => gmdate('H:i:s', $original['endTime']-$original['startTime'])
					]
				];
				$output = [
					'name' => $output_file,
					'start_time' => null,
					'duration' => null,
					'watermark' => $screenshot,
					'thumbnail' => false
				];
				$this->media->createVideo($input, $output);
				break;

			// A video with a tweet as a contradiction
			case 8:

				$video = $this->media->downloadYouTubeVideo($original['id']);
				$this->media->addToS3('youtube_videos/'.$original['id'].'.mp4', $video);

				$path = $this->tweetPath;
				$screenshot = $this->media->saveScreenshot($contradiction['id'], $path, $img, 'tweet_pics');

				$input = [
					[
						'name' => 'youtube_videos/'.$original['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $original['startTime']),
						'duration' => gmdate('H:i:s', $original['endTime']-$original['startTime'])
					]
				];
				$output = [
					'name' => $output_file,
					'start_time' => null,
					'duration' => null,
					'watermark' => $screenshot,
					'thumbnail' => false
				];
				$this->media->createVideo($input, $output);
				break;

			// A comment with a video as a contradiction
			case 11:

				$path = $this->commentPath;
				$screenshot = $this->media->saveScreenshot($original['id'], $path, $img, 'comments');

				$video = $this->media->downloadYouTubeVideo($contradiction['id']);
				$this->media->addToS3('youtube_videos/'.$contradiction['id'].'.mp4', $video);

				$input = [
					[
						'name' => 'youtube_videos/'.$contradiction['id'].'.mp4',
						'start_time' => gmdate('H:i:s', $contradiction['startTime']),
						'duration' => gmdate('H:i:s', $contradiction['endTime']-$contradiction['startTime'])
					]
				];
				$output = [
					'name' => $output_file,
					'start_time' => null,
					'duration' => null,
					'watermark' => $screenshot,
					'thumbnail' => false
				];
				$this->media->createVideo($input, $output);
				break;
		}

		return [
			'key' => $output_file,
			'src' => S3_PATH.$output_file
		];
	}

	public function fallacyTypeExists($id) {
		$this->db->select('name');
		$this->db->where('id', $id);
		$result = $this->db->get('fallacies')->result_array();
		if (count($result) === 0) {
			return false;
		}
		return $result[0]['name'];
	}

	public function getComment($id, $just_count = false) {
		$select = "created_at, message, user_id";
		if ($just_count) {
			$select = 'COUNT(*) AS count';
		}

		$this->db->select($select);
		$this->db->where('id', $id);
		$query = $this->db->get('fallacy_comments');

		if ($just_count) {
			$result = $query->result_array();
			return $result[0]['count'];
		}

		return $query->result_array();
	}

	public function getCommentLikedBy($id, $response_id, $user_id) {
		$where = ['comment_id' => $id, 'user_id' => $user_id];

		if ($response_id) {
			$where['response_id'] = $response_id;
		} else {
			$where['response_id'] = null;
		}

		$this->db->select('COUNT(*) AS count');
		$this->db->where($where);
		$query = $this->db->get('fallacy_comments_likes');
		$result = $query->result_array();
		return (int)$result[0]['count'];
	}

	public function getComments($id, $user_id = null, $page = null, $just_count = false) {
		$select = "f.id, f.created_at, f.message, f.user_id, CONCAT('".S3_PATH."', u.img) AS img, u.name, u.username, likeCount,
		".($user_id !== null ? "likedByMe, " : "")." 
		CONCAT('[',
			GROUP_CONCAT(
				DISTINCT JSON_OBJECT(
					'id', fr.id,
					'created_at', fr.created_at,
					'img', CONCAT('".S3_PATH."', fru.img),
					'likeCount', responseLikeCount,
					".($user_id !== null ? "'likedByMe', responseLikedByMe, " : "")." 
					'message', fr.message,
					'name', fru.name,
					'user_id', fr.user_id,
					'username', fru.username
				)
			),
		']')
		AS responses";

		if ($user_id) {
			$select .= ', likedByMe';
		}

		if ($just_count) {
			$select = 'COUNT(*) AS count';
		}

		$this->db->select($select);

		if (!$just_count) {
			$this->db->join('users u', 'f.user_id=u.id');
			$this->db->join('fallacy_comment_responses fr', 'f.id=fr.response_to', 'left');
			$this->db->join('users fru', 'fr.user_id=fru.id', 'left');

			$this->db->join('(SELECT COUNT(*) as likeCount, comment_id FROM fallacy_comments_likes WHERE response_id IS NULL GROUP BY comment_id) l', 'f.id=l.comment_id', 'left');
			$this->db->join('(SELECT COUNT(*) as responseLikeCount, response_id FROM fallacy_comments_likes GROUP BY response_id) lr', 'fr.id=lr.response_id', 'left');

			if ($user_id) {
				$this->db->join('(SELECT COUNT(*) as likedByMe, comment_id, user_id FROM fallacy_comments_likes WHERE response_id IS NULL GROUP BY comment_id) lbm', 'f.id=lbm.comment_id AND lbm.user_id = "'.$user_id.'"', 'left');
				$this->db->join('(SELECT COUNT(*) as responseLikedByMe, response_id, user_id FROM fallacy_comments_likes GROUP BY response_id) rlbm', 'fr.id=rlbm.response_id AND rlbm.user_id = "'.$user_id.'"', 'left');
			}
		}

		$this->db->where('fallacy_id', $id);

		if (!$just_count) {
			$this->db->group_by('f.id');
			$this->db->order_by('f.created_at', 'DESC');
			if ($page !== null) {
				$limit = 2;
				$start = $page*$limit;
				// $this->db->limit($limit, $start);
			}
		}

		$query = $this->db->get('fallacy_comments f');
		$results = $query->result_array();

		if ($just_count) {
			return $results[0]['count'];
		}

		for ($i=0;$i<count($results);$i++) {
			$responses = $results[$i]['responses'];
			$results[$i]['responses'] = @json_decode($responses, true);
	
			if ($results[$i]['responses'][0]['id'] === null) {
				$results[$i]['responses'] = [];
			} else {
				
				usort($results[$i]['responses'], function($a, $b) {
					return $a['created_at'] <=> $b['created_at'];
				});
			}
		}

		return $results;
	}

	public function getConversation($id) {
		$this->db->select("fc.date_created, fc.message, fc.user_id, u.name, CONCAT('".S3_PATH."', u.img) AS img, u.username");
		$this->db->join('users u', 'fc.user_id = u.id');
		$this->db->where('fc.fallacy_id', $id);
		$this->db->order_by('date_created', 'ASC');
		return $this->db->get('fallacy_conversations fc')->result_array();
	}

	public function getFallacies() {
		$this->db->select('fe.*, f.name AS fallacy_name');
		$this->db->join('fallacies f', 'f.id = fe.fallacy_id');
		$this->db->order_by('fe.id');
		return $this->db->get('fallacy_entries fe')->result_array();
	}

	public function getFallacy($id, $just_count = false) {
		$select = "f.name AS fallacy_name,

			fe.id AS id,
			fe.assigned_by,
			fe.date_created,
			fe.end_time,
			fe.explanation,
			fe.fallacy_id,
			fe.highlighted_text,
			fe.last_updated,
			fe.media_id,
			fe.network,
			fe.retracted,
			CONCAT('".S3_PATH."', fe.s3_link) AS s3_link,
			fe.s3_updated,
			fe.slug,
			fe.start_time,
			fe.status,
			fe.title,
			fe.view_count,

			p.name AS page_name,
			p.profile_pic AS page_profile_pic,
			p.social_media_id AS page_id,
			p.type AS page_type,
			p.username AS page_username,

			u.name AS user_name, 
			u.username AS user_username, 
			CONCAT('".S3_PATH."', u.img) AS user_img, 
			u.id AS user_id, 

			GROUP_CONCAT(DISTINCT t.id ORDER BY t.id ASC SEPARATOR '| ') tag_ids, 
			GROUP_CONCAT(DISTINCT t.value ORDER BY t.id ASC SEPARATOR '| ') AS tag_names,

			tp.tweet_json,

			yv.channel_id AS video_channel_id, 
			yv.date_created AS video_created_at, 
			yv.description AS video_description, 
			yv.dislike_count AS video_dislike_count, 
			yv.img AS video_img, 
			yv.like_count AS video_like_count, 
			yv.title AS video_title, 
			yv.video_id AS video_video_id, 
			yv.view_count AS video_view_count,

			yvp.name AS video_channel_name,
			yvp.profile_pic AS video_channel_img,

			yc.channel_id AS comment_channel_id, 
			yc.comment_id AS comment_id,
			yc.date_created AS comment_created_at, 
			yc.like_count AS comment_like_count, 
			yc.message AS comment_message,
			yc.video_id AS comment_video_id,


			c.comment_id AS contradiction_comment_id, 
			c.end_time AS contradiction_end_time, 
			c.highlighted_text AS contradiction_highlighted_text,
			c.media_id AS contradiction_media_id, 
			c.network AS contradiction_network, 
			c.page_id AS contradiction_page_id, 
			c.start_time AS contradiction_start_time,

			cp.name AS contradiction_page_name,
			cp.profile_pic AS contradiction_page_profile_pic,
			cp.type AS contradiction_page_type,
			cp.username AS contradiction_page_username,


			ctp.tweet_json AS contradiction_tweet_json,

			cyv.channel_id AS contradiction_video_channel_id, 
			cyv.date_created AS contradiction_video_created_at, 
			cyv.description AS contradiction_video_description, 
			cyv.dislike_count AS contradiction_video_dislike_count, 
			cyv.img AS contradiction_video_video_img, 
			cyv.like_count AS contradiction_video_like_count, 
			cyv.title AS contradiction_video_video_title, 
			cyv.video_id AS contradiction_video_video_id, 
			cyv.view_count AS contradiction_video_view_count,

			cyc.channel_id AS contradiction_comment_channel_id, 
			cyc.date_created AS contradiction_comment_created_at, 
			cyc.like_count AS contradiction_comment_like_count, 
			cyc.message AS contradiction_comment_message,
			cyc.video_id AS contradiction_comment_video_id";

		if ($just_count) {
			$select = "fe.id AS id, assigned_by, page_id AS assigned_to, explanation, fallacy_id, status, title";
		}

		$this->db->select($select);

		if (!$just_count) {
			$this->db->join('fallacies f', 'fe.fallacy_id = f.id');
			$this->db->join('pages p', 'fe.page_id = p.social_media_id');
			$this->db->join('users u', 'fe.assigned_by = u.id');

			$this->db->join('fallacy_tags ft', 'fe.id = ft.fallacy_id', 'left');
			$this->db->join('tags t', 'ft.tag_id = t.id', 'left');

			$this->db->join('twitter_posts tp', 'fe.media_id = tp.tweet_id', 'left');
			$this->db->join('youtube_videos yv', 'fe.media_id = yv.video_id', 'left');
			$this->db->join('pages yvp', 'yv.channel_id = yvp.social_media_id', 'left');
			$this->db->join('youtube_comments yc', 'fe.comment_id = yc.comment_id', 'left');

			$this->db->join('contradictions c', 'fe.id = c.fallacy_entry_id', 'left');
			$this->db->join('pages cp', 'c.page_id = cp.social_media_id', 'left');

			$this->db->join('twitter_posts ctp', 'c.media_id = ctp.tweet_id', 'left');
			$this->db->join('youtube_comments cyc', 'c.comment_id = cyc.comment_id', 'left');
			$this->db->join('youtube_videos cyv', 'c.media_id = cyv.video_id', 'left');
		}

		$this->db->where('fe.id', $id);
		$this->db->or_where('fe.slug', $id);
		$result = $this->db->get('fallacy_entries fe')->result_array();

		if (count($result) === 0) {
			return false;
		}

		$fallacy = $result[0];
		if ($fallacy['id'] === null) {
			return false;
		}

		if ($just_count) {
			return 1;
		}

		$ref_id = 0;
		if ($fallacy['tweet_json'] !== null) {
			// Tweet only
			$ref_id = 1;
			// Tweet with another tweet
			if ($fallacy['contradiction_tweet_json'] !== null) {
				$ref_id = 2;
			}
			// Tweet with a video
			if ($fallacy['contradiction_video_video_id'] !== null) {
				$ref_id = 3;
			}
		}
		if ($fallacy['video_video_id'] !== null) {
			// Video only
			$ref_id = 4;
			// Video with a twitter user assigned
			if ($fallacy['page_type'] == 'twitter') {
				$ref_id = 5;
			}
			// Video with a video as a contradiction
			if ($fallacy['contradiction_video_video_id'] !== null) {
				$ref_id = 6;
			}
			// Video with a comment as a contradiction
			if ($fallacy['contradiction_comment_id'] !== null) {
				$ref_id = 7;
			}
			// Video with a tweet as a contradiction
			if ($fallacy['contradiction_tweet_json'] !== null) {
				$ref_id = 8;
			}
		}
		if ($fallacy['comment_id'] !== null) {
			// Comment only
			$ref_id = 9;
			// Comment with another comment
			if ($fallacy['contradiction_comment_id'] !== null) {
				$ref_id = 10;
			}
			// Comment with a video
			if ($fallacy['contradiction_video_video_id'] !== null
				&& $fallacy['contradiction_comment_id'] === null) {
				$ref_id = 11;
			}
		}

		$twitter = $this->twitter;
		if (in_array($ref_id, [1, 2, 3])) {
			$tweet = @json_decode($fallacy['tweet_json'], true);
			$fallacy['tweet_json'] = $twitter->parseExtendedEntities($tweet);
			$user_id = $tweet['user']['id'];
			$user_name = $tweet['user']['name'];
			$user_img = $fallacy['page_profile_pic'];
			$profile_pic = $twitter->saveUserPic($user_id, $user_name, $user_img);
			$fallacy['page_profile_pic'] = $profile_pic;

			if (array_key_exists('retweeted_status', $tweet)) {
				$retweet = $tweet['retweeted_status'];
				$user_id = $retweet['user']['id'];
				$user_name = $retweet['user']['name'];
				$user_img = $retweet['user']['profile_image_url_https'];
				$profile_pic = $twitter->saveUserPic($user_id, $user_name, $user_img);
				$fallacy['page_profile_pic'] = $profile_pic;
			}
		}

		if (in_array($ref_id, [2, 8])) {
			$tweet = @json_decode($fallacy['contradiction_tweet_json'], true);
			$fallacy['contradiction_tweet_json'] = $twitter->parseExtendedEntities($tweet);
			$user_id = $tweet['user']['id'];
			$user_name = $tweet['user']['name'];
			$user_img = $fallacy['contradiction_page_profile_pic'];
			$profile_pic = $twitter->saveUserPic($user_id, $user_name, $user_img);
			$fallacy['contradiction_page_profile_pic'] = $profile_pic;

			if (array_key_exists('retweeted_status', $tweet)) {
				$retweet = $tweet['retweeted_status'];
				$user_id = $retweet['user']['id'];
				$user_name = $retweet['user']['name'];
				$user_img = $retweet['user']['profile_image_url_https'];
				$profile_pic = $twitter->saveUserPic($user_id, $user_name, $user_img);
				$fallacy['contradiction_page_profile_pic'] = $profile_pic;
			}

		}

		$youtube = $this->youtube;
		if (in_array($ref_id, [9, 10, 11])) {
			$pic = $fallacy['page_profile_pic'];
			$channel_name = $fallacy['page_name'];
			$channel_id = $fallacy['comment_channel_id'];
			$channel_pic = $youtube->saveChannelPic($channel_id, $channel_name, $pic);
			$fallacy['page_profile_pic'] = $channel_pic;
		}

		if (in_array($ref_id, [7, 10])) {
			$pic = $fallacy['contradiction_page_profile_pic'];
			$channel_name = $fallacy['contradiction_page_name'];
			$channel_id = $fallacy['contradiction_comment_channel_id'];
			$channel_pic = $youtube->saveChannelPic($channel_id, $channel_name, $pic);
			$fallacy['contradiction_page_profile_pic'] = $channel_pic;
		}

		$fallacy['ref_id'] = $ref_id;
		return $fallacy;
	}

	public function getFallacyCount($id) {
		$this->db->select('COUNT(*) AS count');
		$this->db->where('page_id', $id);
		$result = $this->db->get('fallacy_entries')->result_array();
		return (int)$result[0]['count'];
	}

	public function getFallacyRefs() {
		$this->db->select("f.id, f.name, COUNT(fe.id) AS count");
		$this->db->join('fallacies f', 'fe.fallacy_id = f.id');
		$this->db->group_by('f.id');
		$this->db->order_by('f.name', 'ASC');
		return $this->db->get('fallacy_entries fe')->result_array();
	}

	public function getFallacyTypes() {
		$this->db->select('*');
		return $this->db->get('fallacies')->result_array();
	}

	public function getReview($user_id, $page_id, $id = null, $by_id = false) {
		$this->db->select("p.name AS page_name, p.username, p.social_media_id, p.id AS page_id, CONCAT('".S3_PATH."', p.s3_pic) AS page_profile_pic, p.type, u.id AS user_id, u.name AS user_name, CONCAT('".S3_PATH."', u.img) AS user_pic, u.username AS user_username, c.id, c.summary, c.sincerity, c.sincerity_explanation, c.turing_test, c.turing_test_explanation");
		$this->db->join('pages p', 'c.page_id = p.id');
		$this->db->join('users u', 'c.user_id = u.id');

		if ($by_id) {
			$this->db->where('c.id', $id);
		} else {
			$where = [];

			if ($user_id) {
				$where['user_id'] = $user_id;
			}

			if ($page_id) {
				$where['page_id'] = $page_id;
			}

			if (!empty($where)) {
				$this->db->where($where);
			}
		}
		return $this->db->get('criticisms c')->result_array();
	}

	public function getReviewPlaceholder($page_id) {
		$this->db->select("u.id AS user_id, CONCAT('".S3_PATH."', u.img) AS user_img, u.name AS user_name, c.id, c.summary");
		$this->db->join('users u', 'c.user_id = u.id');
		$this->db->where('page_id', $page_id);
		$this->db->where('summary != ""');
		$this->db->where('summary IS NOT NULL');
		$results = $this->db->get('criticisms c')->result_array();

		if (count($results) > 0) {
			return $results[0];
		}

		return false;
	}

	public function getReviews() {
		$this->db->select("p.name AS page_name, p.id AS page_id, p.profile_pic AS page_profile_pic, u.id AS user_id, u.name AS user_name");
		$this->db->join('pages p', 'c.page_id = p.id');
		$this->db->join('users u', 'c.user_id = u.id');
		return $this->db->get('criticisms c')->result_array();
	}

	public function getReviewStats($page_id) {
		$sql = "SELECT COUNT(*) AS count, (COUNT(*)-SUM(sincerity)) AS sincerity_no, (COUNT(*)-SUM(turing_test)) AS turing_test_no
			FROM criticisms c
			INNER JOIN pages p ON c.page_id = p.id
			WHERE p.social_media_id = ?
			AND c.sincerity IS NOT NULL
			AND c.turing_test IS NOT NULL";
		return $this->db->query($sql, [$page_id])->row();
	}

	public function getTargetsData($id) {
		$this->db->select("p.*, COUNT(*) AS count");
		$this->db->join('pages p', 'fe.page_id = p.social_media_id');
		$this->db->where('fe.assigned_by', $id);
		$this->db->group_by('fe.page_id');
		$this->db->order_by('COUNT(*)', 'DESC');
		return $this->db->get('fallacy_entries fe')->result_array();
	}

	public function getUniqueFallacies($id, $assigned_by, $type = 'user', $network = 'twitter') {
		$this->db->select("f.id AS value, f.name AS key, CONCAT(f.name, ' (', COUNT(*), ')') AS text, COUNT(*) AS count");
		$this->db->join('fallacies f', 'fe.fallacy_id = f.id');
		
		if ($type === 'pages') {
			$this->db->where('fe.page_id', $network === 'twitter' ? (int)$id : $id);
		}

		if ($type === 'post') {
			$this->db->where('fe.media_id', $network === 'twitter' ? (int)$id : $id);
		}

		if ($type === 'users') {
			$this->db->where('fe.assigned_by', $id);
		}

		if ($type === 'targets') {
			$this->db->where([
				'fe.page_id' => $id,
				'fe.assigned_by' => $assigned_by
			]);
		}

		$this->db->group_by('f.id');
		$this->db->order_by('COUNT(*)', 'DESC');
		return $this->db->get('fallacy_entries fe')->result_array();
	}

	public function insertFallacyRefs() {
		$file = file_get_contents(getcwd().'/public/js/blather/src/fallacies.json');
		$json = @json_decode($file, true);
		for ($i=0;$i<count($json);$i++) {
			$this->db->insert('fallacies', [
				'description' => $json[$i]['description'],
				'name' => $json[$i]['name']
			]);
		}
	}

	public function lastConvoExchange($id) {
		$this->db->select('*');
		$this->db->where('fallacy_id', $id);
		$this->db->order_by('date_created', 'DESC');
		$this->db->limit(1);
		$results = $this->db->get('fallacy_conversations')->result_array();
		return count($results) === 1 ? $results[0] : false;
	}

	public function likeComment($comment_id, $response_id, $user_id) {
		$this->db->insert('fallacy_comments_likes', [
			'comment_id' => $comment_id,
			'response_id' => $response_id,
			'user_id' => $user_id
		]);
	}

	public function unlikeComment($comment_id, $response_id, $user_id) {
		$this->db->where([
			'comment_id' => $comment_id,
			'response_id' => $response_id,
			'user_id' => $user_id
		]);
		$this->db->delete('fallacy_comments_likes');
	}

	public function getMostFallacious() {
		$this->db->select('p.type, f.page_id, p.name, p.profile_pic, p.username, COUNT(*) AS count');
		$this->db->join('pages p', 'f.page_id = p.social_media_id');
		$this->db->group_by('p.id');
		$this->db->order_by('count', 'DESC');
		$this->db->limit(10);
		return $this->db->get('fallacy_entries f')->result_array();
	}

	public function getPageByDbId($id) {
		$this->db->select('name, profile_pic, social_media_id, type, username');
		$this->db->where('id', $id);
		return $this->db->get('pages')->row();
	}

	public function pageExists($id) {
		$this->db->select('COUNT(*) AS count');
		$this->db->where('id', $id);
		$this->db->or_where('social_media_id', $id);
		$query = $this->db->get('pages')->result();
		if ($query[0]->count == 0) {
			return false;
		}
		return true;
	}

	public function search($data, $just_count = false) {
		$select = "f.name AS fallacy_name,

			fe.id AS id,
			fe.assigned_by,
			fe.date_created,
			fe.explanation,
			fe.fallacy_id,
			fe.last_updated,
			fe.network,
			CONCAT('".S3_PATH."', fe.s3_link) AS s3_link,
			fe.slug,
			fe.start_time,
			fe.status,
			fe.title,
			fe.view_count,

			fc.commentCount,
			fc.responseCount,

			p.name AS page_name,
			CONCAT('".S3_PATH."', p.s3_pic) AS page_profile_pic,
			p.social_media_id AS page_id,
			p.type AS page_type,
			p.username AS page_username,

			u.name AS user_name,
			u.username AS user_username,
			CONCAT('".S3_PATH."', u.img) AS user_img,
			u.id AS user_id,

			a.code AS archive_code,
			a.object_id AS archive_object_id,
			a.date_created AS archive_date_created,

			GROUP_CONCAT(DISTINCT t.id ORDER BY t.id ASC SEPARATOR '| ') tag_ids,
			GROUP_CONCAT(DISTINCT t.value ORDER BY t.id ASC SEPARATOR '| ') AS tag_names,

			'fallacy' AS item_type ";

		if ($just_count) {
			$select = 'COUNT(DISTINCT(fe.id)) AS count';
		}

		$this->db->select($select);
		$this->db->join('fallacies f', 'fe.fallacy_id = f.id');
		$this->db->join('pages p', 'fe.page_id = p.social_media_id');
		$this->db->join('users u', 'fe.assigned_by = u.id');
		$this->db->join('archived_links a', 'a.object_id = fe.media_id AND a.user_id = fe.assigned_by', 'left');
		$this->db->join('fallacy_tags ft', 'fe.id = ft.fallacy_id', 'left');
		$this->db->join('tags t', 'ft.tag_id = t.id', 'left');

		if ($data['object_id'] && $data['network'] === 'twitter') {
			$this->db->join('twitter_posts tp', 'fe.media_id = tp.tweet_id');
		}

		if ($data['network'] === 'youtube') {
			if ($data['comment_id']) {
				$this->db->join('youtube_comments yc', 'fe.comment_id = yc.comment_id');
			} else {
				$this->db->join('youtube_videos yv', 'fe.media_id = yv.video_id');
			}
		}

		$this->db->join('(
			SELECT COUNT(*) AS commentCount, responseCount, fc.id, fallacy_id
			FROM fallacy_comments fc
			LEFT JOIN (
				SELECT COUNT(*) AS responseCount, id, response_to
				FROM fallacy_comment_responses
				GROUP BY id
			) fcr ON fc.id=fcr.response_to 
			GROUP BY fallacy_id
		) fc', 'fe.id=fc.fallacy_id', 'left');

		if ($data['q']) {
			$this->db->where("(title LIKE '%".$data['q']."%' OR explanation LIKE '%".$data['q']."%' OR p.name LIKE '%".$data['q']."%')");
		}

		if (!empty($data['fallacies'])) {
			$this->db->where_in('fe.fallacy_id', $data['fallacies']);
		}

		if ($data['assigned_by']) {
			$this->db->where('fe.assigned_by', $data['assigned_by']);
		}

		if ($data['assigned_to']) {
			$this->db->where('p.social_media_id', is_numeric($data['assigned_to']) ? (int)$data['assigned_to'] : $data['assigned_to']);
		}

		if ($data['object_id']) {
			$this->db->where([
				'fe.network' => $data['network'],
				'fe.media_id' => $data['network'] === 'twitter' ? (int)$data['object_id'] : $data['object_id']
			]);
		}

		if ($data['comment_id']) {
			$this->db->where([
				'fe.comment_id' => $data['comment_id']
			]);
		}

		if ($data['fallacy_id']) {
			$this->db->where([
				'fe.fallacy_id' => $data['fallacy_id']
			]);
		}

		if ($data['tag_id']) {
			$this->db->where([
				't.id' => $data['tag_id']
			]);
		}

		if (array_key_exists('exclude', $data)) {
			$this->db->where_not_in('fe.id', $data['exclude']);
		}

		if (array_key_exists('last_id', $data) && is_numeric($data['last_id'])) {
			$this->db->where('fe.id >', $data['last_id']);
		}

		if (!$just_count) {
			$limit = 10;
			$start = $data['page']*$limit;

			if (array_key_exists('shuffle', $data) && $data['shuffle']) {
				$this->db->order_by('RAND(351)');
			} else {
				if (array_key_exists('sort', $data)) {
					if ($data['sort'] == 'date') {
						$this->db->order_by('fe.date_created DESC');
					}

					if ($data['sort'] == 'views') {
						$this->db->order_by('fe.view_count DESC');
					}
				} else {
					$this->db->order_by('fe.id DESC');
				}
			}

			$this->db->limit($limit, $start);
			$this->db->group_by('fe.id');
		}

		if ($just_count) {
			$result = $this->db->get('fallacy_entries fe')->result();
			return (int)$result[0]->count;
		}

		$results = $this->db->get('fallacy_entries fe')->result_array();
		return $results;
	}

	public function submitConversation($id, $userId, $msg) {
		$this->db->insert('fallacy_conversations', [
			'date_created' => date('Y-m-d H:i:s'),
			'fallacy_id' => $id,
			'message' => $msg,
			'user_id' => $userId
		]);
	}

	public function update($id, $data, $userId = null, $tags = null) {
		$this->db->where('id', $id);
		$this->db->or_where('slug', $id);
		$this->db->update('fallacy_entries', $data);

		if ($tags) {
			$this->tags->insertTags($id, $tags, 'fallacy', $userId);
		}
	}

	public function updateContradiction($id, $data) {
		$this->db->where('fallacy_entry_id', $id);
		$this->db->update('contradictions', $data);
	}

	public function updateReview($id, $data) {
		$this->db->where('id', $id);
		$this->db->update('criticisms', $data);
	}

	public function updateStatus($id, $status) {
		$sql = "UPDATE fallacy_entries SET status = ? WHERE id = ?";
		$this->db->query($sql, [$status, $id]);
	}

	public function updateViewCount($id) {
		$sql = "UPDATE fallacy_entries SET view_count = view_count+1 WHERE id = ?";
		$this->db->query($sql, [$id]);
	}
}
