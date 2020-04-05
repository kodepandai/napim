// Update with your config settings.

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      database: 'napim',
      user: 'root',
      password: 'evtf78ds'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },
  production: {
    client: 'mysql',
    connection: {
      database: 'napim',
      user: 'root',
      password: 'evtf78ds'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'migrations'
    }
  },

};
