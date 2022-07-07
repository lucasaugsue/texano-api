import { transaction } from "objection";
import CustomProductService from '../../services/CustomProductService'
import { CustomProducts as CustomProductsModel } from '../models/CustomProducts';

export const CustomProducts = (router) => {
    /**
    * @description cria o produto customizável
    * 
    **/
    router.post('/', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
		const trx = await transaction.start(CustomProductsModel.knex())
        try {
            if (!params.company_id) throw new Error("sem o companyprofiles");
            if (!params.product_id) throw new Error("é necessário do produto");
            if (!params.listCombinations || params.listCombinations.length == 0) throw new Error("é necessário da lista de combinações");
            
            const createCustomProduct = await CustomProductService.createCustomProduct(
                params.listCombinations,    
                params.product_id, 
                params.company_id,
            )

            await trx.commit()
			ctx.status = 201
            ctx.body = createCustomProduct
        } catch (error) {
            await trx.rollback()
            throw new Error(`Erro ao criar um produto customizado, ${error.message}`);
        }
	})

    /**
    * @description retorna todas as categorias e os seus atributos customizáveis
    * 
    **/
    router.get('/all-attributes/:company_id', async (ctx, next) => {
    	let params = { ...ctx.data, ...ctx.params};
		const trx = await transaction.start(CustomProductsModel.knex())
        try {
            if (!params.company_id) throw new Error("Sem o company_id");
            const allAttributes = await CustomProductService.attributesAndTheirCategories(params.company_id)

            await trx.commit()
			ctx.status = 201
            ctx.body = allAttributes
        } catch (error) {
            await trx.rollback()
            throw new Error(`Erro ao retornar os atributos e as categorias customizáveis, ${error.message}`);
        }
	})

    /**
    * @description retorna as informações do produto específico
    * 
    **/
    router.get('/info/:product_id', async (ctx, next) => {
    	let params = { ...ctx.data, ...ctx.params};
        try {
            if (!params.product_id) throw new Error("Sem o product_id");
            const info = await CustomProductService.infoProduct(params.product_id)

			ctx.status = 200
            ctx.body = info
        } catch (error) {
            throw new Error(`Erro ao retornar a informação do produto, ${error.message}`);
        }
	})

    /**
    * @description editar as informações do produto
    * 
    **/
    router.patch('/', async (ctx, next) => {
    	let params = { ...ctx.data, ...ctx.params};
        try {
            if (!params.product_id) throw new Error("Sem o product_id");
            if (!params.product_id) throw new Error("é necessário do produto");
            if (!params.listCombinations || params.listCombinations.length == 0) throw new Error("é necessário da lista de combinações");

            const editCustomProduct = await CustomProductService.editCustomProduct(
                params.listCombinations,    
                params.product_id, 
                params.company_id,
            )

			ctx.status = 200
            ctx.body = editCustomProduct
        } catch (error) {
            throw new Error(`Erro ao retornar a informação do produto, ${error.message}`);
        }
	})

    /**
    * @description cria uma categoria customizável
    * 
    **/
     router.post('/new-custom-category/', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
        try {
            if (!params.company_id) throw new Error("sem o companyprofiles");
            if (!params.name) throw new Error("sem o nome");

            const createCustomCategory = await CustomProductService.createCustomCategory (
                params.company_id,
                params.name,
            )

			ctx.status = 200
            ctx.body = createCustomCategory 
        } catch (error) {
            throw new Error(`Erro ao criar uma categoria customizável, ${error.message}`);
        }
	})

    /**
    * @description cria um atributo customizável
    * 
    **/
     router.post('/new-custom-attribute/', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
        try {
            if (!params.custom_category_id) throw new Error("sem o custom_category_id");
            if (!params.title) throw new Error("sem o title");

            const createCustomAttribute = await CustomProductService.createCustomAttribute (
                params.custom_category_id,
                params.title,
            )

			ctx.status = 200
            ctx.body = createCustomAttribute 
        } catch (error) {
            throw new Error(`Erro ao criar uma categoria customizável, ${error.message}`);
        }
	})
    
    /**
    * @description remove uma customização de um produto
    * 
    **/
     router.patch('/remove/product/customization', async (ctx, next) => {
    	let params = {...ctx.data, ...ctx.params};
        try {
            if (!params.id) throw new Error("Não conseguimos encontrar esta customização, tente novamente em alguns minutos!");

            const response = await CustomProductService.deleteCustomization(params.id)
			ctx.status = 200
            ctx.body = response
        } catch (error) {
            throw new Error(`Erro ao remover esta customização, ${error.message}`);
        }
	})
}