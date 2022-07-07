
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("sales", function (t) {
            t.float("price").alter();
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("sales", function (t) {
            t.integer("price").alter();
        })
    ])
     
};