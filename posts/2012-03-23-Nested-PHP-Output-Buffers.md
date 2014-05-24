---
layout: post
title: "Nested PHP Output Buffers, or buffers within buffers"
alias: [/view/524, /view/524/Nested_PHP_Output_Buffers_or_buffers_within_buffers]
---

One of PHP's core features (although some call it a weakness) is that all code resides within a natural HTML document. Thusly, anything echoed by PHP and anything outside of the `<?php ?>` tag gets sent to the browser.  Well sometimes you don't WANT everything to be immediately sent to the browser, such as when you're parsing a PHP based template that needs to go into an email.  This is where the [output buffer functions](http://www.php.net/manual/en/ref.outcontrol.php) become useful.

Calling [`ob_start()`](http://www.php.net/manual/en/function.ob-start.php) at any point in your code will create an output buffer, and anything that is outputted from that point on will be stored in that buffer.  You can then send the buffer's contents to a variable, clear the contents entirely, and/or send them to the browser.  You can even use the output buffer to [gzip the page contents](http://www.php.net/manual/en/function.ob-gzhandler.php).

One of the things that the documentation doesn't really cover, however, is what happens if you create a buffer while already inside a buffer.  My google searches to this affect didn't return anything useful, so I ran the following test:

    echo '1';
    ob_start();
    	echo '2';
    	ob_start();
    		echo '3';
    	$var_b = ob_get_clean();
    	echo '4';
    $var_a = ob_get_clean();
    echo '5';
    
    echo "\n",$var_a,"\n",$var_b;

And received these results:

    15
    24
    3

My conclusions: output buffers are stacked.  When you call `ob_start()`, a buffer is pushed onto the stack, and when you call `ob_end_clean()`, `ob_end_flush()`, or `ob_get_clean()` the buffer is popped back off of that stack.  Only the top most buffer receives code output.