---
layout: post
title: "PinScroll - Easy document content marking on the scrollbar"
alias: [/view/509, /view/509/PinScroll_-_Easy_document_content_marking_on_the_scrollbar]
---

About a month or two ago MSNBC rolled out a new feature on their website, which you can [see demonstrated here](http://www.msnbc.msn.com/id/38788739/ns/technology_and_science-tech_and_gadgets/). Important sections of the website get little tags that float over the document pointing at the scrollbar, indicating where on the page the section is at. Clicking the tag scrolls you directly to that section.

It's a really neat idea, and I dug through their JS source to see how they did it, but everything on their site is obfuscated (plus, they use jQuery).  So, I brainstormed it for a bit to figure out how they were doing it, and implemented my own method as a Prototype library.  I then went further and made it as dynamic as I could, addressing some bugs with their implementation.  Introducing PinScroll.js, a quick and easy method of adding content pointers to tall documents.

[Demo Page][1]
[GitHub Project Page][2]

  [1]: http://files.chipersoft.com/PinScroll/example.html
  [2]: http://github.com/ChiperSoft/PinScroll