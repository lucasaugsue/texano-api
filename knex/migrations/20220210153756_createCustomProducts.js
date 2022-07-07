exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('custom_products', function (t) {
            t.increments('id').notNullable()

            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.integer('product_id').notNullable().index().references('id').inTable('products')
            
            t.boolean("active").notNullable().default(true);

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('custom_attributes_products', function (t) {
            t.increments('id').notNullable()

            t.integer('custom_product_id').notNullable().index().references('id').inTable('custom_products')
            t.integer('custom_attribute_id').notNullable().index().references('id').inTable('custom_attributes')
            
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('custom_attributes_products'),
        knex.schema.dropTable('custom_products'),
    ])
};