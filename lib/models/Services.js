import { Model } from 'objection';
import services_rooms from './Services_rooms'
import Availability from './Availability'

export class Services extends Model {
    static tableName = "services";
    static relationMappings = {
        services_rooms : {
            relation: Model.HasManyRelation,
            modelClass: require("./Services_rooms").Services_rooms,
            join: {
                from: "services.id",
                to: "services_rooms.service_id",
            }
        },
        availability: {
            relation: Model.HasManyRelation,
            modelClass: require("./Availability").Availability,
            join: {
                from: "services.id",
                to: "availability.service_id",
            }
        }, 
         schedules: {
            relation: Model.HasManyRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "services.id",
                to: "schedules.service_id",
            }
        },
        companies : {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "services.company_id",
                to: "companies.id",
            }
        },
    }
}