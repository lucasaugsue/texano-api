
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('coupons', function (t) {
            t.increments('id').notNullable()
            t.string('code').notNullable()
            t.integer('company_id').notNullable().index().references('id').inTable('companies')
            t.float('discount_price').nullable()
            t.float('discount_percentage').nullable()
            t.datetime('start_at').nullable()
            t.datetime('end_at').nullable()
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.boolean('active').notNullable().default(true)
            t.integer('limit_by_user').nullable()
            t.integer('limit_total').nullable()
        }),
        knex.schema.createTable('coupons_users', function (t) {
            t.increments('id').notNullable()
            t.integer('customer_id').notNullable().index().references('id').inTable('customer')
            t.integer('coupon_id').notNullable().index().references('id').inTable('coupons')
            t.datetime('used_at').nullable()
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('coupons_emails', function (t) {
            t.increments('id').notNullable()
            t.text('email').notNullable()
            t.integer('coupon_id').notNullable().index().references('id').inTable('coupons')
            t.integer('sent_by').nullable().index().references('id').inTable('customer')
            t.datetime('used_at').nullable()
            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        })

    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('coupons_emails'),
        knex.schema.dropTable('coupons_users'),
        knex.schema.dropTable('coupons'),
    ])
};
 