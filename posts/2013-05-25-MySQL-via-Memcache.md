---
layout: post
title: "Introduction to using MySQL as a NoSQL store via Memcache"
---

New in MySQL 5.6 is support for interacting with a table as a raw key/value store, bypassing the SQL parser and make direct reads and writes to and from tables without the overhead of domain specific language.  This direct access affords significant performance gains and makes it much easier to use MySQL as a document store.  This is accessed via an interface most PHP developers are familiar with, Memcache.

### Installing MySQL 5.6 on Ubuntu 12.04 64bit

> If you have vagrant installed you can skip over the installation step by cloning my premade vagrant/chef repo, which will get you right up to enabling the memcache plugin.

> [https://github.com/ChiperSoft/mysql56-playground](https://github.com/ChiperSoft/mysql56-playground)

At the time of writing this article there are no pre-existing apt packages to install MySQL 5.6, so to get a development environment up and running we will need to install it manually using the debian package that Oracle has provided (you will need a different package for 32bit).  I'm assuming at this point that you already have a working Ubuntu Server setup.  Additionally, all these commands must be run as an administrator, either via sudo or as root directly.

The debian package lacks any of the system configuration elements that we will need, so to save us a lot of effort lets install MySQL 5.5 first.  We will also need LibAIO, an Asynchronous I/O library used by 5.6.

    $ apt-get install mysql-server-5.5 mysql-client-5.5 libaio1

Once this is done, download the 5.6 package, install it and set the correct account permissions.  We're also removing the new server's conf file (note, I'm not positive this is needed, but it was in the chef recipe I got this from).

	$ wget http://cdn.mysql.com/Downloads/MySQL-5.6/mysql-5.6.10-debian6.0-x86_64.deb
	$ dpkg -i mysql-5.6.10-debian6.0-x86_64.deb
	$ chown -R mysql /opt/mysql/server-5.6/
	$ chgrp -R mysql /opt/mysql/server-5.6/
	$ rm /opt/mysql/server-5.6/my.cnf

We're setting up this service as `mysql.server`, so lets copy in the init.d settings.

	$ cp /opt/mysql/server-5.6/support-files/mysql.server /etc/init.d/mysql.server
	$ update-rc.d mysql.server defaults

Now we can remove the old 5.5 server.

	$ service mysql stop
	$ apt-get remove mysql-server mysql-server-5.5 mysql-server-core-5.5

The debian package expects my.cnf to be in /etc, so we need to move the existing file and then update it with the new locations.

	$ mv /etc/mysql/my.cnf /etc/my.cnf
	$ nano /etc/my.cnf

Alter the following options:

	$ basedir = /opt/mysql/server-5.6
	$ lc-messages-dir	= /opt/mysql/server-5.6/share

Now run the setup script and set the execute permissions before starting the server:

	$ /opt/mysql/server-5.6/scripts/mysql_install_db --user=mysql --datadir=/var/lib/mysql
	$ chmod 0744 /var/lib/mysql
	$ service mysql.server start

Assuming all went well and good, you should now be able to connect to the server.

	$ mysql -u root -p

From inside the MySQL shell:

	mysql> select version();
	+-----------+
	| version() |
	+-----------+
	| 5.6.10    |
	+-----------+
	1 row in set (0.00 sec)

However at this point the memcache plugin is not yet enabled.

### Enabling the Memcache interface.

Before we can enable the interface we need to create the configuration tables that the plugin will use.  Back at the terminal:

	$ mysql -u root -p < /opt/mysql/server-5.6/share/innodb_memcached_config.sql

This creates a new database named `innodb_memcache` containing three tables.  The first, `cache_policies`, controls the behavior of the memcache plugin, but isn't important at the moment.  The second, `config_options`, contains some basic settings that the plugin uses when parsing the memcache requests.

- **separator** is the delimiter used for splitting values up into multiple columns. In this install it defaults to a pipe (|) but some packages may use a comma.
- **table\_map\_delimiter** is used to split a container name from the key name when requesting directly from a specific table.

Both of these values will be explained below.  The third table, `containers` is the one we need to setup for now.

    $ mysql -u root -p
	mysql> select * from innodb_memcache.containers;
	+------+-----------+-----------+-------------+---------------+-------+------------+--------------------+------------------------+
	| name | db_schema | db_table  | key_columns | value_columns | flags | cas_column | expire_time_column | unique_idx_name_on_key |
	+------+-----------+-----------+-------------+---------------+-------+------------+--------------------+------------------------+
	| aaa  | test      | demo_test | c1          | c2            | c3    | c4         | c5                 | PRIMARY                |
	+------+-----------+-----------+-------------+---------------+-------+------------+--------------------+------------------------+
	1 row in set (0.00 sec)

It also creates a demo_test table in the test database.

	mysql> select * from test.demo_test;
	+----+--------------+------+------+------+
	| c1 | c2           | c3   | c4   | c5   |
	+----+--------------+------+------+------+
	| AA | HELLO, HELLO |    8 |    0 |    0 |
	+----+--------------+------+------+------+
	1 row in set (0.00 sec)


Because of the limited range of accessibility that a key/value system provides, InnoDB does not expose all tables to the memcache plugin. You must create containers to map a table's values into a structure that memcache can support.  This is the purpose of the `containers` table.  The container columns do as follows:

- **name**: This is the name that will be used inside memcache to refer to the collection.  If a collection named `default` exists then the plugin will always use that collection upon initial connect, otherwise it defaults to the first entry in the table.
- **db_schema**: Database name
- **db_table**: Table name
- **key_columns**: The column to use for the key lookup. Don't let the plural name fool you, currently this only takes a single column.
- **value_columns**: The column or columns that data will be pulled from and stored to. This is where the separator configuration comes in. Multiple column names can be defined by combining them with the separator value.  Example: firstname|lastname would pull data from both a firstname and lastname column.
- **flags**: The column to store memcache flags in, an integer used to mark rows for memcache operations. If multiple columns are defined in `value_columns` then the flag column will be used for memcache `incr` operations.  This column is optional for basic get/set operations, but is needed for full memcache compliance.
- **cas\_column** and **expire\_time\_column**: These two columns are used for storing memcache compare-and-swap and expiration values. According to the official docs, these are rarely needed and can be left NULL unless you want full memcache compliance.
- **unique\_idx\_name\_on\_key**: The name of the index to use for the key column. It _must_ be a UNIQUE index, and it is recommended that you use the primary key for the table. You can simply use "PRIMARY" in that case. I do not recommend using an auto incrementing index, as you cannot insert to an auto incremented key.

Changes to the containers table require restarting the server (or at least the plugin) for change to full take effect, so before we enable the plugin lets create a new table and container to experiment with.

    mysql> CREATE TABLE `test`.`users` (
      `user_id` varchar(32) NOT NULL DEFAULT '',
      `first` varchar(100) DEFAULT NULL,
      `last` varchar(100) DEFAULT NULL,
      PRIMARY KEY (`id`)
    ) ENGINE=InnoDB

Currently we don't have a `default` container, so we'll use that as the name for the new container.

    mysql> INSERT INTO `containers` (`name`, `db_schema`, `db_table`, `key_columns`, `value_columns`, `unique_idx_name_on_key`)
    VALUES ('default', 'test', 'users', 'user_id', 'first|last', 'PRIMARY');

Now we're ready to turn on the plugin.

    mysql> INSTALL PLUGIN daemon_memcached SONAME 'libmemcached.so';
    mysql> SHOW plugins;

You'll get a huge list of plugins, but near the bottom you should see:

    | daemon_memcached           | ACTIVE   | DAEMON             | libmemcached.so | GPL     |
    
Exit back out to the shell and run:

    $ sudo netstat -tap
    Active Internet connections (servers and established)
    Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
    tcp        0      0 localhost:mysql         *:*                     LISTEN      3167/mysqld     
    tcp        0      0 *:11211                 *:*                     LISTEN      3167/mysqld     

Note that mysql is listening on port 11211 now. This is the memcache interface up and running.

### Testing the interface.

We could create some code here, but it's much simpler to just connect directly and issue some commands.

    $ telnet localhost 11211
    Trying 127.0.0.1...
    Connected to localhost.
    Escape character is '^]'.

Lets store a value.

    set foo 0 0 14
    Jarvis|Badgley
    STORED

- `set` tells memcache that we want to store a value,
- `foo` is the key to store it under
- The first `0` is the flags to use
- The second `0` is the expiration TTL
- The `14` tells it the length of the string that we're going to store.
- `Jarvis|Badgley` is our value to store.

Because we defined two columns in our container definition, we can split the two values with a pipe to send them to the respective columns.  **Note**: I have not found any information indicating how to escape a character to avoid a false column separation, so be aware of the need to avoid having the delimiter character in your stored data.

    get foo
    VALUE foo 0 14
    Jarvis|Badgley
    END

Now if we query mysql we can see our value stored in the table:

    mysql> select * from `test`.`users`;
    +-----+--------+---------+
    | id  | first  | last    |
    +-----+--------+---------+
    | foo | Jarvis | Badgley |
    +-----+--------+---------+
    1 row in set (0.00 sec)

The memcache interface also supports directly addressing a specific container.  We still have our `aaa` container defined from the test table that the setup created, which has a value under the key "AA".  You can address a specific container by prefixing its name with @@, and placing a period between the container name and the key name.

    get @@aaa.AA
    VALUE @@aaa.AA 8 12
    HELLO, HELLO
    END

The `table_map_delimiter` configuration value that I mentioned earlier controls what character is used to separate the container name from the key name.

You can also switch containers for all future requests by performing a get on just the prefixed container name.

    get @aaa
    END
    get AA
    VALUE AA 8 12
    HELLO, HELLO
    END

The connection will continue to use that container until you change it or disconnect, much like the USE command in SQL.

Now lets exit out of the memcache connection and get some simple PHP code working.  Press control-] and enter to return to the telnet prompt.

    ^]

    telnet> quit
    Connection closed.

### Connecting with PHP

I've installed php5-cli with the php5-memcache module, so lets make a basic bit of code.

    <?php
    $memcache = new Memcache;
    if (!$memcache->connect('localhost', 11211)) throw new Exception("Could not connect");

    if (!$memcache->set('bar', 'John|Smith')) throw new Exception("Could not store value");

    $memcache->get('@@aaa'); //switch containers
    $result = $memcache->get('AA');

    var_dump($result);

And now we run it from the shell:

    $ php -f memcache.php 
    string(12) "HELLO, HELLO"
    
And inside MySQL we can now see our new "bar" value stored.

    mysql> select * from test.users;
    +-----+--------+---------+
    | id  | first  | last    |
    +-----+--------+---------+
    | bar | John   | Smith   |
    | foo | Jarvis | Badgley |
    +-----+--------+---------+
    2 rows in set (0.00 sec)
    
## Conclusion

The feature is still young and has a few problems.  For example, data written to the memcache interface goes into a memory buffer before becoming available via the standard mysql interface.  Sometimes it would take several seconds before I could see my changes from one side appear on the other side, in both directions.  This also occurs when changing the container configuration, which is why I recommend restarting mysql after doing so.  The configuration of containers is also not very friendly, and you receive no indication why something is setup wrong, or sometimes even IF it is setup wrong, you simply can't access your data via memcache, or the memcache writes end up going into a different table.

There is no doubt in my mind that this new interface is going to be a massive boon to scalability.  In my next post I will show how you can use this interface to create a multi-columned data object model.

### References

- [http://dev.mysql.com/doc/refman/5.6/en/innodb-memcached-internals.html](http://dev.mysql.com/doc/refman/5.6/en/innodb-memcached-internals.html)
- [http://www.howtoforge.com/how-to-install-mysql-5.6-on-ubuntu-12.10-including-memcached-plugin-p2](http://www.howtoforge.com/how-to-install-mysql-5.6-on-ubuntu-12.10-including-memcached-plugin-p2)
- [https://blogs.oracle.com/mysqlinnodb/entry/get_started_with_innodb_memcached](https://blogs.oracle.com/mysqlinnodb/entry/get_started_with_innodb_memcached) (somewhat out of date)
- [https://blogs.oracle.com/mysqlinnodb/entry/new_enhancements_for_innodb_memcached](https://blogs.oracle.com/mysqlinnodb/entry/new_enhancements_for_innodb_memcached)
- [https://github.com/ChiperSoft/mysql56-playground](https://github.com/ChiperSoft/mysql56-playground)