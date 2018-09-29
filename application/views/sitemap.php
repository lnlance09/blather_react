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
		<loc><?php echo 'http://blather.io/users/'.$users[$i]['username']; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>


<?php
	// Twitter pages
	for($i=0;$i<count($twitterPages);$i++) {
		$username = $twitterPages[$i]['username'];
		$url = 'http://blather.io/pages/twitter/'.$username;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>


<?php
	// Youtube pages
	for($i=0;$i<count($youtubePages);$i++) {
		$id = $youtubePages[$i]['social_media_id'];
		$url = 'http://blather.io/pages/youtube/'.$id;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>


<?php
	// Fallacies
	for($i=0;$i<count($fallacies);$i++) {
		$id = $fallacies[$i]['id'];
		$url = 'http://blather.io/fallacies/'.$id;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>


<?php
	// Discussions
	for($i=0;$i<count($fallacies);$i++) {
		$id = $fallacies[$i]['id'];
		$url = 'http://blather.io/discussions/'.$id;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>

<?php
	// Tags
	for($i=0;$i<count($tags);$i++) {
		$id = $tags[$i]['id'];
		$url = 'http://blather.io/tags/'.$id;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>


<?php
	// Tweets
	for($i=0;$i<count($tweets);$i++) {
?>
	<url>
		<loc><?php echo 'http://blather.io/tweet/'.$tweets[$i]['tweet_id']; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>
<?php
	}
?>


<?php
	// Videos
	for($i=0;$i<count($videos);$i++) {
?>
	<url>
		<loc><?php echo 'http://blather.io/video/'.$videos[$i]['video_id']; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>
<?php
	}
?>


<?php
	// Fallacy types
	for($i=0;$i<count($fallacyTypes);$i++) {
		$replace = str_replace(' ', '_', $fallacyTypes[$i]['name']);
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
		<loc>http://blather.io/about</loc>
		<changefreq>never</changefreq>
		<priority>0.4</priority>
	</url>
	<url>
		<loc>http://blather.io/contact</loc>
		<changefreq>never</changefreq>
		<priority>0.4</priority>
	</url>
	<url>
		<loc>http://blather.io/privacy</loc>
		<changefreq>never</changefreq>
		<priority>0.4</priority>
	</url>
</urlset>