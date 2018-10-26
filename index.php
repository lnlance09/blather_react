<?php
    $uri = $_SERVER['REQUEST_URI'];
    $title = "Fallacies";
    $description = "Blather is an educational tool that allows users to analyze and pinpoint the accuracy of claims made on social media.";
    $img = "brain.png";

    switch($uri) {
        case"/about":
            $title = "About";
            break;
        case"/about/contact":
            $title = "Contact";
            break;
        case"/about/rules";
            $title = "Rules";
            break;

        case"/discussion/create":
            $title = "Create a discussion";
            $description = "Start a discussion where everyone plays by the same set of rules and intellectually dishonest debate tactics are called out. Change your mind if the evidence is compelling.";
            break;
        case"/discussions":
            $title = "Discussions";
            break;

        case"/fallacies":
            $title = "Fallacies";
            break;

        case"/search":
            $title = "Search";
            break;

        case"/settings":
            $title = "Settings";
            break;

        case"/signin":
            $title = "Sign In";
            break;

        case"/tags/create":
            $title = "Create a Tag";
            break;
    }

    $mysqli = new mysqli("blather.cni5l9jtlymn.us-west-2.rds.amazonaws.com:3306", "lnlance09", "kVQ63hewQNi0bXg", "blather");
    if($mysqli->connect_errno) {
        printf("Connect failed: %s\n", $mysqli->connect_error);
        exit();
    }

    if(strpos($uri, "/discussions/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
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
    }

    if(strpos($uri, "/fallacies/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
        $sql = "SELECT f.name AS fallacy_name, p.name AS page_name, fe.explanation
                FROM fallacy_entries fe
                INNER JOIN fallacies f ON fe.fallacy_id = f.id
                INNER JOIN pages p ON fe.page_id = p.social_media_id
                INNER JOIN users u ON fe.assigned_by = u.id
                WHERE id = '".$mysqli->real_escape_string($id)."'";
        if($result = $mysqli->query($sql)) {
            while($row = $result->fetch_assoc()) {
                $title = $row['fallacy_name'].' by '.$row['page_name'];
                $description = $row['explanation'];
            }
            $result->close();
        }
    }

    if(strpos($uri, "/pages/")) {
        $exp = explode("/", $uri);
        $id = null;
        if(count($exp) >= 3) {
            $id = $exp[2];
        }

        $id = end($exp);
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
    }

    if(strpos($uri, "/search/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
        $title = 'Search results';
        if(!empty($_GET['q'])) {
            $title .= ' for '.trim($_GET['q']);
        }
    }

    if(strpos($uri, "/tags/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
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
    }

    if(strpos($uri, "/targets/")) {
        $exp = explode("/", $uri);
        $userId = null;
        $pageId = null;
        if(count($exp) === 3) {
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
    }

    if(strpos($uri, "/tweet/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
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
    }

    if(strpos($uri, "/users/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
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
    }

    if(strpos($uri, "/video/")) {
        $exp = explode("/", $uri);
        $id = $exp[1];
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
    }

    $mysqli->close();
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <meta name="theme-color" content="#000000">
        
        <meta property="og:image" content="<?php echo $img; ?>" />
        <meta property="og:site_name" content="Blather" />
        <meta property="og:title" content="<?php echo $title; ?>" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://blather.io<?php echo $uri; ?>" />

        <meta name="description" content="<?php echo $description; ?>" />

        <link rel="stylesheet" type="text/css" href="/static/css/main.7387fe68.css">
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
    <script src="/static/js/main.e0398274.js"></script>
</html>