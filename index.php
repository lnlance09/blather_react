<?php
    $uri = $_SERVER['REQUEST_URI'];
    $paths = explode('/', $uri);
    array_splice($paths, 0, 1);

    $base_url = "https://blather.io/";
    $title = "Home";
    $description = "Blather is a website that lets users assign fallacies and analyze the logic and reasoning of claims made on social media. It is meant to combat partisanship.";

    $s3Path = "https://s3.amazonaws.com/blather22/";
    $img = $base_url."images/icons/icon-100x100.png";
    $appleIcon = $base_url."images/icons/icon-128x128.png";

    $set = false;
    $author = false;

    $schema = [
        "@context" => "https://schema.org",
        "@type" => "WebSite",
        "url" => $base_url,
        "potentialAction" => [
            "@type" => "SearchAction",
            "target" => $base_url."api/search/advanced?q={search_term_string}&type=fallacies",
            "query-input" => "required name=search_term_string"
        ]
    ];

    switch ($uri) {
        case "/about":
            $title = "About";
            $set = true;
            break;

        case "/about/contact":
            $title = "Contact";
            $set = true;
            break;

        case "/about/rules";
            $title = "Rules";
            $set = true;
            break;

        case "/bot";
            $title = "Free Speech Warrior Bot";
            $description = "Free Speech Warriors in a nutshell. 90% of the arguments that you'll ever hear from them online.";
            $set = true;
            break;

        case "/discussion/create":
            $title = "Create a discussion";
            $description = "Start a discussion where everyone plays by the same set of rules and intellectually dishonest debate tactics are called out. Change your mind if the evidence is compelling.";
            $set = true;
            break;

        case "/discussions":
            $title = "Discussions";
            $set = true;
            break;

        case "/fallacies":
            $title = "Fallacies";
            $set = true;
            break;

        case "/search":
            $title = "Search";
            $set = true;
            break;

        case"/settings":
            $title = "Settings";
            $set = true;
            break;

        case "/signin":
            $title = "Sign In";
            $set = true;
            break;

        case "/tags/create":
            $title = "Create a Tag";
            $set = true;
            break;
    }

    if (!$set) {
        $mysqli = new mysqli("blather.cni5l9jtlymn.us-west-2.rds.amazonaws.com:3306", "lnlance09", "kVQ63hewQNi0bXg", "blather");
        if ($mysqli->connect_errno) {
            printf("Connect failed: %s\n", $mysqli->connect_error);
            exit();
        }

        $id = $paths[1];

        switch ($paths[0]) {
            case "discussions":

                $sql = "SELECT description, title
                        FROM discussions 
                        WHERE id = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $title = $row['title'];
                        $description = $row['description'];
                    }
                    $result->close();
                }
                break;

            case "fallacies":

                if (is_numeric($id)) {
                    $sql = "SELECT
                                c.media_id AS c_media_id,
                                c.network AS c_network,
                                cp.username AS c_username,

                                f.name AS fallacy_name,

                                fe.date_created,
                                fe.explanation,
                                fe.media_id,
                                fe.network,
                                fe.s3_link,
                                fe.title,

                                p.name AS page_name,
                                p.profile_pic, p.type AS page_type,
                                p.social_media_id,
                                p.username,

                                u.id AS user_id,
                                u.img AS user_profile_pic,
                                u.name AS user_name

                            FROM fallacy_entries fe
                            INNER JOIN fallacies f ON fe.fallacy_id = f.id
                            INNER JOIN pages p ON fe.page_id = p.social_media_id
                            INNER JOIN users u ON fe.assigned_by = u.id
                            LEFT JOIN contradictions c ON fe.id = c.fallacy_entry_id
                            LEFT JOIN pages cp ON c.page_id = cp.social_media_id
                            WHERE fe.id = '".$mysqli->real_escape_string((int)$id)."'";
                    $result = $mysqli->query($sql);

                    if ($result) {
                        while ($row = $result->fetch_assoc()) {
                            $cMediaId = $row['c_media_id'];
                            $cNetwork = $row['c_network'];
                            $cUsername = $row['c_username'];

                            $fallacyName = $row['fallacy_name'];

                            $createdAt = $row['date_created'];
                            $explanation = preg_replace("/\r|\n/", " ", $row['explanation']);
                            $mediaId = $row['media_id'];
                            $network = $row['network'];
                            $s3Link = $row['s3_link'];
                            $fallacyTitle = $row['title'];

                            $pageName = $row['page_name'];
                            $pageType = $row['page_type'];
                            $pageId = $row['social_media_id'];
                            $username = $row['username'];

                            $userId = $row['user_id'];
                            $userName = $row['user_name'];
                            $userPic = $row['user_profile_pic'];
                        }
                        $result->close();

                        $title = $fallacyName.' by '.$pageName;
                        $description = substr($explanation, 0, 160);
                        $img = $s3Path.$userPic;

                        $item_one = "https://www.youtube.com/watch?v=".$mediaId;
                        if ($network == "twitter") {
                            $item_one = "https://twitter.com/".$username."/status/".$mediaId;
                        }
                        $isBasedOn = $item_one;

                        if (!empty($cMediaId)) {
                            if ($cNetwork == "twitter") {
                                $isBasedOn = [
                                    $item_one,
                                    "https://twitter.com/".$cUsername."/status/".$cMediaId
                                ];
                            }

                            if ($cNetwork == "youtube") {
                                $isBasedOn = [
                                    $item_one,
                                    "https://www.youtube.com/watch?v=".$cMediaId
                                ];
                            }
                        }

                        $author = $userName;
                        $schema = [
                            "@context" => "http://schema.org",
                            "@type" => "SocialMediaPosting",
                            "@id" => $base_url."fallacies/".$id,
                            "author" => [
                                "@type" => "Person",
                                "image" => $img,
                                "name" => $userName,
                                "url" => "https://blather.io/users/".$userId
                            ],
                            "datePublished" => $createdAt,
                            "headline" => $fallacyTitle,
                            "image" => "",
                            "isBasedOn" => $isBasedOn,
                            "name" => $title,
                            "text" => $explanation,
                        ];

                        if ($s3Link) {
                            $schema["subjectOf"] = [
                                "@type" => "VideoObject",
                                "description" => $explanation,
                                "name" => $title,
                                "uploadDate" => $createdAt,
                                "thumbnailUrl" => $s3Path."thumbnail.jpg",
                                "url" => $s3Path.$s3Link
                            ];
                        }
                    }
                } else {
                    $name = ucwords(str_replace('_', ' ', $id));
                    $sql = "SELECT description, name
                            FROM fallacies
                            WHERE name = '".$mysqli->real_escape_string($name)."'";
                    if ($result = $mysqli->query($sql)) {
                        while ($row = $result->fetch_assoc()) {
                            $title = $row['name'];
                            $description = $row['description'];
                        }
                        $result->close();

                        $schema = [
                            "@context" => "https://schema.org",
                            "@type" => "BreadcrumbList",
                            "itemListElement" => [
                                [
                                    "@type" => "ListItem",
                                    "item" => $base_url,
                                    "name" => "Fallacies",
                                    "position" => 1
                                ],
                                [
                                    "@type" => "ListItem",
                                    "description" => $description,
                                    "item" => $base_url."fallacies/".$id,
                                    "name" => $name,
                                    "position" => 2
                                ]
                            ]
                        ];
                    }
                }
                break;

            case "pages":

                $id = $paths[2];
                $sql = "SELECT about, name, social_media_id, type, username
                        FROM pages
                        WHERE social_media_id = '".$mysqli->real_escape_string($id)."'
                        OR username = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $pageId = $row['social_media_id'];
                        $title = $row['name'];
                        $username = $row['username'];
                        $description = $title."'s logical fallacies catalogued on Blather. A measure of ".$title."'s level of partisanship, logical consistency, and intellectual honesty.";
                        $type = $row['type'];
                    }
                    $result->close();

                    $ext = $type === "twitter" ? "jpg" : "png";
                    $img = $s3Path."pages/".$type."/".$pageId.".".$ext;

                     $schema = [
                        "@context" => "https://schema.org",
                        "@type" => "BreadcrumbList",
                        "itemListElement" => [
                            [
                                "@type" => "ListItem",
                                "item" => $base_url,
                                "name" => "Pages",
                                "position" => 1
                            ],
                            [
                                "@type" => "ListItem",
                                "item" => $base_url."search/".($type === "twitter" ? "profiles" : "channels"),
                                "name" => $type,
                                "position" => 2
                            ],
                            [
                                "@type" => "ListItem",
                                "description" => $description,
                                "image" => $img,
                                "item" => $base_url."pages/".$type."/".($type === "twitter" ? $username : $pageId),
                                "name" => $title,
                                "position" => 3
                            ]
                        ]
                    ];
                }
                break;

            case "search":

                $title = 'Search results';
                if (!empty($_GET['q'])) {
                    $title .= ' for '.trim($_GET['q']);
                }
                break;

            case "tags":

                $sql = "SELECT
                            t.value,
                            tv.description,
                            tv.img
                        FROM tags
                        INNER JOIN tag_versions tv ON t.id = tv.tag_id
                        WHERE id = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $title = $row['value'];
                        $description = $row['description'];
                        $img = 'https://blather.io/api/public/img/tag_pics/'.$row['img'];
                    }
                    $result->close();
                }
                break;

            case "targets":

                $pageId = count($paths) >= 3 ? $paths[2] : null;
                $sql = "SELECT
                            c.summary,

                            p.name AS page_name,
                            p.profile_pic,

                            u.name AS user_name,
                            u.username
                        FROM criticisms c
                        INNER JOIN pages p ON c.page_id = p.id
                        INNER JOIN users u ON c.user_id = u.id
                        WHERE user_id = '".$mysqli->real_escape_string((int)$id)."'
                        AND page_id = '".$mysqli->real_escape_string((int)$pageId)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $summary = preg_replace("/\r|\n/", " ", $row['summary']);
                        $pageName = $row['page_name'];
                        $userName = $row['user_name'];
                        $img = $row['profile_pic'];
                        $username = $row['username'];
                    }
                    $result->close();

                    $title = $userName."'s review of ".$pageName;
                    $description = substr($summary, 0, 160);

                    $schema = [
                        "@context" => "https://schema.org",
                        "@type" => "BreadcrumbList",
                        "itemListElement" => [
                            [
                                "@type" => "ListItem",
                                "item" => $base_url."users/".$username,
                                "name" => $userName,
                                "position" => 1
                            ],
                            [
                                "@type" => "ListItem",
                                "item" => $base_url,
                                "name" => "targets",
                                "position" => 2
                            ],
                            [
                                "@type" => "ListItem",
                                "description" => $title,
                                "item" => $base_url."targets/".$id."/".$pageId,
                                "name" => $pageName,
                                "position" => 3
                            ]
                        ]
                    ];
                }
                break;

            case "tweet":

                $sql = "SELECT
                            t.created_at, t.full_text,
                            p.name, p.profile_pic, p.social_media_id, p.username
                        FROM twitter_posts t
                        INNER JOIN pages p ON t.page_id = p.social_media_id
                        WHERE tweet_id = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $createdAt = $row['created_at'];
                        $username = $row['username'];
                        $name = $row['name'];
                        $pageId = $row['social_media_id'];
                        $pic = $row['profile_pic'];
                        $fullText = preg_replace("/\r|\n/", " ", $row['full_text']);
                    }
                    $result->close();

                    $title = 'Tweet by '.$name;
                    $description = substr($fullText, 0, 160);
                    $img = $s3Path."pages/twitter/".$pageId.".jpg";

                    $author = $name;
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
                        "headline" => $title,
                        "sameAs" => "https://twitter.com/".$username."/status/".$id,
                        "text" => $fullText
                    ];
                }
                break;

            case "users":

                $sql = "SELECT img, name, username
                        FROM users
                        WHERE id = '".$mysqli->real_escape_string($id)."' 
                        OR username = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $title = $row['name'];
                        $img = $s3Path.$row['img'];
                        $username = $row['username'];
                    }
                    $result->close();

                    $description = $title."'s profile on Blather";

                    $schema = [
                        "@context" => "https://schema.org",
                        "@type" => "BreadcrumbList",
                        "itemListElement" => [
                            [
                                "@type" => "ListItem",
                                "item" => $base_url."search/users",
                                "name" => "Users",
                                "position" => 1
                            ],
                            [
                                "@type" => "ListItem",
                                "description" => $description,
                                "image" => $img,
                                "item" => $base_url."users/".$username,
                                "name" => $title,
                                "position" => 2
                            ]
                        ]
                    ];
                }
                break;

            case "video":

                $sql = "SELECT
                            y.date_created, y.description, y.img, y.title, y.video_id,
                            p.name, p.profile_pic, p.social_media_id
                        FROM youtube_videos y
                        INNER JOIN pages p ON y.channel_id = p.social_media_id
                        WHERE video_id = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $_description = preg_replace("/\r|\n/", " ", $row['description']);
                        $pageId = $row['social_media_id'];
                        $createdAt = $row['date_created'];
                        $videoId = $row['video_id'];
                        $name = $row['name'];
                        $title = $row['title'];
                        $profile_pic = $row['profile_pic'];
                        $video_img = $row['img'];
                    }
                    $result->close();

                    $description = substr($_description, 0, 160);
                    $img = $s3Path."pages/youtube/".$pageId.".png";

                    $schema = [
                        "@context" => "http://schema.org",
                        "@type" => "SocialMediaPosting",
                        "@id" => "https://blather.io/video/".$videoId,
                        "datePublished" => $createdAt,
                        "author" => [
                            "@type" => "Person",
                            "image" => $img,
                            "name" => $name,
                            "url" => "https://blather.io/pages/youtube/".$pageId
                        ],
                        "headline" => $title,
                        "image" => $video_img,
                        "sameAs" => "https://www.youtube.com/watch?v=".$videoId
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
        <meta charset="utf8mb4">
        <meta name="google-site-verification" content="bTDbvvxwQikYB9zsfufDiaqgVHMRi4DZ0311nJpngi8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
        <meta name="theme-color" content="#000000">

        <meta property="og:description" content="<?php echo htmlentities($description); ?>">
        <meta property="og:image" content="<?php echo $img; ?>">
        <meta property="og:image:height" content="<?php echo $height; ?>">
        <meta property="og:image:width" content="<?php echo $width; ?>">
        <meta property="og:site_name" content="Blather" />
        <meta property="og:title" content="<?php echo htmlentities($title); ?>">
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blather.io<?php echo $uri; ?>">

        <meta name="description" content="<?php echo htmlentities($description); ?>">
        <meta name="keywords" content="political partisanship,logical fallacies,platitudes,talking points,debunked">
<?php
    if ($author) {
?>
        <meta name="author" content="<?php echo $author; ?>">
<?php
    }
?>

        <link rel="stylesheet" type="text/css" href="/static/css/main.d83a1905.chunk.css">
        <link rel="manifest" href="/manifest.json">
        <link rel="shortcut icon" href="/favicon.ico?v=3">
        <link rel="apple-touch-icon" sizes="128x128" href="/favicon.ico?v=3">

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

    <script src="/static/js/1.e74ef228.chunk.js"></script>
    <script src="/static/js/main.1a45c710.chunk.js"></script>
    <script src="/static/js/runtime~main.229c360f.js"></script>
    <script src="static/js/main.c3e74a8e.js"></script>

<?php
    if ($schema) {
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