import moment from "moment";
import { raw, transaction } from "objection";
import { Availability } from "../lib/models/Availability";
import { Customer as CustomerModel } from "../lib/models/Customer";
import { Schedules as SchedulesModel } from "../lib/models/Schedules";
import { Schedules_dates } from "../lib/models/Schedules_dates";

  const validateHour=(startTime, period, reservedInitialTime, reservedPeriod)=> {
    console.log({startTime, period, reservedInitialTime, reservedPeriod})
    const startTimeMoment = moment(startTime);
    const finalTimeMoment = moment(startTime).add(period, "minutes");
    const reservedStartTime = moment(reservedInitialTime);
    const reservedFinalTime = moment(reservedInitialTime).add(reservedPeriod, "minutes");
    return (
      finalTimeMoment.isSameOrBefore(reservedStartTime) ||
      startTimeMoment.isSameOrAfter(reservedFinalTime)
    );
  }

  const validateAvailability=(StartTime, Period, reservedInitialTime, reservedperiod)=> {
    const finalTimeHour = moment(StartTime).add(Period, "minutes").format('HH:mm');
    const startTimeHour = moment(StartTime).format('HH:mm');
    const reservedStartTimeHour = moment(reservedInitialTime).format('HH:mm');
    const reservedFinalTimeHour = moment(reservedInitialTime).add( reservedperiod, "minutes").format('HH:mm');
    const finalTime = moment(finalTimeHour,'HH:mm')
    const startTime = moment(startTimeHour,'HH:mm')
    const reservedStartTime = moment(reservedStartTimeHour,'HH:mm')
    const reservedFinalTime = moment(reservedFinalTimeHour,'HH:mm')

    if (
      (finalTime.isBefore(reservedFinalTime) &&
        finalTime.isBefore(reservedStartTime)) ||
      (startTime.isBefore(reservedFinalTime) &&
        startTime.isBefore(reservedStartTime))
    ) {
      return true;
    } else if (
      (finalTime.isAfter(reservedFinalTime) &&
        finalTime.isAfter(reservedStartTime)) ||
      (startTime.isAfter(reservedFinalTime) &&
        startTime.isAfter(reservedStartTime))
    ) {

      return true;
    } else if (
      (finalTime.isAfter(reservedFinalTime) &&
        startTime.isSame(reservedFinalTime)) ||
      (finalTime.isSame(reservedStartTime) &&
        startTime.isBefore(reservedStartTime))
    ) {

      return true;
    }

    return false;
  }

 const createSchedules=async(params)=> {
    const trx = await transaction.start(Schedules_dates.knex());
    try {
      if(params.formatted_datetime && params.format){
        params.date_time = moment(params.formatted_datetime, params.format).format()
      }
      if(!params.date_time) throw new Error("Insira uma data válida");
      const availability = await Availability.query().findById(params.availability_id);
      const reservedDates = await Schedules_dates.query().where("company_id", availability.company_id);
      let missMatch = reservedDates.some((reservedDate) => {
        return !(validateHour(
          params.date_time,
          availability.duration,
          reservedDate.date_time,
          reservedDate.period
        ));
      });

      if (missMatch) throw new Error("Selecione um período disponível."); 
      
      // let weekday = moment(params.date_time).weekday();
      // if (weekday !== availability.weekday) throw new Error("Selecione uma data disponivel"); 
      // missMatch = validateAvailability(
      //   params.date_time,
      //   availability.duration,
      //   availability.start_time,
      //   availability.period
      // )
          
      // if (missMatch) throw new Error("Insira um periodo válido.");
      if (!params.customer) throw new Error("Insira os dados do responsável");
      if(!params.customer.name) throw new Error("Para registarmos um cliente precisamos do seu nome")
      if(!params.customer.cpf) throw new Error("Para registarmos um cliente precisamos de um cpf")
      if(!params.customer.email) throw new Error("Para registarmos um cliente precisamos de um email")
      if(!params.customer.phone) throw new Error("Para registarmos um cliente precisamos de um telefone")

      params.customer.cpf = params.customer.cpf.replace(/ |\.|\-|\_/g, "")
      let existent = await CustomerModel.query(trx).findOne(builder => {
        builder
        .where("company_id", availability.company_id)
        .where(build => {
          build
          .where(raw("LOWER(email)"), params.customer.email.toLowerCase())
          // .orWhere("cpf", params.customer.cpf)
        })
      })
      if(existent){
        await existent.$query(trx).patchAndFetch({...params.customer, active:true})
        params.client_id = existent.id
      }else{
        const customer = await CustomerModel.query(trx).insertGraphAndFetch({
          name: params.customer.name,
          cpf: params.customer.cpf,
          email: params.customer.email,
          phone: params.customer.phone,
          company_id: availability.company_id,
        })
        params.client_id = customer.id
      }
      let response = await Schedules_dates.query(trx).insertGraphAndFetch({
        period: availability.duration,
        company_id: availability.company_id,
        date: moment(params.date_time).format("YYYY-MM-DD"),
        date_time: params.date_time,
        availability_id:availability.id,
      });

      await SchedulesModel.query(trx).insertAndFetch({
        room_id: availability.room_id,
        service_id: availability.service_id,
        service_room_id: availability.service_room_id,
        client_id: params.client_id,
        company_id: availability.company_id,
        schedules_dates_id: response.id,
        type: (params.client_id) ? "occupied" : "unavailable",
      })

      await trx.commit();
      return response;
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  export {createSchedules,validateHour}
