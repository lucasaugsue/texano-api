exports.up = function (knex) {
  return Promise.all([knex.schema.table("content_attributes", function (t) {
      t.string("type");
    }),
    knex.schema.table("attributes", function (t) {
      t.dropColumn("value");
    })
  ]);
};

exports.down = function (knex) {
  return Promise.all([ 
    knex.schema.table("content_attributes", function (t) {
      t.dropColumn("type")
    }),
  ]);
};
