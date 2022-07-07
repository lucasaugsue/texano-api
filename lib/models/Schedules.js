import { Model } from 'objection';
import services_rooms from './Services_rooms'
import Availability from './Availability'

export class Schedules extends Model {
    static tableName = "schedules";
    static relationMappings = {
        rooms : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Rooms").Rooms,
            join: {
                from: "rooms.id",
                to: "schedules.room_id",
            }
        },
        services_rooms : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Services_rooms").Services_rooms,
            join: {
                from: "services_rooms.id",
                to: "schedules.service_room_id",
            }
        },
        services: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Services").Services,
            join: {
                from: "services.id",
                to: "schedules.service_id",
            }
        }, 
         customer: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "customer.id",
                to: "schedules.client_id",
            }
        }, 
        companies : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "companies.id",
                to: "schedules.company_id",
            }
        },
        schedules_dates: {
            relation: Model.HasOneRelation,
            modelClass: require("./Schedules_dates").Schedules_dates,
            join: {
                from: "schedules.schedules_dates_id",
                to: "schedules_dates.id",
            }
        },
    }
}