exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('discounts', function (t) {
            t.increments('id').notNullable()
            t.integer('percentage')
            t.integer('amount')
            t.integer('sale_id').index().references('id').inTable('sales') 
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('discounts'),      
    ])
};
 