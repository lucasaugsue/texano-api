import { Categories as CategoriesModel } from '../models/Categories';
import { ProductCategory } from '../models/ProductCategory';
import { raw } from 'objection'
import { transaction } from 'objection'
import moment from 'moment';

export const Categories = (router) => {
    router.get('/all-by/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        ctx.body = await CategoriesModel.query()
        .where("company_id", ctx.params.company_id)
        .where("active", true)
    })

    router.post('/add-category', async (ctx, next) => {
        const trx = await transaction.start(CategoriesModel.knex())
        try {
            let params = {...ctx.data}
            if(!params.category_name) throw new Error("Para adicionar um produto é preciso colocar um Nome")
            if(!params.company_id) throw new Error("Para adicionar um produto é preciso do company_id")
            
            let existentCategory = await CategoriesModel.query(trx)
            .findOne({"category_name": params.category_name.toUpperCase(), "company_id": params.company_id})
            if(existentCategory&&existentCategory.active){
                throw new Error("Já exist uma categoria com esse nome para esse usuário")
            }else if(existentCategory){
                const updated = await existentCategory.$query(trx).patchAndFetch({active:true})
                await trx.commit()
                ctx.status = 200    
                ctx.body = updated
            }else{
                const category = await CategoriesModel.query(trx).insertAndFetch({
                    category_name: params.category_name.toUpperCase(),
                    company_id: params.company_id,
                    active: true
                })
                await trx.commit()
                ctx.status = 200
                ctx.body = category
            }
        } catch (error) {
            await trx.rollback()
            ctx.status = 400
            ctx.body = error.message
        }
        
    })

    router.post('/link-product_id/with-category_id', async (ctx,netx) => {
        const trx = await transaction.start(ProductCategory.knex())
        let params = {...ctx.data};
        let linkProduct;
        try {
            if(params.category_id.length){
                const tempList = []
                const inDataBase = (await ProductCategory.query().where("product_id", params.product_id)).map(c => c.category_id)
                const toRemove = inDataBase.filter(item => !params.category_id.includes(item))
                const toAdd = params.category_id.filter(c => !inDataBase.includes(c));
                if(toRemove.length){
                    let removedCategory = await ProductCategory.query(trx).delete()
                    .where('product_id', params.product_id)
                    .whereIn('category_id', toRemove);
                }
                await Promise.all(
                    params.category_id.map(async(id) => {
                        if(toAdd.includes(id)){
                            let newCategory = await ProductCategory.query(trx).insertAndFetch({
                                product_id: params.product_id,
                                category_id: id
                            })
                            tempList.push(newCategory)
                        }
                    })
                ) 

                linkProduct = tempList;
            }else{
                    const existent = await ProductCategory.query()
                    .findOne({"product_id": params.product_id})
                    // if(existent) throw new Error("Já foi adicionado essa categoria para esse produto")
                    if(existent){
                        await ProductCategory.query(trx).delete()
                        .where('product_id', params.product_id)
                        .andWhereNot('id', existent.id)
                        await ProductCategory.query(trx).updateAndFetchById(existent.id,{
                            category_id: params.category_id,
                            updated_at:moment().format()
                        })
                    }else{
                        linkProduct =  await ProductCategory.query(trx).insertAndFetch({
                            product_id: params.product_id,
                            category_id: params.category_id
                        })
                    }
            }
            
            await trx.commit()
            ctx.status = 200
            ctx.body = linkProduct;
        } catch (error) {
            console.log(error);
            await trx.rollback()
            ctx.status = 400
            ctx.body = error.message
        }   

       
    })

    router.delete('/unlink-category/:product_category_id', async (ctx, next) => {
        const trx = await transaction.start(ProductCategory.knex())

        try{
            const deletedCategory = await ProductCategory.query().findById(ctx.params.product_category_id)
            if(!deletedCategory) throw new Error("Não foi possivel encontrar o id da product_category")

            await ProductCategory.query(trx).deleteById(ctx.params.product_category_id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedCategory

        } catch(err){
            await trx.rollback()
            ctx.status = 400
            ctx.body = err.message
        }
    })

    router.patch('/delete-category/:id', async (ctx, next) => {
        try{
            const deletedCategory = await CategoriesModel.query().findById(ctx.params.id)
            if(!deletedCategory) throw new Error("Não foi possivel encontrar o id da categoria")
            if(!deletedCategory.active) throw new Error("Não foi possivel encontrar o id da categoria")
            const updated = await deletedCategory.$query().patchAndFetch({active:false}) 

            ctx.status = 200
            ctx.body = updated

        } catch(err){

            ctx.status = 400
            ctx.body = err.message
        }
    })

    router.patch('/update/:id', async (ctx, next) => {
        try{ 
            const {category_name} = ctx.data
            const updated = await CategoriesModel.query().patchAndFetchById(ctx.params.id,{category_name})
            if(!updated) throw new Error("Não foi possivel encontrar o id da categoria")
            if(!updated.active) throw new Error("Não foi possivel encontrar o id da categoria")

            ctx.status = 200
            ctx.body = updated

        } catch(err){
            console.log("err",err);
            ctx.status = 400
            ctx.body = err.message
        }
    })

    router.delete('/delete-category/:id', async (ctx, next) => {
        const trx = await transaction.start(CategoriesModel.knex())

        try{
            const deletedCategory = await CategoriesModel.query().findById(ctx.params.id)
            if(!deletedCategory) throw new Error("Não foi possivel encontrar o id da categoria")

            await CategoriesModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedCategory

        } catch(err){

            await trx.rollback()
            ctx.status = 400
            ctx.body = err.message
        }
    })

}