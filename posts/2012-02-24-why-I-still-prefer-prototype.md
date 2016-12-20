---
layout: post
title: "Why I STILL prefer Prototype over jQuery"
alias: [/view/510, /view/510/Why_I_prefer_Prototype_over_jQuery, /view/510/Why_I_STILL_prefer_Prototype_over_jQuery]
---

> **Update, February 24th, 2016**: Since I wrote this version of this post my opinions on the topic have waned a bit. I no longer use Prototype in my web development, and have by and large accepted jQuery for most things DOM related. As the JS ecosystem has pushed towards modules and components, libraries which affect the entire runtime are less and less useful, and in the meanwhile most of Prototype's tooling has found its way into ES6 and ES7. I still feel that all my points and criticisms in this article are valid, but I have long since given up the fight for Prototype and I recommend against using it.

This is the second draft of an essay that began as [a response on Reddit](http://www.reddit.com/r/webdev/comments/gzum1/what_javascript_plugins_do_you_use/c1rjpap?context=3) for why I prefer the Prototype.js + Scriptaculous.js (Protaculous) combination infavor of the much more popular jQuery library.  The original version of this essay was posted on April 29th, 2011.  Since then I've learned a lot both about Javascript in general and about jQuery, and I felt that the text needed a refresher.  This is a work of opinion and far from definitive, it's just why I personally find Prototype to be more conducive to building large web apps than jQuery.

Before I start hashing out details, lets discuss the two fundamental differences between jQuery and Prototype.

## Section 1 - Prototype is a Framework, jQuery is a Library.

All the time I hear people refer to jQuery as a javascript framework; jQuery is **not** a framework, it is a library.  What's the difference, you ask?  Lets ask Wikipedia:

**[Library](http://en.wikipedia.org/wiki/Code_library)**:   
> a library is a collection of resources used to develop software.

I would add to this definition that a library is a closed ecosystem with its own scope.  You make calls to a library and the library responds.  A library performs tasks for you that you could probably do yourself, but not as easily.

**[Framework](http://en.wikipedia.org/wiki/Software_framework)**   
> a software framework is an abstraction in which software providing generic functionality can be selectively changed by user code, thus providing application specific software. It is a collection of software libraries providing a defined application programming interface (API).
>
> Frameworks contain key distinguishing features that separate them from normal libraries:   
> - inversion of control - In a framework, unlike in libraries or normal user applications, the overall program's flow of control is not dictated by the caller, but by the framework.  
> - default behavior - A framework has a default behavior. This default behavior must actually be some useful behavior and not a series of no-ops.  
> - extensibility - A framework can be extended by the user usually by selective overriding or specialized by user code providing specific functionality.  
> - non-modifiable framework code - The framework code, in general, is not allowed to be modified. Users can extend the framework, but not modify its code.  

A framework provides an underlying organization and structure for how code is written and how individual libraries interface with each other.  A JavaScript framework dictates how a JavaScript application is written.  Prototype meets this definition by extending language semantics and providing a classical inheritance model.  Your code is built on top of the foundation that Prototype creates.

Is the difference clear yet?  If you were building a house, Prototype provides the concrete, timber and glass, while also giving you the power tools to put them together.  jQuery is just a drill.

"Now wait a minute" some might say, "what about jQuery Plugins?  Those meet the framework definition."  You're right, they do, but only within jQuery's own eco-system.  If jQuery is a drill, jQuery Plugins are drill bits.  No sane person is going to build an entire web app as a jQuery plugin.

## Section 2 - Goals and Approaches.

If you are fairly new to JavaScript, you may not be familiar with [Prototypal inheritance](http://en.wikipedia.org/wiki/Prototype-based_programming). The wikipedia page can do a better job explaining than I can, but one of the features of this is that any object can be extended by outside code and the definition level.  This is extremely useful in this day and age because it can be used to add new Javascript features, such as Function.bind(), onto engines that lack them (this is commonly referred to as a polyfill).

The reason Prototype is called Prototype is because nearly everything it provides is done so by extending the native Javascript objects.  It adds functions onto the prototypes for Object, Number, String, Date, RegExp, Array, Function, Event, and (most importantly) Element.  It also adds a variety of new objects to the global namespace, such as Template, PeriodicExecuter, Enumerable and Hash.  Prototype embraces the OOP design pattern, having the functions that alter the state of any object always be members of that object.

A lot of developers frown on this behavior, believing that the global namespace should be touched as little as absolutely possible.  This way they can ensure that multiple libraries never conflict with one another, and indeed Prototype's method of extending the base classes can and does cause conflicts with libraries that don't expect it.

jQuery is built on the the polar the opposite paradigm, functional programming.  The object being manipulated is always passed around to different state altering functions.  This may not be immediately obvious, since all of jQuery's DOM manipulation functions are members of an object that represents the Element being altered, but those functions are simply passed the element from inside the collection instead of as a function argument.  jQuery never extends base classes, only exposes two global variables, and provides a `noConflict()` function to remove even that.  

This is extremely important for what jQuery is built for, as its target audience is designers who will be using far more third-party code than their own.  Reducing conflicts is a high priority in that scenario, and I understand it... but for large applications, that is an extra level of abstraction that just slows things down.


## Section 3 - Namespaces & Organization

jQuery essentially has two namespaces, the `jQuery` object (aka `$`), and the jQuery Collection (aka `$.fn`).  Everything that jQuery provides is put into these two folders. Everything jQueryUI provides is put into these two folders.  Everything that jQuery Mobile adds is installed into these two folders.  Everything that every single jQuery Plugin adds is installed into these two folders.  Even plugin authors are encouraged, nay, required to also throw their functions into these two buckets.  This means several things:

1. Plugins have to fight with jQuery itself for name-spacing.  Ironically, the conflict prevention that jQuery hoped to provide by staying out of the global namespace has created its own conflict.
2. There's no natural organization of commands within the library.
3. There's no context to what a function does.  Take the .size() function for example. If you didn't know that function returns the total number of elements found by Sizzle, would that be your first guess?  How about .each() -- $.each() performs a completely different function from $().each().
4. Functions for performing AJAX requests sit alongside functions for manipulating arrays and objects.  
5. Functions for getting and setting element properties sit alongside functions for animating and third party code for creating UI widgets.

Granted, Prototype is a little guilty of this itself, you do get a lot of different functions attached to the Element prototype, but is all done via mix-ins adding functions from individual namespaces, and it only adds functions that are directly relevant to the element type.  Only form elements get the functions that are relevant for form elements, and functions that have nothing to do with an Element don't get put on the Element object.

Event functions are on the Event object, DOM functions are on the `Element` object, Array functions are on the `Array` object, Collection functions are on the `Enumerable` object, XHR functions are on the `Ajax` object. Everything is in its proper place.  This also makes the reference docs MUCH easier to navigate, since the relevant documentation for a function will be under the datatype that function alters.

Where Prototype is a forest, jQuery is a single tree with only one limb and a ton of leaves.


## Section 4 - Ambiguous Behavior

For the sake of brevity, jQuery loves to have functions that perform multiple tasks based on how they are called.  Lets take the base `$()` function:

- `$(function)` binds a callback to the DOM Ready event.
- `$(Element)` returns the element wrapped in a jQuery Collection
- `$('#element_id')` looks up the element by id and returns it wrapped in a jQuery Collection.
- `$('<tag>')` creates a single Element and returns it in a jQuery Collection.
- `$('string')` uses the string as a CSS selector and performs a search within the document, returning a jQuery Collection of matching nodes

jQuery's `$()` function has no syntactic relevance on its own, you have to examine exactly what is being passed into that function to know what the function is doing.  To its credit at least the function (almost) always returns the same thing... a jQuery Collection.  If you're new to jQuery you're probably wondering what is.

As I said in section 2, jQuery never adds anything to the DOM Elements it manipulates.  Every time you call `$()` with a reference to an element, jQuery creates a jQuery Collection (note, this is my term, I don't know what the jQuery team calls it) and adds that element to the collection.  All of your manipulation calls such as `.css()` or `.addClass()` take that collection and perform their task upon every Element contained within.  From the perspective of you the developer, you are directly manipulating the page, but in reality jQuery is acting as a middle-man.

Now, a jQuery Collection is an array – it has all the properties of an array, you can call all array native functions on it, you can access its contents with square brackets just like an array, and if you send it to the debug console it outputs as a standard array.  But here's the thing, you're not supposed to use this array as an array.  The intention is that this array will only every be interfaced with via the functions that are mixed in from the `$.fn` namespace.

Lets compare all this to in Prototype:

- `$('string')` performs document.getElementById() to fetch the element.  On older browsers that don't properly extend the Element prototype, it will apply the extensions before returning the element.
- `$$('string')` uses the string as a CSS selector and performs a search within the document.  It returns an array of extended elements that matched the selector.
- `new Element('div')` creates a single Element and ensures it has the Prototype extensions.

There is no ambiguity here, every function only performs one task.  There's no wrappers, there's no abstraction, you get what you asked for.  Even `$$()` returns just a simple array (technically it's an `Enumerable`, which is a Prototype subclass of `Array`).


## Section 5 - Ambiguous Traversal

Both jQuery and Prototype have functions such as `next()`, `prev()` and `parent()` for traversing through the DOM structure.  In Prototype these functions only exist on singular elements, and only return singular elements, because naturally they are related to the element they are a member of.  In jQuery, however, the collection can contain multiple Elements.  These functions will perform the action on every Element in the collection, and return a new collection with just as many elements.  

So lets say you've got some image on the page that you want to perform some actions on, such as animating a movement across the screen.  The element you want to alter doesn't have any distinctive attributes, but one of its children does, so you construct a CSS selector that references that child and then call `.parent()` to get the element you actually want to manipulate.  There's a problem tho, your selector wasn't specific enough.  jQuery grabbed another element in addition to the one you wanted, and that `parent()` call just grabbed the site logo and animated it across the entire header.

Now imagine this was done by co-worker in a site-wide library, and you have no idea what it is happening or where to start looking.  Welcome to the wonderful world of multiple-traversal.

Personally, if I want to traverse multiple elements at once, I'll do it myself.


## Section 6 - Ambiguous Function Names

- click()
- focus()
- load()
- change()

Pretend you know absolutely nothing about jQuery (this may not be hard).  What would you naturally assume these functions do?  If you thought it did what it says it does, you would be wrong.  All four of these functions take a callback and attach it to each of the collection's contents as an event handler.

[Google Style Guide](http://google-styleguide.googlecode.com/svn/trunk/cppguide.xml#General_Naming_Rules):

> Function names, variable names, and filenames should be descriptive; eschew abbreviation. Types and variables should be nouns, while functions should be "command" verbs.

The [Apple Cocoa Coding Guidelines](https://developer.apple.com/library/mac/#documentation/Cocoa/Conceptual/CodingGuidelines/Articles/NamingMethods.html), [Adobe Flex Guide](http://opensource.adobe.com/wiki/display/flexsdk/Coding+Conventions#CodingConventions-Methodnames), [Sun's Java style guide](http://java.sun.com/docs/books/jls/second_edition/html/names.doc.html), and the official [C++ Programming](http://en.wikibooks.org/wiki/C++_Programming/Code/Statements/Functions#Declarations) guide all recommend that function names should be verbs indicating the action that the function performs.  jQuery defies this convention repeatedly.

- css()
- offset()
- width()
- html()
- size()
- stop()
- live()
- prop()

None of these function names indicate what they do and some of them plain don't mean what you expect them to mean.  All of them also perform different actions based on what they are passed.

By comparison, these are the Prototype equivalents (# indicates it is a member function of an instance):

- Element#on('click', callback)
- Element#on('focus', callback)
- Element#on('load', callback)
- Element#on('change', callback)
- Element#setStyle()
- Element#getPositionedOffset()
- Element#update()
- Enumberable#length
- Effect#stop()
- document.on(eventName, selector, callback)
- Element#readAttribute()


## Section 7 - Animation and Effects

Scriptaculous' Effects.js makes jQueryUI's Effects toolkit look like child's magic set.  For example, this is an animation set from the main slider on [the homepage for the company I work for](http://www.netfinity.net):

<script src="https://gist.github.com/1903079.js"></script>

That's six parallel animations performed over 0.8 seconds using a custom transition, executing actions before the animation starts and after it completes.  All six animations use the same frame cycle, so each element is updated in unison. I can save that Effect.Parallel object and rerun it over and over again by calling one line of code.

Here's a rough example of what the jQueryUI code would look like to do this:

<script src="https://gist.github.com/1903083.js"></script>

Yes, it's less code, but there's some key differences here.

1. There is nothing binding all of these animations to a central key-frame timer, so there's no guarantee that all these animations will occur in sync.  On a slow computer each element may animate on its own cycle as the setTimeout calls complete in series.  It makes the performance of the animation much less fluid.
2. There's nothing allowing me to perform an action when all animations have completed, so I just have to hope that the first one I call completes at the same time the others do.
3. The easeOutQuad transition and the .switchClass() methods are not part of jQuery core, but you'd never know that looking at the code.  You wouldn't even know that switchClass is an animation.
4. I had to duplicate a LOT of values here.


## Section 8 - Other Nit-picks

These are all little things in jQuery that bug me, none of which merit a section of their own.

1. `$().each` iterates over each element in the collection.  These elements are passed to your callback raw, without the jQuery wrapper, so 90% of your callbacks will have `element = $(element)` as the first line of code.

2. `$.each` and `$().each` both pass first the index, and then the value to the callback.  This means that if I have no need for the index, I can't just leave it off the function declaration like I can in Prototype.

3. `$().serializeArray()` returns an array of objects containing element names and values as separate keys.  That's all well and good, but I prefer Prototype's `Form.serialize(true)`, which returns a key:value paired object, with arrays as the value if a key occurs multiple times.  It is closer to what PHP outputs and is just so much easier to debug.

4. `$().find()` includes the contents of the collection in the search, you have to do `$().contents().find()` to prevent a selector from matching the parent.

5. `$().parent()`, `$().parents()`, and `$().parentsUntil()` confuse the hell out of me, none of them seems to be equal to Prototype's `Element.up()` function.

6. jQuery has no equivalent to Prototype's [Element.Layout](http://api.prototypejs.org/dom/Element/Layout/) for calculating an element's dimensions when it is `display:none` or not attached to the page.

## Section 9 - Where jQuery gets it right.

1. `$().appendTo` - Why the hell doesn't Prototype have this?  I even submitted a pull request to Prototype to add a similar syntax to `Element.insert()`, but the request was turned down as being inconsistent with the way insert is syntactically structured.

2. Returning false in a `$.each()` callback cancels the loop.  Why the hell does Prototype rely on throwing an exception to do this?

3. Returning false in an event callback prevents propagation, Prototype requires calling `event.stop()`

4. Prototype has no shorthand equivalent to `$(function)`, the only option is `$(window).observe('dom:ready')`, and half the time I can't remember if it's `window` or `document`.

5. `$().trigger()` works for all events.  Prototype's `Element.fire()` only works for custom events.

6. Prototype has no equivalent to `$().hover()`, although there is a third-party lib to add it.

7. The css selector for Prototype's `Element.select()` is scoped at the element, where jQuery's `$().find()` is scoped at the root of the page.  This means that in Prototype I cannot use `select()` to match an element using on a selector further up the parent tree.

## Conclusion

The final nail in the coffin for me is simply that there's a lot of things Prototype can do that jQuery can't, and very little jQuery can do that Prototype doesn't support.  Prototype offers me numerous extensions to manipulating strings and arrays, jQuery just gives me $.each() and $.trim().  Prototype gives me a system for doing Classical inheritance, jQuery gives me nothing.

Sadly, Prototype is dying.  Even tho Prototype is the second most popular DOM library for developers (largely thanks to Ruby), the community support for it is almost non-existent when viewed next to jQuery.  Many Prototype devs have been forced to switch to jQuery simply because that's where the third party code is, myself included.  My boss doesn't accept me telling him that I'll have to write a custom UI widget for a page when there's a jQuery plugin already existing that does it.  Clients don't care that you have an nine point essay detailing all the ways jQuery is inferior, it has the name recognition, and they know future developers will be able to use it.

