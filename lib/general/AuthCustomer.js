import moment from 'moment'
import { Customer } from '../models/Customer'
import { CustomerPassword } from '../models/CustomerPassword'
import { raw } from 'objection'
import Authenticate from '../../middlewares/Authenticate'
import AuthService from '../../services/AuthService'
import { validCpf} from '../../utils/Util'
import md5 from 'md5'

export const renderUserAuth = user => ({
    ...user,
    customer_oauth: Authenticate({
        id: user.id, 
        username: user.name, 
        cpf: user.cpf,
        jwt_datetime: moment().format(),
    }),
})

export const CustomerAuth = (router) => {

    router.post('/login', async (ctx, next) => {
        let params = {...ctx.data}
        params.companyId =(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
        const user = await AuthService.customerLogin(ctx, params)
        ctx.status = 200
        ctx.body = renderUserAuth(user)
    })
    
    router.post('/signup', async (ctx, next) => {
        let params = {...ctx.data}
        params.company_id =(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)

        if(!params.company_id) throw new Error("Informe que serviço ira acessar")
        if(!params.name) throw new Error(ctx.strings.noName)
        if(!params.birthdate) throw new Error(ctx.strings.noBirthday)
        if(!params.email) throw new Error("Informe o email")
        if(!params.cpf) throw new Error(ctx.strings.noCpf)
        if(!params.phone) throw new Error(ctx.strings.noPhone)
        if(!params.password) throw new Error(ctx.strings.noPassword)
        if(params.password.length<6) throw new Error("Senha precisa ter mais de 6 digitos")

        if(!params.password_confirmation) throw new Error("Precisa da confirmaçao de senha")
        if (params.password !== params.password_confirmation) throw new Error('As senhas devem ser iguais')

        delete params.password_confirmation
        params.cpf = params.cpf.replace(/ |\.|\-|\_/g, "")
        if(!validCpf(params.cpf))throw new Error('Insira um CPF válido')
        const encriptedPassword = md5(params.password)
        delete params.password

        let existent = await Customer.query().findOne({email:params.email,company_id:params.company_id})
        let hasPassword
        if(existent){
            hasPassword = await CustomerPassword.query().findOne({customer_id:existent.id})
            if(existent.active && hasPassword) throw new Error(ctx.strings.existentMail)
            await hasPassword.$query().patch({password:encriptedPassword})
            const response = await existent.$query().patchAndFetch({
                ...params,
                name: params.name.toUpperCase(),
            })
            ctx.status = 201
            ctx.body = renderUserAuth(response)
            return;
        }
        existent = await Customer.query().findOne({"cpf":params.cpf,company_id:params.company_id})
        if(existent){
            hasPassword = await CustomerPassword.query().findOne({customer_id:existent.id})
            if(existent.active && hasPassword) throw new Error("Já existe uma conta com este CPF")
            await hasPassword.$query().patch({password:encriptedPassword})
            const response = await existent.$query().patchAndFetch({
                ...params,
                name: params.name.toUpperCase(),
            })
            ctx.status = 201
            ctx.body = renderUserAuth(response)
            return;
        }

        const customer = await Customer.query().insertAndFetch({
            ...params,
            name: params.name.toUpperCase(),
        })
    
        await CustomerPassword.query().insert({
            customer_id:customer.id,
            password:encriptedPassword
        })

        ctx.status = 201
        ctx.body = renderUserAuth(customer)
    })

}
