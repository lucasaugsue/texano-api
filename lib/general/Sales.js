import moment from "moment";
import { transaction,raw } from "objection";
import PromotionService from "../../services/PromotionService";
import SaleService from "../../services/SaleService";
import CoalahPayService from "../../services/CoalahPayService";
import { Customer as CustomerModel } from "../models/Customer";
import { Sales as SalesModel } from "../models/Sales";
import {getExtenseMonth, getStatus,statusCode} from "../../utils/Util"
import {RenderEmail} from "../../utils/RenderEmail"
import cardsRepository from "../../repositories/CardsRepository";
import { Companies } from "../models/Companies";
import { Transactions } from "../models/Transactions";
import { SaleHistory } from "../models/SaleHistory";
import { ProductViews, ProductViews as ProductViewsModel } from '../models/ProductViews';



export const Sales = (router) => {
  //começa endpoints vendas
  router.get("/:company_id", async (ctx, next) => {
    const company_id = ctx.params.company_id;
    try{
      const sales = await SalesModel.query()
      .withGraphFetched("[payments.method, shippingAddress, salesStock.stock.product.[promotion_product,product_views]]")
      .join(
          "sale_history as sale_history", 
          raw("sale_history.sale_id = sales.id AND sale_history.id IN (select distinct on (sale_id) id from sale_history order by sale_id, date desc)")
          )
      .select('sales.id','sale_history.status', 'sales.company_id', 'sales.price', 'sales.sale_date','sales.displacement_rate')
      .where("sales.company_id", company_id)
      .whereNot('sale_history.status',5)
      ctx.body = sales.map(i =>({
        ...i,
        status:getStatus(i.status)
      }));
    }catch(err){
      console.log("error",err)
    }
  });

  router.get("/daily/:company_id", async (ctx, next) => {
    let params = { ...ctx.data };

    let company_id = ctx.params.company_id;
    let date = moment().format("YYYY-MM-DD");

    const saleOfDay = await SaleService.getSaleOfDay(date, company_id);

    ctx.body = saleOfDay;
  });

  router.get("/:sale_id/details", async (ctx, next) => {
    ctx.body = await SaleService.getSale({sale_id: ctx.params.sale_id});
  });

  router.post("/", async (ctx, next) => {
    let params = { ...ctx.data };
    try {
      if (!params.company_id) throw new Error(" é preciso do usuário");
      const sale = await SaleService.openSale(params.company_id, params.date, params.customer_id);
      ctx.body = sale;
    } catch (error) {
      throw new Error(`Erro ao processar as vendas,${error.message}`);
    }
  });

  router.patch("/", async (ctx, next) => {
    let params = { ...ctx.data };
    try {
      if (!ctx.userInfo) throw new Error("É preciso do usuário");
      if (!params.sale_id) throw new Error(" é preciso da venda");
      const sale = await SaleService.updateStatus(params.sale_id, params.status);
      if(sale){
        const saleStatus = getStatus(sale.status)
        const subject = `Atualização de pedido: Seu pedido está ${saleStatus}!`
        const company = await Companies.query(trx).withGraphFetched("sell_email").findById(sale.company_id)
        const companyEmail = company.sell_email.find(item => item.active == true)

        if (![0,1,2,3,5].includes(sale.status) && sale.customer_id) {
          const user = await SaleService.getCustomerEmail(sale.customer_id)
          RenderEmail(
            user.email, 
            companyEmail.email, 
            "Compra Moov",
            "changeStatus",
            {...sale,
              ...sale.shipping_address,
              day:moment().format('DD'),
              month:getExtenseMonth(parseInt(moment().format("MM")) - 1),
              year:moment().format('YYYY'),
              name:user.name,
              sale_id:sale.id,
              sale_date:moment(sale.sale_date).format('DD/MM/YYYY'),
              products:sale.products.map(i=>{
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
              status:getStatus(sale.status),
              displacement_rate:formatReais(sale.displacement_rate),
              final_price:formatReais(sale.final_price),
              contact_phone:'(61) 3029-9415',
              total:formatReais(sale.final_price+sale.displacement_rate)
              }
          )

        }
      }
      
      ctx.body = sale;
    } catch (error) {
      throw new Error(`Erro ao processar as vendas,${error.message}`);
    }
  });

  // router.patch("/")

  router.delete("/:id", async (ctx, next) => {
    const trx = await transaction.start(SalesModel.knex());
    try {
      const response = await SaleService.deleteSale(ctx.params.id, trx);
      await trx.commit();
      ctx.status = 200;
      ctx.body = response;
    } catch (err) {
      await trx.rollback();
      ctx.status = 400;
      ctx.body = err.message;
    }
  });

  router.post("/item", async (ctx, next) => {
    let params = { ...ctx.data };
    try {
      if (!params.company_id) throw new Error(" é preciso do usuário");
      if (!params.sale_id) throw new Error(" é preciso do id da venda ");
      if (!params.stock_id) throw new Error(" é preciso do id do estoque");
      if (!params.amount) throw new Error(" é preciso da quantidade");
      if (typeof params.amount === "string") throw new Error(" quantidade precisa ser numero");

      const sale = await SalesModel.query().where({
        company_id: params.company_id,
        id: params.sale_id,
      });
      if (!sale.length) throw new Error(" pedido de venda não encontrado");
      const response = await SaleService.addItem(params);
      ctx.body = response;
    } catch (error) {
      throw new Error(`Erro ao adicionar item a venda,${error.message}`);
    }
  });

  router.patch("/item/:id/delete", async (ctx, next) => {
    let params = { ...ctx.data };
    const item_id = ctx.params.id;
    try {
      const response = await SaleService.removeItem(params, item_id);
      ctx.body = response;
    } catch (error) {
      throw new Error(`Erro ao remover item da venda,${error.message}`);
    }
  });

  router.post("/:id/finish", async (ctx, next) => {
    let params = { ...ctx.data };
    const sale_id = ctx.params.id;
    try {
      const response = await SaleService.finishSale({ ...params, sale_id });
      ctx.body = response;
    } catch (error) {
      throw new Error(`Erro ao terminar a venda,${error.message}`);
    }
  });

  router.get("/:id/promo/:company_id", async (ctx, next) => {
    const { id, company_id } = ctx.params;
    try {
      const response = await PromotionService.getAllPromotionBySale(
        id,
        company_id
      );
      ctx.body = response;
    } catch (error) {
      throw new Error(`Erro ao peger as promoções da venda,${error.message}`);
    }
  });

  router.patch("/customer/:id", async (ctx, next) => {
    let params = { ...ctx.data, ...ctx.params };
    const trx = await transaction.start(CustomerModel.knex());
    try {
      const addCustomer = await CustomerModel.query(trx).findById(
        parseInt(params.id)
      );
      if (!addCustomer) throw new Error("Customer inexistente");
      const Sales = await SalesModel.query(trx).patchAndFetchById(
        params.sale_id,
        { customer_id: params.id }
      );

      await trx.commit();
      ctx.body = Sales;
      ctx.status = 200;
    } catch (err) {
      await trx.rollback();
      ctx.body = err;
    }
  });
  
  
};
