exports.up = function (knex) {
    return knex.schema.table("attributes", function (t) {
      t.string("value_attribute", 8000).notNullable();
    })
  };
  
  exports.down = function (knex) {
    return knex.schema.table("attributes", function (t) {
        t.dropColumn("value_attribute")
      })
  };
  