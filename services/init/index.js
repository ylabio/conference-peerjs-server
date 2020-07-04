const {objectUtils} = require('exser').utils;

class Init {

  async init(config, services) {
    this.config = config;
    this.services = services;
    this.s = {
      storage: await this.services.getStorage(this.config.mode),
    };
    this.data = {};
    return this;
  }

  async start(){
    await this.initUsersAdmin();
    await this.initUsers();
    await this.initRooms();
  }

  async initUsersAdmin() {
    const type = 'user';
    if (!this.data['user-admin']) {
      const roles = await this.initRoles();
      let body = {
        _key: 'test-admin',
        username: 'test',
        email: 'test@example.com',
        phone: '+70000000000',
        password: '123456',
        role: {_id: roles.find(s => s.name === 'admin')._id},
        profile: {
          name: 'TestAdminName',
          surname: 'TestAdminSurname'
        }
      };

      let admin = await this.s.storage.get(type).upsertOne({
        filter: {_key: body._key}, body, session: {}
      });

      // await this.s.storage.get('user').updateStatus({
      //   id: admin._id.toString(),
      //   body: {status: 'confirm'},
      //   session: {user: admin}
      // });
      this.data['user-admin'] = objectUtils.merge(body, admin);
    }
    return this.data['user-admin'];
  }

  async initSession() {
    const admin = await this.initUsersAdmin();
    return {
      user: admin
    };
  }

  async initRoles() {
    const type = 'role';
    if (!this.data[type]) {
      let items = [
        {name: 'admin', title: {ru: 'Администратор', en: 'Admin'}},
        {name: 'user', title: {ru: 'Пользователь', en: 'User'}}
      ];
      this.data[type] = [];
      for (let body of items) {
        this.data[type].push(objectUtils.merge(body, await this.s.storage.get(type).upsertOne({
          filter: {name: body.name},
          body
        })));
      }
    }
    return this.data[type];
  }

  /**
   *
   * @returns {Promise<Array>}
   */
  async initUsers() {
    const type = 'user';
    if (!this.data[type]) {
      const roles = await this.initRoles();
      const session = await this.initSession();
      let items = [
        {
          _key: 'test-user',
          username: 'user',
          email: 'user@example.com',
          phone: '+79993332211',
          password: '123456',
          role: {_id: roles.find(s => s.name === 'user')._id},
          profile: {
            name: 'TestUserName',
            surname: 'TestUserSurname'
          }
        },
      ];
      this.data[type] = [];
      for (let body of items) {
        this.data[type].push(objectUtils.merge(body, await this.s.storage.get(type).upsertOne({
          filter: {_key: body._key},
          body,
          session
        })));
      }
    }
    return this.data[type];
  }

  async initRooms() {
    const type = 'room';
    if (!this.data[type]) {
      let items = [
        {name: 'javascript', title: {ru: 'Javascript', en: 'Javascript'}, description: {ru: 'Конференция Javascript разработчиков', en: 'Javascript developers conference'}},
        {name: 'php', title: {ru: 'Php', en: 'Php'}, description: {ru: 'Конференция Php разработчиков', en: 'Php developers conference'}},
        {name: 'python', title: {ru: 'Python', en: 'Python'}, description: {ru: 'Конференция Python разработчиков', en: 'Python developers conference'}},
        {name: 'go', title: {ru: 'Go', en: 'Go'}, description: {ru: 'Конференция Go разработчиков', en: 'Conference Go developers'}},
        {name: 'rust', title: {ru: 'Rust', en: 'Rust'}, description: {ru: 'Конференция Rust разработчиков', en: 'Rust developers conference'}},
        {name: 'managers', title: {ru: 'Managers', en: 'Managers'}, description: {ru: 'Конференция менеджеров', en: 'Managers conference'}},
        {name: 'accountants', title: {ru: 'Accountants', en: 'Accountants'}, description: {ru: 'Конференция бухгалтеров', en: 'Accountants conference'}},
      ];
      this.data[type] = [];
      for (let body of items) {
        this.data[type].push(objectUtils.merge(body, await this.s.storage.get(type).upsertOne({
          filter: {name: body.name},
          body
        })));
      }
    }
    return this.data[type];
  }
}

module.exports = Init;
