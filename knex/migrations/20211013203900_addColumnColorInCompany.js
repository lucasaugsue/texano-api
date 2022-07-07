exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("companies", function (t) {
        t.integer('color').nullable()  
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("companies", function (t) {
        t.dropColumn("color")
      }),
    ]);
  };
  