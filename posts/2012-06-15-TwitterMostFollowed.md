---
layout: post
title: "TwitterMostFollowed"
alias: [/view/527, /view/527/TwitterMostFollowed]
---

My wife asked me tonight if there was any way for her to find out the top 100 people followed by the people she follows on Twitter.  After a while searching for a service to do that, I decided to just write a script to do it myself.  I decided to write it in Node.js as a learning exercise.

You need to have the `request`, `async` and `dirty` libraries installed via npm.

<script src="https://gist.github.com/2939809.js?file=gistfile1.js"></script>

Change the userid on line 42 to your own. It helps a lot if you fill in the oauth object details and uncomment lines 28 and 85, as that increases the twitter request cap from 150 to 350 requests.

So what did I learn from this exercise?  That doing large amounts of I/O in node really sucks.  Also, twitter's rate limiting on REST requests seriously hamstrings development.  I had to cache request responses simply because otherwise I'd get rate limited after just two runs and couldn't test again for a whole hour.
