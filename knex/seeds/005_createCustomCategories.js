
exports.seed = function(knex) {
  return knex('custom_categories').insert([
    {id: 1, company_id: null, name: 'Cor', active: true},
    {id: 2, company_id: null, name: 'Sabor', active: true},
  ]);
}
