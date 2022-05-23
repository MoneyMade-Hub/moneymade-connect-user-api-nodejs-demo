const { MoneymadeSDK } = require('@moneymade/connect-api');

module.exports.initializeSDK = async function (headers) {
  const sdk = new MoneymadeSDK({
    apiKey: headers['api-key'],
    secret: headers['api-secret']
  });

  await sdk.init();

  return sdk;
};
