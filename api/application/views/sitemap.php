<?php
	$base_url = 'https://blather.io/';
	header('Content-type: application/xml');
	echo '<?xml version="1.0" encoding="UTF-8" ?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc><?php echo $base_url; ?></loc> 
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>

	<url>
		<loc><?php echo $base_url; ?>signin</loc> 
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>

	<url>
		<loc><?php echo $base_url; ?>signin?type=signin</loc> 
		<changefreq>daily</changefreq>
		<priority>1.0</priority>
	</url>

	<url>
		<loc><?php echo $base_url; ?>activity</loc> 
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>

	<url>
		<loc><?php echo $base_url.'fallacies'; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>

	<url>
		<loc><?php echo $base_url.'grifters'; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.9</priority>
	</url>

	<url>
		<loc><?php echo $base_url.'tags'; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>


<?php
	// Fallacy types
	for ($i=0;$i<count($fallacyTypes);$i++) {
		$replace = str_replace(' ', '-', $fallacyTypes[$i]['name']);
		$name = strtolower(str_replace("'", '', $replace));
?>
	<url>
		<loc><?php echo $base_url.'fallacies/'.$name; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>
<?php
	}
?>


<?php
	// Fallacies
	for ($i=0;$i<count($fallacies);$i++) {
		$slug = $fallacies[$i]['slug'];
		$url = $base_url.'fallacies/'.$slug;
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
	for ($i=0;$i<count($tags);$i++) {
?>
	<url>
		<loc><?php echo $base_url.'tags/'.$tags[$i]['slug']; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.8</priority>
	</url>
<?php
	}
?>


<?php
	// Twitter pages
	for ($i=0;$i<count($twitterPages);$i++) {
		$username = $twitterPages[$i]['username'];
		$url = $base_url.'pages/twitter/'.$username;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>
<?php
	}
?>


<?php
	// Youtube pages
	for ($i=0;$i<count($youtubePages);$i++) {
		$id = $youtubePages[$i]['social_media_id'];
		$url = $base_url.'pages/youtube/'.$id;
?>
	<url>
		<loc><?php echo $url; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>
<?php
	}
?>


<?php
	// Targets
	for ($i=0;$i<count($reviews);$i++) {
?>
	<url>
		<loc><?php echo $base_url.'targets/'.$reviews[$i]['user_id'].'/'.$reviews[$i]['page_id']; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.7</priority>
	</url>
<?php
	}
?>


<?php
	// Users pages
	for ($i=0;$i<count($users);$i++) {
?>
	<url>
		<loc><?php echo $base_url.'users/'.$users[$i]['username']; ?></loc>
		<changefreq>daily</changefreq>
		<priority>0.6</priority>
	</url>
<?php
	}
?>

	<url>
		<loc><?php echo $base_url; ?>bot</loc>
		<changefreq>daily</changefreq>
		<priority>0.4</priority>
	</url>
	<url>
		<loc><?php echo $base_url; ?>about</loc>
		<changefreq>daily</changefreq>
		<priority>0.3</priority>
	</url>
	<url>
		<loc><?php echo $base_url; ?>contact</loc>
		<changefreq>never</changefreq>
		<priority>0.3</priority>
	</url>
	<url>
		<loc><?php echo $base_url; ?>privacy</loc>
		<changefreq>never</changefreq>
		<priority>0.3</priority>
	</url>
	<url>
		<loc><?php echo $base_url; ?>rules</loc>
		<changefreq>never</changefreq>
		<priority>0.3</priority>
	</url>
</urlset>