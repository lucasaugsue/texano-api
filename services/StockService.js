import { Losses } from '../lib/models/Losses';
import { Sales } from '../lib/models/Sales';
import { Stock } from '../lib/models/Stock'; 
import { SalesStock } from '../lib/models/SalesStock'; 
import { currentLineHeight } from 'pdfkit';

const getSumLosses = async (stock_id) => {
    const sum = await Losses.query()
    .where("losses.stock_id", stock_id)
    .sum('amount')
    if(!sum[0]||!sum[0].sum) return 0

    return parseInt(sum[0].sum)
}

const getSumSales = async (stock_id) => {
    const sum = await SalesStock.query()
    .where("sales_stock.stock_id", stock_id)
    .sum('amount')
    if(!sum[0]||!sum[0].sum) return 0

    return parseInt(sum[0].sum)
}

const getSumStock = async (stock_id) => {
    const sum = await Stock.query()
    .where("stock.id", stock_id)
    .sum('amount')
    if(!sum[0]||!sum[0].sum) return 0

    return parseInt(sum[0].sum)
}


const getStockAvailability = async (stock_id) => {
    if(!stock_id)throw new Error("Sem stock_id dentro de getStockAvailability");

    const stock = await getSumStock(stock_id)
    const losses = await getSumLosses(stock_id)
    const sales = await getSumSales(stock_id) 
    const stockQuantity = stock-(losses+sales)

    return stockQuantity
}

const getAvailableStocks = async (product_id) => {
    if(!product_id)throw new Error("Sem product_id dentro de getAvailableStocks");

    const stocks = await Stock.query().where({product_id:product_id})
    const stockList = await stocks.reduce(async(old,current) =>{
        const stockQuantity = await getStockAvailability(current.id)
        if (stockQuantity>0) return [...old,current]
        return [...old] 
    },[])
    return stockList
}

export default {getSumLosses,getSumSales,getSumStock,getStockAvailability,getAvailableStocks}


