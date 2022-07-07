import moment from "moment";
import { transaction } from "objection";
import io from 'socket.io-client';
import { SaleHistory } from "../models/SaleHistory";
import { Sales } from "../models/Sales";
import { Transactions as TransactionsModel } from "../models/Transactions";


const axios = require('axios')

export const Hooks = (router) => {

    router.post('/transactions', async (ctx, next) => {
        
        const trx = await transaction.start(TransactionsModel.knex())
        try {
            const data = ctx.request.body
            let foundItem
            
            if(((data.status === 2) || (data.status === "2")) && (data.payment_type === "pix")){
                foundItem = await TransactionsModel.query().findOne({key: data.key})
                if(!foundItem) throw new Error("Não foi possível encontrar este PIX, tente novamente mais tarde");
                //Updating transaction
                const updatedTransaction = await TransactionsModel.query(trx).updateAndFetchById(foundItem.id,{
                    payed_date: moment().format(),
                    payed_value: foundItem.value,
                    updated_at:moment().format(),
                })
                
                //Updating sale
                const updatedSale = await Sales.query(trx).updateAndFetchById(foundItem.sale_id,{
                    transaction_id: foundItem.id,
                })
    
            }   
            try {
                const socket = io.connect(process.env.URL);

                socket.on('connect', () => { 
                    socket.emit(`/hooks/transactions`, data) 
                    socket.disconnect()
                })
                ctx.status = 200
            } catch (error) {
                console.log("Erro ao disparar socket pix ",error);
                ctx.status = 500
            }
            await trx.commit();
            ctx.body = "Compra aprovada!"
            ctx.status = 200            
        } catch (error) {
            await trx.rollback();
            ctx.body = error.message
        }
    })
    
}