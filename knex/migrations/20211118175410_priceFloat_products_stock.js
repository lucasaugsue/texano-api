
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.float("price").alter();
        }),
        knex.schema.alterTable("stock", function (t) {
            t.float("price").alter();
        }),
        knex.schema.alterTable("discounts", function (t) {
            t.float("percentage").alter();
        }),
        knex.schema.alterTable("payments", function (t) {
            t.float("discount").alter();
        }),
        knex.schema.alterTable("sales_stock", function (t) {
            t.float("price").alter();
        }),
        knex.schema.alterTable("promotion_product", function (t) {
            t.float("price_unit").alter();
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.integer("price").alter();
        }),
        knex.schema.alterTable("stock", function (t) {
            t.integer("price").alter();
        }),
        knex.schema.alterTable("discounts", function (t) {
            t.integer("percentage").alter();
        }),
        knex.schema.alterTable("payments", function (t) {
            t.integer("discount").alter();
        }),
        knex.schema.alterTable("sales_stock", function (t) {
            t.integer("price").alter();
        }),
        knex.schema.alterTable("promotion_product", function (t) {
            t.integer("price_unit").alter();
        })
    ])
     
};