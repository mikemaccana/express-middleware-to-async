# Express to Async/await Middleware converter (Experimental)

[![CircleCI](https://circleci.com/gh/mikemaccana/express-middleware-to-async.svg?style=svg)](https://circleci.com/gh/mikemaccana/express-middleware-to-async)

Sometimes it's useful to be able to use a single piece of Express middleware in a modern async/await node app, without having to:

 - Revert async/await middleware to use callbacks
 - Rewrite the old Express middleware to use async/await

This module allows you to wrap Express middleware, turning an async/await version of that mmiddleware usable in `arc.http.async`

The request and response format used is the [AWS Lambda native async/await format](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html).

## Wait, you can have middleware without callbacks?

The [arc.codes](https://arc.codes) project, which works with [AWS Lambda's native request and response formats](https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-handler.html), has documentation on both [async/await HTTP handlers](https://arc.codes/primitives/http) and [async/await middleware](https://arc.codes/primitives/http). 

## Tests

```javascript
npm test
```

## Usage examples:

### Basic middleware

```javascript
const middlewareOne = function(req, res, next) {
  res.send(`Hello World!`);
};

const result = await wrapExpressMiddleware(middlewareOne)(fakeAwsRequest);
```

Returns an AWS response:

```javascript 
{
  body: `Hello World!`,
  status: 200,
  type: `application/html`
};
```

### Chaining

```javascript
const middlewareTwo = function(req, res, next) {
  res.status(500).json({ error: `the pretend server broke` });
};
```

Returns

```javascript
{
  body: '{\n  "error": "the pretend server broke"\n}',
  status: 500,
  type: `application/json`
}
```

### Modifying the request 

Modifying the request, and running `next()` will return the modified request just like ARC async middleware does:

```
const middleWareThree = function(req, res, next) {
  req.requestTime = Date.now();
  next();
};
var result = await wrapExpressMiddleware(middleWareThree)(fakeAwsRequest);
```

Returns 

```javascript
{
  httpMethod: "GET",
  path: "/",
  pathParameters: undefined,
  queryStringParameters: {},
  headers: {},
  body: ""
};
```

## Limits

Express middleware that modifies the response but does not send the response is unsupported. In practice such middleware is rare.
