import { ContentOptions as ContentOptionsModel } from "../models/ContentOptions";
import ContentOptionsServices from "../../services/ContentOptionsServices";
import { raw, transaction } from "objection";

export const ContentOptions = (router) => {
  router.get("/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    try{
      let params = { ...ctx.data };
      let existent = await ContentOptionsModel.query().findById(ctx.params.id);
      ctx.body = existent
      if (!existent){throw new Error("Id inválido!")}
      } catch(err){
        ctx.status = 400;
        console.log(err.message);
        throw new Error(err.message);
      }
  });

  router.post("/add_content_options", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ContentOptionsModel.knex());
    try {
      if (!params.option)
        throw new Error("Para adicionar uma opçao é preciso colocar um id");

      let existent = await ContentOptionsModel.query().findOne({
        content_attributes_id: params.content_attributes_id,
        option: params.option,
      });
      if (existent) {
        if (existent.active) throw new Error("Essa opção já existe");
        const opcaoAtiva = await ContentOptionsServices.activateContentOptions(ctx,existent.id);
        ctx.body = opcaoAtiva;
        ctx.status = 200;
      } else {
      const contentOptions =
        await ContentOptionsModel.query().insertGraphAndFetch({
          content_attributes_id: params.content_attributes_id,
          option: params.option,
        });
      ctx.body = contentOptions;
      ctx.status = 200;
      }
    } catch (err) {
      console.log(err.message);
      throw new Error(err.message);
    }
  });

  router.patch("/edit_content_options/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ContentOptionsModel.knex());
    const existent = await ContentOptionsModel.query(trx).findById(ctx.params.id);

    try {
      const editedContentOptions = await ContentOptionsModel.query(trx
      ).patchAndFetchById(ctx.params.id, {option: params.option});
      await trx.commit();
      ctx.status = 200;
      ctx.body = editedContentOptions;
      if (!editedContentOptions){
        throw new Error("Id inválido!")}
      if (!existent.active) {
        throw new Error("Opção inativa");
      }
    } catch (err) {
      ctx.status = 400;
      console.log(err.message);
      throw new Error(err.message);
    }
  });

  router.delete("/deactivate/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    const existent = await ContentOptionsModel.query().findById(ctx.params.id);
    try{
      let exists = await ContentOptionsServices.deactivateContentOptions(
      ctx,
      ctx.params.id
    );
    ctx.status = 200;
    if (!exists){
      throw new Error("Id inválido!")}
    if (!existent.active){
      throw new Error("A opção já está inativa!")}
  } catch (err) {
    ctx.status = 400;
    console.log(err.message);
    throw new Error(err.message);
  }
  });
};
