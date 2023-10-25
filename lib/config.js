const generateAndPropagateHeader = 'x-request-id';

const validateHeaderList = headers => {
  if (!Array.isArray(headers)) {
    throw new Error('Header list is not an array');
  }

  // could be tighter - ASCII code between 33 and 126 at the moment
  const headerNameRegex = /^[\x21-\x7e]+$/i;

  const invalidHeaders = headers.filter(h => typeof h !== 'string' || !headerNameRegex.test(h));

  if (invalidHeaders.length > 0) {
    throw new Error(`Header list contains invalid headers: ${invalidHeaders}`);
  }
};

const load = (overrides = {}) => {
  const {
    setAndPropagateRequestId = true,
    propagateInResponses = false,
    headersToPropagate = [],
  } = overrides;

  validateHeaderList(headersToPropagate);

  const headersToCollect = headersToPropagate;

  let headersToInject = headersToCollect;
  if (setAndPropagateRequestId === true) {
    headersToInject = [generateAndPropagateHeader].concat(headersToCollect);
  }

  return {
    setAndPropagateRequestId,
    propagateInResponses,
    generateAndPropagateHeader,
    headersToCollect,
    headersToInject,
  };
};

module.exports = {
  load,
};
