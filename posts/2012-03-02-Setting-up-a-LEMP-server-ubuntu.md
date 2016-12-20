---
layout: post
title: "Setting up a LEMP server with Ubuntu, Nginx, MySQL, PHP-FPM, phpMyAdmin and PrimalPHP"
alias: [/view/521, /view/521/Setting_up_a_LEMP_server, /view/521/Setting_up_a_LEMP_server_with_Ubuntu_Nginx_MySQL_PHP-FPM_phpMyAdmin_and_PrimalPHP.]
---

After reading [this interview with Chris Hartjes](http://7php.com/php-interview-chris-hartjes/) and placing [this Quora question](http://www.quora.com/What-are-the-advantages-of-using-PHP-FPM-+-Nginx-over-Apache-and-mod_php), I decided I wanted to try out getting my [Primal](http://www.primalphp.com) framework running on a LEMP stack.  Lots of people have heard the term LAMP, but LEMP is relatively new.  It stands for Linux + Nginx + MySQL + PHP-FPM (nginx is pronounced "engine-x").  This post is my chronicle of the steps involved with this process.

Note, the I don't show the command output unless it is relevant to what is being done.  All of these commands spit out a bunch of information, so don't think that something is wrong when you see output between the commands.

## Stage 1 - Installation.

My first step was to download Ubuntu Server 11.10 and install it into a virtualbox VM. This is fairly straight forward and virtualbox walks you through the process, so I'll just assume anyone reading this can figure it out.  I configured virtualbox to let this VM get an IP directly from the local network, rather than NAT my Mac's address.  This would make it easier to access the VM's server from my mac, since I could just add the virtualhost to my /etc/hosts file.  It also allows me to access the VM from any computer in the house.

Once the install was done I dug up a few articles on the install process and set to work.  I started with [Linode's guide for configuring a LEMP stack on 11.10](http://library.linode.com/lemp-guides/ubuntu-11.10-oneiric) but realized shortly into it that they were using a standard fastcgi setup and not PHP-FPM.  Another google search later and I landed on [Giant Flying Saucer's guide on setting up Nginx with PHP-FPM in Ubuntu 10.10](http://www.giantflyingsaucer.com/blog/?p=2140).  I also discovered [Neal Poole's post](https://nealpoole.com/blog/2011/04/setting-up-php-fastcgi-and-nginx-dont-trust-the-tutorials-check-your-configuration/) about security risks with the configurations in many tutorials.  Armed with this information I set to work.

Everything that has to be performed must be done with administrator privileges.  Many guides tell you to use `su`, but by default Ubuntu 11.10 does not configure a root account password, so `su` doesn't work.  Instead I started with:

    $ sudo bash

Before we start installing it's good to make sure all our package definitions are current and the installed software is up-to-date:

    $ apt-get update
    $ apt-get upgrade
    
Now we install nginx.

    $ apt-get install nginx

At most of these steps it will prompt for confirmation of the install, press `Y` and hit enter.

Once that's completed run the following to make sure it is working:

    $ /etc/init.d/nginx start
    Starting nginx: nginx.

At this point you can test that the server is working by pointing your browser and the virtual machine's IP address.  I opted to just use `curl` from the command line, but `curl` isn't installed by default, so I installed it.

    $ apt-get install curl
    $ curl http://localhost/

You should get a very basic empty page with a single H1 tag on it that says "Welcome to nginx!"

Now we install MySQL.

    $ apt-get install mysql-server mysql-client
    
This will prompt you to define a password for the mysql root account.  If you are installing this on a public facing box this is pretty much mandatory, but I'm installing it on a local only VM and didn't want to be bothered with a password, so I just hit enter.  Doing so will make the install process prompt you three times, just hit enter each time.  When the install finishes run the following:

    $ mysql_secure_installation

Just follow the prompts and read what it asks you.  This will once again confirm your mysql root password, offer to disable anonymous users, remove the test tables, and a few other niceties.

Since PHP is a dependency of PHP-FPM, we can just perform the following to install PHP:

    $ apt-get install php5-fpm

Next we install the PHP MySQL module.  I also had a few other PHP modules that I wanted installed.

    $ apt-get install php5-mysql php5-suhosin php-pear php5-curl php5-gd php5-imagick php5-mcrypt php5-memcache php5-xdebug php-apc
    
Now we restart PHP-FPM to load those modules.

    $ /etc/init.d/php-fpm restart
    
We now have our full LEMP stack installed, but it isn't really usable yet.
    
## Stage 2 - Configuration.

Now we're ready to create a virtualhost. Since this will be a test of Primal, I decided to use the domain `primal.dev`.  Following Linode's recommendation I put it at `/srv/www`, and created a test page.  

    $ mkdir -p /srv/www/primal.dev/www
    $ mkdir -p /srv/www/primal.dev/log
    $ echo '<?php phpinfo() ?>' > /src/www/primal.dev/www/index.php
    
I also added `primal.dev` to my Mac's `/etc/hosts` file, pointing at the VM's IP address, so that I could load the site in Safari at the correct domain.

Now we create our virtualhost file.

    $ pico /etc/nginx/sites-available/primal.dev
    
Into this file I placed the following:

    server {
        listen 80;
        server_name www.primal.dev primal.dev;
        access_log /srv/www/primal.dev/log/access.log;
        error_log /srv/www/primal.dev/log/error.log;
        root /srv/www/primal.dev/www/;
        index  index.html index.htm index.php;

        # route all requests for a PHP file into fastcgi
        location ~ \.php$ {
            include /etc/nginx/fastcgi_params;
            try_files     $uri =404;
            fastcgi_pass  127.0.0.1:9000;
            fastcgi_index index.php;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        }
    }

One thing I want to draw attention to here that differs from the guides I linked.  Note the ending slash on the `root` directive.  When I first set this up I couldn't get any pages to load, the error log kept reporting a 404.  It finally came down to that missing slash, once I added it everything started working.

Another variation here is the use of `$document_root` on the `fastcgi_param` attribute.  Most guides tell you to put the full path to your files here, but as long as you have the root directive defined you can just use `$document_root`.

Finally, the try_files directive will force nginx to only execute php scripts that actually exist, as per the flaw that Neal Poole describes in his post.

Restart nginx and go to the site.

    $ /etc/init.d/nginx restart
    
If all is working you should see something like this at the virtualhost's domain:

![screenshot](http://i.imgur.com/HCRb9l.png)


## Stage 3 - Getting Primal Running

At this point, everything we've done has been as root.  This means everything in /srv is owned by root, which means that my user account (chiper) can't write to it.  To resolve this, I like to make the folder group accessible, so lets make a new group named developers, grant it write access to the folder, and change our user account to that group.

    $ groupadd developer
    $ chown -R :developer /srv
    $ chmod -R g+w /srv
    $ usermod -g developer chiper

Since I'm currently logged in as chiper, this change wont take affect for my active shell.  I closed the ssh session and re-logged into the server to let the changes take effect.

Now I can FTP into the server to upload my site files into my new virtualhost and delete the phpinfo index.php file.  I uploaded the compiled Primal collection as a zip, so first i needed to install unzip, and then extract the file.

    $ sudo apt-get install unzip
    $ cd /srv/www/primal.dev/www/
    $ unzip Primal.Compiled.zip
    $ ls -la
    total 116
    drwxrwxr-x 8 root   developer  4096 2012-02-27 21:25 .
    drwxrwxr-x 4 root   developer  4096 2012-02-27 18:33 ..
    drwxr-xr-x 2 chiper developer  4096 2012-02-27 20:43 actions
    drwxr-xr-x 4 chiper developer  4096 2012-02-27 20:43 classes
    -rw-r--r-- 1 chiper developer   361 2012-01-22 14:27 config.php
    drwxr-xr-x 2 chiper developer  4096 2012-02-27 20:43 css
    -rw-r--r-- 1 chiper developer   258 2011-11-03 13:41 favicon.png
    -rw-r--r-- 1 chiper developer  1388 2012-01-22 14:27 .htaccess
    drwxr-xr-x 2 chiper developer  4096 2012-02-27 20:43 js
    -rw-r--r-- 1 chiper developer  1118 2011-11-18 12:29 LICENSE
    -rw-r--r-- 1 chiper developer  1429 2012-01-25 16:25 main.php
    -rw-r--r-- 1 chiper developer 55863 2012-02-27 21:25 Primal.Compiled.zip
    drwxr-xr-x 2 chiper developer  4096 2012-02-27 21:25 readme
    drwxr-xr-x 2 chiper developer  4096 2012-02-27 20:43 views
    
At this point, because no index file exists, connecting to the domain gives a 403 forbidden error.  On Apache, the mod_rewrite directing inside my .htaccess file would forward the request to main.php.  Nginx doesn't support .htaccess files, so we have to add a rewrite directive to the vhost config.  Since I don't need it, I deleted the .htaccess file.

    $ rm .htaccess
    $ sudo pico /etc/nginx/sites-available/primal.dev
    
Getting the routing to work took a long time to figure out.  Most guides for doing url rewriting are written for php apps that take the request path as an argument on index.php.  Primal doesn't work that way, it gets the request path from PHP's server vars, and all requests for files that don't exist are redirected to `main.php`.  Since none of the copy & paste methods would apply I pretty much had to learn how rewriting works before I could put together a solution.

First we route the root request to main.php.

    location = / {
        rewrite ^ /main.php last;
    }

Next we handle any requests to any files that don't exist (`!-e`) to main.php.

    location / {
        if (!-e $request_filename) {
            rewrite ^ /main.php last;
        }
    }
    
We also need to secure Primal's code folders from web requests.

    location ~ /(cache|classes|views|actions) {
        rewrite ^ /main.php last;
    }

Finally, there needs to be a slight alteration to the PHP FastCGI declaration, changing the try_files directive to use main.php for anything that doesn't exist.  From what I've read, this directive doesn't work if your FastCGI engine is not running locally, but I am running locally, and I assume that anyone using that kind of distributed setup knows how to correct this.

    location ~ \.php$ {
        try_files $uri $uri/ $uri/index.php /main.php;
        include /etc/nginx/fastcgi_params;
        fastcgi_pass  127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

I also sprinkled some other niceties that I found during my research, like redirecting to www.primal.dev, preventing logging of robots.txt and favicon.png files, and blocking requests to hidden files.
    
### The final result

<script src="https://gist.github.com/1935628.js?file=primal-nginx.txt"></script>

## Stage 4 - Configuring PHP

I found several pages saying that one should be able to pass php ini settings via fastcgi_param in the vhost, but I was completely unsuccessful with that method for setting up site specific PHP settings.  This meant that reluctantly I had to make the changes in the php.ini file itself.

    $ sudo pico /etc/php5/fpm/php.ini

I made the following changes:

    display_errors = On
    html_errors = On
    post_max_size = 250M
    upload_max_filesize = 250M
    memory_limit 250M

These first two should probably be off on a production server, but we want them on for a dev box.

## Stage 5 - Installing phpMyAdmin

I could install phpMyAdmin from source, but there's actually an easier way.

    $ sudo apt-get install phpmyadmin

1. The installer will prompt you to choose a web server to configure it for.  The package does not list nginx as an option, so go ahead and hit the tab key to select OK without choosing a server.  
2. It will then prompt you to let it configure itself for the local mysql install.  I went ahead and chose to let it configure.
3. Next it prompted me for the mysql password, which is blank.
4. Then it asked for a default password for phpmyadmin to use to connect to MySQL.  I just left it blank and let it generate a random password.

The package installs phpMyAdmin into `/usr/share/phpmyadmin/`, and puts all the configuration files into `/etc/phpmyadmin`.

There's three ways you can make phpMyAdmin accessible in nginx.

1. Give it a dedicated vhost domain.
2. Add a path alias to an existing vhost
3. Symlink `/usr/share/phpmyadmin` into your hosting directory.

I went with option 3.

    $ ln -s /usr/share/phpmyadmin/ /srv/www/primal.dev/www/myadmin
    
![screenshot](http://i.imgur.com/nuycAl.png)

I **hate** the pmahomme theme that is now the default setting in phpMyAdmin, so the first thing I do is crack open the config and change it back to the original.

    $ sudo pico /etc/phpmyadmin/config.inc.php
    
Added the following to the end of the file:

    $cfg['ThemeDefault'] = 'original';

Note, you'll have to completely quit Safari for this change to take affect.  I also had to uncomment the following line to get phpMyAdmin to work with my passwordless root account.

    $cfg['Servers'][$i]['AllowNoPassword'] = TRUE;
    
Once the settings file is saved I can now login to the sql server.  phpMyAdmin will continue to warn you that your password is still blank, but it can be ignored since this isn't a public server.

During installation I specified the php5-suhosin package.  This is a package that modifies PHP to try and reduce some security vulnerabilities, like stack overflows and such.  Suhosin does not play well with phpMyAdmin, so at the moment myadmin is displaying a warning telling me that I need to [alter some suhosin settings](http://www.primal.dev/myadmin/Documentation.html#faq1_38).

    $ sudo pico /etc/php5/conf.d/suhosin.ini
    
Uncomment and alter the following lines:

    suhosin.get.max_value_length = 1024
    suhosin.post.max_array_index_length = 256
    suhosin.post.max_totalname_length = 8192
    suhosin.post.max_vars = 2048
    suhosin.request.max_array_index_length = 256
    suhosin.request.max_totalname_length = 8192
    suhosin.request.max_vars = 2048
    suhosin.sql.bailout_on_error = off
    
Save it and restart PHP-FPM

    $ sudo /etc/init.d/php5-fpm restart
    
Note, however, that these changes don't actually get rid of the error message, so we go back into `config.inc.php` and add the following to the end:

    $cfg['SuhosinDisableWarning'] = true;
    
I also add the following other settings, just of personal preference:

    $cfg['AjaxEnable'] = false;
    $cfg['LongtextDoubleTextarea'] = false;
    $cfg['EditInWindow'] = false;
    $cfg['LeftDisplayLogo'] = false;
    $cfg['MaxRows'] = 50;
    $cfg['PropertiesIconic'] = true;
    $cfg['DefaultTabTable'] = 'tbl_properties_structure.php';
    $cfg['LeftDefaultTabTable'] = 'sql.php';
    $cfg['Export']['method'] = 'custom-no-form';
    $cfg['Export']['sql_drop_table'] = true;

## Stage 5 - Primal Database

In terms of security it's a bad idea to let your web app use the root account for accessing MySQL, so I hit the Permissions tab in myadmin and created a new user named `primal` with the password `primal`, gave it access from localhost only, and then selected to have myadmin create an identically named database, giving that user permission only over it. 

![screenshot](http://i.imgur.com/slmkVl.png)

Once that was done I imported the users table schema from [Primal.Visitor](https://github.com/ChiperSoft/Primal.Visitor) so I would have something to test with.

To configure a database setup in Primal you have to add a call to Primal\Database\Connection in your `config.php` file.  The compiled version of Primal includes this file with a default to use root@localhost, but we want to change this.

    $ pico /srv/www/primal.dev/www/config.php

Alter the `Connection::AddLink` call like so:

    Connection::AddLink(array(
            'method'        =>Connection::METHOD_MYSQL,
            'database'      =>'primal',
            'host'          =>'localhost',
            'username'      =>'primal',
            'password'      =>'primal',
    ));

Now we visit `/login` and enter the default admin credentials of admin/admin.  If all is correct, there will be no errors.  Visiting `/current` displays a var_dump of the current logged in user.

That's it, we now have a running copy of Primal on nginx.