
exports.up = function(knex) {
    return Promise.all([
        knex.schema.dropTable('content_options'),
        knex.schema.createTable('content_options', function (t) {
            t.increments('id').notNullable()
            t.string('option').notNullable().default('')
            t.integer('content_attributes_id').index().references('id').inTable('content_attributes').notNullable()
            t.boolean("active").notNullable().default(true);
        }),
        knex.schema.table("shipping", function (t) {
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.boolean('active').default(true)
        }),
    ]);
};



exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('content_options'),
        knex.schema.createTable('content_options', function (t) {
            t.increments('id').notNullable()
            t.string('option').notNullable().default('')
            t.integer('content_attributes_id').index().references('id').inTable('content_attributes').notNullable()
            t.boolean("active").notNullable().default(true);
        }),
        knex.schema.table("shipping", function (t) {
            t.dropColumn('created_at')
            t.dropColumn('updated_at')
            t.dropColumn('active')
        }),
    ]);
};

 