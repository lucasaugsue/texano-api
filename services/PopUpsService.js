import moment from "moment";
import { raw, transaction } from "objection";
import { PopUps } from "../lib/models/PopUps";
import { PopUpsClicks } from "../lib/models/PopUpsClicks";

const now = moment().format();

export default class PopUpsService {
	/**
	*
	* @description Função que retorna os popups de acordo com o companyId
	*
	* @param {Integer} company_id
	*
	* @returns {Array} popups
	*
	*/
	static async getCompanyPopUps(company_id) {
		const popups = await PopUps.query()
		.withGraphFetched('[coupon,clicks]')
		.where({company_id})
		.where({active:true})
		.where(raw("DATE(end_at)"), ">=", moment().format("YYYY-MM-DD"))
		return popups
	}
	
	/**
	*
	* @description Função que retorna os popups de acordo com o companyId e uma data
	*
	* @param {Integer} company_id
	* @param {Date} date
	*
	* @returns {Array} popups
	*
	*/
	static async checkDateForPopUps(company_id=10,date=moment().format()) {
		const popups = await PopUps.query()
		.withGraphFetched('[coupon,clicks]')
		.modifyGraph("coupon", builder => builder.where("active", true))
		.where({company_id})
		.where({active:true})
        .where(raw("DATE(start_at)"),"<", moment(date).format("YYYY-MM-DD"))
        .andWhere(raw("DATE(end_at)"),">", moment(date).format("YYYY-MM-DD"));
		return popups
	}
	
	/**
	*
	* @description Função que retorna os dados de um popup
	*
	* @param {Integer} popup_id
	*
	* @returns {Object} popUp
	*
	*/
	static async getPopUp(popup_id) {
		const popUp = await PopUps.query().withGraphFetched('[coupon,clicks]')
		.findById(popup_id)
		return popUp
	}
	
	/**
	*
	* @description Função que cria um popup para uma empresa
	*
	* @param {Object} params
	* @param {Integer} params.company_id
	* @param {Integer} params.coupon_id
	* @param {String} params.title
	* @param {String} params.description
	* @param {String} params.image
	* @param {Date} params.start_at
	* @param {Date} params.end_at
	*
	* @returns {Object} newPopUp
	*
	*/
	static async createPopUp(params){
        const trx = await transaction.start(PopUps.knex())
		try{
			if(!params.company_id) throw new Error ("Não conseguimos identificar a empresa deste popup, entre em contato com o suporte.");
			if(!params.title) throw new Error ("Informe o título do popup!");
			if(!params.start_at) throw new Error ("Informe a data inicial do popup!");
			if(!params.end_at) throw new Error ("Informe a data de expiração do popup!");

			
			const newPopUpParams = {
				title:params.title,
				description:params.description,
				image:params.image,
				company_id:params.company_id,
				coupon_id:params.coupon_id,
				start_at: params.start_at,
				end_at: params.end_at,
				active:true,
				created_at:now,
				updated_at:now,
			}
			const newPopUp = await PopUps.query(trx).insertAndFetch(newPopUpParams)
			await trx.commit();
			return newPopUp
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}

	/**
	*
	* @description Função que edita um popup
	*
	* @param {Integer} popup_id
	* @param {Object} params
	* @param {Integer} params.company_id
	* @param {Integer} params.coupon_id
	* @param {String} params.title
	* @param {String} params.description
	* @param {String} params.image
	* @param {Date} params.start_at
	* @param {Date} params.end_at
	*
	* @returns {Object} editedPopUp
	*
	*/
	static async editPopUp(popup_id,params){
		console.log({params})
        const trx = await transaction.start(PopUps.knex())
		try{
			if(!params.company_id) throw new Error ("Não conseguimos identificar a empresa deste popup, entre em contato com o suporte.");
			if(!params.title) throw new Error ("Informe o título do popup!");
			if(!params.start_at) throw new Error ("Informe a data inicial do popup!");
			if(!params.end_at) throw new Error ("Informe a data de expiração do popup!");

			
			const editedPopUpParams = {
				title:params.title,
				image:params.image,
				description:params.description,
				company_id:params.company_id,
				coupon_id:params.coupon_id,
				start_at: params.start_at,
				end_at: params.end_at,
				active:true,
				created_at:now,
				updated_at:now,
			}
			const editedPopUp = await PopUps.query(trx).updateAndFetchById(popup_id,editedPopUpParams)
			await trx.commit();
			return editedPopUp
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}

	/**
	*
	* @description Função que inativa um popup
	*
	* @param {Object} params
	* @param {Integer} popup_id
	*
	*
	* @returns {Object} deletedPopUp
	*/
	static async deletePopUp(popup_id){
        const trx = await transaction.start(PopUps.knex())
		try{
			if(!popup_id) throw new Error ("Não conseguimos identificar este popup, entre em contato com o suporte.");

			const deletedPopUpParams = {
				active:false,
				updated_at:now,
			}
			const deletedPopUp = await PopUps.query(trx).updateAndFetchById(popup_id,deletedPopUpParams)
			await trx.commit();
			return deletedPopUp
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}
	
	/**
	*
	* @description Função que grava o clique em um popup
	*
	* @param {Object} params
	* @param {Object} params.user_id
	* @param {Integer} popup_id
	*
	*
	* @returns {Object} newPopUpClick
	*/
	static async userClickedPopUp(params,popup_id){
        const trx = await transaction.start(PopUps.knex())
		try{
			const newPopUpClickParams = {
				customer_id:params.customer_id,
				popup_id:popup_id,
				clicked_at:now,
				updated_at:now,
			}
			const newPopUpClick = await PopUpsClicks.query(trx).insertAndFetch(newPopUpClickParams)
			await trx.commit();
			return newPopUpClick
		}catch(error){
			await trx.rollback();
			return error.message
		}
	}


}