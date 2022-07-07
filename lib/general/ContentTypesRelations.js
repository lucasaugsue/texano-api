import { ContentTypesRelations as ContentTypesRelationsModel } from "../models/ContentTypesRelations";
import ContentTypesRelationsServices from "../../services/ContentTypesRelationsServices.js";
import { raw, transaction } from "objection";

export const ContentTypesRelations = (router) => {
  router.get("/all/:id", async (ctx, next) => {
    try{
    let params = { ...ctx.data };
    let existent = await ContentTypesRelationsModel.query().findById(ctx.params.id);
    ctx.body = existent
    if (!existent){throw new Error("Id inválido!")}
  } catch (err) {
    ctx.status = 400;
    console.log(err.message);
    throw new Error(err.message);
  }
  });

  router.post("/add_content_types_relations", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ContentTypesRelationsModel.knex());
    
    try {
      if (!params.from_id)
        throw new Error(
          "Para adicionar uma relação é preciso colocar um id de partida(from_id)"
        );

      if (!params.to_id)
        throw new Error(
          "Para adicionar uma relação é preciso colocar um id de chegada(to_id)"
        );

      let existent = await ContentTypesRelationsModel.query().findOne({
        from_id: params.from_id,
        to_id: params.to_id,
      });

      if (existent) {
        if (existent.active) {
          console.log(existent.active)
          throw new Error("Essa relação já existe");}
            
        const relacaoAtiva = await ContentTypesRelationsServices.activateContentTypesRelations(ctx,existent.id);
        ctx.body = relacaoAtiva;
        ctx.status = 200;
      }
      else{
        const contentTypesRelations = await ContentTypesRelationsModel.query().insertGraphAndFetch({
          from_id: params.from_id,
          to_id: params.to_id,
        });
        ctx.body = contentTypesRelations;
        ctx.status = 200;
      }
    }
    catch (err) {
      const fromidExists = await ContentTypesRelationsModel.query(trx).findOne({from_id: params.from_id});
      const toidExists = await ContentTypesRelationsModel.query(trx).findOne({to_id: params.to_id});
      ctx.status = 400;
      console.log(err.message);
      if(!fromidExists & !toidExists){
        throw new Error("Ids inexistentes (from_id/to_id)")}
      if(!fromidExists){
        throw new Error("Id inexistente (from_id)")}
      if(!toidExists){
        throw new Error("Id inexistente (to_id)")}
      else{throw new Error(err.message);}
    }
  });
  router.delete("/deactivate/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    const existent = await ContentTypesRelationsModel.query().findById(ctx.params.id);
    try{
      let exists = await ContentTypesRelationsServices.deactivateContentTypesRelations(
      ctx,
      ctx.params.id
    );
    ctx.status = 200;
    if (!exists){
      throw new Error("Id inválido!")}
    if (!existent.active){
      throw new Error("A relação já está inativa!")}
  } catch (err) {
      ctx.status = 400;
      console.log(err.message);
      
      throw new Error(err.message);
    }
  });
};
