const Model = require('exser').Model;
const ObjectID = require('exser').ObjectID;
const moment = require('moment');

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
            description: 'Дата и время подключения к Peer серверу',
          },
          dateDisconnect: {
            type: 'string',
            format: 'date-time',
            description: 'Дата и время отключения от Peer сервера',
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

  async createOne({body, view = true, fields = {'*': 1}, session, validate, prepare, schema = 'create'}) {
    const peer = await super.getOne({
      filter: {
        peerId: body.peerId,
        'room._id': ObjectID(body.room._id),
      },
      throwNotFound: false,
      fields,
      session,
    });
    if (peer) {
      return peer;
    }

    return await super.createOne({
      body, view, fields, session, validate, schema,
      prepare: async (parentPrepare, object) => {
        const prepareDefault = (object) => {
          parentPrepare(object);
          object.dateConnect = moment().toISOString();
        };
        await (prepare ? prepare(prepareDefault, object) : prepareDefault(object));
      }
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
      body: {dateConnect: moment().toISOString()},
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
      body: {dateDisconnect: moment().toISOString()},
    });
  }
}

module.exports = Peer;
