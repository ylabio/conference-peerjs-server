const Model = require('exser').Model;

class Room extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'room',
      indexes: this.spec.extend(parent.indexes, {
        name: [{'name': 1}, {
          'unique': true,
          partialFilterExpression: {name: {$gt: ''}, isDeleted: false}
        }]
      }),
      model: this.spec.extend(parent.model, {
        title: 'Комната',
        properties: {
          name: {type: 'string', description: 'Кодовое название', minLength: 2, maxLength: 64},
          title: this.spec.generate('i18n', {description: 'Заголовок', minLength: 2, maxLength: 64}),
          description: this.spec.generate('i18n', {description: 'Описание', default: '', maxLength: 255}),
        },
        required: ['name', 'title'],
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

module.exports = Room;
