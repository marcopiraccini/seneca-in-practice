Let's consider a situation in which we want to execute a set of operations
for each invocation. On the Microservice side, this can be done using `wrap`,
that is a method which  matches a set of patterns and overrides all of them with
the same action extension function.  This is the same as calling seneca.add manually for each one. It takes the following two parameters:

* **pin**: a pin is a pattern-matching pattern.
* action: action extension function.

Here an example of teh "greetings" plugin
which transform every name passed in uppercase:

```
module.exports = function greetings(options) {

  this.add({role:'greetings', cmd:'hello'}, function(args, done) {
    var hey = "Hello " + msg.name;
    respond(null, { answer: hey });
  })

  this.add({role:'greetings', cmd:'hey'}, function(args, done) {
    var hey = "Hey " + msg.name;
    respond(null, { answer: hey });
  })

  this.wrap('role:greetings', function (msg, respond) {
    msg.name  = msg.name.toUpperCase();
    this.prior(msg, respond)
  })

}
```

In this case, the pin role:greetings matches the patterns `role:greetings,cmd:hello`
and `role:greetings,cmd:hey` that are registered with Seneca.

Note the `prior` call.  Each time you override an action pattern, you get a prior.
This prior may have its own prior from a previous definition of the action pattern.
So this is the way of calling the overriden function. In this sense the `wrap`
actually acts as a wrapper for a set of patterns/actions.

Also *pin* can be used to specify the set of patterns that is associated with a client.
```
require('seneca')().use('greetings' ).listen({type:'tcp', pin:'role:greetings'})
```

The goal of the exercise is to extend the math plugin using `wrap` with a `pin`
to convert the passed parameters to Number, so that the plugin works also if
the numbers to be added / multiplied are strings.
