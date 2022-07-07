exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("coupons_users", function (t) {
            t.integer('sale_id').notNullable().index().references('id').inTable('sales')
        }),
        knex.schema.alterTable("sales", function (t) {
            t.float('coupon_discount_price').nullable()
        }),
        
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("coupons_users", function (t) {
            t.dropColumn("sale_id");
        }),
        knex.schema.alterTable("sales", function (t) {
            t.dropColumn("coupon_discount_price");
        }),
    ])
};
 