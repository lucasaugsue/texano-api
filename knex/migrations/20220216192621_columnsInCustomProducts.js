exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("custom_products", function (t) {
            t.string("image", 8000).notNullable().default('')
            t.float('price').notNullable().default(1)
            t.string('nVlPeso').notNullable().default('1kg')
        }),
        
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("custom_products", function (t) {
            t.dropColumn("image");
            t.dropColumn("price");
            t.dropColumn("nVlPeso");
        }),
    ])
};
 