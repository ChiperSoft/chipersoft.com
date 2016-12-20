---
layout: post
title: "PHP on Nginx vs Apache."
alias: [/view/523, /view/523/PHP_on_Nginx_vs_Apache.]
---

I now have two different VirtualBox VMs built on Ubuntu 11.10 for hosting out PHP files.

- [One build running Nginx 1.0.5](http://chipersoft.com/view/521/Setting_up_a_LEMP_server), using PHP-FPM to handle PHP requests via FastCGI.
- [One build running Apache 2.2.20](http://chipersoft.com/view/522/Setting_up_a_LAMP_server), using mod_php to handle the same PHP requests.

Both builds are running PHP 5.3.6-13 with suhosin.

I wanted to test these two setups to see how much of a performance difference there would be between them.  To perform this test I built the following Node script:

<script src="https://gist.github.com/1968650.js?file=gistfile1.js"></script>

This script would let me hammer each server with a variable number of requests at once.  I ran the script on three urls on each build at different levels of near simultaneous requests.  At each level I ran the script five or six times and logged the mean time per request.

Both servers were running my Primal framework.  I used three different URLs for testing.

1. `/LICENSE` is a static file on the server, PHP should never be invoked for it.
2. `/` is the site index, handled by Primal's routing.  The index file is generated from a couple different code includes, but no database access
3. `/login` takes a post request of a username and password.  It performs a select to find the user, and on successful login it performs and update to change the user's last_login value; two SQL queries.

The tests were performed on a 2010 model MacBook Pro with a Core i5.  For both builds I ran the test immediately after a "cold" boot of the VM, with no other virtual machines running.  The figures below are the average time, in seconds, per request.

    Apache Request                  10          20          50          100
    http://primal.lamp/LICENSE      0.003       0.0023      0.00175     0.00165
    http://primal.lamp/             0.0049      0.004       0.004       0.0043
    http://primal.lamp/login        0.22        0.233       0.235       0.24

    Nginx Request                   10          20          50          100
    http://www.primal.dev/LICENSE   0.0033      0.0055      0.0047      0.0045
    http://www.primal.dev/          0.008       0.0085      0.009       0.0091
    http://www.primal.dev/login     0.22        0.233       0.24        0.24

These results surprised me, and honestly I'm hoping someone can find a flaw in my testing procedure, because the figures just don't make sense to me.

1. I expected the response time to increase as more load was placed on the server, but the opposite seemed to happen.
2. Apache had a significant performance increase over nginx when hosting static files.
3. mod_php processed a basic page generation twice as fast as the FastCGI delivered file.  Isn't the whole point of FPM supposed to be that it makes individual requests faster because it's not reloading PHP?

Did I miss something, or did I just prove some people wrong?

---

## Update 1

Some points were raised about the fact that the VMs were running on the same machine as the test, even though they were virtualized.  The topic of multiple cores also came up, as the VMs in the original test were configured for single cores, so I copied the VMs over to my desktop PC and made sure that virtualbox was configured to run both VMs with all four cores and 2GB of memory.  The host machine is a Core i5-650 overclocked to 3.5GHz running Windows 7.  I continued to run the test from my Mac.


    Apache Request                  10          20          50          100
    http://primal.lamp/LICENSE      0.00256     0.00179     0.00117     0.00105
    http://primal.lamp/             0.00334     0.00237     0.00172     0.00160
    http://primal.lamp/login        0.0863      0.0869      0.0860      0.0878

    Nginx Request                   10          20          50          100
    http://www.primal.dev/LICENSE   0.006       0.00512     0.00459     0.00448
    http://www.primal.dev/          0.0071      0.00802     0.00896     0.00892
    http://www.primal.dev/login     0.0857      0.0906      0.0863      0.0879

I've installed jmeter and will be doing some testing with that.  Will return with my results.

---

## Update 2 - jMeter Results

I ran the following tests in jMeter.  All tests were done with a 5 second rampup time.

1. /LICENSE, 1000 threads, 20 loops

    - Nginx:  126,635 requests per minute, average response time 1ms, 1ms deviation
    - Apache: 100,772 requests per minute, average response time 1ms, 0 deviation
    
2. /index, 500 threads, 10 loops

    - Nginx:  50,116 requests per minute, avg 71ms response time, deviation of 45ms
    - Apache: 58,083 requests per minute, avg 4ms response time, deviation of 7ms
    
3. /index, 50 threads, 10 loops

    - Nginx:  6,059 requests per minute, avg 3ms response time, 0 deviation.
    - Apache: 6,064 requests per minute, avg 3ms response time, 0 deviation
    
3. /login 500 threads, 10 loops.  MySQL did NOT like this test, results below were from the best of repeated attempts

    - Nginx:  520 requests per minute, avg 34.8 seconds response time, deviation of 22 seconds.  Only 733 of the 5000 requests completed.
    - Apache: 789 requests per minute, avg 28.8 seconds response time, deviation of 28.8 seconds.  Only 1287 of the 5000 requests completed.
    
4. /login 50 threads, 10 loops.

    - Nginx:  686 requests per minute, avg 3.8 seconds response time, deviation of 977ms.
    - Apache: 959 requests per minute, avg 2.6 seconds response time, deviation of 712ms.
    
On static files, nginx just barely managed to eek out a lead, and in standard PHP requests they were both fairly close, but on requests involving MySQL, apache had a clear lead.

Now obviously this data is non-conclusive, and I make no claims about my competency at this kind of thing, but from where I'm sitting I don't have any clear reason to switch to a LEMP stack from LAMP.  I expected much more drastic results.