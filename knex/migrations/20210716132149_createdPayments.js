
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('methods', function (t) {
            t.increments('id').notNullable()

            t.string('type').notNullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('payments', function (t) {
            t.increments('id').notNullable()

            t.integer('discount').nullable().default(0)

            t.integer('method_id').index().references('id').inTable('methods')
            t.integer('company_id').notNullable().index().references('id').inTable('companies')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('sales', function (t) {
            t.increments('id').notNullable()

            t.integer('amount').notNullable()
            t.datetime('sale_date').nullable()
            t.integer('price').notNullable()

            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.integer('stock_id').index().references('id').inTable('stock')
            t.integer('method_id').index().references('id').inTable('methods')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('sales'),
        knex.schema.dropTable('payments'),
        knex.schema.dropTable('methods'),
    ])
};
