exports.up = function (knex) {
  return Promise.all([
    knex.schema.alterTable("contents_types", function (t) {
      t.boolean("menu").notNullable().default(true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table("contents_types", (t) => {
      t.dropColumn("menu");
    }),
  ]);
};
