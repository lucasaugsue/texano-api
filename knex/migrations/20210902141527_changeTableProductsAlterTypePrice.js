
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.integer("price").alter();
        }),
        knex.schema.alterTable("promotion", function (t) {
            t.datetime("final_date").nullable().alter();
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.float("price").alter();
        }),
        knex.schema.alterTable("promotion", function (t) {
            t.datetime("final_date").notNullable().alter();
        }),
    ])
     
};