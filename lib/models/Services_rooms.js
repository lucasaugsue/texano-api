import { Model } from 'objection';

export class Services_rooms extends Model {
    static tableName = "services_rooms";
    static relationMappings = {
        rooms: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Rooms").Rooms,
            join: {
                from: "services_rooms.room_id",
                to: "rooms.id",
            }
        },
        availability: {
            relation: Model.HasManyRelation,
            modelClass: require("./Availability").Availability,
            join: {
                from: "services_rooms.id",
                to: "availability.service_room_id",
            }
        }, 
         services: {
            relation: Model.HasOneRelation,
            modelClass: require("./Services").Services,
            join: {
                from: "services_rooms.service_id",
                to: "services.id",
            }
        },
        schedules: {
            relation: Model.HasManyRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "services_rooms.id",
                to: "schedules.service_room_id",
            }
        },  
        companies: {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "services_rooms.company_id",
                to: "Companies.id",
            }
        },
    }
}