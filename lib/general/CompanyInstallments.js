import { CompanyInstallments as CompanyInstallmentsModel } from '../models/CompanyInstallments';
import CompanyInstallmentsService from '../../services/CompanyInstallmentsService'
import { Sales as SalesModel } from '../models/Sales';
import { transaction } from 'objection';

export const CompanyInstallments = (router) => {
    
    router.get('/available/:sale_id', async (ctx, next) => {
		const customer = ctx.customerInfo
		const sale = await SalesModel.query().findById(ctx.params.sale_id)

		var installments = await CompanyInstallmentsModel.query()
		.where("company_installments.company_id", customer.company_id)
		//.where("active", true)

		let final = installments.reduce((acc, curr) => {
			let item = (sale.price/parseInt(curr.num_installments)) >= parseFloat(curr.min_value) 
			if(item === true) {
				acc.push({
					id: curr.id,
					company_id: curr.company_id,
					num_installments: parseInt(curr.num_installments),
					price:(sale.price/parseInt(curr.num_installments))
				})
			}

			return acc
		}, [])

		ctx.body = final
	})

	/**
    * @description retorna todas as categorias e os seus atributos customizáveis
    * 
    **/
	 router.get('/all/:company_id', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
        try {
            if (!params.company_id) throw new Error("Sem o company_id");
            const allInstallments = await CompanyInstallmentsService.getInstallments(params.company_id)

			ctx.status = 201
            ctx.body = allInstallments
        } catch (error) {
            await trx.rollback()
            throw new Error(`Erro ao retornar as parcelas, ${error.message}`);
        }
	})

	/**
    * @description cria uma parcela vinculada com a empresa
    * 
    **/
	 router.post('/', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
		const trx = await transaction.start(CompanyInstallmentsModel.knex())
        try {
            if (!params.min_value) throw new Error("é necessário do valor mínimo");
            if (!params.num_installments) throw new Error("é necessário do número de parcelas");
            if(params.num_installments && (parseInt(params.num_installments) > 12)) throw new Error("Insira no máximo 12 parcelas!");
            
            const createInstallment = await CompanyInstallmentsService.createInstallment(
                params.company_id,
                params.num_installments, 
                params.min_value,    
            )

            await trx.commit()
			ctx.status = 201
            ctx.body = createInstallment
        } catch (error) {
            await trx.rollback()
            throw new Error(`Erro ao criar uma parcela, ${error.message}`);
        }
	})
    
    /**
    * @description deleta uma parcela vinculada com a empresa
    * 
    **/
	 router.delete('/:id', async (ctx, next) => {
    	let {id} = ctx.params
		const trx = await transaction.start(CompanyInstallmentsModel.knex())
        try {
            
            const deletedInstallment = await CompanyInstallmentsModel.query(trx).deleteById(id);

            await trx.commit()
			ctx.status = 201
            ctx.body = deletedInstallment
        } catch (error) {
            await trx.rollback()
            throw new Error(`Erro ao deletar uma parcela, ${error.message}`);
        }
	})

}