exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("sales", function (t) {
            t.float('installment_price').nullable();
            t.integer('installment_amount').nullable();
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("sales", function (t) {
            t.dropColumn("installment_price");
            t.dropColumn("installment_amount");
        }),
    ])
};
 