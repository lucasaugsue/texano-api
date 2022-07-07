
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('product_category', function (t) {
            t.increments('id').notNullable()

            t.integer('product_id').index().references('id').inTable('products')
            t.integer('category_id').index().references('id').inTable('categories')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('product_category')
    ])
};