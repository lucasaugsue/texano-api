
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('content_types_relations', function (t) {
            t.increments('id').notNullable()
            t.integer('from_id').index().references('id').inTable('contents_types').notNullable()
            t.integer('to_id').index().references('id').inTable('contents_types').notNullable()

        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('content_types_relations')
    ])
};
 