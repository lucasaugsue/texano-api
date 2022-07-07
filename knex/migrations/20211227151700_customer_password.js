exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("customer", function (t) {
            t.date('birthdate').nullable()
        }),
        knex.schema.alterTable("sales", function (t) {
            t.string('payment_transaction', 8000).nullable()
        }),
        knex.schema.createTable('customer_password', function (t) {
            t.increments('id').notNullable()
            t.integer('customer_id').index().references('id').inTable('customer').notNullable()
            t.string('password', 8000).notNullable()
            t.boolean("active").notNullable().default(true);
        }),
        knex.schema.createTable('customer_cards', function (t) {
            t.increments('id').notNullable()
            t.integer('customer_id').index().references('id').inTable('customer').notNullable()
            t.integer('credit_card_id').index().references('id').inTable('credit_cards').notNullable()
            t.string('last_digits').notNullable().default('0000')
            t.boolean("active").notNullable().default(true);
        }),
        knex.schema.createTable('customer_address', function (t) {
            t.increments('id').notNullable()
            t.integer('customer_id').index().references('id').inTable('customer').notNullable()
            t.integer('address_id').index().references('id').inTable('addresses').notNullable()
            t.boolean("active").notNullable().default(true);
        }),  
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("customer", function (t) {
            t.dropColumn("birthdate");
        }),
        knex.schema.alterTable("sales", function (t) {
            t.dropColumn("payment_transaction");
        }),
        knex.schema.dropTable('customer_password'),
        knex.schema.dropTable('customer_address'),
        knex.schema.dropTable('customer_cards'),
    ])
};
 