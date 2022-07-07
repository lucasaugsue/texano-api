exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("availability", function (t) {
        t.integer('duration').nullable()  
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("availability", function (t) {
        t.dropColumn("duration")
      }),
    ]);
  };
  