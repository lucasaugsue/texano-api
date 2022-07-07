import {Companies as CompaniesModel} from '../models/Companies'
import DonationsService from '../../services/DonationsService'

export const Donations = (router) => {
    router.post('/create', async (ctx, next) => {
        const data = ctx.data

        const company = await CompaniesModel.query().findById(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
        
        const {donate_value : value, method, card, customer} = data

        switch(method){
            case "credit":
                await DonationsService.makeCreditDonation(ctx, {company, value, card, customer})
            break;
            default:
                throw new Error("Não implementado")
        }

        ctx.status = 201
    })
}