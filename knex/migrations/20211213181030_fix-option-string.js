
exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("content_options", function (t) {
          t.dropColumn("options")
          t.string("options").notNullable().default('');
        }),
    ]);
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("content_options", function (t) {
            t.dropColumn("options")
            t.string('option').index().references().inTable('content_attributes').notNullable();
        }),
    ]);
};

 