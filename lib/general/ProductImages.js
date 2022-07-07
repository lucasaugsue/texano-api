import { ProductImages as ProductImagesModel } from "../models/ProductImages";
import { raw, transaction } from "objection";
import { Products } from "./Products";
import { Products as ProductsModel } from '../models/Products';

export const ProductImages = (router) => {
  router.get("/all/:id", async (ctx, next) => {
    try{
    let params = { ...ctx.data };
    let existent = await ProductImagesModel.query().findById(ctx.params.id);
    console.log(existent)
    ctx.body = existent
    if (!existent){throw new Error("Id inválido!")}
    } catch(err){
      ctx.status = 400;
      console.log(err.message);
      throw new Error(err.message);
    }
  });
  router.post("/add_product_images", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ProductImagesModel.knex())
    try {
      if (!params.image_url)
        throw new Error(
          "Para adicionar uma imagem é preciso colocar uma url (image_url)"
        );

      if (!params.product_id)
        throw new Error(
          "Para adicionar uma imagem é preciso colocar um product_id"
        );

        const product = await ProductsModel.query(trx).findOne({"id": params.product_id})
        if (!product){throw new Error("product_id inexistente!")}
        const productImages =
        await ProductImagesModel.query().insertGraphAndFetch({
          image_url: params.image_url,
          product_id: params.product_id,
        });

      ctx.body = productImages;
      ctx.status = 200;
    }
      catch (err) {
      ctx.status = 400;
      throw new Error(err.message);
    }
  });
  router.patch("/edit_product_images/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(ProductImagesModel.knex());

    try {
      const editedProductImages = await ProductImagesModel.query(trx
      ).patchAndFetchById(ctx.params.id, {image_url: params.image_url});
      await trx.commit();
      ctx.status = 200;
      ctx.body = editedProductImages;
      let existent = await ProductImagesModel.query().findById(ctx.params.id);
      if (!params.image_url)
        throw new Error(
          "Para adicionar uma imagem é preciso colocar uma url (image_url)"
        );
      if (!existent){
        throw new Error("Id inválido!")}
    } catch (err) {
      ctx.status = 400;
      console.log(err.message);
      throw new Error(err.message);
    }
  });
  router.delete('/delete_product_images/:id', async (ctx, next) => {
    const trx = await transaction.start(ProductImagesModel.knex())

    try{
        const deletedImage = await ProductImagesModel.query().findById(ctx.params.id)
        if(!deletedImage) {throw new Error("Não foi possivel encontrar o id da imagem")}

        await ProductImagesModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedImage

    } catch(err){
        await trx.rollback()
        ctx.status = 400;
        
        throw new Error(err.message);
    }
})
};
