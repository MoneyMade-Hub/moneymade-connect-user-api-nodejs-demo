require('dotenv').config({
    path: process.env.DOTENV_CONFIG_PATH
});


if(!process.env.API_KEY) {
    throw new Error("API_KEY is not present in environment variables");
}

if(!process.env.API_SECRET) {
    throw new Error("API_SECRET is not present in environment variables");
}

module.exports.config = {
    port: process.env.PORT || 3000,
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
}