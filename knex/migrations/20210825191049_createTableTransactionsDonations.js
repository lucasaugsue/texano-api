
exports.up = function(knex) {
    return Promise.all([
        knex.schema.table('companies', function (t) {
            t.string('coalah_pay_key').nullable()
        }),
        knex.schema.createTable('credit_cards', function (t) {
            t.increments('id').notNullable()
            
            t.string('key').notNullable()
            t.string('origin').notNullable().default("coalah")

            t.string('crypted_number').notNullable()
            t.string('brand').notNullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('transactions', function (t) {
            t.increments('id').notNullable()
            
            t.integer('credit_card_id').nullable().index().references('id').inTable('credit_cards')
            
            t.string('key').notNullable()
            t.string('origin').notNullable().default("coalah")
            t.float('value').notNullable()
            t.float('payed_value').nullable()
            t.datetime('due_date').notNullable()
            t.datetime('payed_date').nullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        }),
        knex.schema.createTable('donations', function (t) {
            t.increments('id').notNullable()
            
            t.integer('customer_id').notNullable().index().references('id').inTable('customer')
            t.integer('transaction_id').nullable().index().references('id').inTable('transactions')
            
            t.float('value').nullable()

            t.datetime('created_at').notNullable().defaultTo(knex.raw('NOW()'))
            t.datetime('updated_at').notNullable().defaultTo(knex.raw('NOW()'))
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('donations'),
        knex.schema.dropTable('transactions'),
        knex.schema.dropTable('credit_cards'),
        knex.schema.table('companies', function (t) {
            t.dropColumn('coalah_pay_key')
        }),
    ])
};
 