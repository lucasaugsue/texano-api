exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("contents_types", function (t) {
        t.boolean('visible').notNullable().default(true)
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("contents_types", function (t) {
        t.dropColumn("visible")
      }),
    ]);
  };
