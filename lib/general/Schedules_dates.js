import { transaction } from 'objection';
import { createSchedules } from "../../services/SchedulesServices";
import { Schedules_dates as Schedules_datesModel } from "../models/Schedules_dates";

export const Schedules_dates = (router) => {
  router.get("/all", async (ctx, next) => {
    let params = { ...ctx.data };

    ctx.body = await Schedules_datesModel.query()
  });

  router.post('/add-schedules_dates/:availability_id', async (ctx, next) => {
    let params = {...ctx.data, availability_id: ctx.params.availability_id};
    // params = {...ctx.data}
    console.log('params',params);
    const trx = await transaction.start(Schedules_datesModel.knex());

    try {
      let response = await createSchedules(params);
      
      await trx.commit();  
      ctx.body = {cancelLink: `https://reservas.fridom.com.br/${response.id}/cancelar`}
      ctx.status = 200
    } catch (err) {
      ctx.body = {error: err.message}
      await trx.rollback();
    }
  })
  
    router.patch('/edit-schedules_dates/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(Schedules_datesModel.knex())

      try{
          const editedSchedules_dates = await Schedules_datesModel.query(trx)
          .patchAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedSchedules_dates

      } catch(err){

          await trx.rollback()
          ctx.body = err
      }
  })
  router.delete('/delete-schedules_dates/:id', async (ctx, next) => {
    const trx = await transaction.start(Schedules_datesModel.knex())

    try{
        const deletedSchedules_dates = await Schedules_datesModel.query().findById(ctx.params.id)
        if(!deletedSchedules_dates) throw new Error("Não foi possivel encontrar o id")
        
        await Schedules_datesModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedSchedules_dates

    } catch(err){

        await trx.rollback()
        ctx.body = err
    }
})
};
