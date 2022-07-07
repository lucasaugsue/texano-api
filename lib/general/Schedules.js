import { Schedules as SchedulesModel } from "../models/Schedules";
import { raw, transaction } from 'objection'

export const Schedules = (router) => {
  router.get("/all/:user_id", async (ctx, next) => {

    ctx.body = await SchedulesModel.query()
    .where("company_id", ctx.params.user_id)
    .withGraphFetched("schedules_dates") 
    .withGraphFetched("rooms") 
    .withGraphFetched("services") 
    .withGraphFetched("services_rooms") 
    .withGraphFetched("customer") 
    
    // ctx.body = await SchedulesModel.query().where("company_id", ctx.params.user_id);
  });

  router.post('/add-schedules', async (ctx, next) => {
    let params = {...ctx.data}
    const trx = await transaction.start(
        SchedulesModel.knex()
    )
    try {
      if(!params.schedules_dates_id) throw new Error("Para agendar é preciso marcar um horário")
      if(!params.room_id && !params.service_id && !params.service_room_id) throw new Error("Para agendar é preciso selecionar uma sala ou serviço")
      
      const Schedules = await SchedulesModel.query().insertGraphAndFetch({
          room_id: params.room_id,
          service_id: params.service_id,
          company_id: params.company_id,
          service_room_id: params.service_room_id,
          client_id: params.client_id,
          type: ((params.client_id)?'occupied' : 'unavailable'),
          schedules_dates_id: params.schedules_dates_id,
      })
      ctx.body = Schedules
      ctx.status = 200
  
      await trx.commit()  
    } catch (err) {
      ctx.status = 500
      await trx.rollback();
      console.log(err.message)
      throw new Error('Não agendou ', err)

    }
    })

  //   router.post('/link/:schedules_id/with/:schedules_dates_id', async (ctx,netx) => {
  //     let params = {...ctx.data}

  //     let existent = await SchedulesModel.query()
  //     .findOne({"schedules_id": params.schedules_id, "schedules_dates_id": params.schedules_dates_id})
  //     // if(existent) throw new Error("Já foi adicionado essa para esse")

  //     const linkSchedule = await SchedulesModel.query().insertAndFetch({
  //         schedules_id: params.schedules_id,
  //         schedules_dates_id: params.schedules_dates_id
  //     })

  //     ctx.status = 200
  //     ctx.body = linkSchedule
  // })

    router.patch('/edit-Schedules/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(SchedulesModel.knex())

      try{
          const editedSchedules = await SchedulesModel.query(trx)
          .patchAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedSchedules

      } catch(err){
      ctx.status = 500

          await trx.rollback()
          ctx.body = err
      }
  })
  router.delete('/delete-Schedules/:id', async (ctx, next) => {
    const trx = await transaction.start(SchedulesModel.knex())

    try{
      if(!ctx.params.id) throw new Error("É preciso id da reserva")
      const schedule = await SchedulesModel.query(trx).findById(ctx.params.id)
      if(!schedule) throw new Error("Não foi possivel encontrar a da reserva")
      const deletedRelations = await schedule.$relatedQuery('',trx).delete().where({ schedule_id: ctx.params.id }).returning('*');
      if (deletedRelations.length===0) throw new Error("Não foi possivel encontrar as datas da reserva")
      
      await Sales.query(trx).deleteById(ctx.params.id)

      await trx.commit()
      ctx.status = 200
      ctx.body = {...schedule,date:deletedRelations}
    } catch(err){
      ctx.status = 500

        await trx.rollback()
        ctx.body = err
    }
})
};
