
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('losses', function (t) {
            t.increments('id').notNullable()

            t.integer('amount').notNullable()

            t.datetime('loss_date').nullable()
            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.integer('stock_id').index().references('id').inTable('stock')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('losses')
    ])
};