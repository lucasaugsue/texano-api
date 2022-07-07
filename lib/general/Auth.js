import moment from 'moment'
import Authenticate from '../../middlewares/Authenticate'
import { Resources as ResourcesModel } from '../models/Resources'
import { ResourcesProfiles as ResourcesProfilesModel } from '../models/ResourcesProfiles'
import AuthService from '../../services/AuthService'

export const renderUserAuth = user => ({
    ...user,
    oauth: Authenticate({
        id: user.id, 
        username: user.username, 
        cpf: user.cpf,
        jwt_datetime: moment().format(),
    }),
})

export const Auth = (router) => {

    router.post('/login', async (ctx, next) => {
        let params = {...ctx.data}
        const user = await AuthService.login(ctx, params)
        ctx.status = 200
        ctx.body = renderUserAuth(user)
    })
    
    router.get('/resources', async (ctx, next) => {
        const resourcesObject = await ResourcesModel.query()
        const resourceProfiles = await ResourcesProfilesModel.query().where("profile_id", {...ctx.companyProfile}.profile_id || 10000000)
        let resources = {}

        for(let r of resourcesObject){
            const allow = !!resourceProfiles.find(rp => rp.resource_id === r.id)
            if(allow) resources[`${r.key}`] = { ...r }
        }
        
        ctx.body = resources
    })
    
    // router.post('/signup', async (ctx, next) => {
    //     let params = {...ctx.data}
    //     if(!params.name) throw new Error(ctx.strings.noName)
    //     // if(!params.birthday) throw new Error(ctx.strings.noBirthday)
    //     if(!params.username) throw new Error(ctx.strings.noMail)
    //     if(!params.cpf) throw new Error(ctx.strings.noCpf)
    //     if(!params.phone) throw new Error(ctx.strings.noPhone)
    //     if(!params.password) throw new Error(ctx.strings.noPassword)

    //     delete params.password_confirmation
    //     params.cpf = params.cpf.replace(/ |\.|\-|\_/g, "")

    //     let existent = await Users.query().findOne(raw("LOWER(username)"), params.username.toLowerCase())
    //     if(existent) throw new Error(ctx.strings.existentMail)
    //     existent = await Users.query().findOne("cpf", params.cpf)
    //     if(existent) throw new Error(ctx.strings.existentCpf)

    //     const user = await Users.query().withGraphFetched("address").insertAndFetch({
    //         ...params,
    //         name: params.name.toUpperCase(),
    //         password: raw(`md5('${params.password}')`),
    //         username: params.username.toLowerCase(),
    //     })

    //     ctx.status = 201
    //     ctx.body = renderUserAuth(user)
    // })

}
