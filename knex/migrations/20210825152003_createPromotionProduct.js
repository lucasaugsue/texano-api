exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('promotion_product', function (t) {
            t.increments('id').notNullable()
            t.integer('price_unit').notNullable()
            t.integer('amount').notNullable()
            t.integer('product_id').index().references('id').inTable('products') 
            t.integer('promotion_id').index().references('id').inTable('promotion') 
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.table("promotion", function (t) {
            t.dropColumn("product_id");
            t.dropColumn("price");
            t.boolean("exact_amount").notNullable().defaultTo(true)
          })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('promotion_product'), 
        knex.schema.table("promotion", function (t) {
            t.dropColumn("exact_amount");
            t.integer('price').notNullable()
            t.integer('product_id').index().references('id').inTable('products') 
          })       
    ])
};
 