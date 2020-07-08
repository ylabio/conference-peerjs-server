const Model = require('exser').Model;

class Peer extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'peer',
      indexes: this.spec.extend(parent.indexes, {
        peerRoom: [{'peerId': 1, 'room._id': 1}, {
          'unique': true,
          partialFilterExpression: {isDeleted: false}
        }]
      }),
      model: this.spec.extend(parent.model, {
        title: 'Участники конференции',
        properties: {
          peerId: {type: 'string', description: 'Peer ID', minLength: 2, maxLength: 256},
          user: this.spec.generate('rel', {
            type: 'user',
            description: 'Пользователь',
          }),
          room: this.spec.generate('rel', {
            type: 'room',
            description: 'Комната',
          }),
          dateConnect: {
            type: 'string',
            format: 'date-time',
            description: 'Дата и время подключения к Peer серверу'
          },
          dateDisconnect: {
            type: 'string',
            format: 'date-time',
            description: 'Дата и время отключения от Peer сервера'
          },
        },
        required: ['peerId', 'user', 'room'],
      })
    };
  }

  schemes() {
    return this.spec.extend(super.schemes(), {
      // Схема создания
      create: {
        properties: {
          $unset: []
        },
      },
      // Схема редактирования
      update: {
        properties: {
          $unset: [],
        }
      },
      // Схема просмотра
      view: {
        properties: {
          $unset: []
        }
      },
    });
  }

  async peerConnected({peerId}) {
    const result = await super.getList({
      filter: {peerId},
      sort: {dateCreate: -1},
      limit: 1,
      view: false,
    });

    if (result.items.length === 0) {
      return;
    }

    await super.updateOne({
      id: result.items[0]._id,
      body: {dateConnect: Date.now()},
    });
  }

  async peerDisconnected({peerId}) {
    const result = await super.getList({
      filter: {peerId},
      sort: {dateCreate: -1},
      limit: 1,
      view: false,
    });

    if (result.items.length === 0) {
      return;
    }

    await super.updateOne({
      id: result.items[0]._id,
      body: {dateDisconnect: Date.now()},
    });
  }
}

module.exports = Peer;
