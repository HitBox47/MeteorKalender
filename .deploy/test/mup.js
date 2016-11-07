module.exports = {
  servers: {
    one: {
      host: 'research-osnet.fb2.frankfurt-university.de',
      username: 'meteorkalender',
      // WARNING: Keys protected by a passphrase are not supported
      pem: '../deploy_rsa'
      // password:
      // or leave blank for authenticate from ssh-agent
    }
  },
  // Install and configure MongoDB on remote server.
  "setupMongo": true,
  // Install Node.js on the server which is required
  "setupNode": true,
  // Configure your Node version number, stick with this for the moment.
  "nodeVersion": '4.1.6',
  // Install Phantom.js on the server
  "setupPhantom": false,
  // App name (No spaces)
  "appName": 'MeteorKalenderTest', //this is used as the dir name to store your app under /opt/
  meteor: {
    appName: 'Test',
    name: 'MeteorKalenderTest',
    path: '../',
    servers: {
      one: {}
    },
    buildOptions: {
      serverOnly: true,
      debug: true
    },
    env: {
      PORT: 3001,
      ROOT_URL: 'https://test.meteorkalender.freeddns.org'
      //MONGO_URL: 'mongodb://localhost/meteor'
    },
    dockerImage: 'cwaring/meteord:base',
    deployCheckWaitTime: 60
  },
  mongo: {
    oplog: true,
    port: 27017,
    servers: {
      one: {}
    },
  },
};