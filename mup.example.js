module.exports = {
  servers: {
    one: {
      host: '95.85.46.44',
      username: 'root',
    },
  },

  meteor: {
    name: 'portal',
    path: '.',
    servers: {
      one: {},
    },
    buildOptions: {
      serverOnly: true,
    },
    ssl: {
      // Ask the [melon team](team@melonport.com) for these files
      // if you want to deploy to your own servers, you need own certs
      // further reading: https://github.com/zodern/meteor-up#ssl-support
      crt: './fullchain.pem',
      key: './privkey.pem',
      port: 443,
    },
    env: {
      ROOT_URL: 'https://portal.melonport.com',
      MONGO_URL: 'mongodb://localhost/meteor',
    },

    dockerImage: 'abernix/meteord:base',
    deployCheckWaitTime: 120,
  },

  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {},
    },
  },
};
