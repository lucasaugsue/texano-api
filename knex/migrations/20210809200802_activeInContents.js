exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("contents", function (t) {
        t.boolean('active').notNullable().default(true)
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("contents", function (t) {
        t.dropColumn("active")
      }),
    ]);
  };
  