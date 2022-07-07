import { transaction } from 'objection';
import { Losses } from '../models/Losses';
import { Sales } from '../models/Sales';
import { Stock as StockModel } from '../models/Stock';
import StockService from '../../services/StockService'
import SaleService from '../../services/SaleService'
import moment from 'moment'
import { SalesStock } from '../models/SalesStock';


export const Stock = (router) => {
    //endpoints stock
    router.get('/all-by/:company_id', async (ctx, next) => {

        const allStocks = await StockModel.query().withGraphFetched("[product,customization.custom_attributes_products.custom_attributes]")
        .join("products", "stock.product_id", "products.id")
        .where({"company_id": ctx.params.company_id,"stock.active":true,"products.active":true})

        const res = (allStocks.length === 0) ? []
        : await Promise.all(
            allStocks.map(async(stock) => { 
                var remainingQuantity = await StockService.getStockAvailability(stock.id)
                return({
                    id: stock.id,
                    amount: remainingQuantity,
                    product_id: stock.product_id,
                    stock_date: stock.stock_date,
                    due_date: stock.due_date,
                    active: stock.active,
                    stock_number: stock.stock_number,
                    price: stock.price,
                    ending_stock: stock.ending_stock,
                    product: {
                        id: stock.product.id,
                        name: stock.product.name,
                        price: stock.product.price,
                        company_id: stock.product.company_id,
                        active: stock.product.active,
                    },
                    customization:{
                        id:{...stock.customization}.id,
                        title:((stock.customization && {...stock.customization}.custom_attributes_products.length) 
                            ? {...{...{...stock.customization}.custom_attributes_products[0]}.custom_attributes}.title 
                            : "")
                    }
                })
            })
        ) 

        ctx.body = res.sort((a,b) => a.product.name > b.product.name ? 1 : -1)
    })

    router.get('/ending-stock/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        const company_id = ctx.params.company_id

        const stock = await StockModel.query().withGraphFetched("product")
        .join("products", "stock.product_id", "products.id")
        .select("stock.amount")
        .where("products.company_id", company_id)
        
        ctx.body = stock
    })

    router.get('/validate-stock-expiration/:company_id', async (ctx, next) => {
        let params = {...ctx.data}

        const company_id = ctx.params.company_id
        const stock = await StockModel.query().withGraphFetched("product")
        .join("products", "stock.product_id", "products.id")
        .where({"company_id":company_id, "stock.active":true})

        const validExpiration = (s) => {
            if((moment().add(7,'days').format()) >= (moment(s.due_date).format())) return true
            else return false
        }

        const validSpoiled = (s) => {
            if((moment().format()) >= (moment(s.due_date).format())) return true
            else return false
        }

        const stocksMap = stock.map(stock =>({
            id: stock.id,
            /* amount: stock.amount,
            price: stock.price, */
            stock_date: stock.stock_date,
            due_date: stock.due_date,
            company_id: stock.product.company_id,
            product: stock.product.name,

            closeToSpoiling: validExpiration(stock),
            spoiled: validSpoiled(stock)
        }))

       ctx.body = stocksMap.filter(item => item.closeToSpoiling === true)
    })

    router.post('/add-stock', async (ctx, next) => {
        let params = {...ctx.data }
        if(!params.amount) throw new Error("Para criar uma stock é preciso da quantidade")
        if(!params.product_id) throw new Error("Para criar uma stock é preciso do id do produto")
        // if(!params.price) throw new Error("Para criar uma stock é preciso do preço")
        if(!params.stock_date) throw new Error("Para criar uma stock é preciso da data que entrou no estoque")
        if(!params.due_date) throw new Error("Para criar uma stock é preciso da data de vencimento do estoque")

        if(params.stock_number){
            const exist = await StockModel.query().findOne({stock_number:params.stock_number})
            if (exist && exist.active) {
                throw new Error("Stock já cadastrado")
            }else if(exist){
                const updated = await exist.$query().patchAndFetch({active:true})
                ctx.body = updated
                return
            }
        }

        const stock = await StockModel.query().insertAndFetch({
            amount: params.amount,
            active: true,
            product_id: params.product_id,
            price: (!params.price)?0:params.price,
            stock_date: moment(params.stock_date).format("YYYY-MM-DD"),
            due_date: moment(params.due_date).format("YYYY-MM-DD"),
            stock_number:params.stock_number,
            custom_products_id:params.custom_product_id
        })

        ctx.status = 200
        ctx.body = stock
    })

    router.patch('/delete-stock/:id', async (ctx, next) => {

        try{
            const exist = await StockModel.query().findById(ctx.params.id)
            if(!exist) throw new Error("Não foi possivel encontrar o id do stock")
        
            const updated = await exist.$query().patchAndFetch({active:false})    

            ctx.status = 200
            ctx.body = updated

        } catch(err){
            ctx.body = err
        }
    })

    router.delete('/delete-stock/:id', async (ctx, next) => {
        const trx = await transaction.start(StockModel.knex())

        try{
            const deletedstock = await StockModel.query().findById(ctx.params.id)
            if(!deletedstock) throw new Error("Não foi possivel encontrar o id do stock")

            await StockModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedstock

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    //começa endpoints perdas
    router.get('/all-losses', async (ctx, next) => {
        const losses = await Losses.query().withGraphFetched("stock(productId).product(selectInfo)")
        .modifiers({
           selectInfo(builders) {
               builders.select("products.name")
           }, productId(builders) {
            builders.select("stock.product_id")   
           }
        }).select("losses.id", "losses.amount", "losses.company_id", "losses.loss_date")

        ctx.body = losses
    })

    router.patch('/ending-stock/:id', async (ctx, next) => {
        let params = {...ctx.data}
        const trx = await transaction.start(StockModel.knex())

        try{
            if(!params.id) throw new Error("Necessário colocar o id do stock")
            if(!params.ending_stock) throw new Error("Necessário colocar o número perto de acabar")
            const endingStock = await StockModel.query().patchAndFetchById(ctx.params.id, params)

            await trx.commit()
            ctx.status = 200
            ctx.body = endingStock
  
        } catch(err){
            await trx.rollback()
            ctx.body = err
        }
    })

    router.get('/ending-products/:company_id', async (ctx, next) => {
        let params = {...ctx.data }

        let company_id = ctx.params.company_id
        const listStock = await StockModel.query().join("products", "stock.product_id", "products.id")
        .withGraphFetched("product")
        .where("products.company_id", company_id)
        const array = [];
        const allLosses = await listStock.reduce(async(filtered, option)=>{
            const losses = await StockService.getSumLosses(option.id)
            const sales = await StockService.getSumSales(option.id)
            //console.log(`id:${option.id}, losses${losses}, sales${sales}`);

            if(losses || sales){
                var amountLeft = option.amount - (losses + sales);
                if(amountLeft<=option.ending_stock){
                var newValue = {...option,amount:amountLeft};
                array.push(newValue);
                }
            }
            return filtered
        },array)
        console.log("Todas as perdas", allLosses);
        ctx.body = allLosses
    })

    router.post('/post-loss', async (ctx, next) => {
        const trx = await transaction.start(Losses.knex())
        try{
            let params = {...ctx.data}
            var remainingQuantity = await StockService.getStockAvailability(params.stock_id)

            let a = parseFloat(params.amount)
            let b = parseFloat(remainingQuantity)

            if(!params.amount) throw new Error("Para criar uma perda é preciso da quantidade")
            if(!params.loss_date) throw new Error("Para criar uma perda é preciso da data")
            if(!params.company_id) throw new Error("Para criar uma perda é preciso do id da empresa")
            if(!params.stock_id) throw new Error("Para criar uma perda é preciso do id do perda")
            if(a>b) throw new Error("A quantidade de perda é maior do que a de estoque restante!")

            const loss = await Losses.query().insertAndFetch({
                amount: params.amount,
                loss_date: moment(params.loss_date).format("YYYY-MM-DD"),
                company_id: params.company_id,
                stock_id: params.stock_id
            })

            await trx.commit()
            ctx.body = loss

        } catch(err) {
            await trx.rollback()
            throw new Error(err.message)
        }
    })

    router.delete('/delete-losses/:id', async (ctx, next) => {
        const trx = await transaction.start(Losses.knex())

        try{
            const deleteLosses = await Losses.query().findById(ctx.params.id)
            if(!deleteLosses) throw new Error("Não foi possivel encontrar o id da perda")

            await Losses.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deleteLosses

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    //começa endpoints vendas
    router.get('/ver-validacao/:stock_id', async (ctx, next) => {
        let params = {...ctx.data}

        let stock_id = ctx.params.stock_id
        const stock = await StockService.getSumStock(stock_id)
        const losses = await StockService.getSumLosses(stock_id)
        const sales = await StockService.getSumSales(stock_id) 

        console.log(`stock:${stock}, losses${losses}, sales${sales}`);

        const stockQuantity = stock-((losses?losses:0)+(sales?sales:0))

        ctx.body = stockQuantity
    })    

}