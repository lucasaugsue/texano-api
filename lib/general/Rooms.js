import { Rooms as RoomsModel } from "../models/Rooms";
import RoomsServices from "../../services/RoomService";

import { raw, transaction } from "objection";

export const Rooms = (router) => {
  router.get("/all/:company_id", async (ctx, next) => {
    let params = { ...ctx.data };

    ctx.body = await RoomsModel.query().where(
      "company_id",
      ctx.params.company_id
    );
  });

  router.get("/list/:company_id", async (ctx, next) => {
    ctx.body = await RoomsModel.query().where({
      company_id: ctx.params.company_id,
      active: true,
    });
  });

  router.post("/add-rooms", async (ctx, next) => {
    let params = { ...ctx.data };
    try {
      if(!params.name)throw new Error("Para adicionar uma sala é preciso colocar um Nome");

      let existent = await RoomsModel.query().findOne(
        raw("LOWER(name)"),
        params.name.toLowerCase()
      );
        if (existent&&existent.active) {
          throw new Error("Já existe uma sala com esse nome");
        }else if(existent){
          const updated = await existent.$query().patchAndFetch({active:true})
          ctx.body = updated
          return;
        }

      const rooms = await RoomsModel.query().insertGraphAndFetch({
        name: params.name.toUpperCase(),
        company_id: params.company_id,
      });
      ctx.body = rooms;
      ctx.status = 200;

    } catch (err) {
      throw new Error(err.message)
    }
  });

  router.patch("/edit-rooms/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(RoomsModel.knex());

    try {
      const editedRooms = await RoomsModel.query(trx).patchAndFetchById(
        ctx.params.id,
        params
      );

      await trx.commit();
      ctx.status = 200;
      ctx.body = editedRooms;
    } catch (err) {
      await trx.rollback();
      ctx.body = err;
    }
  });

  router.patch("/:id/deactivate/:company_id", async (ctx, next) => {
    await RoomsServices.deactivateRoom(ctx, ctx.params.id),
      RoomsModel.query().where("company_id", ctx.params.company_id);

    ctx.status = 200;
  });

  router.delete("/delete-rooms/:id", async (ctx, next) => {
    const trx = await transaction.start(RoomsModel.knex());

    try {
      const deletedRooms = await RoomsModel.query().findById(ctx.params.id);
      if (!deletedRooms)
        throw new Error("Não foi possivel encontrar o id da sala");

      await RoomsModel.query(trx).deleteById(ctx.params.id);

      await trx.commit();
      ctx.status = 200;
      ctx.body = deletedRooms;
    } catch (err) {
      await trx.rollback();
      ctx.body = err;
    }
  });
};
