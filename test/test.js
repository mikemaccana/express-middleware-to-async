const assert = require(`assert`),
  wrapExpressMiddleware = require("../index"),
  log = console.log.bind(console);

const fakeAwsRequest = {
  httpMethod: `GET`,
  path: `/`,
  resource: `/`,
  queryStringParameters: {},
  headers: {},
  body: ``,
  isBase64Encoded: false
};

suite(
  `Express middleware takes AWS requests and returns AWS responses`,
  async function() {
    test(`Basic res.send works`, async function() {
      const middlewareOne = function(req, res, next) {
        res.send(`Hello World!`);
      };

      const result = await wrapExpressMiddleware(middlewareOne)(fakeAwsRequest);
      const expected = {
        body: `Hello World!`,
        status: 200,
        type: `application/html`
      };
      assert.deepEqual(result, expected);
    });

    test(`Chaining works`, async function() {
      const middlewareTwo = function(req, res, next) {
        res.status(500).json({ error: `the pretend server broke` });
      };

      const result = await wrapExpressMiddleware(middlewareTwo)(fakeAwsRequest);
      const expected = {
        body: '{\n  "error": "the pretend server broke"\n}',
        status: 500,
        type: `application/json`
      };
      assert.deepEqual(result, expected);
    });

    test(`Modifying the request and running next() returns the modified request`, async function() {
      const middleWareThree = function(req, res, next) {
        req.requestTime = Date.now();
        next();
      };

      var result = await wrapExpressMiddleware(middleWareThree)(fakeAwsRequest);
      const expected = {
        httpMethod: "GET",
        path: "/",
        pathParameters: undefined,
        queryStringParameters: {},
        headers: {},
        body: ""
      };
      assert.deepEqual(result, expected);
    });
  }
);
