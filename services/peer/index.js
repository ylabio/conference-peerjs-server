const {PeerServer} = require('peer');

class Peer {
  async init(config, services) {
    this.config = config;
    this.services = services;
    this.s = {
      storage: await this.services.getStorage(),
    };
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
    this.peerServer.on('connection', (client) => this.onPeerConnect(client));
    this.peerServer.on('disconnect', (client) => this.onPeerDisconnect(client));
    return this.peerServer;
  }

  async onPeerConnect(client) {
    console.log('peer connected:', client.id);
    await this.s.storage.get('peer').peerConnected({peerId: client.id});
  }

  async onPeerDisconnect(client) {
    console.log('peer disconnected:', client.id);
    await this.s.storage.get('peer').peerDisconnected({peerId: client.id});
  }
}

module.exports = Peer;
