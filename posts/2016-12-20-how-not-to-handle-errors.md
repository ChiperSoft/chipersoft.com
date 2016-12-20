---
title: How not to handle your node errors.
---

Via Reddit I found this post by Dima Grossman:

> ### [How to write async await without try-catch blocks in Javascript](http://blog.grossman.io/how-to-write-async-await-without-try-catch-blocks-in-javascript/)

This is a neat idea and a clever way to use dereferencing, but the example code demonstrates a couple really bad practices:

### First Mistake: All errors are not created equal

```js
[err, user] = await to(UserModel.findById(1));
if(err || !user) return cb('No user found');
```

The User model at least demonstrates that they haven't fallen into the trap of throwing in the event of a record not existing (that's another article), but how do you know that the error you got back from `findById(1)` means the user doesn't exist? It could be that your database is down. It could be that your model has a malformed query.

### Second Mistake: Throwing out the baby with the bath water

```js
[err, savedTask] = await to(TaskModel({userId: user.id, name: 'Demo Task'}));
if(err) return cb('Error occurred while saving task');
```

This code is eating the entire context of the error condition. What error occurred? Where did it occur at? Good luck debugging why your site doesn't work when you don't log the error message or the stack trace.

### Third Mistake: Errors should always be Errors

```js
if(user.notificationsEnabled) {
  const [err] = await to(NotificationService.sendNotification(user.id, 'Task Created'));
  if(err) return cb('Error while sending notification');
}

if(savedTask.assignedUser.id !== user.id) {
  const [err, notification] = await to(NotificationService.sendNotification(savedTask.assignedUser.id, 'Task was created for you'));
  if(err) return cb('Error while sending notification');
}
```

Again, stack traces are important. You just used the same error message twice, how do you know which line triggered the problem? What if this code is 5 layers deep into the call stack of a request and you used the same message in two other models, where did your error come from? If you have to throw a new error, it should always be a `new Error()` so that you capture the stack trace.

### Fourth Mistake: You don't need to catch everything.

The reason promises bubble errors is so that you never lose the original error. Having to process each error response individually is one of the largest flaws of error-first callbacks. Inevitably someone will forget to put an `if (err) cb(err)` somewhere and things blow up in strange and confusing ways.

You don't need to be changing every error into a new error. Most of the time you *want* the original errors to be passed up the call stack so that you can log them properly. You would only be checking for errors if the code you're calling throws an error on common conditions, and in those cases you should be checking to make sure the error is that specific kind and re-throwing any that aren't.

For example, most http libs (eg, `superagent` or `request`) will throw an error if a response comes back with a non-200 status code. You may want to capture 404 errors to process non-existing entities, but any other error would indicate a flaw either in your application code or in the service itself, and that needs to be logged.

```js
try {
  result = request.get(someurl);
} catch (err) {
  if (err.status === 404) {
    return null;
  }
  throw err;
}
```

This will ensure that, if your service request isn't working, the failure causes the application to respond with a 500 error instead of a 400 or 404, and the cause of the error gets recorded by your error handler logging (you do have error handler logging, right?).

### The right way

I sympathize with the author's desire to not have to fill their code with `try..catch` blocks. They're ugly and kind of cumbersome to work with.  We've also had several years of being told not to use `try..catch` in Node because it triggers a V8 de-optimization.

So instead, here's a better way to write the author's example.

```js
// The base function is receiving a callback and thus doesn't need to be async.
function asyncTask(cb) {
  Promise.resolve().then(async function () {
    const user = await UserModel.findById(1);
    if(!user) throw new Error('No user found');

    const savedTask = await TaskModel({userId: user.id, name: 'Demo Task'});

    if(user.notificationsEnabled) {
      // These notifications can be ran in parallel, no reason to await both individually
      await Promise.all([
        NotificationService.sendNotification(user.id, 'Task Created'),
        NotificationService.sendNotification(savedTask.assignedUser.id, 'Task was created for you')
      ])
    }

    return savedTask;
  }).then((result) => cb(null, result), cb);
  // Callback handling has now been removed from the central control flow, your async logic doesn't need to know about the cb.
}
```
