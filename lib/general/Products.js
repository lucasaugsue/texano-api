import moment from 'moment';
import { raw, transaction } from 'objection';
import { ProductImages as ProductImagesModel } from "../models/ProductImages";
import { Products as ProductsModel } from '../models/Products';
import { ProductViews as ProductViewsModel } from '../models/ProductViews';
import { CompanyInstallments as CompanyInstallmentsModel } from '../models/CompanyInstallments';


export const Products = (router) => {
    router.get('/all-products/:company_id', async (ctx, next) => {

        const {category_id,initial_price, final_price, brand, name  } = ctx.query
        console.log({initial_price, final_price, category_id, brand});
        const res = await ProductsModel.query()
        .withGraphFetched("[product_category.category, product_images, images, product_relations.to, product_views, promotion_product.promotion, shipping, custom_products.custom_attributes_products.custom_attributes]")
        .where("products.company_id", ctx.params.company_id)
        .where("active", true)
        .where(builder => {
            if(initial_price && initial_price !== "null" && initial_price !== null){
                builder.where('price', '>=', initial_price)
            }
            if(final_price && final_price !== "null" && final_price !== null){
                builder.where('price', '<=', final_price)
            }
            if(brand && brand !== "null" && brand !== null){
                builder.where(raw('lower("brand")'), 'like', `%${brand.toLowerCase()}%`)
            }
            if(category_id && category_id !== "null" && category_id !== null){
                builder.modifyGraph('product_category', build => {
                    build.where('product_category.category_id',category_id)
                })
            }
            if(name && name !== "null" && name !== null){
                builder.where(raw('lower("name")'), 'like', `%${name.toLowerCase()}%`)
            }
        })
        .modifyGraph("product_relations.to", (builder) => {
            builder.where({ active: true });
        })
        .modifyGraph("custom_products", (builder) => {
            builder.where({ active: true });
        })

        const shipping = ctx.headers.shipping
        const installments = await CompanyInstallmentsModel.query()
        .where("company_installments.company_id", ctx.params.company_id)

        var allProducts = res.map(product => {
            //validPromotion is a filter to see if the date is still valid.
            let validPromotion = (product.promotion_product.length === 0) ? [] 
            : product.promotion_product.filter(item => 
                moment(item.promotion.final_date).format() >= (moment().format()) 
            )
            
            //validInstallment is a filter to see if the price is >= then min_value 
            let validInstallment = installments.length === 0 ? []
            : installments.filter(item =>
                (product.price/parseInt(item.num_installments)) >= parseFloat(item.min_value) 
            )

            return ({
                id: product.id,
                name: product.name,
                price: product.price,
                company_id: product.company_id,
                active: product.active,
                subtitle: product.subtitle,
                description: product.description,
                brand: product.brand,

                custom_products: product.custom_products,
                product_category: product.product_category,
                product_images: product.product_images,
                product_relations: product.product_relations,
                product_views: product.product_views,
                views: (product.product_views || []).length,
                promotion_product: validPromotion,
                shipping: product.shipping,

                installments: validInstallment,
                images: (product.images || []).map(i => i.image_url),
            })
        })

        //cleaning the object
        allProducts.map(product => {
            if(!product.custom_products || product.custom_products.length === 0) { delete product.custom_products }
            if(!product.product_category || product.product_category.length === 0) { delete product.product_category }
            if(!product.product_images || product.product_images.length === 0) { delete product.product_images }
            if(!product.product_relations || product.product_relations.length === 0) { delete product.product_relations }
            if(!product.product_views || product.product_views.length === 0) { delete product.product_views }
            if(!product.promotion_product || product.promotion_product.length === 0) { delete product.promotion_product }    
            if(!product.installments || product.installments.length === 0) { delete product.installments }    
            if(!product.shipping || shipping || product.shipping.length === 0) { delete product.shipping }
        })
        ctx.body = allProducts.sort((a,b) => a.name > b.name ? 1 : -1)
    })

    router.get('/:product_id', async (ctx, next) => {
        let companyId =(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
        
        const res = await ProductsModel.query()
        .withGraphFetched("[product_category.category, product_images, product_relations.to, product_views, promotion_product.promotion, shipping]")
        .where("products.company_id", companyId)
        .where("active", true)
        .modifyGraph("product_relations.to", (builder) => {
            builder.where({ active: true });
        })
        .findById(ctx.params.product_id)
        const shipping = ctx.headers.shipping
        const view = ctx.query.view
        if(view && res){
            // registra a visualizaçao do produto
            const client = ctx.headers.client_id
            await ProductViewsModel.query().insertAndFetch({
                product_id:ctx.params.product_id,
                customer_id:client||null
            })
        }

        //validPromotion is a filter to see if the date is still valid.
        let validPromotion = (res.promotion_product.length === 0) ? [] 
        : res.promotion_product.filter(i => 
            moment(i.promotion.final_date).format() >= (moment().format()) 
        )

        ctx.body = ({id: res.id,
            name: res.name,
            price: res.price,
            company_id: res.company_id,
            active: res.active,
            subtitle: res.subtitle,
            description: res.description,
            brand: res.brand,

            product_category: res.product_category,
            product_images: res.product_images,
            product_relations: res.product_relations,
            product_views: res.product_views,
            promotion_product: validPromotion,
            shipping: res.shipping})
    })

    router.get('/category/:category_id/products/:company_id', async (ctx, next) => {
        let params = {...ctx.data,...ctx.params}
        const {initial_price, final_price, brand } = ctx.query

        const res = await ProductsModel.query()
        .joinRelated('product_category')
        .where("category_id",params.category_id)
        .withGraphFetched("[product_category.category,product_images,product_relations.to,product_views,promotion_product.promotion]")
        .where("products.company_id", ctx.params.company_id)
        .where("active", true)
        .where(builder => {
            if(initial_price && initial_price !== "null" && initial_price !== null){
                builder.where('price', '>=', initial_price)
            }
            if(final_price && final_price !== "null" && final_price !== null){
                builder.where('price', '<=', final_price)
            }
            if(brand && brand !== "null" && brand !== null){
                builder.where(raw('lower("brand")'), 'like', `%${brand.toLowerCase()}%`)
            }
        })
        .modifyGraph("product_relations.to", (builder) => {
            builder.where({ active: true });
        })
        .modifyGraph("product_relations.to", (builder) => {
            builder.where({ active: true });
        })
        .modifyGraph("product_category.category", (builder) => {
            builder.where({ active: true });
        })
        

        const installments = await CompanyInstallmentsModel.query()
        .where("company_installments.company_id", ctx.params.company_id)

        var allProducts = res.map(product => {
            //validPromotion is a filter to see if the date is still valid.
            let validPromotion = (product.promotion_product.length === 0) ? [] 
            : product.promotion_product.filter(itemFilter => 
                moment(itemFilter.promotion.final_date).format() >= (moment().format()) 
            )

            //validInstallment is a filter to see if the price is >= then min_value 
            let validInstallment = installments.length === 0 ? []
            : installments.filter(itemFilter =>
                (product.price/parseInt(itemFilter.num_installments)) >= parseFloat(itemFilter.min_value) 
            )

            return ({
                id: product.id,
                name: product.name,
                price: product.price,
                company_id: product.company_id,
                active: product.active,
                subtitle: product.subtitle,
                description: product.description,
                brand: product.brand,

                product_category: product.product_category,
                product_images: product.product_images,
                product_relations: product.product_relations,
                product_views: product.product_views,
                promotion_product: validPromotion,

                installments: validInstallment,
                images: (product.images || []).map(i => i.image_url),
            })
        })

        ctx.body = allProducts

    })

    router.post('/add-products', async (ctx, next) => {
        let params = {...ctx.data}
        const trx = await transaction.start(ProductsModel.knex())

        if (!params.name) { throw new Error ('Insira um nome para o produto') }
        if (!params.price) { throw new Error ('Insira um preço para o produto') }
        if (!params.subtitle) { throw new Error ('Insira um subtitulo para o produto') }
        if (!params.description) { throw new Error ('Insira uma descrição para o produto') }
        if (!params.brand) { throw new Error ('Insira uma marca para o produto') }
        if(typeof(params.price) !== "number") throw new Error("Adicione um valor válido para o preço")

        let existentProduct = await ProductsModel.query(trx)
        .findOne({"name": params.name.toUpperCase(), "company_id": params.company_id})

        try{
            if(existentProduct&&existentProduct.active) { 
                throw new Error("Já existe um produto com esse name")
            } else if(existentProduct) {
                const updated = await existentProduct.$query(trx).patchAndFetch({active:true})

                await trx.commit()
                ctx.status = 200
                ctx.body = updated
    
            } else {
                const product = await ProductsModel.query(trx).insertWithRelatedAndFetch({
                    active: true,
                    name: params.name.toUpperCase(), 
                    subtitle: params.subtitle, 
                    company_id: params.company_id,
                    brand: params.brand, 
                    price:params.price, 
                    description:params.description,
                    product_images: (params.images || []).map(image_url => ({image_url})),
                    // product_relations: params.to_id.map(to_id => ({to_id})),
                })
                await trx.commit()
                ctx.status = 200
                ctx.body = product
            }
        }catch(err){
            await trx.rollback()
            console.log("errdar",err);
            throw new Error("Não foi possível criar o produto ", err);
        }
    })

    router.patch('/edit-products/:id', async (ctx, next) => {
        let params = {...ctx.data}
        const images = params.images
        delete params.images
        const trx = await transaction.start(ProductsModel.knex())

        if (!params.name) { throw new Error ('Insira um nome para o produto') }
        if (!params.price) { throw new Error ('Insira um preço para o produto') }
        if (!params.subtitle) { throw new Error ('Insira um subtitulo para o produto') }
        if (!params.description) { throw new Error ('Insira uma descrição para o produto') }
        if (!params.brand) { throw new Error ('Insira uma marca para o produto') }
        if(typeof(params.price) !== "number") throw new Error("Adicione um valor válido para o preço")
        
        try{
            const editedProduct = await ProductsModel.query(trx).withGraphFetched("images").patchAndFetchById(ctx.params.id, params)
            const toDelete = editedProduct.images.filter(i => !images.includes(i.image_url))
            const toInsert = images.filter(i => !editedProduct.images.some(pi => pi.image_url === i))
            if(toDelete.length > 0){ await ProductImagesModel.query(trx).whereIn("id", toDelete.map(i => i.id)).delete() }
            if(toInsert.length > 0){ await ProductImagesModel.query(trx).insertGraphAndFetch(toInsert.map(image_url => ({product_id: editedProduct.id, image_url}))) }

            await trx.commit()
            ctx.body = await ProductsModel.query().withGraphFetched("images").findById(ctx.params.id)
            ctx.status = 200
        } catch(err){
            await trx.rollback()
            throw new Error(err.message);
        }
    })

    router.patch("/edit_product_images/:id", async (ctx, next) => {
        let params = { ...ctx.data };
        const trx = await transaction.start(ProductImagesModel.knex());
    
        try {
          const editedProductImages = await ProductImagesModel.query(trx
          ).patchAndFetchById(ctx.params.id, {image_url: params.image_url});
          await trx.commit();
          ctx.status = 200;
          ctx.body = editedProductImages;
          let existent = await ProductImagesModel.query().findById(ctx.params.id);
          if (!params.image_url)
            throw new Error(
              "Para adicionar uma imagem é preciso colocar uma url (image_url)"
            );
          if (!existent){
            throw new Error("Id inválido!")}
        } catch (err) {
          ctx.status = 400;
          console.log(err.message);
          throw new Error(err.message);
        }
    });
    
    router.patch('/delete-product/:id', async (ctx, next) => {
        const trx = await transaction.start(ProductsModel.knex())

        try{
            const product = await ProductsModel.query(trx).findById(ctx.params.id)
            if(!product) throw new Error("Não foi possivel encontrar o id do produto")
            const updatedProduct = await product.$query(trx).patchAndFetch({active:false})
            if(!updatedProduct) throw new Error("Não foi possivel deletar produto")
            

            await trx.commit()
            ctx.status = 200
            ctx.body = updatedProduct

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    router.delete('/delete-product/:id', async (ctx, next) => {
        const trx = await transaction.start(ProductsModel.knex())

        try{
            const deletedProduct = await ProductsModel.query().findById(ctx.params.id)
            if(!deletedProduct) throw new Error("Não foi possivel encontrar o id do produto")
            
            await ProductsModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedProduct

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })
}