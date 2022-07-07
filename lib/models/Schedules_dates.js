import { Model } from 'objection';

export class Schedules_dates extends Model {
    static tableName = "schedules_dates";
    static relationMappings = {
      
         schedules: {
            relation: Model.HasOneRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "schedules_dates.id",
                to: "schedules.schedules_dates_id",
            }
        },
        companies : {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "schedules_dates.company_id",
                to: "companies.id",
            }
        }, 
        availability : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Availability").Availability,
            join: {
                from: "schedules_dates.company_id",
                to: "availability.id",
            }
        },
    }
}