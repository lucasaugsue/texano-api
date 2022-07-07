
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('product_images', function (t) {
            t.increments('id').notNullable()
            t.integer('product_id').index().references('id').inTable('products').notNullable()
            t.string('image_url').notNullable().default('')
            
        }),
        knex.schema.createTable('product_relations', function (t) {
            t.increments('id').notNullable()
            t.integer('from_id').index().references('id').inTable('products').notNullable()
            t.integer('to_id').index().references('id').inTable('products').notNullable()
            
        }),
        knex.schema.createTable('product_views', function (t) {
            t.increments('id').notNullable()
            t.integer('product_id').index().references('id').inTable('products').notNullable()
            t.integer('customer_id').index().references('id').inTable('customer').nullable()
            
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('product_images'),
        knex.schema.dropTable('product_relations'),
        knex.schema.dropTable('product_views')
    ])
};
 