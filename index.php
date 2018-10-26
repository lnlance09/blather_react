<?php
    $uri = $_SERVER['REQUEST_URI'];
    $paths = explode('/', $uri);
    array_splice($paths, 0, 1);

    $set = false;
    $title = "Fallacies";
    $description = "Blather is an educational tool that allows users to analyze and pinpoint the accuracy of claims made on social media.";
    $img = "brain.png";

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
        $mysqli = new mysqli("127.0.0.1:8889", "root", "root", "blather_react");
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
                    $sql = "SELECT f.name AS fallacy_name, p.name AS page_name, fe.explanation
                            FROM fallacy_entries fe
                            INNER JOIN fallacies f ON fe.fallacy_id = f.id
                            INNER JOIN pages p ON fe.page_id = p.social_media_id
                            INNER JOIN users u ON fe.assigned_by = u.id
                            WHERE fe.id = '".$mysqli->real_escape_string((int)$id)."'";
                    if($result = $mysqli->query($sql)) {
                        while($row = $result->fetch_assoc()) {
                            $title = $row['fallacy_name'].' by '.$row['page_name'];
                            $description = $row['explanation'];
                        }
                        $result->close();
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

            case'tags':
                $sql = "SELECT t.value, tv.description, tv.img
                        FROM tags
                        INNER JOIN tag_versions tv ON t.id = tv.tag_id
                        WHERE id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['value'];
                        $description = $row['description'];
                        $img = $row['img'];
                    }
                    $result->close();
                }
                break;

            case'targets':
                if(count($paths) >= 3) {
                    $userId = $exp[1];
                    $pageId = $exp[2];
                }

                $sql = "SELECT p.name AS page_name, u.name AS user_name, p.profile_pic
                        FROM criticisms c
                        INNER JOIN pages p ON c.page_id = p.id
                        INNER JOIN users u ON c.user_id = u.id
                        WHERE user_id = '".$mysqli->real_escape_string($userId)."'
                        AND page_id = '".$mysqli->real_escape_string($pageId)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['user_name']."'s review of ".$row['page_name'];
                        $img = $row['profile_pic'];
                    }
                    $result->close();
                }
                break;

            case'tweet':
                $sql = "SELECT t.full_text, p.name, p.profile_pic
                        FROM twitter_posts t
                        INNER JOIN pages p ON t.page_id = p.social_media_id
                        WHERE tweet_id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = 'Tweet by '.$row['name'];
                        $description = $row['full_text'];
                        $img = $row['profile_pic'];
                    }
                    $result->close();
                }
                break;

            case'users':
                $sql = "SELECT bio, img, name
                        FROM users
                        WHERE id = '".$mysqli->real_escape_string($id)."' 
                        OR username = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['name'];
                        $description = $row['bio'];
                        $img = $row['img'];
                    }
                    $result->close();
                }
                break;

            case'video':
                $sql = "SELECT y.title, y.description, y.img, p.name
                        FROM youtube_videos y
                        INNER JOIN pages p ON y.channel_id = p.social_media_id
                        WHERE video_id = '".$mysqli->real_escape_string($id)."'";
                if($result = $mysqli->query($sql)) {
                    while($row = $result->fetch_assoc()) {
                        $title = $row['title'];
                        $description = $row['description'];
                        $img = $row['img'];
                    }
                    $result->close();
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

        <meta property="og:description" content="<?php echo htmlspecialchars($description); ?>" />
        <meta property="og:image" content="https://blather.io/<?php echo $img; ?>" />
        <meta property="og:image:height" content="<?php echo $height; ?>">
        <meta property="og:image:width" content="<?php echo $width; ?>">
        <meta property="og:site_name" content="Blather" />
        <meta property="og:title" content="<?php echo htmlspecialchars($title); ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blather.io<?php echo $uri; ?>" />

        <meta name="description" content="<?php echo htmlspecialchars($description); ?>" />

        <link rel="stylesheet" type="text/css" href="static/css/main.806cf679.css">
        <link rel="manifest" href="manifest.json">
        <link rel="shortcut icon" href="favicon.ico">
        <meta name="google-site-verification" content="bTDbvvxwQikYB9zsfufDiaqgVHMRi4DZ0311nJpngi8" />
        <title><?php echo $title; ?> - Blather</title>
    </head>
    <body>
        <noscript>
            You need to enable JavaScript to run this app.
        </noscript>
        <div id="root"></div>
    </body>
    <script src="static/js/main.00e23e60.js"></script>
</html>