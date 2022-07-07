exports.up = function (knex) {
    return knex.schema.table("companies", function (t) {
      t.string("uuid", 8000).notNullable();
    })
  };
  
exports.down = function (knex) {
  return knex.schema.table("companies", function (t) {
      t.dropColumn("uuid")
    })
};
  