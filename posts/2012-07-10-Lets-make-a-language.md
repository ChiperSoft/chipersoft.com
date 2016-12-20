---
layout: post
title: "Lets Make A Language"
published: false
---

Jeff Atwood says that people need to stop bitching about how bad PHP is and actually product something to replace it.  Here's the problem with that statement tho, the people who complain about PHP already think they already have a better replacement.  If you ask them what language to use instead, odds are they'll tell you Ruby, Python, or Node.js.  If they're Enterprise developers they'll probably say Java or .NET.  All five of these answers completely miss the point.  They are viewing web programming from a programming perspective.

Programmers are not the people who made PHP the kingpin of the web that it is today.  If your biggest problems with PHP all stem from the fact that the language doesn't behave like the languages you learned in college, you are not PHP's target audience.  You do not have the niche that PHP fills, and that makes you completely unqualified to create something that could replace it.

My first programming language was JavaScript, it's the language that I learned the basics of programming in.  Unlike seemingly a lot of people, I've never had any problems understanding how JS works.  I don't see what the hell is so weird about prototypical inheritance (sure, classes are easier, but it's not all **that**  different).  I've never had problems with data types or comparisons going awry.  I've never found navigating the DOM to be all that awful (yes, it could be a lot easier, but it's a tree structure, it's really not that complicated).  I've been making websites since 1994, and I've never found any of the web technologies to be confusing.

My second language was AppleScript, my third language was REALbasic.  I dabbled with Pascal and FORTAN a bit in high school, and then I went to college.  I learned C, I learned Java, I learned Assembly.  I learned how arrays, linked lists, binary sorts and other rudimentary data structures are done.  I learned how network stacks and transfer protocols work.  I learned how to do GUI programming in Windows using C++.  I learned how to do GUI programming on the Mac in Objective-C.  I learned how to write servlets.  I've written both servers and clients for dozens of protocols in multiple languages.  

Then, I learned PHP, and I learned that don't want to deal with any of that shit ever again.  I don't want to handle memory management, juggle pointers or convert data types.  I don't want to handle http requests or manage a daemon.  I don't want to try to abstract my data on to a templating language that bears no similarity to the rest of my code.  I don't want to be constrained into a pre-defined file structure, or a framework built by someone I've never met.  Separation of business and presentation logic is always important, but if I want to spit out some HTML from within an object, I don't want to have to create a string and pass it to some response gateway.  If I've got a page that's mostly static content wrapped in a template, I like being able to just toss in a couple includes around normal HTML.  I like being able to say `if ($value)` and not worry about if the value is undefined, an empty string, a 0, or a string containing a 0.  

Last year I learned Python, looked into Ruby and dabbled with CoffeeScript.  From them I learned that I hate languages with significant whitespace (tho I should have known that from my experience with Pascal).  I regularly use Node for testing API calls and writing basic maintenance scripts.  From it I learned that I hate having to manage my own event loop.

In short, I just want to make web apps, quickly and efficiently, and under my own terms.  I am exactly the nitch that PHP is built to fill, and I feel like that puts me in an ideal position to design a language that could replace it; because, yes, it does need to be replaced.  I will be the first to admit that PHP has 15 years of cruft still dragging behind it, and the only way to clean it out will be to start over.  The standard toolkit wasn't designed, it was cobbled together by bits and pieces of C code.  OOP was added half way into PHP's lifespan, it's taken 8 years to get it right, and there's still things that need fixing.  None of these things can be improved without completely gutting the language, breaking all backwards compatibility, and under the current regime that will never happen.

The only option is to build a new language entirely.  Alas, I lack neither the experience or the knowledge to implement even a language parser, much less a JIT bytecode compiler.  That, however, doesn't keep me from designing what I believe such a language should be.  Perhaps someone who *does* have this experience will find this document and use it as a roadmap to build such a language.  I shall call this language...

## W

Why W?  For "Web", obviously.  Also, because it seems that every language needs a moniker with under four characters, and the letter W doesn't appear to be taken.

First lets start with the basics, the very foundation.  What has made PHP the single most popular language for server side development?  Some people will tell you it's that it's extremely easy to deploy.  This is not a cause, it is an effect, it is the result of the runtime blending so well with Apache, and there being so many hosting companies supporting it.  This is also used as a reason, but again we are looking at effect instead of causation. If you go back 15 years ago PHP was barely getting started, the most popular languages for server side applications were Perl, Java and C.  The reason we have so many PHP hosts today is because there are so many PHP developers who need hosting.  So why are there so many PHP developers?

It all starts with a simple command: `<?php include 'header.html'; ?>`.  You've got a static website, every single page on the site needs to have the same header and footer HTML, and it gets really frustrating copying and pasting all that boilerplate to every single page, especially if you need to alter it after a dozen or more pages have been made.  Tools were invented to help with this sort of thing – Dreamweaver has an excellent templating system that handles the automatic insertion and updating of templates, for example – but these tools cannot match the simplicity of a single line at the top and bottom of the page.

I would wager that _at least_ half of all PHP developers started with this one simple task, of automatically including a chunk of HTML inline with a chunk of other HTML.  They didn't have to create a full application stack, they didn't have to move their code into a cgi-bin folder, they probably didn't even have to change any server configuration.  All they had to do was change the filename from `.html` to `.php`, and suddenly their lives were significantly easier.  Next they added a `date()` call to the footer to make sure the copyright was current.  After that they built a basic POST form submit that handled contact emails.  They started performing primitive CMS tasks by reading in from static data files.  Eventually they found some example code for how to connect to a database and created a basic news feed.

This is the single most important feature that any PHP replacement **must** have.  Coding purists loath it, MVC zealots cry out in pain over it, and every poor PHP newbie who has stumbled into a discussion forum quickly finds themselves abused for it, but without it PHP would never have become the juggernaut that it is today.

### W must...

- ...be embeddable within html.
- ...be usable alongside static assets without any other framework or configuration beyond installation of the runtime
- ...be pluggable into the existing major web servers (Apache, nginx, lighttp, IIS)
- ...be able to include entire chunks of html or code directly into the execution thread

Engine

- Pages executed as code, same as PHP.  Runs as FastCGI, using an FPM.
- Configuration file is json.  Any page can load in a new config to be merged on top of existing config settings, but it must be loaded at the start of the request.
- Must have a standard toolkit that is as complete as PHPs
- Needs autoloading
- Should be event driven, but that eventing should be handled at the runtime level, not forced upon the developer.  There is nothing wrong with halting the current execution thread while an I/O operation completes.  The majority of my I/O operations will be collecting data to output, so I don't have anything to do until those operations are done, anyway.  Give me a way to fire off chunks of code outside of the current execution stack and keep my I/O functions

Syntax:

- No significant whitespace, it doesn't work when embedded in html
- Uses prototypical inheritance, but has class keyword to allow usage in a classical manner
- Object wrapped literals (strings, numbers, arrays), same as JS.
- Period denotes member reference, same as JS
- Fixed point decimal type built in (default over floats?)
- Semi-colons required
- Code contained inside <? ?> blocks, same as PHP.  May be omitted if certain file extension.

Functions

- Brackets ({}) always create a function from the code contained inside, but every function is an object.  If js object notation is used the only action taken is to assign values to the function object.
- Scoping and variable initialization follow JavaScript rules.
- Parens before the function for identifying parameters are optional
- Parameters list supports default values, separated by equals.  Example: `(foo = 1, bar = 2)`
- Functions can be invoked in order or with named parameters.  Example: `myFunc(foo:20)`
- Keywords before the braces determine how and when the function is invoked.  If no keyword, or is an assignment, function is invoked immediately.
- `var foo = {return blah;};` is invoked instantly and the return assigned to foo.
- `function [Name]` or `<=` identifies that the function should not be immediately invoked, but rather assigned.  If no assignment operator is defined with the former syntax, function is assigned to current scope container using the provided name, which is used for the `this` keyword within that function.  If no name is provided, or the later syntax is used, a syntax error occurs.
- `namespace Name` executes the function immediately, as the defined scope.  The name is relative to the root namespace, unless it begins with the `space` keyword, which identifies as a child of the current namespace.
- `if ()` keyword only calls the function if the contents of the parens are true
- `select ()` calls the function, assigning the value within the parens to a hidden var only accessed by the `case` keyword
- `after` identifies the function as a background action to be executed after the request/main execution completes, passing the values in the parens.
- `defer` identifies the function to be called at the end of the event loop.
- `for ()`, `while ()` and `do ()` all loop as expected.
- All function keywords can be applied to a stored function.  Example: `select (myVar) myFunction;`
- `class NameA [extends NameB][ implements NameC]` identifies the function as a prototype and assigns it to the current namespace as the passed name.  The addition of the `extends` keyword automatically assigns the prototype chain.  The addition of the implements keyword tells the engine to throw an exception if the new function does not contain the values defined by the following object name.
- `private`, `protected`, `public` and `const` keywords substituted for `var` define the variable as a member of the containing function, with the respective access rules and bring it into local scope.
- `this` keyword defines current member assignment, `space` keyword identifies current explicit namespace
- `new` keyword executes the passed function as a new scope.  If a constructor is defined within that scope, it is executed as well.

Strings
 
- Uses python's string indexing (ie string_var[-4, 2] for substrings)
- Unique operator for string concatenation, recommend two character ($ or @?)
- '' for string literals, "" for string templating using {variable} syntax.