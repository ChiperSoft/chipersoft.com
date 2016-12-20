---
layout: post
title: "I Promise You'll Learn Something"
draft: true
---

**The example code in this file uses [when.js](https://github.com/cujojs/when), but the concepts described should apply to all implementations of the [Promises/A+](http://promises-aplus.github.io/promises-spec/) specification.**

## In the beginning...

... there was code, and it was good.  Then there were sub-procedures, and it was better.  Finally, someone came up with the idea of sub-procedures having their own scope and returning a response instead of altering external variables, and functions were born.  Be they standalone or member, first class or fixed, functions make modern programming sane.  Functions have a problem, however, in that they can't return until they finished what they're doing.

> Mark and his wife Sue are getting ready to bake a cake. Sue looks in the fridge and tells Mark that they're all out of eggs.  Mark says, "I'll go ask Maria across the street if she can spare some eggs."  Mark runs across the street and knocks on Maria's door.  

> "I think so, let me go look in the refrigerator."  Maria walks to her kitchen and opens the door to a fridge full of food.  After digging around for a few minutes she finds a carton of eggs and returns to the door several minutes later.  Meanwhile, Mark's been standing there this whole time, and Sue's been back in the kitchen wondering what is taking so long.

IO operations take time, even the simplest operations such as reading a file can take a couple cycles... cycles that could be spent performing other operations.  Socket operations can take even longer, and in the mean time nothing it happening while those operations block the execution.

Here's an example of a blocking call:
    
    Neighbor = {
    	borrowEgg: function (callback) {

   		    var response = $.ajax('http://localhost/refrigerator/eggcarton/egg',{
    			type: "GET",
    			async: false
    		}).responseText;

    		return JSON.parse(response);

    	}
    };

    var egg = Neighbor.borrowEgg(); //I has an egg!
    
    /**
     * Note, you should never do the above, and in fact cannot do this any more in newer browsers.
     * It may have even been removed from jQuery by the time you read this.
     */

Calling the `borrowEgg` function will stop all JS execution until the request to the refrigerator has completed. If the refrigerator service is particularly slow, this could be a very noticeable delay.  While this request is happening, nothing else on the page will be processed because the JavaScript event loop is paused waiting for your call.  That means no responding to mouse or keyboard input, no execution of newly loaded JS code such as jsonp requests, and setTimeout calls wont resolve.

To solve this problem in JavaScript, both in the browser and in Node.js, all IO operations occur asynchronously.  The IO call takes a callback, which is then executed upon completion or failure.  However, callbacks present new challenges with keeping maintainable and readable code, particularly when multiple operations have to be performed in sequence.  Either your callbacks get created well in advance and are used by reference, or you create deeper and deeper levels of nested logic.

    
    function getIngredients(callback) {

    	$.ajax('http://localhost/refrigerator/eggcarton/1',{
    		type: "GET",
    		success: function (egg) {
    			$.ajax('http://localhost/refrigerator/milkjug/milk/1c',{
    				type: "GET",
    				success: function (milk) {
    					$.ajax('http://localhost/pantry/flour/1c',{
    						type: "GET",
    						success: function (flour) {
    							$.ajax('http://localhost/pantry/vegoil/2T',{
    								type: "GET",
    								success: function (oil) {
    									callback([
    										egg,
    										milk,
    										flour,
    										oil
    									]);
    								}
    							});
    						}
    					});
    				}
    			});
    		}
    	});

    }

Callbacks also have to be run in sequence, so you're waiting for every task to complete one by one before your final state resolves.

> Next week, Mark decides he wants some pancakes for breakfast, but realizes he's out of milk.  Mark see's his next door neighbor Tom out in his back yard, so he runs outside and asks if Tom could spare some milk.  "I don't have any right now, but I could go get you some," says Tom.  "No thanks, I don't want to wait that long," Mark replies.

> "No, it's cool.  Here, take this."  Tom hands Mark a small box with a speaker on the side and two doors on top.  "Take this box back to your kitchen and open it. It'll be empty, but in a few minutes you'll hear a ding, and then milk will be inside."

> "What? You're full of it."

> "No, seriously. Take this back inside, and I *promise* you that there will be a jug of milk inside when the bell goes off."

> Mark takes the box back into the kitchen and and opens the box. There's nothing inside.  Deciding he's not getting pancakes, sits down in the livingroom to watch TV instead.  A few minutes later he hears a ding from the kitchen.  He opens the box, and wouldn't you know it, there's a pint of milk inside.  Mark runs outside to find Tom.

> "That was amazing, how did you do that?"

> "It's called a Promise Box, I have an matching one just like it.  When I put the milk inside and push this button, it appears on your side as well.  It's like magic!" Tom replies casually.

These are the basics of a Javascript Promise.  A promise is a container, passed from one function to another, guaranteeing that when the data being asked for is ready, the container will be full.  This way the calling code doesn't have to sit around waiting for the conclusion of whatever task is being requested, and it also doesn't have to give a callback.  Mark's opening of the box was the equivalent of attaching a callback to the promise object.  The ringing of the bell is the called function (Tom) calling the resolution function on the promise, passing the milk carton through his side of the box.

	var Tom = {
		promiseMilk = function () {
			//first we create a deferred promise
			var deferred = when.defer();

			//now we setup our asycronous action
			//note, this is just an example, jquery has it's own built in promises
			$.ajax('http://localhost/refrigerator/milkjug/milk/pint/1', {
			    type: 'GET',
				success: function (milk) {
					deferred.resolve(milk);
				},
				error: function (xkr, status, error) {
					deferred.reject(error);
				}
			});

			return deferred.promise;
		}
	}
	
	var Mark = {
        gotMilk : function () {
            Tom.promiseMilk().then(
                function onFulfilled (milk) {
                    // milk found
                },
                function onRejected (message) {
                    console.log("No Milk:", message);
                }
            );
        }
	};
	
In this example Tom is making a call to his refrigerator API, asking for a pint of milk.  When the AJAX call completes, he calls the `resolve` function on the promise, passing in his pint of milk.  Mark, on the other end of the promise, has his `onFulfilled` function called, and now Mark has the milk.

Notice that on both sides of the promise there are two possible calls.  Each promise has two possible states, resolved, or rejected.  If Tom's fridge were to respond with a 404 (Milk Not Found), jQuery would trigger the error callback, and Tom would `reject` the promise.  On Mark's side we have a second callback passed into the `then` function.  This is the rejection handler for the promise.

> A couple weeks later Mark's doing some lawn work and can't get his weed whacker to start, realizing that it's out of oil.  He waves at Tom and asks him if he can borrow a quarter of oil.  "I might have some in the garage. Here, take the promise box, I'll put the oil in if I find it."
    
> Tom heads off and Mark sits the box down on the ground while he does some weeding.  A couple minutes later he hears a sound from the box, but it's a buzzer instead of the usual ding of a bell.  The box has also changed color, it doesn't look like it's even the box Tom gave him.  Mark opens the box and finds a note.  "Hi Mark, this is Jason, Tom's friend.  Tom couldn't find any oil and came over to see if I had any, but I don't, sorry."

Any promise can be resolved with another promise, effectively replacing the old promise with the new one.  When Tom called Jason, Jason gave Tom his own promise, which Tom then attached to his promise, replacing Mark's box.

    Tom.promiseOil = function () {
        var deferred = when.defer();

    	$.ajax('http://localhost/garage/motoroil',{
    		type: "GET",
    		success: function (oil) {
    			deferred.resolve(oil);
    		},
    		error: function () {
    			deferred.resolve(Jason.promiseOil());
    		}
    	});

    	return deferred.promise;
    };

    Jason.promiseOil = function () {
        var deferred = when.defer();

    	$.ajax('http://localhost/garage/motoroil',{
    		type: "GET",
    		success: function (oil) {
    			deferred.resolve(oil);
    		},
    		error: function () {
    			deferred.reject('Hi Mark, this is Jason ...');
    		}
    	});

    	return deferred.promise;
    };

    Mark.addOilToWeedWhacker = function () {
        Tom.promiseOil().then(
            function found (oil) {
                this.weedWhacker.addOil(oil);
            },
            function notFound (message) {
                console.log('Oil Not Found:', message); // Displays the message from Jason
            }
        );
    };

Mark wasn't able to find the oil, which means he couldn't resolve the promise, so he rejected it.  That rejection went right past Tom and straight to Mark.  A rejection should always include some sort of message indicating why the call failed, in this case being Jason's note.  This may be an exception object, but it could just as easily be a string or status object explaining what happened.  *when.js* automatically wraps all onFulfilled calls in a try statement.  If an error occurs while executing the function, the promise will then be rejected with the exception object.

Lets say Tom wanted to send his own message to Mark.

    Tom.promiseOil = function () {
        var promise = when.defer();

    	$.ajax('http://localhost/garage/motoroil',{
    		type: "GET",
    		success: function (oil) {
    			promise.resolve(oil);
    		},
    		error: function () {
    		    var jasonsPromise = Jason.promiseOil();
    		    
    		    jasonsPromise.then(null, function () {
    		        return when.reject('Sorry Mark, I couldn't find any oil. Tom.');
    		    });
    		    
    			promise.resolve(jasonsPromise);
    		}
    	});

    	return promise;
    };

In the above code, Tom has added a `then` handler to Jason's promise.  If Jason finds the oil, Tom doesn't care and can just pass it through to Mark, but if Jason fails then Top wants to send his own message.  `then` calls are evaluated in the order of which they are made, so in the above case Tom is adding his `then` before Mark would receive it.  Tom has not provided a function for the fulfilled condition, so if the promise resolves then this `then` will just be skipped over.  But if Jason fails, Tom will catch that rejection and then replace it with his own rejection message, so that Mark has no reason to even know Jason was involved.

Note the function call, `when.reject()`, which we will explain below.

## Obeying The Letter of the Law

The [Promises/A+](http://promises-aplus.github.io/promises-spec/) specification does not actually define the method of resolution/rejection, it only dictates the interface for the final promise.  Those requirements are quite simple, the promise must have a `then` function which takes two callbacks for fulfillment and rejection, and if those callbacks also return promises then it must produce a new promise.  That's pretty much it, everything beyond that is left up to the implementation of the specific promise library.

In the above example code you will notice that all of the functions which create a deferral object return `deferred.promise` instead of the `deferred` object itself.  *When.js*'s `defer` function does not produce a promise, it produces a defer which just happens to meet the interface requirements of a promise.  This means that technically you can return that defer and it will act like any other promise.  However, this is not the *proper* implementation because you are returning a promise which could be altered after the fact.  `deferred.promise` contains the real promise object, which only contains the `then` function.

The resolution examples shown above are exclusive to *when.js*.  Another popular promises library is [RSVP.js](https://github.com/tildeio/rsvp.js), which uses the following format:

    var promise = new RSVP.Promise(function(resolve, reject){
        // succeed
        resolve(value);
        // or reject
        reject(error);
    });

It is this author's opinion that *when.js* provides the most comprehensive and easy to use feature set of the various libraries.  So lets see some of the stuff we can do with *when.js*.

## Juggling Promises

### Pre-Resolution with `when.resolve` and `when.reject`

> Tom's putting together a gift for his nephew and has the box all wrapped up, but he doesn't have any bows to put on the package.  "Hey, Mark owes me a couple favors, lets go see if he has any bows."  Tom walks over and knocks on the door, and Sue answers.  Tom explains his problem, and Sue nods and says "Sure, I've got a bow.  Here, take the promise box."  As Tom turns to walk away from the door, the box dings. He opens it, and the bow is already inside.

> "Hey," he says to Sue, "This box was already full."

Sometimes, usually because of caching, a function call will already have the data that the requester needs.  However, because the expectation is that the function will return a promise, it can't just hand that data over.  This is where pre-resolved promises come in.  The promise is created and immediately resolved with the data that needs to be returned.  Of course, the promise doesn't yet have any fulfillment or rejection handlers, but as soon as the requesting function binds a callback, that callback will be called (much in the same way that `jQuery.each` will immediately call the iteration function it receives).

    Sue.promiseBow = function () {
    	if (this.bows.length) {
    		return when.resolve(this.bows.pop());
    	} else {
    		var promise = when.defer();

    		$.ajax('http://store/bows/1',{
    			type: "GET",
    			success: function (bow) {
    				promise.resolve(bow);
    			},
    			error: function () {
    				promise.reject("Store did not have any bows.");
    			}
    		});

    		return promise;
    	}
    }

`when.reject` provides the same use case, commonly tied into error conditions.

    Sue.ringDoorBell = function (force) {
        
        if (!this.doorBell.battery) {
            return when.reject('Doorbell did not ring.');
        }
        
        if (force > 9000) {
            return when.reject('YOU BROKE IT!');
        }
        
        return Sue.dingDong();
        
    }
    
### Parallel Promises

Lets return to our first example of Mark and Sue baking a cake.  The first thing they need to do is gather the ingredients for the cake.  The more people working in the kitchen, the more ingredients can be retrieved at once, so we don't need to get each item in sequence.

    Recipie.promiseIngredients = function () {
		return when.all([
			Refrigerator.promiseEggs(),
			Refrigerator.promiseMilk(),
			Pantry.promiseFlour(),
			when.any([
				Pantry.promiseVegitableOil(),
				Pantry.promiseCoconutOil(),
				Refrigerator.promiseLard(),
				Refrigerator.promiseButter()
			])
		]);
	};

Here we see two of tools *when.js* provides for running parallel tasks:  `when.all` and `when.any`.  Both of these functions take an array of promises or values and return a promise.  

**all**:

- Resolves when all of the promises are fulfilled
- Resolves with an array of the results, in the same order as the promises were provided
- Rejects if any of the promises fail.

If a non-promise is passed in the array, it will be included in the resolution array at the same position.

**any**:

- Resolves when any of the promises resolve
- Resolves with the first promise that gets fulfilled
- Rejects only if all of the promises fail

Note, if a non-promise is passed in the array, `any` will resolve instantly.  `when.any(['foo'])` is functionally identical to `when.resolve('foo')`;

Our recipe can take any of four types of oil, so whichever one we grab first will do the job.

### And More!

The *when.js* project repo contains a number of extension modules for doing more with promises, such as the [`when/function`](https://github.com/cujojs/when/blob/master/docs/api.md#synchronous-functions) library which lets you turn non-promise functions into promise resolvers, or [`when/pipeline`](https://github.com/cujojs/when/blob/master/docs/api.md#whenpipeline) which lets you create content sequence arrays where each resolution gets passed into the next action.