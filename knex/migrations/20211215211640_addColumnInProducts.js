exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.string("subtitle").notNullable().default('')
            t.string("description").notNullable().default('')
            t.string("brand").notNullable().default('')
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.dropColumn('subtitle')
            t.dropColumn('description')
            t.dropColumn('brand')
        }),     
    ])
};
 