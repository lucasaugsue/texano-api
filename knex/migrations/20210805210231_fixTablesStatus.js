
exports.up = function(knex) {
    return Promise.all([
        knex.schema.table("categories", function (t) {
            t.dropColumn("status");
            t.boolean("active").default(true);
        }),
        knex.schema.table("products", function (t) {
            t.dropColumn("status");
            t.boolean("active").default(true);
        }),
        knex.schema.table("stock", function (t) {
            t.dropColumn("status");
            t.boolean("active").default(true);
            t.integer("StockNumber").notNullable()
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("categories", function (t) {
            t.integer("status");
            t.dropColumn("active");
        }),
        knex.schema.table("products", function (t) {
            t.integer("status");
            t.dropColumn("active");
        }),
        knex.schema.table("stock", function (t) {
            t.integer("status");
            t.dropColumn("active")
            t.dropColumn("StockNumber")
        }),
    ])
};