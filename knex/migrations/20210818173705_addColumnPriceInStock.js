exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("stock", function (t) {
        t.integer('price')   
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
      knex.schema.table("stock", function (t) {
        t.dropColumn("price")
      }),
    ]);
  };
  