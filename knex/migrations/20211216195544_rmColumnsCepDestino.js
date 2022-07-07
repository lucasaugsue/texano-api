exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("shipping", function (t) {
            t.dropColumn("sCepDestino");
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("shipping", function (t) {
            t.string('sCepDestino').notNullable().default('')
        })
    ])
};
 