exports.up = function (knex) {
  return Promise.all([
    knex.schema.alterTable("sales", function (t) {
      t.integer("customer_id").nullable().references("id").inTable("customer");

    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table("sales", (t) => {
      t.dropColumn("customer_id");
    }),
  ]);
};
