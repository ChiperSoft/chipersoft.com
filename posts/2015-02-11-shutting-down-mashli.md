---
title: Shutting Down Mash.li
---

This week I will be shutting down the mash.li website.

So far I have spent $100 running the site. This was the cost of operating a 1GB droplet on ocean digital for the entire life of the project. Currently there is one more month of operations left on the account. I'm not convinced that it is worth it for me to add more money to the account to keep it running.

For one, the site has largely been a failure.  I was not able to create a search algorithm capable of consistently picking out good tracks. In fact, I wasn't even able to reach a 50% success.  I had hoped that user interaction would compensate for that, but as of yet that has also been a failure.

Out of 6259 tracks indexed on the site, only 42 received votes, and only 14 received more than one vote.  According to google analytics, the site received 180 visitors since last december. Of those, 74 were analytics spam bots, at least 32 weren't browsers at all, and only 38 were using a non-IE browser.

So at best there were only 50 real visitors in three months, none of which voted on tracks.

The final deciding factor comes in the form of an API change in soundcloud itself.  On March 2nd, SoundCloud will be changing the way results in their API are paginated.  This will break my scraping script.  I could certainly update that script, but that will mean making a new deployment of the site.  I haven't deployed new code in more than six months, and while I have occasionally updated the codebase for dependency changes (especially in Express 4), I really don't feel like taking the time to make sure that everything still works.

The site was a fun learning project, and I managed to create some really good frontend code that I'll be reusing in the future, but its time has passed.  I'll be uploading a full dump of the database to the code repo, for anyone who wants to try running the site on their own machines.