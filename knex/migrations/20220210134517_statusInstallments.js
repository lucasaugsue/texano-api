exports.up = function(knex) {
    return Promise.all([
        knex.schema.table("company_installments", function (t) {
            t.dropColumn("num_installments");
        }),
        knex.schema.table("company_installments", function (t) {
            t.dropColumn("min_value");
        }),
        knex.schema.alterTable("company_installments", function (t) {
            t.integer('num_installments').notNullable().default(1)
            t.float('min_value').notNullable().default(1)
            t.boolean("active").notNullable().default(true);
        }),
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.table("company_installments", function (t) {
            t.dropColumn("num_installments")
        }),
        knex.schema.table("company_installments", function (t) {
            t.dropColumn("min_value")
        }),
        knex.schema.alterTable("company_installments", function (t) {
            t.string('num_installments')
            t.string('min_value')
            t.dropColumn("active");
        }),     
    ])
};
 