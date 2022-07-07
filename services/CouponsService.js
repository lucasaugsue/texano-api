import moment from "moment";
import { transaction } from "objection";
import { Coupons } from "../lib/models/Coupons";
import { CouponsUsers } from "../lib/models/CouponsUsers";
import { Sales } from "../lib/models/Sales";
import SaleService from "./SaleService";

export default class CouponsService {
	/**
	*
	* @description Função que retorna os cupons de acordo com o companyId
	*
	* @param {Integer} company_id
	*
	* @returns {Array} coupons
	*
	*/
	static async getCompanyCoupons(company_id) {
		const coupons = await Coupons.query().where({company_id}).where({active:true})
		return coupons
	}
	
	/**
	*
	* @description Função que retorna os dados de um cupom
	*
	* @param {Integer} coupon_id
	*
	* @returns {Object} coupon
	*
	*/
	static async getCoupon(coupon_id) {
		const coupon = await Coupons.query().findById(coupon_id)
		return coupon
	}
	
	/**
	*
	* @description Função que retorna os dados de um cupom pelo código
	*
	* @param {String} code
	*
	* @returns {Object} coupon
	*
	*/
	static async getCouponByCode(code) {
		const coupon = await Coupons.query().findOne({code, active:true})
		if(!coupon) throw new Error("Este código é inválido ou já expirou!");
		return coupon
	}
	
	/**
	*
	* @description Função que cria um cupom para uma empresa
	*
	* @param {Object} params
	* @param {Integer} params.company_id
	* @param {String} params.code
	* @param {Float} params.discount_price
	* @param {Float} params.discount_percentage
	* @param {Integer} params.limit_total
	* @param {Integer} params.limit_by_user
	* @param {Date} params.start_at
	* @param {Date} params.end_at
	*
	* @returns {Object} newCoupon
	*
	*/
	static async createCoupon(params){
        const trx = await transaction.start(Coupons.knex())
		try{
			if(!params.company_id) throw new Error ("Não conseguimos identificar a empresa deste cupom, entre em contato com o suporte.");
			if(!params.code) throw new Error ("Informe o código do cupom!");
			if(!params.discount_price && !params.discount_percentage) throw new Error ("Insira pelo menos 1 tipo de desconto!");

			const now = moment().format();
			const newCouponParams = {
				code:params.code,
				company_id:params.company_id,
				discount_price:params.discount_price,
				discount_percentage:params.discount_percentage,
				start_at: (params.start_at || null),
				end_at: (params.end_at || null),
				limit_total:(params.limit_total || null),
				limit_by_user:(params.limit_by_user || null),
				active:true,
				created_at:now,
				updated_at:now,

			}
			const newCoupon = await Coupons.query(trx).insertAndFetch(newCouponParams)
			await trx.commit();
			return newCoupon
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}

	/**
	*
	* @description Função que edita um cupom
	*
	* @param {Object} params
	* @param {Integer} params.company_id
	* @param {String} params.code
	* @param {Float} params.discount_price
	* @param {Float} params.discount_percentage
	* @param {Integer} params.limit_total
	* @param {Integer} params.limit_by_user
	* @param {Date} params.start_at
	* @param {Date} params.end_at
	*
	* @returns {Object} editedCoupon
	*
	*/
	static async editCoupon(params){
        const trx = await transaction.start(Coupons.knex())
		try{
			if(!params.coupon_id) throw new Error ("Não conseguimos identificar este cupom, entre em contato com o suporte.");
			if(!params.company_id) throw new Error ("Não conseguimos identificar a empresa deste cupom, entre em contato com o suporte.");
			if(!params.code) throw new Error ("Informe o código do cupom!");
			if(!params.discount_price && !params.discount_percentage) throw new Error ("Insira pelo menos 1 tipo de desconto!");

			const now = moment().format();
			const editedCouponParams = {
				code:params.code,
				discount_price:params.discount_price,
				discount_percentage:params.discount_percentage,
				start_at: (params.start_at || null),
				end_at: (params.end_at || null),
				limit_total:(params.limit_total || null),
				limit_by_user:(params.limit_by_user || null),
				updated_at:now,

			}
			const editedCoupon = await Coupons.query(trx).updateAndFetchById(params.coupon_id,editedCouponParams)
			await trx.commit();
			return editedCoupon
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}

	/**
	*
	* @description Função que inativa um cupom
	*
	* @param {Object} params
	* @param {Integer} params.coupon_id
	*
	*
	* @returns {Object} deletedCoupon
	*/
	static async deleteCoupon(params){
        const trx = await transaction.start(Coupons.knex())
		try{
			if(!params.coupon_id) throw new Error ("Não conseguimos identificar este cupom, entre em contato com o suporte.");

			const now = moment().format();
			const deletedCouponParams = {
				active:false,
				updated_at:now,
			}
			const deletedCoupon = await Coupons.query(trx).updateAndFetchById(params.coupon_id,deletedCouponParams)
			await trx.commit();
			return deletedCoupon
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}

	/**
	*
	* @description Função que aplica um cupom a um usuário
	*
	* @param {Object} params
	* @param {Integer} params.company_id
	* @param {Integer} params.sale_id
	* @param {Integer} params.customer_id
	* @param {String} params.id //Cupom
	* @param {String} params.code //Cupom
	* @param {Float} params.discount_price //Cupom
	* @param {Float} params.discount_percentage //Cupom
	* @param {Integer} params.limit_total //Cupom
	* @param {Integer} params.limit_by_user //Cupom
	* @param {Date} params.start_at //Cupom
	* @param {Date} params.end_at //Cupom
	*
	* @returns {Object} newCustomerCoupon
	*
	*/
	static async claimCoupon(params){
		console.log({params})
        const trx = await transaction.start(CouponsUsers.knex())
		try{
			if(!params.company_id) throw new Error ("Não conseguimos identificar a empresa deste cupom, entre em contato com o suporte.");
			if(!params.customer_id) throw new Error ("Não conseguimos identificar este consumidor, entre em contato com o suporte.");
			if(!params.sale_id) throw new Error ("Não conseguimos identificar esta venda, entre em contato com o suporte.");
			const now = moment().format();

			const newCouponUserParams = {
				sale_id:params.sale_id,
				coupon_id:params.coupon.id,
				customer_id:params.customer_id,
				used_at:now,
				created_at:now,
				updated_at:now,
			}
			const sale = await SaleService.getSale(params)
			
			let promotionalValue = sale.initial_price;
			if(params.coupon && params.coupon.discount_percentage){
				promotionalValue -= (promotionalValue*(params.coupon.discount_percentage/100));
            } else if(params.coupon && params.coupon.discount_price){
				promotionalValue -= (params.coupon.discount_price);
            }
			const newCustomerCoupon = await CouponsUsers.query(trx).insertAndFetch(newCouponUserParams)
			const updatedSale = await Sales.query(trx).updateAndFetchById(sale.id, {coupon_discount_price: promotionalValue, price: promotionalValue})
			await trx.commit();
			return {newCustomerCoupon, updatedSale}
		}catch(error){
			console.log({error});
			await trx.rollback();
			return error.message
		}
	}

}