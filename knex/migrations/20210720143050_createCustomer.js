
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('customer', function (t) {
            t.increments('id').notNullable()
            t.integer('company_id').index().references('id').inTable('companies').notNullable()
            t.string('name').notNullable()
            t.string('cpf').nullable()
            t.string('email').notNullable()
            t.string('phone').nullable()

        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('customer')
    ])
};
