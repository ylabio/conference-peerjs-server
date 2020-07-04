const {PeerServer} = require('peer');

class Peer {
  async init(config, services) {
    this.config = config;
    this.services = services;
    this.peerServer = null;
    return this;
  }

  async start() {
    const peerServer = await this.getPeerServer();
    return peerServer;
  }

  async getPeerServer() {
    if (this.peerServer) {
      return this.peerServer;
    }
    this.peerServer = PeerServer(this.config);
    this.peerServer.on('connection', (client) => console.log('peer connection:', client.id));
    this.peerServer.on('disconnect', (client) => console.log('peer disconnect:', client.id));
    return this.peerServer;
  }
}

module.exports = Peer;
