exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("transactions", function (t) {
            t.float('voided_value').nullable()
            t.datetime('voided_at').nullable()
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("transactions", function (t) {
            t.dropColumn('voided_value')
            t.dropColumn('voided_at')
        }),     
    ])
};
 