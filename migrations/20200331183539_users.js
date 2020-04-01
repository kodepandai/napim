exports.up = function (knex) {
    return knex.schema.createTable('users', table => {
        table.increments('id').primary();
        table.string('username');
        table.string('email').unique();
        table.string('password');
        table.timestamp('created_at').defaultTo(knex.fn.now())
        table.timestamp('updated_at').defaultTo(knex.fn.now())
        table.timestamp('deleted_at')
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users')
};
