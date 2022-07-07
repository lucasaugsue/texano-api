
exports.seed = function(knex) {
  return knex('resources').insert([
    {id: 1, key: "dashboard", type: "menu-group", name: "Dashboard"},
    {id: 2, parent_id: 1, key: "dashboard.home", type: "menu", name: "Início", link: "/dashboard"},
    {id: 3, key: "configs", type: "menu-group", name: "Configurações"},
    {id: 4, parent_id: 3, key: "configs.users", type: "menu", name: "Usuários", link: "/configuracoes/usuarios"},
    {id: 5, parent_id: 3, key: "configs.users.create", type: "frame", name: "Cadastrar"},
    {id: 6, parent_id: 3, key: "configs.users.update", type: "frame", name: "Editar"},
    {id: 7, parent_id: 3, key: "configs.users.delete", type: "frame", name: "Remover"},
    {id: 8, key: "contents", type: "menu", name: "Conteúdos"},

  ]);
};
