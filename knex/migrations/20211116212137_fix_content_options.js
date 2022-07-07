
exports.up = function(knex) {
    return Promise.all([
        knex.schema.dropTable('content_options')
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.createTable('content_options', function (t) {
            t.increments('id').notNullable()
            t.string('option').index().references().inTable('contents_types').notNullable()
            t.integer('content_attributes_id').index().references('id').inTable('contents_types').notNullable()

        })
    ])
};

 