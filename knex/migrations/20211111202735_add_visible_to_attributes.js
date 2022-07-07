exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("attributes", function (t) {
        t.boolean('visible').notNullable().default(true)
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("attributes", function (t) {
        t.dropColumn("visible")
      }),
    ]);
  };
