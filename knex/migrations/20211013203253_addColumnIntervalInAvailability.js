exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("availability", function (t) {
        t.integer('interval').nullable()  
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("availability", function (t) {
        t.dropColumn("interval")
      }),
    ]);
  };
  