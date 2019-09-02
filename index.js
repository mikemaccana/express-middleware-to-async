// https://expressjs.com/en/guide/writing-middleware.html
const log = console.log.bind(console)

const UTF8 = 'charset=UTF-8'

const TYPES = {
  HTML: `text/html; ${UTF8}`,
  JAVASCRIPT: `application/javascript; ${UTF8}`,
  JSON: `application/json; ${UTF8}`,
  TEXT: `text/plain; ${UTF8}`
}

const awsRequestToExpressRequest = function(awsRequest){
  // Convert our AWS request to an Express request (done before the middleware processes it)
  var expressRequest = {
    // https://expressjs.com/en/api.html#req
    // https://arc.codes/primitives/http#req
    method: awsRequest.httpMethod,
    path: awsRequest.path,
    // resource - String
    // The absolute path of the request, with resources substituted for actual path parts (e.g. /{foo}/bar)
    params: awsRequest.pathParameters,
    query: awsRequest.queryStringParameters,
    // Headers comes from node's http module,
    // Hence no headers at https://expressjs.com/en/api.html#req
    headers: awsRequest.headers,
    // Assuming it's already been parsed
    body: awsRequest.body
  }
  return expressRequest
}

const expressRequestToAWSRequest = function(expressRequest){
  // Convert our Expresss request to an AWS request (done after the middleware has procssed i, if the middleware isn't sending a response)
  var expressRequest = {
    httpMethod: expressRequest.method,
    path: expressRequest.path,
    // resource - String
    // The absolute path of the request, with resources substituted for actual path parts (e.g. /{foo}/bar)
    pathParameters: expressRequest.params,
    queryStringParameters: expressRequest.query,
    // Headers comes from node's http module,
    // Hence no headers at https://expressjs.com/en/api.html#req
    headers: expressRequest.headers,
    // Assuming it's already been parsed
    body: expressRequest.body
  }
  return expressRequest
}

const wrapExpressMiddleware = function(middleware){
  function wrappedMiddleware(awsRequest){

    // The wrapped middleware expects an AWS compatible request 
    var expressRequest = awsRequestToExpressRequest(awsRequest)

    // The wrapped middleware will return an ARC compatible respone
    var arcResponse = {
      body: null,
      status: 200,
      type: TYPES.HTML
    }

    return new Promise(function(resolve, reject) {
      

      var expressResponse = {
        send: function(body){
          arcResponse.body = body
          resolve(arcResponse);
        },
        json: function(object){
          arcResponse.type = TYPES.JSON
          arcResponse.body = JSON.stringify(object, null, 2)
          resolve(arcResponse);
        },
        status: function(status){
          arcResponse.status = status
          // Allow for chaining
          return expressResponse
        }
      }

      var next = function(){
        // Arc async middleware will return modified request if not responding immediately
        // Since the Express middleware has operated on expressRequest
        // We'll convert it before we send it back
        resolve(expressRequestToAWSRequest(expressRequest))
      }
      middleware(expressRequest, expressResponse, next)
    });
  }
  return wrappedMiddleware
}

module.exports = wrapExpressMiddleware