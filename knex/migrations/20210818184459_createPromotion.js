
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('promotion', function (t) {
            t.increments('id').notNullable()
            t.integer('product_id').index().references('id').inTable('products') 
            t.integer('price').notNullable()
            t.datetime('initial_date').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('final_date').notNullable()
            t.integer('company_id').index().references('id').inTable('companies').notNullable()

        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('promotion')
    ])
};
 