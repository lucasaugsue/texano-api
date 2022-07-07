exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable("recaptcha_tokens", function (t) {
            t.increments('id').notNullable()
            
            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.string('token').notNullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable("recaptcha_tokens"),
    ])
};
// 6Le53gQcAAAAAA2RWZwnXzBnrvvFkBPloc9r6Akc