exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('sale_history', function (t) {
            t.increments('id').notNullable()
            t.integer('sale_id').index().references('id').inTable('sales') 
            t.integer('status').notNullable()
            t.datetime('date').notNullable().defaultTo(knex.raw('NOW()'))
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('sale_history'),        
    ])
};
 