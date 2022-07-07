exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('sale_address', function (t) {
            t.increments('id').notNullable()
            t.integer('sale_id').index().references('id').inTable('sales') 
            t.string('cep').notNullable()
            t.string('country').notNullable().default("Brazil")
            t.string('uf').notNullable()
            t.string('city').notNullable()
            t.string('neighborhood').notNullable()
            t.string('address').notNullable()
            t.string('complement').nullable()
            t.string('number').notNullable()
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('sale_address')
    ])
};
 