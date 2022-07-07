import { CompanyInstallments as CompanyInstallmentsModel } from '../lib/models/CompanyInstallments';

export default class CompanyInstallmentsService{
    /**
    *
    * @description Função que retorna todas as parcelas pela empresa
    *
    * @param {Integer} product_id
    *
    * @returns {Array} [res]
    *
    */
    static getInstallments = async (companyprofiles) => {
        const allInstallments = await CompanyInstallmentsModel.query()
		.where("company_id", companyprofiles)

        return allInstallments
    }

    /**
    *
    * @description Função que cria uma parcela vinculada com o company_id
    *
    * @param {Integer} min_value
    * @param {Integer} company_id
    * @param {Integer} num_installments
    *
    * @returns {Object} {createInstallment}
    *
    */
     static createInstallment = async (company_id, num_installments, min_value) => {
        try{
            const createInstallment = await CompanyInstallmentsModel.query()
            .insertAndFetch({
                min_value: min_value,
                company_id: company_id,
                num_installments: num_installments,
            })
    
            return createInstallment
        }catch(err){
            throw new Error(err)
        }
    }
}


