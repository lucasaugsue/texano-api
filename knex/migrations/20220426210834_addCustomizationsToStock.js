exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("stock", function (t) {
            t.integer('custom_products_id').nullable().index().references('id').inTable('custom_products')
        }),
        
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("stock", function (t) {
            t.dropColumn("custom_products_id");
        }),
    ])
};
 