---
layout: post
title: "PHP, The many meanings of static."
alias: [/view/526, /view/526/PHP_The_many_meanings_of_static.]
---

The term `static` has a lot of different uses in PHP.  It can change the accesibility of a function, alter the scope of a variable, and change what class a statement refers to.  This post will attempt to explain the different uses by way of examples.  Please note that this is not a complaint article, it is intended to be informative for those learning PHP.

Since all three use cases pertain to classes, lets first have a brief explanation of class behavior in PHP.  The following is an example of a PHP class that employs all three uses of the static keyword.  This example will be referenced thru-ought the article.

<script src="https://gist.github.com/2423482.js"></script>
    
### Conventions

Common PHP convention is to use the term "class" when referencing the uninstantiated base structure, and "object" when referring to an instance of that structure.  The above class would be instanced as an object by calling `new Foo()`.  PHP does not differentiate between functions and methods, and the terms are used interchangeably in most documentation. For the purposes of this article we will stick to the term "function".

The term "member" describes any variable or function that is accessible as part of an instanced object.  Static properties and functions are never referred to as members.

### Visibility

Please note that all of the functions and properties defined above are publicly visible.  PHP provides three levels of visibility:

1. Public - Accessible from anywhere
2. Protected - Accessible from inside the defining class and its subclasses
3. Private - Accessible from inside the defining class only

Visibility is defined by putting `public`, `private`, or `protected` before the property or class definition.  The keyword `var` can also be used in place of `public`.  Best practice is to explicitly identify functions and properties as being public, but any function defined without visibility is assumed to be public, as is any static property.


## Functions

Class functions, by default, are always member functions, and therefore only accessible on an instanced object (technically they can be accessed statically, but it's a bad idea, and will cause an error in `E_STRICT` mode).  Functions defined with the `static` keyword, as on line 11 of the example, exist not as member functions, but as directly accessible elements of the class itself, accessed using the double-colon operator like so:

    Foo::staticFunction();
    
Why would you want to do this, you ask?  Well, lets say you have a standalone function which just takes some input, processes it, and returns output.  There is no saved state for this function, once it's done all local variables are expunged.  As a member function, calling this from external code requires first creating an instance of the object it belongs to.  This is not only cumbersome (as you have to first create the object), but it also takes up memory that isn't needed.  Static functions are also very handy when using the singleton code pattern, as they provide an access point for fetching the singleton object without having to first create a singleton factory.

> Note: There is a camp of PHP developers that believe that static functions are evil and should never be used.  Their argument to this affect is that, because static functions can be called literally from anywhere in the codebase, then they are in fact a pollution of the global namespace.  This author is not of this mindset and feels that static functions are an invaluable tool when used in a stateless manner.  It is, of course, up to you the developer to choose which school of thought you prefer.

## Properties

Lines 3 and 5 of the example demonstrate the use of member properties and static properties, respectively.  A member property does not exist until the object is instantiated, and will cease to exist when the object goes out of scope and is destroyed.  In normal operation this property would be accessed like so.

    $blah = new Foo();
    $blah->memberProperty = 7;
    
Static properties, however, will always retain their state until the end of the request and never go out of scope.  Some example use cases are:

- Storing the current instance in a singleton pattern
- Storing a collection of values that never changes and needs to be accessed by multiple instances
- Caching unchanging data loaded from an external source (such as a database or http request)

As static properties do take up memory that is never released, it is best practice to use them sparingly and only in situations where a value must be stored for a long duration.  Static properties do not retain their contents across requests or multiple executions.

## Now hear `$this`

In some languages class functions execute within the scope of the entire object, with object properties directly accessible by their names.  PHP is not one of those languages, functions execute with their own scope and must directly reference their siblings as member elements.  This is done using the `$this` variable, which is present by default in the scope of every member function.  Attempting to reference `$this` from a non-member function will result in a PHP runtime error.

Line 16 of the example demonstrates the use of `$this` to interact with a member property.  Calling a member function works in an identical manner:

    $this->exampleD();
    
`$this` is one of four total methods for accessing the current object.

## Find your `parent`

Lets say that we were to create a subclass of Foo named Bar, and in that class we defined a new copy of `memberFunction()`.  To access the original version of memberFunction we would make use of the `parent` keyword.  In all cases, `parent` refers to the parent class directly, and calls functions on this class are invoked with the scope of the calling class.  The syntax for performing this is:

    parent::memberFunction();
    
This is true regardless of if the function is or is not static.

## Playing with my `self`

The `self` keyword always refers directly to the _class_ you are currently within.  `self` is used to reach static properties and functions (ex: `self::$staticProperty` or `self::staticFunction()`), or for creating a new instance of the class (`$o = new self();`).

The `self` property _always_ refers to the class it is used in, regardless of if the function using it was invoked as that class, or as a subclass.  This posed many problems, since it basically meant that no parent class could address a subclass' static properties.  This was finally corrected in PHP 5.3 with the addition of Late Static Binding, which brings us to the second usage of the `static` keyword.

## Static class referencing

As of 5.3.0, anywhere you use the `self` keyword can now be replaced with `static`:

- `static::memberFunction()`
- `new static()`
- `static::$staticProperty`

Whenever this is executed, PHP will return the subclass where the call stack originated at.  So if `Bar` calls a function that exists in `Foo`, and `Foo` calls another function on Foo, `static` will always reference `Bar`.  

Please note that in versions of PHP prior to 5.3, this will result in a syntax error.

## Function Level Static Scoping

The third and final use of the `static` keyword is for creating static variables, as shown on line 20 of the example class.  This behaves exactly like any other local variable, except that the contents are not lost when the function completes.  The variable will retain its value the next time the function is called, providing you with a value that can only be accessed by that function.

## In Conclusion

1. Static properties retain their value for the life of the program
2. Static functions are accessible from anywhere, and should be used in a stateless manner only
3. Late Static Binding allows you to directly access the originating subclass
4. Static local variables retain their value across multiple function calls

Hopefully, armed with this knowledge, you can now understand the following:

<script src="https://gist.github.com/2424548.js"></script>
