exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("transactions", function (t) {
            t.integer('sale_id').nullable().index().references('id').inTable('sales')
        }),
        
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("transactions", function (t) {
            t.dropColumn("sale_id");
        }),
    ])
};
 