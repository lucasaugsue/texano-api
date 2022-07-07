exports.up = function(knex) {
    return Promise.all([
        knex.schema.table("sales", function (t) {
            t.dropColumn("method_id")
            t.integer('payment_id').index().references('id').inTable('payments')
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("sales", function (t) {
            t.dropColumn("payment_id")
            t.integer('method_id').index().references('id').inTable('methods')
        }),
    ])
};