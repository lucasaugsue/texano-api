import { raw, transaction } from 'objection';
import UsersService from "../../services/UsersService";
import { Customer as CustomerModel } from '../models/Customer';
import { Users as UsersModel } from '../models/Users';
import xlsx from 'node-xlsx';
var moment = require('moment-timezone');

export const Users = (router) => {
    
    router.get('/list', async (ctx, next) => {
        const res = await CustomerModel.query().withGraphJoined("companies")
        .where("companies.id", ctx.companyProfile.company_id)
        .where("active", true)

        ctx.body = res 
    })

    router.post('/save', async (ctx, next) => {
        const {username, profile_id} = {...ctx.data}
        if(!username) throw new Error("Informe o nome de usuário, por favor");
        if(!profile_id) throw new Error("Selecione um perfil de acesso");

        let user = await UsersModel.query().findOne(raw("LOWER(username)"), username.toLowerCase())
    
        await UsersModel.query().patchAndFetchById(user.id, {profile_id, company_id: ctx.companyProfile.company_id})

        ctx.status = 201
    })

    router.post('/excel/generate', async (ctx, next) => {
        try{
            const company_id = ctx.companyProfile.company_id
            const data = await UsersService.generateExcel({company_id: company_id})

            const options = {
                '!cols': [{wch: 10}, {wch: 20}, {wch: 22}, {wch: 15}, {wch: 15}], 
                '!rows': [{hpt: 15}, {hpt: 15}, {hpt: 15}, {hpt: 15}, {hpt: 15}]
            };

            var buffer = xlsx.build([{
                data: data,
                name: "Usuários",
                options: options,
            }]);

            let file = `${moment().tz("America/Fortaleza").format('DDMMYYYYHHmm')}-sales`

            ctx.attachment(file + ".xlsx")
            ctx.body = buffer
            ctx.status = 200
            
        }catch(err){
            ctx.status = 500
            throw new Error("Não foi possível gerar o excel ", err);
        }
    })

}