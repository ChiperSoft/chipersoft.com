---
layout: post
title: "Testing iPad Web App Layouts"
alias: [/view/519, /view/519/Testing_iPad_web_app_layout]
---

For the past few weeks I've been building a pure JS single-page web app for the iPad.  One of the challenges with this process is getting layout right when viewing the app in Safari in my mac.  Just today did it finally occur to me that I could add this to the page to ensure I was looking at the right dimensions:

<script src="https://gist.github.com/1889320.js?file=iPadFullscreenDebug.css"></script>

This will resize the page body to exactly the dimensions of a homescreened web app in landscape mode.