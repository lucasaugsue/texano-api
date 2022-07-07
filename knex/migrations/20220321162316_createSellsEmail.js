
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('sells_emails', function (t) {
            t.increments('id').notNullable()
            t.string('email').notNullable()
            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.boolean('active').notNullable().default(true)
        }),

    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('sells_emails'),
    ])
};
 