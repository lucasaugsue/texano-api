import moment from "moment";
import { transaction } from "objection";
import CoalahPayService from "../../services/CoalahPayService";
import SaleService from '../../services/SaleService';
import { RenderEmail } from "../../utils/RenderEmail";
import { formatReais, getExtenseMonth, getStatus } from '../../utils/Util';
import { Addresses } from "../models/Addresses";
import { Companies } from "../models/Companies";
import { SaleAddress } from "../models/SaleAddress";
import { SaleHistory } from "../models/SaleHistory";
import { Sales } from "../models/Sales";
import { Transactions as TransactionsModel } from "../models/Transactions";


export const Transactions = (router) => {

    router.post('/generate/pix', async (ctx, next) => {
        const trx = await transaction.start(TransactionsModel.knex())
        try {
            const data = ctx.request.body
            const {sale, company_id, user, totalPrice} = data;
            console.log({data});
            const company = await Companies.query(trx).findById(company_id)
		        if(!company) throw new Error("Não encontramos esta compania, por favor entre em contato com o suporte!")
		        if(!user.cpf) throw new Error("Não encontramos o CPF do comprador")
            const generatePixData = {
                value:(totalPrice || sale.price),
                description:"Compra de produtos - Moov",
                cpf:user.cpf,
                // splits:[{}]
            }
            let response
            if(parseFloat(sale.price) >= parseFloat(1)){
              response = await CoalahPayService.generatePix(company.coalah_pay_key,generatePixData)
              if(response){
                const registerPix = await TransactionsModel.query(trx).insertGraphAndFetch({
                  credit_card_id:null,
                  key:response.key,
                  sale_id:sale.id,
                  origin:"zoop",
                  value:(totalPrice || sale.price),
                  due_date:moment().format(),
                  created_at:moment().format(),
                  updated_at:moment().format(),
                })
                console.log({registerPix});
              }else{
                throw new Error("Falha ao gerar o código PIX, por favor tente novamente mais tarde!")
              }
            }else{}

            await trx.commit();
            ctx.body = response
            
        } catch (error) {
          console.log(error);
            await trx.rollback();
            throw new Error(error);
        }
    });
    router.patch('/check/pix', async (ctx, next) => {
      const trx = await transaction.start(TransactionsModel.knex())
      try {
          let response = {paid:false};
          let payment
          const data = ctx.request.body
          const sale = await Sales.query(trx).findById(data.sale.id)
          if(!sale) throw new Error("Não identificamos esta venda!");
          if(data.data){
            payment = await TransactionsModel.query(trx).findOne({key:data.key})
          }else{
            payment = await TransactionsModel.query(trx).findOne({sale_id:sale.id}).whereNotNull("payed_value").whereNotNull("payed_date")
          }
          if(payment){
            if(payment.payed_date && payment.payed_value){
              response = {paid:true, ...payment}
            }
          }

          await trx.commit();
          ctx.body = response
            
        } catch (error) {
          console.log(error);
          await trx.rollback();
          ctx.body = error.message
        }
    })
    router.patch('/cart/finish', async (ctx, next) => {
      const {company_id, user, sale, address_id, totalPrice} = ctx.data
      
      const trx = await transaction.start(Sales.knex())
      try{
        if(!sale) throw new Error("Não identificamos esta venda, tente novamente!")
        const validSale = await Sales.query(trx).findById(sale.id).withGraphFetched("customer");
        const paidSale = await TransactionsModel.query(trx).findOne({sale_id:validSale.id})
        if(!paidSale || (!paidSale.payed_value || !paidSale.payed_date)) throw new Error("Não identificamos o pagamento desta venda, tente novamente!");
        if(!validSale) throw new Error("Não foi possível localizar esta venda, tente novamente!");
        let updatedSaleWithShipping
        updatedSaleWithShipping = await Sales.query(trx).updateAndFetchById(sale.id,{price:totalPrice})
        const customer = validSale.customer
        const address = await Addresses.query(trx).findById(address_id)
        const saleAddress = await SaleAddress.query(trx).insertAndFetch({
          sale_id:validSale.id,
          cep:address.cep,
          country:address.country,
          uf:address.uf,
          city:address.city,
          neighborhood:address.neighborhood,
          address:address.address,
          complement:address.complement,
          number:address.number
        })
    
        const company = await Companies.query(trx).withGraphFetched("sell_email").findById(company_id).select('coalah_pay_key')
        if(!company) throw new Error("Não encontramos esta compania, por favor entre em contato com o suporte!")
        const companyEmail = company.sell_email.find(item => item.active == true)
        
        //Updating sale
        const updatedSale = await Sales.query(trx).updateAndFetchById(validSale.id,{
          transaction_id: paidSale.id,
          updated_at:moment().format()
        })
  
        //Changing status to confirmed
        const newSaleHistory = await SaleHistory.query(trx).insertAndFetch({
          sale_id:validSale.id,
          status:10
        })

    
        await trx.commit();
        const emailSale = await SaleService.getSale({sale_id:validSale.id})
        RenderEmail(
          customer.email, 
          companyEmail.email, 
          "Compra Moov",
          "changeStatus",
          {...emailSale,
            ...emailSale.shipping_address,
            day:moment().format('DD'),
            month:getExtenseMonth(parseInt(moment().format("MM")) - 1),
            year:moment().format('YYYY'),
            name:customer.name,
            sale_id:emailSale.id,
            sale_date:moment(emailSale.sale_date).format('DD/MM/YYYY'),
            products:emailSale.products.map(i=>{
            var image = null
            if(i.product_images.length){
              const main = i.product_images.find(image=> image.main)
              image = (main)?main.image_url:i.product_images[0].image_url
            }
            return{
              ...i,
              unit_price:formatReais(i.unit_price),
              image
            }
            }),
            status:getStatus(emailSale.status),
            // displacement_rate:formatReais(frete?frete.displacement_rate:0),
            final_price:formatReais(updatedSaleWithShipping.price),
            contact_phone:'(61) 3029-9415',
            total:formatReais(updatedSaleWithShipping.price)
            }
        )
        ctx.body = await SaleService.getSale({sale_id:validSale.id})
        ctx.status = 200
      }catch(err){
        await trx.rollback();
        ctx.status = 400
        throw new Error(`Houve um problema ao finalizar a compra: ${err.message}`)
      }
      
      })
}