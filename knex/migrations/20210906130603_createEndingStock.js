exports.up = function (knex) {
    return knex.schema.table("stock", function (t) {
      t.integer("ending_stock").nullable();
    })
  };
  
exports.down = function (knex) {
  return knex.schema.table("stock", function (t) {
      t.dropColumn("ending_stock")
    })
};
  