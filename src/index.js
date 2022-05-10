const { app } = require("./server");
const { config } = require("./config");


app().listen(() => {
    console.log(`Listening ${config.port} port`)
});
