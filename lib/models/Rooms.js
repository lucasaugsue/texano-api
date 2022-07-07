import { Model } from 'objection';

export class Rooms extends Model {
    static tableName = "rooms";
    static relationMappings = {
        ServicesRooms: {
            relation: Model.HasManyRelation,
            modelClass: require("./Services_rooms").Services_rooms,
            join: {
                from: "rooms.id",
                to: "services_rooms.room_id",
            }
        },
        Companies: {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "rooms.company_id",
                to: "Companies.id",
            }
        }, 
        availability: {
            relation: Model.HasManyRelation,
            modelClass: require("./Availability").Availability,
            join: {
                from: "rooms.id",
                to: "availability.room_id",
            }
        }, 
         schedules: {
            relation: Model.HasManyRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "rooms.id",
                to: "schedules.room_id",
            }
        },
    }
}