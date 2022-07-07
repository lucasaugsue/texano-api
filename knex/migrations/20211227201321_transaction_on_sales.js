exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("sales", function (t) {
            t.dropColumn("payment_transaction");
            t.integer('transaction_id').nullable().index().references('id').inTable('transactions')
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("sales", function (t) {
            t.dropColumn("transaction_id");
            t.string('payment_transaction', 8000).nullable()
        }),
    ])
};
 