exports.up = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.dropColumn("description");
        }),
        knex.schema.alterTable("products", function (t) {
            t.string("description", 8000).notNullable().default('')
        }),
        knex.schema.alterTable("product_images", function (t) {
            t.boolean('main').notNullable().default(false)
        }),
        knex.schema.alterTable("product_images", function (t) {
            t.dropColumn("image_url");
        }),
        knex.schema.alterTable("product_images", function (t) {
            t.string("image_url", 8000).notNullable().default('')
        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.alterTable("products", function (t) {
            t.dropColumn("description");
        }),
        knex.schema.alterTable("products", function (t) {
            t.string("description").notNullable().default('')
        }),
        knex.schema.alterTable("product_images", function (t) {
            t.dropColumn("main");
        }),
        knex.schema.alterTable("product_images", function (t) {
            t.dropColumn("image_url");
        }),
        knex.schema.alterTable("product_images", function (t) {
            t.string("image_url").notNullable().default('')
        })   
    ])
};
 