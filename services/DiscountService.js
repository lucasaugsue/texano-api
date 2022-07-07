import moment from 'moment';
import { Discounts } from '../lib/models/Discounts';
import { SalesStock } from '../lib/models/SalesStock';

const insertDiscount = async (params) => {
    const discount = await Discounts.query().insertAndFetch({
        percentage: params.percentage,
        amount: params.amount,
        sale_id: params.sale_id
    })
    return discount
}

const promotionalValue = async (params) => {
    const promotion = await SalesStock.query().withGraphFetched("stock.product.promotion_product.promotion")
    .where("sales_stock.sale_id", params.sale_id)
    .join("stock", "sales_stock.stock_id", "stock.id")
    .join("products", "stock.product_id", "products.id")
    .join("promotion_product", "products.id", "promotion_product.product_id")
    .join("promotion", "promotion_product.promotion_id", "promotion.id")
    .groupBy("sales_stock.id")
    
    const promotionMap = promotion.map(promo =>({
        sale_id: promo.sale_id,
        amount: promo.amount,

        promotion: !(promo.stock.product.promotion_product)?null
        :promo.stock.product.promotion_product.map(pp => ({
            active: pp.promotion.active,
            promotion_id: pp.promotion.id,

            promotion_amount: pp.amount,
            exact_amount: pp.promotion.exact_amount,
            final_date: pp.promotion.final_date,

            final_price: (moment().format()) >= (moment(pp.promotion.final_date).format()) 
                ?promo.amount>=pp.amount?pp.price_unit:promo.price
                :promo.price,
        }))
        
    }))

    let temp = []
    const reducer = (a, b) => a + b;
    promotionMap.map(pm => temp.push(pm.promotion[0].final_price*pm.amount))
    const final_value = temp.length>1?temp.reduce(reducer):"sem desconto em atacado"

    return final_value
}

export default {insertDiscount,promotionalValue}