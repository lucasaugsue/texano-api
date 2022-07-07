import { ProductRelations as ProductRelationsModel } from "../models/ProductRelations";
import { raw, transaction } from "objection";

export const ProductRelations = (router) => {
  router.get("/all/:id", async (ctx, next) => {
    try{
    let params = { ...ctx.data };
    let existent = await ProductRelationsModel.query().findById(ctx.params.id);
    console.log(existent)
    ctx.body = existent
    if (!existent){throw new Error("Id inválido!")}
    } catch(err){
      ctx.status = 400;
      console.log(err.message);
      throw new Error(err.message);
    }
  });
  router.post("/add_product_relations", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ProductRelationsModel.knex());
    try {
      if (!params.from_id)
        throw new Error(
          "Para adicionar uma relação é preciso colocar um id de partida(from_id)"
        );

      if (!params.to_id)
        throw new Error(
          "Para adicionar uma relação é preciso colocar um id de chegada(to_id)"
        );

      let existent = await ProductRelationsModel.query().findOne({
        from_id: params.from_id,
        to_id: params.to_id,
      });
      if (existent) {
        throw new Error("Essa relação já existe");
      }
      const productRelations =
        await ProductRelationsModel.query().insertGraphAndFetch({
          from_id: params.from_id,
          to_id: params.to_id,
        });

      ctx.body = productRelations;
      ctx.status = 200;
    }
      catch (err) {
      ctx.status = 400;
      console.log(err.message);
      throw new Error(err.message);
    }
  });
  router.delete('/delete_relation/:id', async (ctx, next) => {
    const trx = await transaction.start(ProductRelationsModel.knex())

    try{
        const deletedRelation = await ProductRelationsModel.query().findById(ctx.params.id)
        if(!deletedRelation) {throw new Error("Não foi possivel encontrar o id da relaçao")}

        await ProductRelationsModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedRelation

    } catch(err){
        await trx.rollback()
        ctx.status = 400;
        
        throw new Error(err.message);
    }
})
};
