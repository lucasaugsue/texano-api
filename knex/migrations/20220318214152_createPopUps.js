
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('popups', function (t) {
            t.increments('id').notNullable()
            t.text('title').notNullable()
            t.text('description').notNullable()
            t.string('image').nullable()
            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.integer('coupon_id').nullable().index().references('id').inTable('coupons')
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('start_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('end_at').nullable()
            t.boolean('active').notNullable().default(true)
        }),
        knex.schema.createTable('popups_clicks', function (t) {
            t.increments('id').notNullable()
            t.integer('customer_id').notNullable().index().references('id').inTable('customer')
            t.integer('popup_id').notNullable().index().references('id').inTable('popups')
            t.datetime('clicked_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),

    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('popups_clicks'),
        knex.schema.dropTable('popups'),
    ])
};
 