---
layout: post
title: "Keep it simple, SOLIDs!"
alias: [/view/525, /view/525/Keep_it_simple_SOLIDs]
---

There's been a lot of attention in the PHP blogosphere lately about class design; a lot of focus on improving the structure of classes to facilitate testing and easier maintenance.  This is good, people should be paying attention to how they build their classes; I know just as well as anyone that nothing is worse than going back to an old project to add new functionality and realizing that your class structure simply wont facilitate it.

One of the buzzwords that I've seen tossed around lately is SOLID:

1. **S**ingle responsibility
2. **O**pen-closed Principle
3. **L**iskov Substitution
4. **I**nterface Segregation
5. **D**ependency Inversion

Much like MVC, SOLID defines a set of rules and guidelines for code design which help to keep things more organized.  And, just like MVC, the principles that SOLID teaches are excellent things to know, everyone should be educated on them and they should be kept forefront in ones mind while developing.  However, just like with MVC, sometimes I think people focus so much on the ideals and academic elements of these concepts, that they forget that ideal code isn't, ironically, always ideal.

The example I'm currently thinking of is [a post made yesterday by Freek Lijten](http://www.freeklijten.nl/home/2012/03/23/SOLID-The-S-is-for-Single-responsibility), where he explains how the first tenet of SOLID is applied.  He takes the concept of an Active Record – a data model capable of saving and recalling its state to and from the database – and shows how, under the SOLID guidelines, it should be split up into three separate disparate classes.

1. One to hold the state
2. One to compare the state
3. One to save and load the state.

I get it, the idea is the separate unique functionality, but there's some serious problems here.  

### Problem 1: Longer Implementation

The entire reason the concept of an Active Record was created was to save time in implementation.  Active Records make it so that you don't have to write extra code to preserve something, you just call `$data->save()` and be done with it.  Under Freek's example, the following:

    $a = new Bike(2);
    $b = new Bike(4);
    if (!$a->isEqual($b)) {
        $a->save();
    }
    
Becomes:

    $a = new Bike(2);
    $b = new Bike(4);
    $comp = new BikeComparator();
    if (!$comp->BikeComparator($a, $b) {
        $repo = new BikeRepository();
        $repo->save($a);
    }
    
You've now written almost 30% more code and am taking three times as much memory to perform the same task as before.  On top of this, the code is now more complex to read.  You've taken logic that should have been part of the class, and shifted it into the implementation, all in the name of making the classes easier to maintain.  Well what good is maintainable classes when you've gotta do more to use the classes?

What am I more likely to be doing, modifying the classes, or using them?  Where is the bulk of my time going to be?  For most developers, that time will be spent in the glue, linking classes together.  Creating classes is fun, but lets never forget that we need to use them.

### Problem 2: Pick a paradigm

As I see it, you're either doing OOP, or you're doing Functional Programming.  Freek's example is, to me, functional programming trying to disguise itself as OOP.  The whole point of having a member function on an object is to alter the state of that object.  Both `BikeComparator` and `BikeRepository` are stateless objects, they take up memory and add disk I/O purely for the sake of organizing code.  Why are we creating this hybrid of OOP and FP?

Furthermore, if you're going to use this functional approach, what do you even need the Bike class for in the first place?  Just use an array!


### Problem 3: The Steak Sandwich is now a Steak with Side Dishes

What Freek has created is no longer an Active Record, it's three completely different systems that are dependent on one another, but the only connection between them is the word "Bike" in their name.  Out of the context of their implementation each class contains no relation, in code.  One would have to rely on comments within the class files to identify how the three classes relate to one another.  

What happen if three months from now a new developer takes over the project and needs to compare two Bikes, but doesn't know that `BikeComparator` exists?  Unless Bike.php has a comment somewhere telling him to look for `BikeComparator`, he's gonna assume he needs to write a new comparison function.

### Problem 4: Why can't I hold all these classes?

Extending this Single Responsibility pattern even further, one would be forced to create a class for every task that might ever be associated with the Bike.  Is the bike in motion?  Do we need to turn the handle bars?  Apply the breaks?  There's three more classes you'd have to make, just to add a single function to the base object.

Why are we even using OOP when every task gets a new object?

##So what?

Some will probably say I'm nitpicking, that I'm over-analyzing an example.  Well, sure I probably am, but examples are what new developers use to comprehend the concepts they're being told, and teaching restraint is just as important as teaching the initial application.  This is the sort of thing that results in the MVC zealots who tear into people on public forums because they didn't put their business logic in a separate file from presentation code, or because they use linear includes instead of wrapping everything in a class.

A few months ago someone posted a password hashing library to Reddit.  This library contained no fewer than 12 classes, each in their own individual file, for a task that can be accomplished with [less than fifty lines of code](https://github.com/ChiperSoft/Primal.Visitor/blob/master/classes/Primal/SaltedHash.php).  When I asked the author why he made such a simple task into something so overly complicated, he said that's just the way they write code where he works.

> Maybe I've been spending too much time around Enterprise devs.

His project was the perfect example of what people who strictly follow SOLID produce, code that has become less maintainable, simply because nobody knows where the functionality they need to change is at, and less useful because nobody knows what part of the codebase does what they need.

But, hey, what do I know, I've only been doing this for nine years.
