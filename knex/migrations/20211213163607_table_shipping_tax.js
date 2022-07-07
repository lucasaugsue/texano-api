
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('shipping', function (t) {
            t.increments('id').notNullable()
            t.integer('product_id').index().references('id').inTable('products').notNullable()
            t.string('nCdEmpresa').notNullable().default('')
            t.string('sDsSenha').notNullable().default('')
            t.string('nCdServico').notNullable().default('')
            t.string('sCepOrigem').notNullable().default('')
            t.string('sCepDestino').notNullable().default('')
            t.string('nVlPeso').notNullable().default('1kg')
            t.integer('nCdFormato').notNullable().default(1)
            t.float('nVlComprimento').notNullable().default(0)
            t.float('nVlAltura').notNullable().default(0)
            t.float('nVlLargura').notNullable().default(0)
            t.float('nVlDiametro').notNullable().default(0)
            t.string('sCdMaoPropria').notNullable().default('N')
            t.float('nVlValorDeclarado').notNullable().default(0)
            t.string('sCdAvisoRecebimento').notNullable().default('N')
        })

    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('shipping')
    ])
};
 