import { Model } from 'objection';
import Rooms from './Rooms'

export class Availability extends Model {
    static tableName = "availability";
    static relationMappings = {
        rooms: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Rooms").Rooms,
            join: {
                from: "availability.room_id",
                to: "rooms.id",
            }
        },
         services_rooms: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Services_rooms").Services_rooms,
            join: {
                from: "availability.service_room_id",
                to: "services_rooms.id",
            }
        },
        services: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Services").Services,
            join: {
                from: "availability.service_id",
                to: "services.id",
            }
        },
        companies: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "companies.id",
                to: "availability.company_id",
            }
        },
        schedules_dates: {
            relation: Model.HasManyRelation,
            modelClass: require("./Schedules_dates").Schedules_dates,
            join: {
                from: "availability.id",
                to: "schedules_dates.availability_id",
            }
        },
    
    }
}