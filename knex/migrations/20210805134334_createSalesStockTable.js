
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('sales_stock', function (t) {
            t.increments('id').notNullable()

            t.integer('sale_id').index().references('id').inTable('sales')
            t.integer('stock_id').index().references('id').inTable('stock')
            t.integer('amount').notNullable()
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.table("sales", function (t) {
            t.dropColumn("stock_id");
            t.dropColumn("amount");
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("sales", function (t) {
            t.integer('stock_id').index().references('id').inTable('stock')
            t.integer('amount')
        }),
        knex.schema.dropTable('sales_stock'),
    ])
};