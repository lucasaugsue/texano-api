
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('company_addresses', function (t) {
            t.increments('id').notNullable()
            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.integer('address_id').notNullable().index().references('id').inTable('addresses')
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.boolean('active').notNullable().default(true)
            t.boolean('main').notNullable().default(false)
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('company_addresses'),
    ])
};
 