import moment from 'moment';
import { Customer } from '../lib/models/Customer';
import { Discounts } from '../lib/models/Discounts';
import { Payments } from "../lib/models/Payments";
import { SaleHistory } from '../lib/models/SaleHistory';
import { Sales } from '../lib/models/Sales';
import { SalesStock } from '../lib/models/SalesStock';
import { Stock } from "../lib/models/Stock";
import DiscountService from './DiscountService';
import PromotionService from './PromotionService';
import StockService from './StockService';
import { raw } from 'objection'
import { PromotionProduct } from '../lib/models/PromotionProduct';

const statusCode = {
    0:"open",
    1:"processing",
    2:"waiting",
    3:"closed",
    4:"reffunded",
    5:"deleted",
    6:"separation",
    7:"sent",
    8:"delivered",
    9:"canceled",
    10:"confirmed"
}

const updateStatus = async (sale_id,status) =>{
    if(!sale_id) throw new Error ("Falta o sale_id")
    if(!status || !statusCode[status]) throw new Error ("Falta o status, ou não existe")
    
    const sale = await Sales.query().findById(sale_id)
    if(!sale) throw new Error ("Venda não encontrada")
    const saleStatus = await SaleHistory.query().insertAndFetch(
        {
            sale_id:sale.id,
            status:status
        })

     
    return {...sale,status:statusCode[saleStatus.status]}
}

const openSale = async (company_id,customer_id,date) =>{
    try{
        if(!company_id)throw new Error("Sem company_id dentro de openSale");
        if(!customer_id)throw new Error("Sem customer_id dentro de openSale");
        const sale = await Sales.query().insertAndFetch({
            price: 0,
            company_id: company_id ? company_id: null,
            sale_date: date ? date : moment().format(),
            customer_id: customer_id ? customer_id : null
        })
    
        const saleStatus = await SaleHistory.query().insertAndFetch({
            sale_id:sale.id,
            status:0
        })
        return {...sale,status:statusCode[saleStatus.status]}
    }catch(err){
        throw new Error(err);
    }
}

const getSaleOfDay=async (date,company_id)=>{
    const findData = await Sales.query()
    .findOne("sale_date", date)
    if(findData){
        const saleOfDay = await Sales.query()
        .where({"sale_date": date, "company_id": company_id})
        .sum('price')
        return parseInt(saleOfDay[0].sum)
    }
    return 0
}

const addItem = async (data) =>{
    var {
        sale_id,
        stock_id,
        amount,
        price,
        company_id,
        customer_id,
        product_id,
        customSelected
    } = data
    try{
        console.log({data})
    
        if(product_id){
          const stocks = await StockService.getAvailableStocks(product_id)
          if(stocks.length <=0)throw new Error("Estoque já esgotado");
          stock_id = stocks[0].id
        }
        if (stock_id) {
            const stockLeft = await StockService.getStockAvailability(stock_id);
            if(stockLeft <=0)throw new Error("Estoque já esgotado");
            if(stockLeft < amount)throw new Error(`Estoque disponivel ${stockLeft}, tentativa de compra de ${amount}`);
        }
    
        const stock = await Stock.query().findById(stock_id).withGraphFetched("product")
        var sale
    
        if (sale_id) {
            sale = await Sales.query().findById(sale_id)
            if(customer_id && sale.customer_id !== customer_id) sale = null
            if(!sale)throw new Error("Aconteceu algum erro dentro da sua venda");
        }else{
            sale = await allOpenSales(company_id,customer_id);
            if(sale.length > 0) { sale = sale[0]; }
            else {
                let res = await openSale(company_id,customer_id)
                sale = res
            }
        }
    
        if(!sale) throw new Error("Erro ao adicionar item, carrinho nao encontrado");
        
        const product = stock.product
        const price_unit = customSelected
            ? customSelected.price
            : (!price)?product.price:price
        
        const productPromotion = await PromotionProduct.query().findOne({product_id}).where("amount", "<=", amount);
        console.log({productPromotion});
        const updatedSale = await Sales.query().updateAndFetchById(sale.id, {
            price:productPromotion ? productPromotion.price_unit : (sale.price+price_unit*amount)
        })
    
        const salesStock = await SalesStock.query().findOne({
            sale_id: sale_id ? sale_id : sale.id,
            stock_id: stock_id,
            custom_products_id: customSelected?customSelected.id:null,
        })
    
        if (!salesStock) {
            await SalesStock.query().insertAndFetch({
                sale_id:sale_id ? sale_id : sale.id,
                stock_id:stock_id,
                amount:amount,
                price:price_unit,
                custom_products_id: customSelected?customSelected.id:null,
            })
        }else{
            await salesStock.$query().patchAndFetch({
                amount:salesStock.amount+amount,
            })
        }
    
        const response ={
            stock:{
                id:stock_id,
                number:stock.stock_number
            },
            product_added:{
                id:product.id,
                name:product.name,
                price_unit:price_unit,
                amount:amount
            },
            sale:{
                id:updatedSale.id,
                price:updatedSale.price,
            }
        }
        return response
    }catch(err){
        throw new Error(err);
    }

}

const removeItem = async (data,item_id) =>{
    const {sale_id,stock_id,amount,price,customer_id} = data
    var sale = await Sales.query().findById(sale_id)
    if(customer_id && sale &&sale.customer_id !== customer_id) sale = null

    if (!sale) throw new Error("Erro ao encontrar a lista") 
    const saleStatus = await SaleHistory.query()
    .where({sale_id:sale_id}).orderBy('date','desc')
    if(saleStatus[0].status===3)throw new Error("compra já efetuada")
    const item = await SalesStock.query()
    .where({id:item_id})
    .orWhere({
        sale_id:sale_id,
        stock_id:stock_id,
        price:price
    })
    .withGraphFetched("stock.product.product_views")
    if(!item.length) throw new Error(" não encontrado o item para a retirada")
    
    let deleteditem
    if (!amount || (item[0].amount ===amount)) {
        deleteditem = await item[0].$query().delete().returning('*')
        
    }else{

        if(item[0].amount < amount)throw new Error(` numero de items na lista ${item.amount}, tentativa de retirada de ${amount}`)
        if((item[0].amount-amount) === 0){
            deleteditem = await item[0].$query().delete().returning('*')
        }else{
            deleteditem = await item[0].$query().patchAndFetch({
                amount:(item[0].amount-amount)
            })
        }
    }
    console.log({VALORDAVENDA:(sale.price-(item[0].price*amount) )});
    const updatedSale = await sale.$query().patchAndFetch({
        price:(sale.price-(item[0].price*amount) ),
        updated_at: moment().format()
    }).returning("*")

    const response ={
        stock:{
            id:stock_id,
            number:item[0].stock_number
        },
        product_removed:{
            id:item[0].stock.product.id,
            name:item[0].stock.product.name,
            price_unit:item[0].price,
            amount:amount
        },
        sale:{
            id:updatedSale.id,
            price:updatedSale.price
        }
    }
    return response
}

const deleteSale = async (sale_id,trx) =>{
    const sale = await Sales.query(trx).findById(sale_id)
    .withGraphFetched("[payments.method,salesStock.stock.product.product_views]")
    .join(
        "sale_history as sale_history", 
        raw("sale_history.sale_id = sales.id AND sale_history.id IN (select distinct on (sale_id) id from sale_history order by sale_id, date desc)")
        )
    .select('sales.id','sale_history.status', 'sales.company_id', 'sales.price', 'sales.sale_date','sales.displacement_rate')

    let relations
    if(!sale) throw new Error("Não foi possivel encontrar o id da venda")
    console.log("sale",sale);
    if (sale.status === 0) {
        const deletedRelations = await sale.$relatedQuery("salesStock",trx).delete().where({sale_id:sale_id}).returning('*')
        const deletedStatus = await sale.$relatedQuery("saleHistory",trx).delete().where({sale_id:sale_id}).returning('*')
        const deleteDiscount = await sale.$relatedQuery("discount",trx).delete().where({sale_id:sale_id}).returning('*')
        if(!deletedRelations) throw new Error("Não foi possivel deletar a venda")
        if(!deletedStatus) throw new Error("Não foi possivel deletar a venda")
        if(!deleteDiscount) throw new Error("Não foi possivel deletar a venda")
        await Sales.query(trx).deleteById(sale_id)
        relations = {
            stock:deletedRelations,
            saleHistory:"deleted"
        }
    }else{
        await SaleHistory.query().insertAndFetch({
            sale_id:sale.id,
            status:5
        })
        relations = {
            saleHistory:"deleted"
        }
    }

    return {...sale,...relations}
}

const finishSale = async (data) =>{
    const {sale_id,payment_id,sale_date } = data
    const sale = await Sales.query().findById(sale_id)
    .withGraphFetched("[payments.method,salesStock.stock.product.product_views]")
    .join(
        "sale_history as sale_history", 
        raw("sale_history.sale_id = sales.id AND sale_history.id IN (select distinct on (sale_id) id from sale_history order by sale_id, date desc)")
        )
        .select('sales.id','sale_history.status', 'sales.company_id', 'sales.price', 'sales.sale_date','sales.displacement_rate')
    //console.log("sale",sale);
    if (!sale) throw new Error("Venda não encontrada")
    if (sale.status !== 0)throw new Error("venda já processada,verifique se a venda já esta fechada")
    const payment = await Payments.query().findById(payment_id)
    //console.log(payment); 
    if(!payment) throw new Error("Selecione uma forma de pagamento válida")
    await sale.$query().patchAndFetch({
        payment_id:payment_id,
        sale_date:(!sale_date)?moment().format():sale_date
    })
    await SaleHistory.query().insert({
        sale_id:sale.id,
        status:3
    })
    const finishedSale = await getSale(data)

    return finishedSale

}

const getSale=async(data)=>{
    try{
        const sale = await Sales.query().findById(data.sale_id)
        .withGraphFetched("[payments.method, salesStock.stock.product.[promotion_product,product_views],shippingAddress]")
        .join(
            "sale_history as sale_history", 
            raw("sale_history.sale_id = sales.id AND sale_history.id IN (select distinct on (sale_id) id from sale_history order by sale_id, date desc)")
            )
        .select('sales.id','sale_history.status', 'sales.company_id', 'sales.price', 'sales.sale_date','sales.displacement_rate')
        const products = sale.salesStock.map((item)=>{
            return{
                product_id:item.stock.product.id, 
                name:item.stock.product.name,
                amount:item.amount,
                subtitle:item.stock.product.subtitle,
                unit_price:item.price,
                stock_id:item.stock.id,
                product_images: (item.stock.product.product_images)?item.stock.product.product_images:[],
                //stock_number:item.stock.stock_number,
            }
        })
        const promotions = await PromotionService.getAllPromotionByCompany(sale.company_id,products)
        const betterPromotions = PromotionService.getBetterPromotion(products, promotions) //agrupando todos os itens de uma promoção pelo promotion_id
        
        
        const discountValue = await DiscountService.promotionalValue(data)
        const discount = await Discounts.query().findOne("sale_id", data.sale_id)
        const response = {
            id:sale.id,
            sale_date:sale.sale_date,
            status:statusCode[sale.status],
            products,
            payment_method:(sale.payments)?(sale.payments.method)?sale.payments.method.type:'':'',
            payment_method_id:(sale.payments)?(sale.payments.id):null,
            payment_discount:(sale.payments)?sale.payments.discount:0,
            displacement_rate:sale.displacement_rate,
            initial_price:sale.price,
            promotion_price: discountValue,
            shipping_address: sale.shippingAddress,
            
            final_price: (discount ? discountValue*((100-(sale.payments)?sale.payments.discount:0)/100)*(discount
                ?discount.percentage
                ?(1-discount.percentage/100)
                :1-(discount.amount)
                :1) : sale.price) + sale.displacement_rate
            }
    
            
        return response
    }catch(err){
        console.log({err})
        return err
    }
    
}

const salesByCustomer = async (customer_id) =>{
    const sales = await Sales.query().where({customer_id})
    .withGraphFetched("[saleHistory, payments.method, salesStock.stock.product.[product_images,promotion_product,custom_products.custom_attributes_products.custom_attributes]]")
    console.log({sales});
    let currentCart = sales.find(item => item.transaction_id === null)
    console.log({currentCart});
    let itensInCart = (!currentCart || !currentCart.salesStock) ? []
    : currentCart.salesStock.reduce((old, curr) => {
        let customProduct = (!curr.stock.product.custom_products) ? []
        : curr.stock.product.custom_products.find(i => i.id === curr.custom_products_id)
        let stock = curr.stock
        let product = curr.stock.product

        let title = (customProduct && customProduct.length !== 0)
        ? customProduct.custom_attributes_products.reduce((o, c) => {
            o.push(c.custom_attributes.title)
            return o
        }, [])
        : []


        old.push({
            ...curr,
            stock: stock,
            product: product,
            customProduct: customProduct,
            simpleTitle: title.map(i => i).join(" - "),
        })
        return old
    }, [])

    /* .join(
        "sale_history as sale_history", 
        raw("sale_history.sale_id = sales.id AND sale_history.id IN (select distinct on (sale_id) id from sale_history order by sale_id, date desc)")
        )
    .select('*') */

    // delete currentCart.salesStock
    currentCart = {...currentCart, itensInCart}
    
    return {
        ...sales, 
        currentCart, 
    }
    //return sales
}

const getCustomerEmail = async (customer_id) => {
    return await Customer.query().findById(customer_id).select('email')
}

const allOpenSales = async (company_id,customer_id) => {
    if(!company_id)throw new Error("Sem company_id dentro de allOpenSales");
    if(!customer_id)throw new Error("Sem customer_id dentro de allOpenSales");
    
    let sales = Sales.query()
    .withGraphFetched("[saleHistory, payments.method, salesStock.stock.product.[product_views,promotion_product, product_images]]")
    .join(
        "sale_history as sale_history", 
        raw("sale_history.sale_id = sales.id AND sale_history.id IN (select distinct on (sale_id) id from sale_history order by sale_id, date desc)")
        )
    .where('sales.company_id', company_id)
    .select('sales.id','sale_history.status', 'sales.company_id', 'sales.price', 'sales.sale_date','sales.displacement_rate')
    .where('sale_history.status', 0)

    if(customer_id) sales = sales.where('customer_id', customer_id);
    sales = await sales;

    console.log("vendas abertas",sales);
    return sales
}
const changeSaleProductCustomization = async ({sale_id, stock_id, custom_products_id, trx}) => {
    try {
        const updatedProductCustomization = await SalesStock.query(trx).update({custom_products_id})
        .where({sale_id, stock_id})
        return updatedProductCustomization
    } catch (err) {
        return err;
    }
    
}

export default {changeSaleProductCustomization, getCustomerEmail,openSale,getSaleOfDay,deleteSale,addItem,removeItem,finishSale,getSale,updateStatus,salesByCustomer,allOpenSales}