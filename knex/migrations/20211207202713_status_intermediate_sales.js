exports.up = function (knex) {
    return Promise.all([
        knex.schema.table("sales_stock", function (t) {
            t.integer("status").notNullable().default(1);
          }),
        knex.schema.table("promotion_sale", function (t) {
            t.integer("status").notNullable().default(1);
        })
    ]);
  };
  

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("sales_stock", function (t) {
          t.dropColumn("status");
        }),
        knex.schema.table("promotion_sale", function (t) {
          t.dropColumn("status");
        })
    ]);
  
};
