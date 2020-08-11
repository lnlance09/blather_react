<?php
    $uri = $_SERVER['REQUEST_URI'];
    $paths = explode('/', $uri);
    array_splice($paths, 0, 1);

    $dir = "/blather/";
    $base_url = "https://blather.io/";
    $canonical_url = "https://blather.io".$uri;
    $title = "Assign a Logical Fallacy";
    $description = "Blather is a website and application that lets users assign logical fallacies to tweets. You can also make political memes out of tweets and fallacies.";
    $keywords = [
        "logical fallacies",
        "political memes",
        "contradictions"
    ];
    $html = "";

    $schema = false;
    $s3Path = "https://s3.amazonaws.com/blather22/";
    $img = $base_url."images/icons/icon-512x512.png";
    $appleIcon = $base_url."images/icons/icon-128x128.png";

    $set = false;
    $author = false;
    $authorUrl = "";

    switch ($uri) {
        case "/":
            $schema = [
                "@context" => "https://schema.org",
                "@type" => "WebSite",
                "name" => "Blather",
                "url" => $base_url,
                "potentialAction" => [
                    "@type" => "SearchAction",
                    "target" => $base_url."api/search/advanced?q={search_term_string}&type=fallacies",
                    "query-input" => "required name=search_term_string"
                ]
            ];
            break;

        case "/about":
            $title = "About";
            $set = true;
            break;

        case "/activity":
            $title = "Activity";
            $set = true;
            break;

        case "/about/contact":
            $title = "Contact";
            $set = true;
            break;

        case "/about/privacy";
            $title = "Privacy";
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

        case "/fallacies":
            $title = "Fallacies";
            $description = "A list of logical fallacies along with their definitions and examples of how they're used";

            $html = "<h1>Logical Fallacies</h1>";

            $mysqli = new mysqli("blather.cni5l9jtlymn.us-west-2.rds.amazonaws.com:3306", "lnlance09", ":~dYCVk'9_W9arZ", "blather");
            if ($mysqli->connect_errno) {
                printf("Connect failed: %s\n", $mysqli->connect_error);
                exit();
            }
            $sql = "SELECT description, name FROM fallacies";
            $result = $mysqli->query($sql);
            while ($row = $result->fetch_assoc()) {
                $slug = strtolower(str_replace(' ', '-', $row['name']));
                $html .= "<h2><a href='".$base_url."fallacies/".$slug."'>".$row['name']."</a></h2><p>".$row['description']."</p>";
            }
            $result->close();

            $set = true;
            break;

        case "/grifters";
            $title = "Grifters";
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
            $description = "Sign in to Blather. Create an account.";
            $set = true;
            break;

        case "/tags";
            $title = "Tags";
            $set = true;
            break;
    }

    if (!$set) {
        $mysqli = new mysqli("blather.cni5l9jtlymn.us-west-2.rds.amazonaws.com:3306", "lnlance09", ":~dYCVk'9_W9arZ", "blather");
        if ($mysqli->connect_errno) {
            printf("Connect failed: %s\n", $mysqli->connect_error);
            exit();
        }

        $id = $paths[1];

        switch ($paths[0]) {
            case "fallacies":

                $name = ucwords(str_replace('-', ' ', $id));
                $sql = "SELECT description, id, name
                        FROM fallacies
                        WHERE name = '".$mysqli->real_escape_string($name)."'";
                $result = $mysqli->query($sql);

                if ($result->num_rows === 1) {
                    while ($row = $result->fetch_assoc()) {
                        $fallacyId = $row['id'];
                        $title = $row['name'];
                        $description = $row['description'];
                    }
                    $result->close();

                    $img = $s3Path."reference/".$id.".jpg";
                    $schema = [
                        "@context" => "https://schema.org",
                        "@type" => "BreadcrumbList",
                        "itemListElement" => [
                            [
                                "@type" => "ListItem",
                                "item" => $base_url."fallacies",
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

                    $html = '<div>
                                <h1>'.$title.'</h1>
                                <p>'.$description.'</p>
                                <img src="'.$img.'" alt="'.$title.'" />
                                <p>Examples</p>';

                    $sql = "SELECT slug, title
                            FROM fallacy_entries
                            WHERE fallacy_id = '".$mysqli->real_escape_string($fallacyId)."'";
                    $result = $mysqli->query($sql);

                    if ($result) {
                        while ($row = $result->fetch_assoc()) {
                            $html .= '<a href="'.$base_url.'fallacies/'.$row['slug'].'">'.$row['title'].'</a>';
                        }
                        $result->close();
                    }

                    $html .= '</div>';
                } else {
                    $exp = explode('-', $id);
                    $id = end($exp);

                    $sql = "SELECT
                                c.media_id AS c_media_id,
                                c.network AS c_network,
                                cp.username AS c_username,

                                f.name AS fallacy_name,

                                fe.date_created,
                                fe.explanation,
                                fe.last_updated,
                                fe.media_id,
                                fe.network,
                                fe.s3_link,
                                fe.slug,
                                fe.title,

                                p.name AS page_name,
                                p.type AS page_type,
                                p.s3_pic AS page_pic,
                                p.social_media_id,
                                p.username AS page_username,

                                u.id AS user_id,
                                u.img AS user_profile_pic,
                                u.name AS user_name,
                                u.username,

                                GROUP_CONCAT(DISTINCT t.id ORDER BY t.id ASC SEPARATOR '|') AS tag_ids,
                                GROUP_CONCAT(DISTINCT t.value ORDER BY t.id ASC SEPARATOR '|') AS tag_names,
                                GROUP_CONCAT(DISTINCT t.slug ORDER BY t.id ASC SEPARATOR '|') AS tag_slugs

                            FROM fallacy_entries fe
                            INNER JOIN fallacies f ON fe.fallacy_id = f.id
                            INNER JOIN pages p ON fe.page_id = p.social_media_id
                            INNER JOIN users u ON fe.assigned_by = u.id
                            LEFT JOIN contradictions c ON fe.id = c.fallacy_entry_id
                            LEFT JOIN pages cp ON c.page_id = cp.social_media_id
                            LEFT JOIN fallacy_tags ft ON fe.id = ft.fallacy_id
                            LEFT JOIN tags t ON ft.tag_id = t.id
                            WHERE fe.id = '".$mysqli->real_escape_string((int)$id)."'";
                    $result = $mysqli->query($sql);

                    if ($result->num_rows === 1) {
                        while ($row = $result->fetch_assoc()) {
                            $cMediaId = $row['c_media_id'];
                            $cNetwork = $row['c_network'];
                            $cUsername = $row['c_username'];

                            $fallacyName = $row['fallacy_name'];

                            $createdAt = $row['date_created'];
                            $explanation = preg_replace("/\r|\n/", " ", $row['explanation']);
                            $lastUpdated = $row['last_updated'];
                            $mediaId = $row['media_id'];
                            $network = $row['network'];
                            $s3Link = $row['s3_link'];
                            $slug = $row['slug'];
                            $fallacyTitle = $row['title'];

                            $pageName = $row['page_name'];
                            $pagePic = $row['page_pic'];
                            $pageType = $row['page_type'];
                            $pageId = $row['social_media_id'];
                            $pageUsername = $row['page_username'];

                            $userId = $row['user_id'];
                            $userName = $row['user_name'];
                            $userPic = $row['user_profile_pic'];
                            $userUsername = $row['username'];

                            $tag_ids = explode('|', $row['tag_ids']);
                            $tag_names = explode('|', $row['tag_names']);
                            $tag_slugs = explode('|', $row['tag_slugs']);
                        }
                        $result->close();

                        $title = $fallacyTitle;
                        $pageTitle = $fallacyName.' by '.$pageName;
                        $description = $pageTitle.' - '.substr($explanation, 0, 120);
                        $img = $s3Path.$pagePic;
                        $author = $userName;
                        $authorUrl = $base_url.'users/'.$userUsername;
                        $canonical_url = $base_url."fallacies/".$slug;
                        $referee_pic = $s3Path.'reference/'.str_replace(' ', '-', strtolower($fallacyName)).'.jpg';

                        if (strpos($s3Link, "screenshots") !== false) {
                            $img = $s3Path.$s3Link;
                        } else {
                            $img = $referee_pic;
                        }

                        $schema_keywords = [
                            'Tag:'.$fallacyName,
                            'Tag:'.$pageName
                        ];

                        for ($i=0;$i<count($tag_ids);$i++) {
                            if (!empty($tag_ids[$i])) {
                                $schema_keywords[] = 'Tag:'.trim($tag_names[$i]);
                                $keywords[] = trim($tag_names[$i]);
                            }
                        }

                        $schema = [
                            "@context" => "http://schema.org",
                            "@type" => "NewsArticle",
                            "image" => $img,
                            "url" => $canonical_url,
                            "dateCreated" => $createdAt,
                            "datePublished" => $createdAt,
                            "dateModified" => empty($lastUpdated) ? $createdAt : $lastUpdated,
                            "headline" => $title,
                            "name" => $title,
                            "description" => $description,
                            "identifier" => $id,
                            "keywords" =>  $schema_keywords,
                            "author" => [
                                "@type" => "Person",
                                "name" => $author,
                                "url" => $authorUrl
                            ],
                            "creator" => $author,
                            "publisher" => [
                                "@type" => "Organization",
                                "name" => "Blather",
                                "url" => "https://blather.io",
                                "logo" => [
                                    "@type" => "ImageObject",
                                    "url" => $base_url."images/icons/icon-512x512.png",
                                    "width" => "512",
                                    "height" => "512"
                                ]
                            ],
                            "mainEntityOfPage" => $canonical_url
                        ];

                        $keywords[] = $fallacyName;
                        $keywords[] = $pageName;

                        $html = '<div>
                                    <h1>
                                        '.$fallacyTitle.' - '.$fallacyName.' by '.$pageName.'
                                    </h1>
                                    <p>'.$explanation.'</p>
                                    <img src="'.$referee_pic.'" alt="'.$fallacyName.'" />
                                    <a href="'.$base_url.'fallacies/'.str_replace(' ', '-', strtolower($fallacyName)).'">'.$fallacyName.'</a>
                                    <a href="'.$base_url.'pages/'.$network.'/'.$pageId.'">'.$pageName.'</a>
                                    <img src="'.$s3Path.$pagePic.'" alt="'.$pageName.'"/>';

                        if (strpos($s3Link, "screenshots") !== false) {
                            $html .= '<img src="'.$s3Path.$s3Link.'" alt="'.htmlentities($pageTitle).'"/>';
                        }

                        $sql = "SELECT slug, title
                                FROM fallacy_entries
                                WHERE page_id = '".$mysqli->real_escape_string($pageId)."'";
                        $result = $mysqli->query($sql);
                        if ($result) {
                            while ($row = $result->fetch_assoc()) {
                                $html .= '<a href="'.$base_url.'fallacies/'.$row['slug'].'">'.$row['title'].'</a>';
                            }
                            $result->close();
                        }

                        for ($i=0;$i<count($tag_ids);$i++) {
                            if (!empty($tag_ids[$i])) {
                                $html .= '<a href="'.$base_url.'tags/'.trim($tag_slugs[$i]).'">'.trim($tag_names[$i]).'</a>';
                            }
                        }

                        $html .= '</div>';
                    }
                }
                break;

            case "pages":

                $id = $paths[2];
                $sql = "SELECT about, name, s3_pic, social_media_id, type, username
                        FROM pages
                        WHERE social_media_id = '".$mysqli->real_escape_string($id)."'
                        OR username = '".$mysqli->real_escape_string($id)."'";

                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $pageId = $row['social_media_id'];
                        $title = $row['name'];
                        $s3Pic = $row['s3_pic'];
                        $username = $row['username'];
                        $description = $title."'s list of contradictions and logical fallacies on Blather. A measure of ".$title."'s credibility and partisanship.";
                        $type = $row['type'];
                    }
                    $result->close();

                    $ext = $type === "twitter" ? "jpg" : "png";
                    $img = $s3Path.$s3Pic;
                    $canonical_url = $base_url."pages/".$type."/".($type === "twitter" ? $username : $pageId);

                    $schema = [
                        "@context" => "https://schema.org",
                        "@type" => "Person",
                        "name" => $title,
                        "url" => $canonical_url,
                        "sameAs" => [
                            $type === "twitter" ? "https://twitter.com/".$username : "https://www.youtube.com/channel/".$pageId
                        ]
                    ];

                    $keywords[] = $title;
                    $keywords[] = "credibility";
                    $keywords[] = "contradictions";
                    $keywords[] = "logical fallacies";

                    $html = '<div>
                                <img src="'.$img.'" alt="'.$title.'">
                                <h1>'.$title.'</h1>
                                <p>'.$description.'</p>
                            </div>';

                    $sql = "SELECT slug, title
                            FROM fallacy_entries
                            WHERE page_id = '".$mysqli->real_escape_string($pageId)."'";
                    $result = $mysqli->query($sql);
                    if ($result) {
                        while ($row = $result->fetch_assoc()) {
                            $html .= '<a href="'.$base_url.'fallacies/'.$row['slug'].'">'.$row['title'].'</a>';
                        }
                        $result->close();
                    }
                }
                break;

            case "search":

                $title = 'Search results';
                if (!empty($_GET['q'])) {
                    $title .= ' for '.trim($_GET['q']);
                }
                break;

            case "tags":

                $exp = explode('-', $id);
                $id = end($exp);

                $sql = "SELECT t.value, t.slug AS tag_slug, tv.description, ti.s3_path, ti.caption, fe.title, fe.slug
                        FROM tags t

                        INNER JOIN tag_versions tv ON t.id = tv.tag_id
                        LEFT JOIN tag_images ti ON t.id = ti.tag_id
                        LEFT JOIN fallacy_tags ft ON t.id = ft.tag_id
                        LEFT JOIN fallacy_entries fe ON ft.fallacy_id = fe.id

                        WHERE tv.version = (
                            SELECT MAX(version) FROM tag_versions 
                            WHERE tag_id = '".$mysqli->real_escape_string($id)."' 
                            OR t.slug = '".$mysqli->real_escape_string($id)."'
                        )
                        AND t.id = '".$mysqli->real_escape_string($id)."'";
                if ($result = $mysqli->query($sql)) {
                    $html = '';
                    $i = 0;

                    while ($row = $result->fetch_assoc()) {
                        if ($i === 0) {
                            $canonical_url = $base_url.'tags/'.$row['tag_slug'];
                            $title = $row['value'];
                            $description = substr($row['description'], 0, 160);

                            if (!empty($row['s3_path'])) {
                                $img = $s3Path.$row['s3_path'];
                            }

                            $html .= '<div>
                                        <h1>'.$title.'</h1>
                                        <p>'.$description.'</p>
                                    </div>';
                        }

                        $html .= '<img src="'.$s3Path.$row['s3_path'].'" alt="'.$row['caption'].'">';
                        $html .= '<a href="'.$base_url.'fallacies/'.$row['slug'].'">'.$row['title'].'</a>';

                        $i++;
                    }
                    $result->close();
                }
                break;

            case "targets":

                $pageId = count($paths) >= 3 ? $paths[2] : null;

                if ($id == "create") {
                    $sql = "SELECT name AS page_name, profile_pic
                            FROM pages
                            WHERE id = '".$mysqli->real_escape_string((int)$pageId)."'";
                } else {
                    $sql = "SELECT
                                c.summary,
                                p.name AS page_name,
                                p.profile_pic,
                                u.name AS user_name,
                                u.username
                            FROM criticisms c
                            INNER JOIN pages p ON c.page_id = p.id
                            INNER JOIN users u ON c.user_id = u.id
                            WHERE page_id = '".$mysqli->real_escape_string((int)$pageId)."'
                            AND user_id = '".$mysqli->real_escape_string((int)$id)."'";
                }

                if ($result = $mysqli->query($sql)) {
                    while ($row = $result->fetch_assoc()) {
                        $pageName = $row['page_name'];
                        $img = $row['profile_pic'];
                        $summary = $id != "create" ? preg_replace("/\r|\n/", " ", $row['summary']) : null;
                        $userName = $id != "create" ? $row['user_name'] : null;
                        $username = $id != "create" ? $row['username'] : null;
                    }
                    $result->close();

                    if ($id != "create") {
                        $title = $userName."'s review of ".$pageName;
                    } else {
                        $title = "Create a review of ".$pageName;
                    }

                    $description = substr($summary, 0, 160);
                    $canonical_url = $base_url."targets/".$id."/".$pageId;

                    if ($id != "create") {
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
                                    "item" => $canonical_url,
                                    "name" => $pageName,
                                    "position" => 3
                                ]
                            ]
                        ];
                        $keywords[] = $userName;
                        $keywords[] = $pageName;
                        $keywords[] = "review";
                    }
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
                        "image" => $img,
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
                    $canonical_url = $base_url."users/".$username;

                    $schema = [
                        "@context" => "https://schema.org",
                        "@type" => "Person",
                        "name" => $title,
                        "url" => $canonical_url
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
        <meta name="msvalidate.01" content="66D65FA622461FB6866BB3F58EBD4CE9" />
        <meta name="viewport" content="width=device-width, user-scalable=0">
        <meta name="theme-color" content="#000000">

        <meta property="fb:app_id" content="498572440350555">
        <meta property="og:description" content="<?php echo htmlentities($description); ?>">
        <meta property="og:image" content="<?php echo $img; ?>">
        <meta property="og:image:height" content="<?php echo $height; ?>">
        <meta property="og:image:width" content="<?php echo $width; ?>">
        <meta property="og:site_name" content="Blather" />
        <meta property="og:title" content="<?php echo htmlentities($title); ?> - Blather">
        <meta property="og:type" content="website" />
        <meta property="og:url" content="<?php echo $canonical_url; ?>">

        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:site" content="@blatherio">
        <meta name="twitter:creator" content="@blatherio">
        <meta name="twitter:title" content="<?php echo htmlentities($title); ?> - Blather">
        <meta name="twitter:description" content="<?php echo htmlentities($description); ?>">
        <meta name="twitter:image" content="<?php echo $img; ?>">

        <meta name="description" content="<?php echo htmlentities($description); ?>">
        <meta name="keywords" content="<?php echo implode(",", array_unique($keywords)); ?>">
        <meta name="title" content="<?php echo htmlentities($title); ?> - Blather">
<?php
    if ($author) {
?>
        <meta property="article:publisher" content="<?php echo $author; ?>">
        <meta property="article:author" content="<?php echo $author; ?>">
        <meta name="author" content="<?php echo $author; ?>">

        <link rel="publisher" href="<?php echo $base_url; ?>">
        <link rel="author" href="<?php echo $authorUrl; ?>">
<?php
    }
?>

        <link rel="stylesheet" type="text/css" href="/static/css/1.afd5d2df.chunk.css">
        <link rel="stylesheet" type="text/css" href="/static/css/main.5266bd4f.chunk.css">

        <link rel="canonical" href="<?php echo $canonical_url; ?>" />
        <link rel="home" href="<?php echo $base_url; ?>" />

        <link rel="manifest" href="/manifest.json">
        <link rel="shortcut icon" href="/favicon.ico?v=3">
        <link rel="apple-touch-icon" sizes="128x128" href="/favicon.ico?v=3">

        <title><?php echo $title; ?> - Blather</title>
<?php
    if ($schema) {
?>
        <script type="application/ld+json">
            <?php echo json_encode($schema); ?>
        </script>
<?php
    }
?>
        <script id="parsely-cfg" src="//cdn.parsely.com/keys/blather.io/p.js"></script>
    </head>

    <body>
        <noscript>
            You need to enable JavaScript to run this app.
        </noscript>
        <div id="root"></div>
        <div style="display: none;">
            <?php echo $html; ?>
        </div>
    </body>

    <script src="/static/js/1.60e85972.chunk.js"></script>
    <script src="/static/js/main.58443afb.chunk.js"></script>
    <script src="/static/js/runtime~main.229c360f.js"></script>

    <script>
        var sc_project=11316702;
        var sc_invisible=1;
        var sc_security="b7d7f089";
    </script>
    <script src="https://www.statcounter.com/counter/counter.js" async></script>

    <!-- Start Alexa Certify Javascript -->
    <script>
        _atrk_opts = { atrk_acct:"r9gPs1KAfD20Cs", domain:"blather.io",dynamic: true};
        (function() { var as = document.createElement('script'); as.type = 'text/javascript'; as.async = true; as.src = "https://certify-js.alexametrics.com/atrk.js"; var s = document.getElementsByTagName('script')[0];s.parentNode.insertBefore(as, s); })();
    </script>
    <noscript>
        <img src="https://certify.alexametrics.com/atrk.gif?account=r9gPs1KAfD20Cs" style="display:none" height="1" width="1" alt="" />
    </noscript>
    <!-- End Alexa Certify Javascript -->
</html>