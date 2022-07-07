
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('contents_types', function (t) {
            t.increments('id').notNullable()

            t.string('title').notNullable()
            t.string('uuid').notNullable()

            t.integer('company_id').notNullable().index().references('id').inTable('companies')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('contents', function (t) {
            t.increments('id').notNullable()

            t.integer('contents_types_id').notNullable().index().references('id').inTable('contents_types')

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),

        //atributos
        knex.schema.createTable('content_attributes', function (t) {
            t.increments('id').notNullable()

            t.integer('contents_types_id').index().references('id').inTable('contents_types')
            t.string('title').notNullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        
        knex.schema.createTable('attributes', function (t) {
            t.increments('id').notNullable()

            t.integer('content_attributes_id').index().references('id').inTable('content_attributes')
            t.integer('contents_id').index().references('id').inTable('contents').notNullable()
            t.string('value').nullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('attributes'),
        knex.schema.dropTable('content_attributes'),
        knex.schema.dropTable('contents'),
        knex.schema.dropTable('contents_types'),
    ])
};