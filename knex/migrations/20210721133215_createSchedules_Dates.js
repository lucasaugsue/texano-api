
exports.up = function(knex) {
    return Promise.all([
    knex.schema.createTable('schedules_dates', function (t) {
        t.increments('id').notNullable()
        t.datetime('date_time').notNullable()
        t.string('date').notNullable()
        t.integer('period').nullable()
        t.integer('company_id').index().references('id').inTable('companies') 
        t.integer('availability_id').index().references('id').inTable('availability') 
        
    })
])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('schedules_dates')
    ])
};
