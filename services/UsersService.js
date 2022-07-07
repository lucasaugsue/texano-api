import {Customer as CustomerModel} from '../lib/models/Customer';
var moment = require('moment-timezone');

export default class UsersService{
    static generateExcel = async ({company_id}) => {
        var res = await CustomerModel.query().withGraphJoined("companies")
        .where("companies.id", company_id)
        .where("active", true)

        var obj = {};

        for (var i = 0, len = res.length; i < len; i++)
            obj[res[i]['id']] = res[i];

            res = new Array();
        for (var key in obj)
        res.push(obj[key]);

        let data = [
            ["", "Todos os usuários:"],
            [],
            [],
            ["", "Nome", "Email", "CPF", "Telefone"],
            [],
        ];

        for (let i in res) {
            let item = res[i];
            let response = [
                "",
                item.name,
                item.email,
                item.cpf,
                item.phone,
            ]
            data.push(response)
        }

        //Report footer
        data.push([])
        data.push([])
        let dateReport = ["", "Relatório gerado em: ", moment().tz("America/Fortaleza").format("DD/MM/YYYY HH:mm:ss")]
        data.push(dateReport)

        return data
    }
}


