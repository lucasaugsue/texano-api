
exports.seed = function(knex) {
  return knex('custom_attributes').insert([
    {id: 1, title: 'Azul', custom_category_id: 1, active: true},
    {id: 2, title: 'Verde', custom_category_id: 1, active: true},
    {id: 3, title: 'Vermelho', custom_category_id: 1, active: true},
    {id: 4, title: 'Laranja', custom_category_id: 1, active: true},
    {id: 5, title: 'Amarelo', custom_category_id: 1, active: true},
    
    {id: 6, title: 'Chocolate', custom_category_id: 2, active: true},
    {id: 7, title: 'Baunília', custom_category_id: 2, active: true},
    {id: 8, title: 'Morango', custom_category_id: 2, active: true},
    {id: 9, title: 'Napolitano', custom_category_id: 2, active: true},
    {id: 10, title: 'Diet', custom_category_id: 2, active: true},
  ]);
}
