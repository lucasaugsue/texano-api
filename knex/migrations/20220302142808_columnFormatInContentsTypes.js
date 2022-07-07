exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("contents_types", function (t) {
            t.string('format').notNullable().defaultTo('content')
        }),
        
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("contents_types", function (t) {
            t.dropColumn("format");
        }),
    ])
};
 