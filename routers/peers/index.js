const {queryUtils, errors} = require('exser').utils;

module.exports = async (router, services) => {

  const spec = await services.getSpec();
  const storage = await services.getStorage();
  /** @type {Peer} */
  const peers = storage.get('peer');

  /**
   *
   */
  router.post('/peers', {
    operationId: 'peers.create',
    summary: 'Создание',
    description: 'Создание участника',
    session: spec.generate('session.user', ['user']),
    tags: ['Peers'],
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/peer.create'}}
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
      200: spec.generate('success', {$ref: '#/components/schemas/peer.view'})
    }
  }, async (req) => {
    req.body.user = {_id: req.session.user._id};
    return await peers.createOne({
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  /**
   *
   */
  router.get('/peers', {
    operationId: 'peers.list',
    summary: 'Выбор списка (поиск)',
    description: 'Список участников с фильтром',
    tags: ['Peers'],
    session: spec.generate('session.user', ['user']),
    parameters: [
      {
        in: 'query', name: 'search[room]', schema: {type: 'string'}, example: '',
        description: 'Поиск по ID комнаты. "|" - для разделения поисковых фраз'
      },
      {$ref: '#/components/parameters/sort'},
      {$ref: '#/components/parameters/limit'},
      {$ref: '#/components/parameters/skip'},
      {
        in: 'query',
        name: 'fields',
        description: 'Выбираемые поля',
        schema: {type: 'string'},
        example: '_id,user(*)'
      },
    ],
    responses: {
      200: spec.generate('success', {
        items: {
          type: 'array',
          items: {$ref: '#/components/schemas/peer.view'}
        }
      })
    }
  }, async (req) => {
    const filter = queryUtils.formattingSearch(req.query.search, {
      room: {field: 'room._id', kind: 'ObjectId'},
    });

    return peers.getList({
      filter,
      sort: queryUtils.formattingSort(req.query.sort),
      limit: req.query.limit,
      skip: req.query.skip,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.get('/peers/:id', {
    operationId: 'peers.one',
    summary: 'Выбор одного',
    description: 'Участник по идентификатору',
    tags: ['Peers'],
    session: spec.generate('session.user', ['user']),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/peer.update'}}
      }
    },
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'id участника',
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
      200: spec.generate('success', {$ref: '#/components/schemas/peer.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    const filter = queryUtils.formattingSearch({
      _id: req.params.id,
    }, {
      _id: {kind: 'ObjectId'},
    });

    return await peers.getOne({
      filter,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.put('/peers/:id', {
    operationId: 'peers.update',
    summary: 'Редактирование',
    description: 'Изменение участника',
    tags: ['Peers'],
    session: spec.generate('session.user', ['user']),
    requestBody: {
      content: {
        'application/json': {schema: {$ref: '#/components/schemas/peer.update'}}
      }
    },
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'id участника',
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
      200: spec.generate('success', {$ref: '#/components/schemas/peer.view'}),
      404: spec.generate('error', 'Not Found', 404)
    }
  }, async (req) => {

    return await peers.updateOne({
      id: req.params.id,
      body: req.body,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });

  router.delete('/peers/:id', {
    operationId: 'peers.delete',
    summary: 'Удаление',
    description: 'Удаление участника',
    session: spec.generate('session.user', ['user']),
    tags: ['Peers'],
    parameters: [
      {
        in: 'path',
        name: 'id',
        description: 'Идентификатор участника',
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

    return await peers.deleteOne({
      id: req.params.id,
      session: req.session,
      fields: queryUtils.parseFields(req.query.fields)
    });
  });
};
