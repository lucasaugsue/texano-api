exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("contents_types", function (t) {
            t.string('email').nullable()
        }),
        
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("contents_types", function (t) {
            t.dropColumn("email");
        }),
    ])
};
 