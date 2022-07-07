
exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('company_installments', function (t) {
            t.increments('id').notNullable()

            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            
            t.string('num_installments').notNullable()
            t.string('min_value').notNullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('company_installments'),
    ])
};