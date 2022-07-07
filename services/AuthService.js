import md5 from 'md5'
import { raw } from 'objection'
import { Users as UsersModel } from "../lib/models/Users"
import { Customer as CustomerModel } from "../lib/models/Customer"

class AuthService{

    static login(ctx, params){
        return new Promise(async (resolve, reject) => {
            try{
                if(!params.username) throw new Error(ctx.strings.noMail)
                if(!params.password) throw new Error(ctx.strings.noPassword)

                let user = await UsersModel.query()
                    .withGraphFetched("[address, companyProfiles]")
                    .where(build => {
                        build
                        .where(raw("LOWER(username)"), params.username.toLowerCase())
                        .orWhere("cpf", params.username.replace(/ |\.|\-|\_/g, ""))
                    })
                    .findOne("password", md5(params.password))

                if(!user) throw new Error(ctx.strings.loginFailed)
                if(!user.companyProfiles[0]) throw new Error(ctx.strings.userWithoutProfile)

                resolve(user)
            }catch(err){
                reject(err)
            }
        })
    }

    static async customerLogin(ctx, params){
            try{
                if(!params.username) throw new Error(ctx.strings.noMail)
                if(!params.companyId) throw new Error("informe que serviço ira acessar")
                if(!params.password) throw new Error(ctx.strings.noPassword)

                let customer = await CustomerModel.query()
                    .joinRelated('password')
                    .where(build => {
                        build
                        .where('email', params.username)
                        .orWhere("cpf", params.username.replace(/ |\.|\-|\_/g, ""))
                    })
                    .where('company_id',params.companyId)
                    .findOne("password.password", md5(params.password))

                if(!customer) throw new Error(ctx.strings.loginFailed)

                return customer
            }catch(err){
                throw Error(err)
            }
    }
}

export default AuthService