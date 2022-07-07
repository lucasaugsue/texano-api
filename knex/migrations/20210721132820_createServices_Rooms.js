
exports.up = function(knex) {
    return Promise.all ([
      knex.schema.createTable('services_rooms', function (t) {
          t.increments('id').notNullable()
          t.integer('room_id').index().references('id').inTable('rooms').notNullable()
          t.integer('service_id').index().references('id').inTable('services').notNullable()
          t.integer('company_id').index().references('id').inTable('companies').notNullable()
          t.boolean('active').notNullable().default(true)

      })
    ])
  };
  
  exports.down = function(knex) {
    return Promise.all ([
        knex.schema.dropTable('services_rooms')
    ])
  };
  
  