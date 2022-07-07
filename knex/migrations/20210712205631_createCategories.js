
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('categories', function (t) {
            t.increments('id').notNullable()

            t.string('category_name').notNullable()
            t.integer('status').notNullable()

            t.integer('company_id').notNullable().index().references('id').inTable('companies')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('categories')
    ])
};
