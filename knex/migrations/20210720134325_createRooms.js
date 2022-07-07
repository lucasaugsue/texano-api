
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('rooms', function (t) {
            t.increments('id').notNullable()
            t.string('name').notNullable()   
            t.integer('company_id').index().references('id').inTable('companies').notNullable()
            t.boolean('active').notNullable().default(true)

        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('rooms')
    ])
};
