
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('stock', function (t) {
            t.increments('id').notNullable()

            t.integer('amount').notNullable()
            t.float('price').notNullable()
            t.integer('status').notNullable()
            
            t.integer('product_id').index().references('id').inTable('products')

            t.datetime('stock_date').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('due_date').notNullable()


            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('stock')
    ])
};