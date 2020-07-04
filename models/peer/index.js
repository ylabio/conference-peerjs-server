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
}

module.exports = Peer;
