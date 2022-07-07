exports.up = function (knex) {
  return knex.schema.table("stock", function (t) {
    t.dropColumn("price");
  });
};

exports.down = function (knex) {
    return knex.schema.table("stock", function (t) {
        t.integer("price").nullable().default(0);
      });
};
