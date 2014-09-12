---
title: You Don't Know Inheritance
---

Recently I discovered [Kyle Simpson's (@getify)](http://twitter.com/getify) spectacular book series, [You Don't Know JS](http://youdontknowjs.com). It's a sequence of books being written entirely on github and physically published by O'Reilly. The books are licensed CC-NC-ND and free to read online, but you should buy them anyway just because they're really good.  That said, I have an issue of semantics that's been bugging me, and I need to get it off my chest.

In [chapter 5](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20&%20object%20prototypes/ch5.md#class-functions) of "`this` & Prototypes", Kyle states the following fact:

> In class-oriented languages, multiple copies (aka, "instances") of a class can be made, like stamping something out from a mold. As we saw in Chapter 4, this happens because the process of instantiating (or inheriting from) a class means, "copy the behavior plan from that class into a physical object", and this is done again for each new instance.

> But in JavaScript, there are no such copy-actions performed. You don't create multiple instances of a class. You can create multiple objects that [[Prototype]] link to a common object. But by default, no copying occurs, and thus these objects don't end up totally separate and disconnected from each other, but rather, quite linked.

Further on in this chapter, under ["What's In A Name"](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20&%20object%20prototypes/ch5.md#whats-in-a-name) he uses this to re-enforce this point:

> This mechanism is often called "prototypal inheritance" (we'll explore the code in detail shortly), which is commonly said to be the dynamic-language version of "classical inheritance". It's an attempt to piggy-back on the common understanding of what "inheritance" means in the class-oriented world, but tweak (read: pave over) the understood semantics, to fit dynamic scripting.

> The word "inheritance" has a very strong meaning (see Chapter 4), with plenty of mental precedent. Merely adding "prototypal" in front to distinguish the actually nearly opposite behavior in JavaScript has left in its wake nearly two decades of mirey confusion.

> [...]

> **"Inheritance" implies a copy operation**, and JavaScript doesn't copy object properties (natively, by default). Instead, JS creates a link between two objects, where one object can essentially delegate property/function access to another object. "Delegation" (see Chapter 6) is a much more accurate term for JavaScript's object-linking mechanism.

(Emphasis mine) Kyle spends all of chapter four building up to this point, repeating time and again that classical inheritance involves duplication of properties. Half of the book is all setup for this statement of opinion that the term "prototypical inheritance" is a misnomer.  Much like Crockford's demonstrated bias in JavaScript: The Good Parts, Kyle has used the book to express his opinion that people have been misrepresenting the behavior of JavaScript.  There's just one problem with that...

**The word "inheritance" does not actually imply a copy operation.**

[The historical meaning](http://en.wiktionary.org/wiki/inheritance#Etymology) of the word refers to an heir of an estate; the bequeathing of a portion or whole of an ancestor's physical property to their descendants.  When you inherit a house, no-one duplicates the original house. When you inherit money, no one gives you a copy of the money. To quote Kyle himself, it is a "deferral" of the material goods. This is the oldest definition dating back to the 15th century, and it perfectly describes the type of inheritance used in JavaScript.  Prototypical children receive the exact properties of their parents, right down to the memory address.

Now, one could argue that Kyle is referring to inheritance as the transmission of genetic traits. This definition has only come into use in the last century and isn't even listed in [Merriam-Webster's main definition](http://www.merriam-webster.com/dictionary/inheritance) (if you scroll down the page it shows up under the Medical dictionary, but says nothing of duplication). [The oxford definition of inherit](http://www.oxforddictionaries.com/us/definition/american_english/inherit) does include genetic traits in the main definition, but also makes no mention of duplication.  Genetic inheritance is not, in fact, a perfect duplication of traits. Both ova and spermatozoa only contain half of the parent's chromosomes, and due to epigenetic drift, that which the child receives is rarely a perfect copy.

Therefore, "prototypical inheritance" is in fact the more syntactically accurate term.