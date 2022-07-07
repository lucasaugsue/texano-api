exports.up = function (knex) {
    return Promise.all([
        knex.schema.createTable('custom_categories', function (t) {
            t.increments('id').notNullable()

            t.integer('company_id').nullable().index().references('id').inTable('companies')
            
            t.string('name').notNullable()
            t.boolean("active").notNullable().default(true);

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('custom_attributes', function (t) {
            t.increments('id').notNullable()

            t.integer('custom_category_id').notNullable().index().references('id').inTable('custom_categories')
            
            t.string('title').notNullable()
            t.boolean("active").notNullable().default(true);

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTable('custom_attributes'),
        knex.schema.dropTable('custom_categories'),
    ])
};