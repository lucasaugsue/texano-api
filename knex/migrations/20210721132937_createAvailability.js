
exports.up = function(knex) {
    return Promise.all([
        knex.schema.createTable('availability', function (t) {
            t.increments('id').notNullable()
            t.integer('room_id').index().references('id').inTable('rooms') 
            t.integer('service_id').index().references('id').inTable('services') 
            t.integer('weekday').notNullable()
            t.datetime('start_time').notNullable()
            t.integer('period').nullable()
            t.integer('service_room_id').index().references('id').inTable('services_rooms') 
            t.integer('company_id').index().references('id').inTable('companies') 
            t.boolean('active').notNullable().default(true)


        })
    ])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('availability')
    ])
};
 