exports.up = function(knex) {
    return Promise.all([
        knex.schema.table("promotion", function (t) {
            t.boolean("by_price").notNullable().defaultTo(false)
            t.integer("by_price_type").nullable()
            t.float("total_value").nullable()
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("promotion", function (t) {
            t.dropColumn("by_price");
            t.dropColumn("total_value");
            t.dropColumn("by_price_type");
          })       
    ])
};
 