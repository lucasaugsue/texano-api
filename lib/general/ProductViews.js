import { ProductViews as ProductViewsModel } from "../models/ProductViews";
import { raw, transaction } from "objection";
import { Customer } from "./customer";
import { Customer as CustomerModel } from "../models/Customer";
import { Products } from "./Products";
import { Products as ProductsModel } from '../models/Products';

export const ProductViews = (router) => {
  router.get("/all/:id", async (ctx, next) => {
    try{
    let params = { ...ctx.data };
    let existent = await ProductViewsModel.query().findById(ctx.params.id);
    console.log(existent)
    ctx.body = existent
    if (!existent){throw new Error("Id inválido!")}
    } catch(err){
      ctx.status = 400;
      console.log(err.message);
      throw new Error(err.message);
    }
  });
  router.post("/add_product_views", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ProductViewsModel.knex())

    try {
      if (!params.product_id) throw new Error("Para adicionar uma view é preciso colocar um product_id");

      const customer = await CustomerModel.query(trx).findOne({"id": params.customer_id})
      const product = await ProductsModel.query(trx).findOne({"id": params.product_id})
      if (!product){throw new Error("product_id inexistente!")}
      // if (!customer){throw new Error("customer_id inexistente!")}
      const productViews = await ProductViewsModel.query(trx).insertGraphAndFetch({
        customer_id: params.customer_id || null,
        product_id: params.product_id,
      });
      await trx.commit();
      ctx.body = productViews;
      ctx.status = 200;
    }
    catch (err) {
      await trx.rollback();
      ctx.status = 400;
      throw new Error(err.message);
    }
  });
  router.delete('/delete_product_views/:id', async (ctx, next) => {
    const trx = await transaction.start(ProductViewsModel.knex())

    try{
        const deletedView = await ProductViewsModel.query().findById(ctx.params.id)
        if(!deletedView) {throw new Error("Não foi possivel encontrar o id da view")}

        await ProductViewsModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedView

    } catch(err){
        await trx.rollback()
        ctx.status = 400;
        
        throw new Error(err.message);
    }
})
};
