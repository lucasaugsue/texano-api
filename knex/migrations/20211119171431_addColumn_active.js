exports.up = function (knex) {
  return Promise.all([
    knex.schema.table("contents_relations", function (t) {
      t.boolean("active").notNullable().default(true);
    }),
    knex.schema.table("content_types_relations", function (t) {
      t.boolean("active").notNullable().default(true);
    }),
    knex.schema.table("content_options", function (t) {
      t.boolean("active").notNullable().default(true);
    }),
  ]);
};

exports.down = function (knex) {
  return Promise.all([
    knex.schema.table("contents_relations", function (t) {
      t.dropColumn("active");
    }),
    knex.schema.table("content_types_relations", function (t) {
      t.dropColumn("active");
    }),
    knex.schema.table("content_options", function (t) {
      t.dropColumn("active");
    }),
  ]);
};
