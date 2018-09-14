<?php
	header('Content-type: application/xml');
	echo '<?xml version="1.0" encoding="UTF-8" ?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>http://blather.io/</loc> 
        <changefreq>hourly</changefreq>
        <priority>1.0</priority>
    </url>

<?php
	// Users pages
	for($i=0;$i<count($users);$i++) {
?>
	<url>
        <loc><?php echo 'http://blather.io/users/'.$users[$i]['id']; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
<?php
	}

	// Pages pages
	for($i=0;$i<count($pages);$i++) {
		$id = $pages[$i]['social_media_id'];
		$type = $pages[$i]['type'];
		$username = $pages[$i]['username'];

		if($type === 'twitter') {
			$url = 'http://blather.io/pages/'.$username.'/twitter';
		} else {
			if(empty($username)) {
				$url = 'http://blather.io/pages/'.$id.'/'.$type;
			} else {
				$url = 'http://blather.io/pages/'.$username.'/'.$type;
			}
		}
?>
	<url>
        <loc><?php echo $url; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
<?php
	}

	// The fallacies pages
	for($i=0;$i<count($fallacies);$i++) {
		$item = $fallacies[$i];
		$id = $item['id'];
		$network = $item['post_network'];

		switch($network) {
			case'fb':

				$type = (array_key_exists('comment_id', $item) ? 'comment' : 'status');
				break;

			case'twitter':

				$type = 'tweet';
				break;

			case'youtube':

				$type = (array_key_exists('comment_id', $item) ? 'comment' : 'video');
				break;
		}

		$url = 'http://blather.io/fallacies/'.$network.'/'.$type.'/'.$id;
?>
	<url>
        <loc><?php echo $url; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
<?php
	}

	// Loop thru the FB posts
	for($i=0;$i<count($fbPosts);$i++) {
?>
	<url>
        <loc><?php echo 'http://blather.io/fb/status/'.$fbPosts[$i]['page_id'].'_'.$fbPosts[$i]['media_id']; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
    </url>
<?php
	}

	// Loop thru the tweets
	for($i=0;$i<count($twitterPosts);$i++) {
?>
	<url>
        <loc><?php echo 'http://blather.io/twitter/tweet/'.$twitterPosts[$i]['tweet_id']; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
    </url>
<?php
	}

	// Loop thru the YouTube videos
	for($i=0;$i<count($youtubePosts);$i++) {
?>
	<url>
        <loc><?php echo 'http://blather.io/youtube/videos/'.$youtubePosts[$i]['video_id']; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
    </url>
<?php
	}

	// Loop thur all of the example fallacies
	for($i=0;$i<count($fallacyList);$i++) {
		$replace = str_replace(' ', '_', $fallacyList[$i]['name']);
		$name = strtolower(str_replace("'", '', $replace));
?>
	<url>
        <loc><?php echo 'http://blather.io/fallacies/'.$name; ?></loc>
        <changefreq>daily</changefreq>
        <priority>0.6</priority>
    </url>
<?php
	}
?>
	<url>
		<loc>http://blather.io/fallacies</loc>
		<changefreq>never</changefreq>
		<priority>0.5</priority>
	</url>

    <url>
		<loc>http://blather.io/about</loc>
		<changefreq>never</changefreq>
		<priority>0.4</priority>
	</url>

	<url>
		<loc>http://blather.io/contact</loc>
		<changefreq>never</changefreq>
		<priority>0.4</priority>
	</url>
</urlset>