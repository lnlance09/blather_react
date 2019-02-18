<?php
    $css_files = array_slice(scandir('static/css'), 2);
    $js_files = array_slice(scandir('static/js'), 2);

    $js_dir = 'api/public/js/blather/build/static/';
    $new_css_files = array_slice(scandir($js_dir.'css/'), 2);
    $new_js_files = array_slice(scandir($js_dir.'js/'), 2);
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

    file_put_contents('index.php', $file);
?>