
exports.seed = function(knex) {
  return knex('profiles').insert([
    {id: 1, name: 'Administrador'},
  ]);
};
