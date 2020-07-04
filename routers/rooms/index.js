const {queryUtils, errors} = require('exser').utils;

module.exports = async (router, services) => {

  const spec = await services.getSpec();
  const storage = await services.getStorage();
  /** @type {Room} */
  const rooms = storage.get('room');

  /**
   *
   */
  router.post('/rooms', {
    operationId: 'rooms.create',
    summary: 'Создание',
    description: 'Создание комнаты',
    session: spec.generate('session.user', ['user']),
    tags: ['Rooms'],
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/room.create'}}
      }
    },
    parameters: [
      {
        in: 'query',
        name: 'fields',
        description: 'Выбираемые поля',
        schema: {type: 'string'},
        example: '*'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/room.view'})
    }
  }, async (req) => {

    return await rooms.createOne({
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  /**
   *
   */
  router.get('/rooms', {
    operationId: 'rooms.list',
    summary: 'Выбор списка (поиск)',
    description: 'Список комнат с фильтром',
    tags: ['Rooms'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'query',
        name: 'search[query]',
        description: 'Поиск по названию или заголовку',
        schema: {type: 'string'}
      },
      {$ref: '#/components/parameters/sort'},
      {$ref: '#/components/parameters/limit'},
      {$ref: '#/components/parameters/skip'},
      {
        in: 'query',
        name: 'fields',
        description: 'Выбираемые поля',
        schema: {type: 'string'},
        example: '_id,name,title'
      },
    ],
    responses: {
      200: spec.generate('success', {
        items: {
          type: 'array',
          items: {$ref: '#/components/schemas/room.view'}
        }
      })
    }
  }, async (req) => {
    const filter = queryUtils.formattingSearch(req.query.search, {
      query: {kind: 'regex', fields: ['name','title.ru', 'title.en']}
    });

    return rooms.getList({
      filter,
      sort: queryUtils.formattingSort(req.query.sort),
      limit: req.query.limit,
      skip: req.query.skip,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.get('/rooms/:id', {
    operationId: 'rooms.one',
    summary: 'Выбор одного',
    description: 'Комната по идентификатору',
    tags: ['Rooms'],
    session: spec.generate('session.user', ['user']),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/room.update'}}
      }
    },
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'id комнаты',
        schema: {type: 'string'}
      },
      {
        in: 'query',
        name: 'fields',
        description: 'Выбираемые поля',
        schema: {type: 'string'},
        example: '*'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/room.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    const filter = queryUtils.formattingSearch({
      _id: req.params.id,
    }, {
      _id: {kind: 'ObjectId'},
    });

    return await rooms.getOne({
      filter,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.put('/rooms/:id', {
    operationId: 'rooms.update',
    summary: 'Редактирование',
    description: 'Изменение комнаты',
    tags: ['Rooms'],
    session: spec.generate('session.user', ['user']),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/room.update'}}
      }
    },
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'id комнаты',
        schema: {type: 'string'}
      },
      {
        in: 'query',
        name: 'fields',
        description: 'Выбираемые поля',
        schema: {type: 'string'},
        example: '*'
      }
    ],
    responses: {
      200: spec.generate('success', {$ref: '#/components/schemas/room.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    return await rooms.updateOne({
      id: req.params.id,
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.delete('/rooms/:id', {
    operationId: 'rooms.delete',
    summary: 'Удаление',
    description: 'Удаление комнаты',
    session: spec.generate('session.user', ['user']),
    tags: ['Rooms'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'Идентификатор комнаты',
        schema: {type: 'string'}
      },
      {
        in: 'query',
        name: 'fields',
        description: 'Выбираемые поля',
        schema: {type: 'string'},
        example: '_id'
      }
    ],
    responses: {
      200: spec.generate('success', true),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    return await rooms.deleteOne({
      id: req.params.id,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });
};
