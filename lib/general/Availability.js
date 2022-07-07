import { Availability as AvailabilityModel } from "../models/Availability";
import { Customer as CustomerModel } from "../models/Customer";
import { raw, transaction } from "objection";
import AvailabilityServices from "../../services/AvailabilityService";
import {validateHour} from "../../services/SchedulesServices";
import moment from "moment-timezone";
import { Schedules_dates } from "../models/Schedules_dates";
import { Services } from "../models/Services";
import { getExtenseWeekday, groupBy } from "../../utils/Util";

const extractHours = ({date, availabilities, scheduleDates, timezone = "America/Sao_Paulo"}) => {
  var hours = [];
  for(let availability of availabilities){
    const durationTotal = availability.duration+availability.interval;
    for(let i = 0 ; (i+durationTotal) <= availability.period ; i += durationTotal){
      const datetime = moment(`${date}T${moment(availability.start_time).format("HH:mm:ss")}`).add(i, 'minutes');
      const invalid = datetime.diff(moment(), "hours") < 6 || scheduleDates.some(sd => {
        return !validateHour(datetime, durationTotal, sd.date_time, sd.period)
      });
      if(!invalid){
        hours.push({
          datetime: moment(datetime).tz(timezone).format(),
          date: moment(datetime).tz(timezone).format("DD/MM/YYYY"),
          time: moment(datetime).tz(timezone).format("HH:mm"),
          availabilityId: availability.id,
          availability: { id: availability.id },
        })
      }
    }
  }
  return hours;
}

export const Availability = (router) => {
  router.get("/list/:service_name/:room_name?", async (ctx, next) => {
    let { service_name, room_name} = ctx.params;
    let { selectedDay, format = "YYYY-MM-DD", timezone = "America/Sao_Paulo" } = ctx.data;
    selectedDay = selectedDay ? moment(selectedDay, format).format("YYYY-MM-DD") : null
    if(!selectedDay || selectedDay <= moment().subtract(6, "hours").format("YYYY-MM-DD")){
      selectedDay = moment().add(1, "days").format("YYYY-MM-DD");
    }
    let week = moment(selectedDay).weekday()
    const service = await Services.query().findOne(raw("LOWER(services.name)"), service_name.toLowerCase())
    if(!service) throw new Error("Serviço não encontrado");
 
    let availabilities = await AvailabilityModel.query()
      .leftJoinRelated("[rooms,services]")
      .where(build => { if(room_name){ build.where({"rooms.name":room_name.toUpperCase()}) } })
      .where("service_id", service.id)
      .where("availability.active", true)
      .where("availability.weekday", week)
      .withGraphFetched("[rooms,services,services_rooms,schedules_dates]")
      
    const scheduleDates =  await Schedules_dates.query().where("company_id", service.company_id)
    let options = {};
    const optionsArr = extractHours({availabilities, scheduleDates, date: selectedDay, timezone});
    optionsArr.forEach((item, index) => { options[`${index+1}`] = item })

    ctx.body = {
      options,
      choosenDate: moment(selectedDay).format("DD/MM/YYYY"),
      optionsText: optionsArr.map((opt, index) => `${index+1} - ${opt.time}`).join("\n"),
    };
  });
  
  router.get("/next/disponibility/:service_name/:room_name?", async (ctx, next) => {
    let { service_name, room_name} = ctx.params;
    let { phone, timezone = "America/Sao_Paulo" } = ctx.data;
    let date = moment().add(1, "days").format("YYYY-MM-DD");
 
    const service = await Services.query().findOne(raw("LOWER(services.name)"), service_name.toLowerCase())
    if(!service) throw new Error("Serviço não encontrado");

    let customer = phone ? await CustomerModel.query()
      .whereNotNull("email")
      .whereNotNull("name")
      .whereNotNull("cpf")
      .findOne({
        company_id: service.company_id,
        phone,
      }) : null
    
    let availabilities = await AvailabilityModel.query()
      .leftJoinRelated("[rooms]")
      .where(build => { if(room_name){ build.where({"rooms.name":room_name.toUpperCase()}) } })
      .where("service_id", service.id)
      .where("availability.active", true)
      .withGraphFetched("[rooms, services]")

    const datesOptions = groupBy(availabilities, a => a.weekday).map(grouped => {
      return `*${getExtenseWeekday(grouped[0])}*\n${grouped[1].map(av => 
        `_${moment(av.start_time).tz(timezone).format("HH:mm")} às ${moment(av.start_time).tz(timezone).add(av.period, "minutes").format("HH:mm")}_`).join("\n")}`
    }).join("\n")
      
    const scheduleDates = await Schedules_dates.query().where("company_id", service.company_id);
    let count = 0, nextDate = null;
    while(availabilities.length > 0 && !nextDate && count < 5000){
      const hs = extractHours({availabilities, scheduleDates, date: moment(date).add(count, "days").format("YYYY-MM-DD")});
      if(hs.length>0) nextDate = hs[0];
      count++;
    }

    ctx.body = {customer, nextDate, datesOptions};
  });

  router.get("/all/:service_name/:room_name?", async (ctx, next) => {
    console.log('aaaaaaaa');
    let { service_name, room_name} = ctx.params;
    let res;
    if (service_name && room_name) {
      res = await AvailabilityModel.query()
        .joinRelated("[rooms,services]")
        .where({"availability.active": true,"rooms.name":room_name.toUpperCase(),"services.name":service_name.toUpperCase()})
    } else {
      res = await AvailabilityModel.query()
        .joinRelated("services")
        .where({"availability.active": true,"services.name":service_name.toUpperCase()})
      }

      ctx.body = res.map(item => ({
        ...item,
        start_time:moment(item.start_time).format()
      }));
    
  });

  router.post("/add-availability", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(AvailabilityModel.knex());
    try {
      if (!params.weekday)
        throw new Error("Para adicionar é preciso colocar um dia da semana");
      //     let existent = await AvailabilityModel.query().findOne(raw("LOWER(weekday)"), params.weekday.toLowerCase())
      //   if(existent) throw new Error("Já existe um serviço com esse dia da semana")
      const Availability = await AvailabilityModel.query().insertGraphAndFetch({
        room_id: params.room_id,
        service_id: params.service_id,
        weekday: params.weekday,
        start_time: params.start_time,
        period: params.period,
        service_room_id: params.service_room_id,
        company_id: params.company_id,
      });
      ctx.body = Availability;
      ctx.status = 200;

      await trx.commit();
    } catch (err) {
      ctx.status = 500;
      await trx.rollback();
      console.log(err.message);
      throw new Error("Serviço não adicionado ", err);
    }
  });

  router.patch("/edit-availability/:id", async (ctx, next) => {
    let params = { ...ctx.data };
    const trx = await transaction.start(AvailabilityModel.knex());

    try {
      const editedAvailability = await AvailabilityModel.query(
        trx
      ).patchAndFetchById(ctx.params.id, params);

      await trx.commit();
      ctx.status = 200;
      ctx.body = editedAvailability;
    } catch (err) {
      await trx.rollback();
      ctx.body = err;
      //   console.log(err)
    }
  });

  router.patch("/:id/deactivate/:company_id", async (ctx, next) => {
    await AvailabilityServices.deactivateAvailability(ctx, ctx.params.id),
      AvailabilityModel.query().where("company_id", ctx.params.company_id);

    ctx.status = 200;
  });

  router.delete("/delete-availability/:id", async (ctx, next) => {
    const trx = await transaction.start(AvailabilityModel.knex());

    try {
      const deletedAvailability = await AvailabilityModel.query().findById(
        ctx.params.id
      );
      if (!deletedAvailability)
        throw new Error("Não foi possivel encontrar o id");

      await AvailabilityModel.query(trx).deleteById(ctx.params.id);

      await trx.commit();
      ctx.status = 200;
      ctx.body = deletedAvailability;
    } catch (err) {
      await trx.rollback();
      ctx.body = err;
    }
  });
};
