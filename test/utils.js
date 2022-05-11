module.exports.makeAxiosError = function (status, dataOrMessage, config = {}) {
  const error = new Error();

  error.isAxiosError = true;

  if (status) {
    error.response = {
      ...config,
      status,
      data: typeof dataOrMessage === 'string' ? { statusCode: status, message: dataOrMessage } : dataOrMessage
    };
  }

  return error;
};
