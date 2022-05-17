const { MoneymadeSDK } = require('@moneymade/connect-api');
const { config } = require('./config');

module.exports.initializeSDK = async function () {
  const sdk = await new MoneymadeSDK({
    apiKey: config.apiKey,
    secret: config.apiSecret
  }).init();

  return sdk;
};
