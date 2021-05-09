const caching = (cacheObj, endpoint, temporalParams, parameters) => {
    if (cacheObj[endpoint] && endpoint === "/countries") {
      return cacheObj[endpoint];
    } else if (cacheObj[endpoint]) {
      if (
        cacheObj[endpoint].params.temporal === temporalParams &&
        cacheObj[endpoint].params.parameters === parameters
      ) {
        return cacheObj[endpoint].value;
      }
    }
    return null;
  };

module.exports = caching  