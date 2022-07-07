import { Services as ServicesModel } from "../models/Services";
import { raw, transaction } from 'objection'
import ServicesService from "../../services/ServicesService";

export const Services = (router) => {
  router.get("/all/:user_id", async (ctx, next) => {
    let params = { ...ctx.data };

    ctx.body = await ServicesModel.query().where("company_id", ctx.params.user_id);
  });

  router.get("/list/:company_id", async (ctx, next) => {
    ctx.body = await ServicesModel.query().where({
      company_id: ctx.params.company_id,
      active: true,
    });
  });

  router.post('/add-services', async (ctx, next) => {
    let params = {...ctx.data}
    const trx = await transaction.start(
        ServicesModel.knex()
    )
    try {
      if(!params.name) throw new Error("Para adicionar um serviço é preciso colocar um Nome")

      let existent = await ServicesModel.query().findOne(raw("LOWER(name)"), params.name.toLowerCase())
      if(existent&&existent.active){
        throw new Error("Já existe um serviço com esse nome")
      }else if(existent){
        const updated = await existent.$query().patchAndFetch({active:true})
        await trx.commit() 
      
        ctx.body = updated
        ctx.status = 200
      }else{
        const services = await ServicesModel.query().insertGraphAndFetch({
          name: params.name.toUpperCase(),
          company_id: params.company_id,
        })
        await trx.commit() 
        ctx.body = services
        ctx.status = 200
      } 
    } catch (err) {
      ctx.status = 400
      await trx.rollback();
      console.log(err.message)
      throw new Error('Serviço não adicionado ', err)

    }
  })
  
    router.patch('/edit-services/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(ServicesModel.knex())

      try{
          const editedServices = await ServicesModel.query(trx)
          .patchAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedServices

      } catch(err){

          await trx.rollback()
          ctx.body = err
      }
  })

  router.patch("/:id/deactivate/:company_id", async (ctx, next) => {
    await ServicesService.deactivateService(ctx, ctx.params.id),
    ServicesModel.query().where("company_id", ctx.params.company_id);

    ctx.status = 200;
  });

  router.patch('/delete-services/:id', async (ctx, next) => {
    const trx = await transaction.start(ServicesModel.knex())

    try{
        const service = await ServicesModel.query(trx).findById(ctx.params.id)
        if(!service) throw new Error("Não foi possivel encontrar o serviço")
        const updated = await service.$query(trx).patchAndFetch({active:false})
        if(!updated) throw new Error("Não foi possivel apagar o serviço")
        
        await trx.commit()
        ctx.status = 200
        ctx.body = updated

    } catch(err){
        console.log("====================================================================================");
        await trx.rollback()
        ctx.body = err
    }
})

  router.delete('/delete-services/:id', async (ctx, next) => {
    const trx = await transaction.start(ServicesModel.knex())

    try{
      const deletedServices = await ServicesModel.query().findById(ctx.params.id)
        console.log('ctx.params',deletedServices)
        if(!deletedServices) throw new Error("Não foi possivel encontrar o serviço")
        console.log("depois do erro");
        const deleted = await ServicesModel.query(trx).deleteById(ctx.params.id)
        console.log("apagou",deleted);
        await trx.commit()
        console.log("apagou com certeza");
        ctx.status = 200
        ctx.body = deletedServices

    } catch(err){
        console.log("====================================================================================");
        await trx.rollback()
        ctx.body = err
    }
})
};
