const Model = require('exser').Model;

class Role extends Model {

  define() {
    const parent = super.define();
    return {
      collection: 'role',
      indexes: this.spec.extend(parent.indexes, {
        // relativeId: [{'relative._id': 1}],
      }),
      model: this.spec.extend(parent.model, {
        title: 'Роль',
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

module.exports = Role;
