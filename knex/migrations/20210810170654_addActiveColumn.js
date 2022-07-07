exports.up = function (knex) {
    return Promise.all([
      knex.schema.table("customer", function (t) {
        t.boolean('active').notNullable().default(true)
      }),
      knex.schema.table("payments", function (t) {
        t.boolean('active').notNullable().default(true)
      })
    ]);
  };
  
  exports.down = function (knex) {
    return Promise.all([ 
        knex.schema.table("customer", function (t) {
            t.dropColumn('active')
          }),
          knex.schema.table("payments", function (t) {
            t.dropColumn('active')
          })
    ]);
  };
  