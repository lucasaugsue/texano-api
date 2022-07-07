import { transaction } from 'objection';
import { Discounts as DiscountsModel } from '../models/Discounts';
import { Promotion } from '../models/Promotion';
import { Products } from '../models/Products';
import { PromotionProduct } from '../models/PromotionProduct';
import DiscountService from '../../services/DiscountService'
import moment from 'moment'
import { Sales } from '../models/Sales';
import { SalesStock } from '../models/SalesStock';
import { groupBy } from '../../utils/Util'

export const Discount = (router) => {
    router.get('/:company_id', async (ctx, next) => {
        const company_id = ctx.params.company_id
        ctx.body = await DiscountsModel.query()
    })

    router.post('/', async (ctx, next) => {
        let params = {...ctx.data}
        try{
            const discount = await DiscountService.insertDiscount(params)
            ctx.body = discount

        }catch(error){
            throw new Error(`Erro ao inserir um disconto,${error.message}`)
        }  
    })

    router.delete('/:id', async (ctx, next) => {
        const trx = await transaction.start(DiscountsModel.knex())
        try{
            const response = await DiscountsModel.query().deleteById(ctx.params.id)
            await trx.commit()
            ctx.status = 200
            ctx.body = response

        } catch(err){
            console.log(err.message);
            await trx.rollback()
            ctx.status = 400
            ctx.body = err.message
        }

    })
} 