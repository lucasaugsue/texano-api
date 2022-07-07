exports.up = function(knex) {
    return Promise.all([
        knex.schema.table("content_attributes", function (t) {
            t.string('uuid').nullable()
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("content_attributes", function (t) {
            t.dropColumn("uuid")
        }),
    ])
};