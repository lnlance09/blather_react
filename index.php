<?php
    $uri = $_SERVER['REQUEST_URI'];
    $paths = explode('/', $uri);
    array_splice($paths, 0, 1);
    $schema = [];

    $set = false;
    $title = "Fallacies";
    $description = "Blather is an educational tool that allows users to analyze and pinpoint the accuracy of claims made on social media.";
    $img = "https://blather.io/brain.png";

    switch($uri) {
        case"/about":
            $title = "About";
            $set = true;
            break;
        case"/about/contact":
            $title = "Contact";
            $set = true;
            break;
        case"/about/rules";
            $title = "Rules";
            $set = true;
            break;

        case"/discussion/create":
            $title = "Create a discussion";
            $description = "Start a discussion where everyone plays by the same set of rules and intellectually dishonest debate tactics are called out. Change your mind if the evidence is compelling.";
            $set = true;
            break;
        case"/discussions":
            $title = "Discussions";
            $set = true;
            break;

        case"/fallacies":
            $title = "Fallacies";
            $set = true;
            break;

        case"/search":
            $title = "Search";
            $set = true;
            break;

        case"/settings":
            $title = "Settings";
            $set = true;
            break;

        case"/signin":
            $title = "Sign In";
            $set = true;
            break;

        case"/tags/create":
            $title = "Create a Tag";
            $set = true;
            break;
    }

    if(!$set) {
        $mysqli = new mysqli("blather.cni5l9jtlymn.us-west-2.rds.amazonaws.com:3306", "lnlance09", "kVQ63hewQNi0bXg", "blather");
        if($mysqli->connect_errno) {
            printf("Connect failed: %s\n", $mysqli->connect_error);
            exit();
        }

        $id = $paths[1];
        switch($paths[0]) {
            case'discussions':
                $sql = "SELECT title, description 
                        FROM discussions 
                        WHERE id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['title'];
                        $description = $row['description'];
                    }
                    $result->close();
                }
                break;

            case'fallacies':
                if(is_numeric($id)) {
                    $sql = "SELECT f.name AS fallacy_name, p.name AS page_name, p.profile_pic, p.type AS page_type, p.social_media_id, fe.date_created, p.username, fe.title, fe.explanation, fe.media_id, u.name AS user_name, u.id AS user_id, u.img AS user_profile_pic
                            FROM fallacy_entries fe
                            INNER JOIN fallacies f ON fe.fallacy_id = f.id
                            INNER JOIN pages p ON fe.page_id = p.social_media_id
                            INNER JOIN users u ON fe.assigned_by = u.id
                            WHERE fe.id = '".$mysqli->real_escape_string((int)$id)."'";
                    if($result = $mysqli->query($sql)) {
                        while($row = $result->fetch_assoc()) {
                            $userId = $row['user_id'];
                            $mediaId = $row['media_id'];
                            $network = $row['network'];
                            $userName = $row['user_name'];
                            $pageName = $row['page_name'];
                            $pageType = $row['page_type'];
                            $pageId = $row['social_media_id'];
                            $username = $row['username'];
                            $fallacyTitle = $row['title'];
                            $createdAt = $row['date_created'];
                            $title = $row['fallacy_name'].' by '.$pageName;
                            $description = $row['explanation'];
                            $img = $row['profile_pic'];
                            $pic = $row['user_profile_pic'];
                        }
                        $result->close();

                        $pageUrl = $pageType === "twitter" ? "https://twitter.com/".$username : "https://www.youtube.com/channel/".$pageId;
                        $postUrl = $network === "twitter" ? "https://twitter.com/".$username."/status/".$mediaId : "https://www.youtube.com/watch?v=".$mediaId;
                        $schema = [
                            "@context" => "http://schema.org",
                            "@type" => "SocialMediaPosting",
                            "@id" => $postUrl,
                            "author" => [
                                "@type" => "Person",
                                "image" => $img,
                                "name" => $pageName,
                                "url" => $pageUrl
                            ],
                            "datePublished" => $createdAt,
                            "headline" => $description,
                            "image" => $img,
                            "review" => [
                                "@type" => "Review",
                                "author" => [
                                    "@type" => "Person",
                                    "image" => "https://blather.io/api/public/img/profile_pics/".$pic,
                                    "name" => $userName,
                                    "url" => "https://blather.io/users/".$userId
                                ],
                                "datePublished" => $createdAt,
                                "name" => $fallacyTitle,
                                "reviewBody" =>  $description
                            ]
                        ];
                    }
                } else {
                    $name = ucwords(str_replace('_', ' ', $id));
                    $sql = "SELECT description, name
                            FROM fallacies
                            WHERE name = '".$mysqli->real_escape_string($name)."'";
                    if($result = $mysqli->query($sql)) {
                        while($row = $result->fetch_assoc()) {
                            $title = $row['name'];
                            $description = $row['description'];
                        }
                        $result->close();
                    }
                }
                break;

            // TODO profilePage
            case'pages':
                $id = $paths[2];
                $sql = "SELECT about, name, profile_pic
                        FROM pages
                        WHERE id = '".$mysqli->real_escape_string($id)."'
                        OR username = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['name'];
                        $description = $row['about'];
                        $img = $row['profile_pic'];
                    }
                    $result->close();
                }
                break;

            case'search':
                $title = 'Search results';
                if(!empty($_GET['q'])) {
                    $title .= ' for '.trim($_GET['q']);
                }
                break;

            // TODO article
            case'tags':
                $sql = "SELECT t.value, tv.description, tv.img
                        FROM tags
                        INNER JOIN tag_versions tv ON t.id = tv.tag_id
                        WHERE id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['value'];
                        $description = $row['description'];
                        $img = 'https://blather.io/api/public/img/tag_pics/'.$row['img'];
                    }
                    $result->close();
                }
                break;

            // TODO 
            case'targets':
                $pageId = count($paths) >= 3 ? $paths[2] : null;
                $sql = "SELECT p.name AS page_name, u.name AS user_name, p.profile_pic
                        FROM criticisms c
                        INNER JOIN pages p ON c.page_id = p.id
                        INNER JOIN users u ON c.user_id = u.id
                        WHERE user_id = '".$mysqli->real_escape_string((int)$id)."'
                        AND page_id = '".$mysqli->real_escape_string((int)$pageId)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['user_name']."'s review of ".$row['page_name'];
                        $img = $row['profile_pic'];
                    }
                    $result->close();
                }
                break;

            case'tweet':
                $sql = "SELECT t.created_at, t.full_text, p.name, p.username, p.profile_pic
                        FROM twitter_posts t
                        INNER JOIN pages p ON t.page_id = p.social_media_id
                        WHERE tweet_id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $createdAt = $row['created_at'];
                        $username = $row['username'];
                        $title = 'Tweet by '.$row['name'];
                        $description = $row['full_text'];
                        $img = $row['profile_pic'];
                    }
                    $result->close();

                    $schema = [
                        "@context" => "http://schema.org",
                        "@type" => "SocialMediaPosting",
                        "@id" => "https://blather.io/tweet/".$id,
                        "datePublished" => $createdAt,
                        "author" => [
                            "@type" => "Person",
                            "image" => $img,
                            "name" => $name,
                            "url" => "https://blather.io/pages/twitter/".$username
                        ],
                        "headline" => $description,
                        "image" => $img,
                        "sharedContent" => [
                            "@type" => "WebPage",
                            "headline" => $title,
                            "url" => "https://twitter.com/".$username."/status/".$id,
                            "author" => [
                                "@type" => "Person",
                                "image" => $img,
                                "name" => $name,
                                "url" => "https://twitter.com/".$username
                            ]
                        ]
                    ];
                }
                break;

            // TODO profilePage
            case'users':
                $sql = "SELECT bio, img, name
                        FROM users
                        WHERE id = '".$mysqli->real_escape_string($id)."' 
                        OR username = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['name'];
                        $description = $row['bio'];
                        $img = 'https://blather.io/api/public/img/profile_pics/'.$row['img'];
                    }
                    $result->close();
                }
                break;

            case'video':
                $sql = "SELECT y.title, y.description, y.img, y.video_id, y.date_created, p.name, p.social_media_id, p.profile_pic
                        FROM youtube_videos y
                        INNER JOIN pages p ON y.channel_id = p.social_media_id
                        WHERE video_id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $pageId = $row['social_media_id'];
                        $createdAt = $row['date_created'];
                        $videoId = $row['video_id'];
                        $name = $row['name'];
                        $title = $row['title'];
                        $description = $row['description'];
                        $img = $row['img'];
                        $profile_pic = $row['profile_pic'];
                    }
                    $result->close();

                    $schema = [
                        "@context" => "http://schema.org",
                        "@type" => "SocialMediaPosting",
                        "@id" => "https://blather.io/video/".$videoId,
                        "datePublished" => $createdAt,
                        "author" => [
                            "@type" => "Person",
                            "image" => $profile_pic,
                            "name" => $name,
                            "url" => "https://blather.io/pages/youtube/".$pageId
                        ],
                        "headline" => $title,
                        "image" => $img,
                        "sharedContent" => [
                            "@type" => "WebPage",
                            "headline" => $title,
                            "image" => $img,
                            "url" => "https://www.youtube.com/watch?v=".$videoId,
                            "author" => [
                                "@type" => "Person",
                                "image" => $profile_pic,
                                "name" => $name,
                                "url" => "https://www.youtube.com/channel/".$pageId
                            ]
                        ]
                    ];
                }
                break;
        }

        $mysqli->close();
    }

    list($width, $height) = getimagesize($img);
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="theme-color" content="#000000">

        <meta property="og:description" content="<?php echo htmlentities($description); ?>" />
        <meta property="og:image" content="<?php echo $img; ?>" />
        <meta property="og:image:height" content="<?php echo $height; ?>">
        <meta property="og:image:width" content="<?php echo $width; ?>">
        <meta property="og:site_name" content="Blather" />
        <meta property="og:title" content="<?php echo htmlentities($title); ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blather.io<?php echo $uri; ?>" />

        <meta name="description" content="<?php echo htmlentities($description); ?>" />

        <link rel="stylesheet" type="text/css" href="/static/css/main.629f3d22.css">
        <link rel="manifest" href="manifest.json">
        <link rel="shortcut icon" href="favicon.ico">
        <meta name="google-site-verification" content="bTDbvvxwQikYB9zsfufDiaqgVHMRi4DZ0311nJpngi8" />
        <title><?php echo $title; ?> - Blather</title>

        <!-- Facebook Pixel Code -->
        <script>
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '363202504450429');
            fbq('track', 'PageView');
        </script>
        <noscript><img height="1" width="1" style="display:none"
        src="https://www.facebook.com/tr?id=363202504450429&ev=PageView&noscript=1"
        /></noscript>
        <!-- End Facebook Pixel Code -->
    </head>
    <body>
        <noscript>
            You need to enable JavaScript to run this app.
        </noscript>
        <div id="root"></div>
    </body>
    <script src="/static/js/main.4cd1a86d.js"></script>
<?php
    if($schema) {
?>
    <script type="application/ld+json">
        <?php echo json_encode($schema); ?>
    </script>
<?php
    }
?>
    <script>
        var sc_project=11316702; 
        var sc_invisible=1; 
        var sc_security="b7d7f089"; 
    </script>
    <script src="https://www.statcounter.com/counter/counter.js" async></script>
</html>