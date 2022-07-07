
exports.up = function(knex) {
    return Promise.all([
    knex.schema.createTable('schedules', function (t) {
        t.increments('id').notNullable()
        t.integer('room_id').index().references('id').inTable('rooms')
        t.integer('service_id').index().references('id').inTable('services')
        t.integer('service_room_id').index().references('id').inTable('services_rooms')
        t.integer('client_id').index().references('id').inTable('customer')
        t.integer('company_id').index().references('id').inTable('companies')
        t.enum('type',['occupied', 'unavailable']).notNullable().default('occupied')
        t.integer('schedules_dates_id').index().references('id').inTable('schedules_dates').notNullable()
       

    })
])
};

exports.down = function(knex) {
    return Promise.all([
        knex.schema.dropTable('schedules')
    ])
};
