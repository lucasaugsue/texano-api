import moment from 'moment';
import { raw, transaction } from 'objection';
import { formatReais } from '../../utils/Util';
import { Products } from '../models/Products';


export const Searches = (router) => {
    router.get('/general/:text', async (ctx, next) => {
        const searchProducts = await Products.query()
        .withGraphFetched('images')
        .where(raw('lower("name")'), 'like', `%${ctx.params.text.toLowerCase()}%`)
        .orWhere(raw('lower("subtitle")'), 'like', `%${ctx.params.text.toLowerCase()}%`)
        .orWhere(raw('lower("brand")'), 'like', `%${ctx.params.text.toLowerCase()}%`)

        const res = searchProducts.filter(p => p.active)
        ctx.body = res.map((p) => {
            return({
                id:p.id,
                name:p.name,
                price:formatReais(p.price),
                image:(p.images && p.images.length) ? p.images[0].image_url : ""
            })
        })
        ctx.status = 200;
    })
}