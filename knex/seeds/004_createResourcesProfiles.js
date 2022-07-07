
exports.seed = function(knex) {
  return knex('resources_profiles').insert([
    {id: 1, profile_id: 1, resource_id: 1},
    {id: 2, profile_id: 1, resource_id: 2},
    {id: 3, profile_id: 1, resource_id: 3},
    {id: 4, profile_id: 1, resource_id: 4},
    {id: 5, profile_id: 1, resource_id: 5},
    {id: 6, profile_id: 1, resource_id: 6},
    {id: 7, profile_id: 1, resource_id: 7},
    {id: 8, profile_id: 1, resource_id: 8},
  ]);
}
