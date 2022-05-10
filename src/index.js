const { createServer } = require("./server");
const { config } = require("./config");

async function main() {
    const server = await createServer();

    server.listen(() => {
        console.log(`Listening ${config.port} port`)
    });
}

main();
