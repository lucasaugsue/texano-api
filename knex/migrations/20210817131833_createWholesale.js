
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('wholesale', function (t) {
            t.increments('id').notNullable()
            t.integer('amount').notNullable()
            t.integer('price').notNullable()
            t.integer('product_id').index().references('id').inTable('products') 
            t.integer('company_id').index().references('id').inTable('companies').notNullable()

        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('wholesale')
    ])
};
 