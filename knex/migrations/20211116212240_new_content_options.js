
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('content_options', function (t) {
            t.increments('id').notNullable()
            t.string('option').index().references().inTable('content_attributes').notNullable()
            t.integer('content_attributes_id').index().references('id').inTable('content_attributes').notNullable()

        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('content_options')
    ])
};
 