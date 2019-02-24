<?php
    $css_files = array_slice(scandir('static/css'), 2);
    $js_files = array_slice(scandir('static/js'), 2);
    $media_files = array_slice(scandir('static/media'), 2);

    $js_dir = 'api/public/js/blather/build/static/';
    $new_css_files = array_slice(scandir($js_dir.'css/'), 2);
    $new_js_files = array_slice(scandir($js_dir.'js/'), 2);
    $new_media_files = array_slice(scandir($js_dir.'media/'), 2);
    $file = file_get_contents('index.php');

    for($i=0;$i<count($new_css_files);$i++) {
        $content = file_get_contents($js_dir.'css/'.$new_css_files[$i]);
        file_put_contents('static/css/'.$new_css_files[$i], $content);
        if ($css_files[$i] !== $new_css_files[$i]) {
            exec("rm static/css/".$css_files[$i]);
        }
        $file = str_replace($css_files[$i], $new_css_files[$i], $file);
    }

    for($i=0;$i<count($new_js_files);$i++) {
        $content = file_get_contents($js_dir.'js/'.$new_js_files[$i]);
        file_put_contents('static/js/'.$new_js_files[$i], $content);
        if ($js_files[$i] !== $new_js_files[$i]) {
            exec("rm static/js/".$js_files[$i]);
        }
        $file = str_replace($js_files[$i], $new_js_files[$i], $file);
    }

    for($i=0;$i<count($new_media_files);$i++) {
        $content = file_get_contents($js_dir.'media/'.$new_media_files[$i]);
        file_put_contents('static/media/'.$new_media_files[$i], $content);
        if ($media_files[$i] !== $new_media_files[$i] && !empty($media_files[$i])) {
            exec("rm static/media/".$media_files[$i]);
        }
        $file = str_replace($media_files[$i], $new_media_files[$i], $file);
    }

    $content = file_get_contents('api/public/js/blather/build/asset-manifest.json');
    file_put_contents('asset-manifest.json', $content);

    file_put_contents('index.php', $file);
?>