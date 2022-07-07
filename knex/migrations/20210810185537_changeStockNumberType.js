
exports.up = function(knex) {
    return Promise.all([
        knex.schema.table("stock", function (t) {
            t.dropColumn("StockNumber")
            t.string("stock_number")
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("stock", function (t) {
            t.dropColumn("stock_number")
            t.integer("StockNumber")
        }),
    ])
};