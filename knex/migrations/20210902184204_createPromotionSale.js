exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('promotion_sale', function (t) {
            t.increments('id').notNullable()
            t.integer('sale_id').index().references('id').inTable('sales') 
            t.integer('promotion_id').index().references('id').inTable('promotion') 
        }),
        knex.schema.alterTable("promotion", function (t) {
            t.boolean("active").default(true)
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('promotion_sale'),
        knex.schema.alterTable("promotion", function (t) {
            t.dropColumn('active')
        }),     
    ])
};
 