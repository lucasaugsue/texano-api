exports.up = function (knex) {
    return Promise.all([
        knex.schema.table("sales", function (t) {
            t.float("displacement_rate").notNullable().default(0);
          })
    ]);
  };
  

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("sales", function (t) {
          t.dropColumn("displacement_rate");
        })
    ]);
  
};
