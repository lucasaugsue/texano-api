exports.up = function (knex) {
  return Promise.all([
    knex.schema.table("sales_stock", function (t) {
      t.integer('price').nullable()  
    })
  ]);
};

exports.down = function (knex) {
  return Promise.all([ 
    knex.schema.table("sales_stock", function (t) {
      t.dropColumn("price")
    }),
  ]);
};
