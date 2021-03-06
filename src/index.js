const { createServer } = require('./server');
const { config } = require('./config');

async function main () {
  const server = await createServer();

  server.listen(config.port, () => {
    console.log(`Listening ${config.port} port`);
  });
}

main();
