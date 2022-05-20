require('dotenv').config({
  path: process.env.DOTENV_CONFIG_PATH
});

module.exports.config = {
  port: process.env.PORT || 3000
};
