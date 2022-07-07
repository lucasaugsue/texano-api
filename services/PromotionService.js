import moment from 'moment-timezone'
import { raw, transaction } from 'objection'

import { Products } from '../lib/models/Products'
import { Promotion } from '../lib/models/Promotion'
import { PromotionProduct } from '../lib/models/PromotionProduct'
import { PromotionSale } from '../lib/models/PromotionSale'
import SaleService from './SaleService'

const makePromotion = async (data) =>{
    const {company_id,exact_amount,final_date,initial_date,products } = data
    const trx = await transaction.start(Promotion.knex())
    try {
        var newProducts = []
        const promotion = await Promotion.query(trx).insertAndFetch({
                                company_id:company_id,
                                exact_amount:exact_amount,
                                initial_date:initial_date,
                                final_date:final_date
                            })
        await Promise.all(products.map(async(item)=>{
            const {price_unit,amount,product_id} = item
            console.log("item",item);
            if(!product_id) throw new Error("Para criar a promoção é necessario o id do produto")
            if(!price_unit) throw new Error("Para criar a promoção é necessario o preço por unidade")
            if(!amount) throw new Error("Para criar a promoção é necessario a quantia do produto")
            const product = await Products.query(trx).where({id:product_id,company_id:company_id})
            if(!product.length) throw new Error("Para criar a promoção é necessário inserir um produto existente")
            const insertedProduct = await product[0].$relatedQuery('promotion_product',trx).insert({
                price_unit:price_unit,
                amount:amount,
                product_id:product_id,
                promotion_id:promotion.id
            }).returning(['price_unit','amount','product_id'])
            newProducts.push(insertedProduct)
        }))

        
        const response = {
            ...promotion,
            products_on_promotion:newProducts
        }

        trx.commit()
        return response

    } catch (error) {
        trx.rollback()
        throw new Error(error.message)
    }
}

const makePricePromotion = async (data) =>{
    const {company_id,by_price,by_price_type, total_value } = data
    const trx = await transaction.start(Promotion.knex())
    try {
        const response = await Promotion.query(trx).insertAndFetch({
            company_id:company_id,
            by_price,
            by_price_type, 
            total_value 
        })
        console.log({response})
        trx.commit()
        return response

    } catch (error) {
        trx.rollback()
        throw new Error(error.message)
    }
}
const getAvailablePromotionByCompanyAndSale = async (company_id, sale_id) =>{
    //BY_PRICE_TYPE: 
    // 1 = Frete Grátis
    // 2 = 10% OFF
    // 3 = R$10 OFF
    const now = moment().format();
    const data = {
        company_id,
        sale_id
    }
    const sale = await SaleService.getSale(data)
    const response = await Promotion.query()
    .findOne({company_id,
        active:true,
        by_price:true,
    }).where('total_value', '<', sale.initial_price).where('by_price_type', 1).orWhere('by_price_type', 2).orWhere('by_price_type', 3);

    //Possibilidade: Limitar a consulta por período, via colunas initial_date e final_date
    if(!response) throw new Error("Sem promoções hoje.");
    return response
}

const deletePromotion = async (promotion_id,company_id) => {
    const trx = await transaction.start(Promotion.knex())
    try {
        let deletedPromotion
        const promotions_sales = await PromotionSale.query(trx).where({promotion_id:promotion_id})
        if (!promotions_sales.length) {
            deletedPromotion = await Promotion.query(trx).where({id:promotion_id,company_id:company_id})
            if(!deletedPromotion.length) throw new Error("Promoção não encontrada")
            await deletedPromotion[0].$relatedQuery('promotion_product',trx).where({promotion_id:promotion_id}).delete()
            await deletedPromotion[0].$query(trx).delete().returning('*')
        }else{
            deletedPromotion = await Promotion.query(trx).where({id:promotion_id,company_id:company_id}).patchAndFetch({active:false})
            if(!deletedPromotion.length) throw new Error("Promoção não encontrada")
        }
        trx.commit()
        return deletedPromotion
    } catch (error) {
        trx.rollback()
        throw new Error(error.message)
    }
}

const getAllPromotionByCompany = async (company_id, products=[]) =>{
    try{
        let response
        if(products && (products.length > 0)){
            response = await Promotion.query()
            .withGraphFetched("[promotion_product.product]")
            .where({company_id:company_id})
            .join('promotion_product', 'promotion.id', 'promotion_product.promotion_id')
            .whereIn("promotion_product.product_id", products.map(p => p.product_id))
            .where(raw("DATE(initial_date)"), "<=", moment().format("YYYY-MM-DD"));
            // .where(raw("DATE(final_date)"), ">=", moment().format("YYYY-MM-DD")) 
        }else{
            response = await Promotion.query()
                .withGraphFetched("[promotion_product.product]")
                .where({company_id:company_id})
                .where(raw("DATE(initial_date)"), "<=", moment().format("YYYY-MM-DD"));
                // .where(raw("DATE(final_date)"), ">=", moment().format("YYYY-MM-DD"))    
        }
        return response
    }catch(err){
        console.log({err2:err});
        throw new Error(err);
    }
}

const getAllPromotionBySale = async (sale_id,company_id) =>{
    const promotionList = await PromotionSale.query().where({sale_id:sale_id})
    .withGraphFetched("promotion.promotion_product")
    .modifyGraph('promotion',builder => {
        builder.where({company_id:company_id})
    })
    return promotionList
}

const hasPromo = (products, promo) => {
    return (promo.promotion_product || []).length > 0 && !(promo.promotion_product || []).some(pp => {
        const qt = products.reduce((pv, p) => pv + (p.product_id === pp.product_id ? p.amount : 0),0) 
        return qt < pp.amount
    })
}


function permutation(xs) {
    let ret = [];
    for (let i = 0; i < xs.length; i = i + 1) {
        let rest = permutation(xs.slice(0, i).concat(xs.slice(i + 1)));

        if(!rest.length) {
            ret.push([xs[i]])
        } else {
            for(let j = 0; j < rest.length; j = j + 1) {
                ret.push([xs[i]].concat(rest[j]))
            }
        }
    }
    return ret;
}

/**
*
* @description Função que calcula o melhor desconto a ser aplicado em uma lista de produtos, com base nas promoções válidas
*
* @param {Array} products Produtos com os seguintes attributos: product_id, name, amount, unit_price, stock_id
* @param {Array} promotions Promoções consultada no método PromotionService.getAllPromotionByCompany
*
* @returns {Object} {finalValue, separatedProductsValue, promosValue, promos}
*
*/
const getBetterPromotion = (products, promotions) => {
    try{
        const calculatedPromotions = permutation(promotions).map(arr => calculatePromotions(products, arr));
        return calculatedPromotions.sort((a,b) => a.finalValue > b.finalValue ? 1 : -1)[0];
    }catch(err){
        console.log({err3:err})
        throw new Error(err);
    }
}

const calculatePromotions = (products, promotions) => {
    let tempProducts = [...products]
    let removed = {}
    for(let promo of promotions){
        while(hasPromo(tempProducts, promo)){
            tempProducts = tempProducts.map(p => {
                let amount = p.amount
                for(let pp of (promo.promotion_product || [])){
                    if(amount >= 0 && pp.product_id === p.product_id){
                        const toRemove = promo.exact_amount ? pp.amount : amount
                        amount -= toRemove
                        removed[pp.id] = {
                            ...pp,
                            quantity: removed[pp.id] ? removed[pp.id].quantity + toRemove : toRemove
                        }
                    }
                }
                
                return amount > 0 ? {...p, amount} : null
            }).filter(notNull => notNull)
        }
    }
    const promos = []
    for(let k in removed){ promos.push(removed[k]) }

    const separatedProductsValue = tempProducts.reduce((pv, p) => pv+(p.amount * p.unit_price),0)
    const promosValue = promos.reduce((pv, p) => pv+(p.quantity * p.price_unit),0)

    return {
        finalValue: separatedProductsValue + promosValue,
        separatedProductsValue,
        promosValue,
        promos,
    }
}

export default {getAvailablePromotionByCompanyAndSale,makePricePromotion,makePromotion,deletePromotion,getAllPromotionByCompany,getAllPromotionBySale, getBetterPromotion}