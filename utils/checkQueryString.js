const checkQueryString = (queryData) => {
  if (queryData) {
    const temporalParams = queryData.queries?.split("|");
    
    if (queryData.params?.length === 0) return false
    const params = queryData.params?.split(",");

    if (
      temporalParams &&
      !isNaN(temporalParams[0]) &&
      !isNaN(temporalParams[1]) &&
      parseInt(temporalParams[0]) < parseInt(temporalParams[1]) &&
      parseInt(temporalParams[1]) <= new Date().getFullYear()
    ) {
      if (params) {
        return true;
      }

      return false;
    }
    return false;
  }

  return false;
};

module.exports = checkQueryString;
