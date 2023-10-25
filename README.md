# hpropagate

This package automatically propagates HTTP headers from inbound to outbound HTTP requests.

## The why

We use a micro-service architecture with a growing number of HTTP endpoints. We want to propagate certain HTTP headers received from the incoming HTTP requests to all subsequent outbound HTTP requests without the need for our engineers to do it programmatically in each services:

By default, the following headers are automatically propagated:

1. `x-request-id`. If the header is missing from the inbound request, it will be created with a UUID as value.

Apart from `x-request-id`, only headers received on the incoming request will be propagated to outbound calls.

The list of headers can be overridden and the initialisation of `x-request-id` disabled, see [below](#override-defaults)

The value of `x-request-id` is also set as the value for `req.id` and `res.id` mainly to allow the [pino-http](https://github.com/pinojs/pino-http) logger to pick up the value in logs automatically also.

## Getting started

To use the default configuration:

```javascript
// should have this line as early as possible in your code
// it must be before loading express and request
const hpropagate = require("hpropagate");

// then start it
hpropagate();
```

Or do it in one go:

```javascript
require("hpropagate")();
```

### NestJS

For NestJs be sure to run `hpropagate()` at the top of the `bootstrap` function.

## Override Defaults

- to disable the initialisation and generation of the correlation id header:

```javascript
hpropagate({
  setAndPropagateRequestId: false,
});
```

- to override the list of headers to propagate:

```javascript
hpropagate({
  headersToPropagate: ["x-my-header", "x-another-header"],
});
```

You can also combine those, for example to disable the initialisation of the request id and only propagate it:

```javascript
hpropagate({
  setAndPropagateRequestId: false,
  headersToPropagate: ["x-request-id"],
});
```

- to enable the propagation of the headers in the response (to allow more traceability):

```javascript
hpropagate({
  propagateInResponses: true,
});
```

## The How

Inspiration from this [talk](https://youtu.be/A2CqsR_1wyc?t=5h26m40s) ([Slides and Code](https://github.com/watson/talks/tree/master/2016/06%20NodeConf%20Oslo)) and this [module](https://github.com/guyguyon/node-request-context)

The first goal is to be able to propagate certain headers (i.e. `x-request-id`) to outbound HTTP requests without the need to do it programmatically in the service.

It works by using a global `tracer` object which keeps a records of traces (a `trace` object per http request). The header value is saved in the `trace` object associated with the current request.
The http core code is wrapped to record headers on the `trace` (on the request listener of the http server set with `http.createServer`) and inject headers to the outbound requests (currently only on `http.request`).

Node's `async_hooks` module (new in Node 8) is used to set/reset `tracer.currentTrace` to the trace relevant to the current execution context. `tracer.currentTrace` is used in the wrapped functions to record/access the headers data.

## Improvements

- Move to TypeScript
- Move to Jest

## Limitations

- Only tested with `Express 4`
- Need Node >= 8
- Many more....
