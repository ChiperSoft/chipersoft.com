---
layout: post
title: "Setting up a LAMP server with Ubuntu, Apache, MySQL, mod_php, phpMyAdmin and PrimalPHP"
alias: [/view/522, /view/522/Setting_up_a_LAMP_server_with_Ubuntu_Apache_MySQL_mod_php_phpMyAdmin_and_PrimalPHP]
---

To properly test the LEMP configuration that I built [in the previous article built](http://chipersoft.com/view/521/Setting_up_a_LEMP_server), I need an equally built LAMP (Ubuntu, Apache, MySQL, mod_php) configuration.  These are the steps I followed to achieve that end.  Most of this is identical to setting up the other machine, and there are hundreds of guides online about how to install Apache+PHP on ubuntu, so I'm going to breeze through some of these.

## Stage 1 - Installation

As before, my first step was to install Ubuntu Server 11.10 and into a virtualbox VM. This is fairly straight forward and virtualbox walks you through the process, so I'll just assume anyone reading this can figure it out.  I configured virtualbox to let this VM get an IP directly from the local network, rather than NAT my Mac's address.  This would make it easier to access the VM's server from my mac, since I could just add the virtualhost to my /etc/hosts file.  It also allows me to access the VM from any computer in the house.

Everything that has to be performed must be done with administrator privileges.  Many guides tell you to use `su`, but by default Ubuntu 11.10 does not configure a root account password, so `su` doesn't work.  Instead I started with:

    $ sudo bash

Before we start installing it's good to make sure all our package definitions are current and the installed software is up-to-date:

    $ apt-get update
    $ apt-get upgrade

Once that's finished I installed a few utilities I knew I would be needing in the process, and then set to installing Apache, MySQL, PHP, and any php modules that I needed, following any relevant prompts as they came up.

    $ apt-get install curl unzip
    $ apt-get install apache2
    $ apt-get install mysql-server mysql-client
    $ mysql_secure_installation
    $ apt-get install php5 php5-mysql php5-suhosin php-pear php5-curl php5-gd php5-imagick php5-mcrypt php5-memcache php5-xdebug php-apc
    
I then used curl to verify that the server was working

    $ curl http://localhost/
    <html><body><h1>It works!</h1>
    <p>This is the default web page for this server.</p>
    <p>The web server software is running but no content has been added, yet.</p>
    </body></html>
    
By default the Ubuntu packages do not enable Apache's mod_rewrite module, so we have to do that.

    $ ln -s /etc/apache2/mods-available/rewrite.load /etc/apache2/mods-enabled/rewrite.load

## Stage 2 - Configuration

    $ mkdir -p /srv/www/primal.lamp/www
    $ mkdir -p /srv/www/primal.lamp/log
    $ echo '<?php phpinfo() ?>' > /srv/www/primal.lamp/www/index.php
    $ pico /etc/nginx/sites-available/primal.lamp
    
Into this configuration file I pasted the following:

<script src="https://gist.github.com/1968422.js"></script>

File saved, I now have to enable it.

    $ ln -s /etc/apache2/sites-available/primal.lamp /etc/apache2/sites-enabled/primal.lamp
    
Since mod_php lets me pass my php.ini overrides directly, I don't need to alter the php.ini file, so we're ready restart Apache and start serving files.

    $ /etc/init.d/apache2 restart.
    
If all is good, going to http://primal.lamp/ should display the phpinfo output.
    
## Stage 3 - Getting Primal Running

Everything done above was performed as root, so /srv needs to be made accessible to my user account (chiper).
    
    $ groupadd developer
    $ chown -R :developer /srv
    $ chmod -R g+w /srv
    $ usermod -g developer chiper
    
Now I log out of the server completely and log back in to let the group changes take affect.  I then FTP'd the compiled Primal collection into the hosting directory and use unzip to extract it.

    $ cd /srv/www/primal.lamp/www/
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
    
(Note that I deleted the index.php file we created during setup). Connecting to http://primal.lamp/ now gives me the Primal default confirmation page.

## Stage 4 - Installing phpMyAdmin

    $ sudo apt-get install phpmyadmin
     
Follow the prompts. Do NOT choose the apache2 auto-configure.  When finished, symlink the system level install into our host directory.

    $ ln -s /usr/share/phpmyadmin/ /srv/www/primal.lamp/www/myadmin

Now we need to alter suhosin to be compatible with phpMyAdmin

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

You may need to restart Apache for this to take affect.

Now I apply my own phpMyAdmin preferences.

    $ sudo pico /etc/phpmyadmin/config.inc.php

Since I used a blank password for my mysql root, I need to enable support for it by uncommenting the following:

    $cfg['Servers'][$i]['AllowNoPassword'] = TRUE;

Then, at the bottom of the file I add the following lines:

    $cfg['SuhosinDisableWarning'] = true;   //disable the suhosin warning, since we've fixed it.
    $cfg['ThemeDefault'] = 'original';      //get rid of that ugly-ass pmahomme theme.
    $cfg['AjaxEnable'] = false;             //disable ajax requests, since they don't give any browser status while running
    $cfg['LongtextDoubleTextarea'] = false; //don't need HUGE text areas on longtext fields.
    $cfg['MaxRows'] = 50;                   //change the default row display count
    $cfg['PropertiesIconic'] = true;        //icon only row action links
    $cfg['DefaultTabTable'] = 'tbl_properties_structure.php'; // action for clicking table name is to edit the structure
    $cfg['LeftDefaultTabTable'] = 'sql.php'; //action for clicking the mini-icon is to browse
    $cfg['Export']['method'] = 'custom-no-form'; //disable the "quick" export feature.
    $cfg['Export']['sql_drop_table'] = true; //add DROP TABLE IF EXISTS to SQL table structure exports

Save the file and load up http://primal.test/myadmin/index.php

## Stage 5 - Configure Primal

As with the LEMP build, I used phpMyAdmin to create a new mysql user named primal with its own database.  From there I loaded the Primal.Visitor table schema, so I had a user to test database access with.

    $ pico /srv/www/primal.dev/www/config.php
    
From here I altered the `Connection::AddLink` call like so:

    Connection::AddLink(array(
            'method'        =>Connection::METHOD_MYSQL,
            'database'      =>'primal',
            'host'          =>'localhost',
            'username'      =>'primal',
            'password'      =>'primal',
    ));
    
## Finished

That's it, Primal is now running on a LAMP stack.
