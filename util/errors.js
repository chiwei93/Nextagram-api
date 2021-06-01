module.exports = (message, statusCode, errors) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;

  return error;
};
