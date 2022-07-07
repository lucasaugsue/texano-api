import { Model } from 'objection';

export class Companies extends Model {
    static tableName = "companies" 
    static relationMappings = {
        rooms : {
            relation: Model.HasManyRelation,
            modelClass: require("./Rooms").Rooms,
            join: {
                from: "companies.id",
                to: "rooms.company_id",
            }
        },
         customer : {
            relation: Model.HasManyRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "companies.id",
                to: "customer.company_id",
            }
        },
        schedules : {
            relation: Model.HasManyRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "companies.id",
                to: "schedules.company_id",
            }
        },
        schedules_dates : {
            relation: Model.HasManyRelation,
            modelClass: require("./Schedules_dates").Schedules_dates,
            join: {
                from: "companies.id",
                to: "schedules_dates.company_id",
            }
        },
        services : {
            relation: Model.HasManyRelation,
            modelClass: require("./Services").Services,
            join: {
                from: "companies.id",
                to: "services.company_id",
            }
        }, 
        ServicesRooms: {
            relation: Model.HasManyRelation,
            modelClass: require("./Services_rooms").Services_rooms,
            join: {
                from: "companies.id",
                to: "services_rooms.services_id",
            }
        },
        availability: {
            relation: Model.HasManyRelation,
            modelClass: require("./Availability").Availability,
            join: {
                from: "companies.id",
                to: "availability.companies.id",
            }
        },
        company_installments: {
            relation: Model.HasManyRelation,
            modelClass: require("./CompanyInstallments").CompanyInstallments,
            join: {
                from: "companies.id",
                to: "company_installments.company_id",
            }
        },
        sell_email: {
            relation: Model.HasManyRelation,
            modelClass: require("./SellsEmails").SellsEmails,
            join: {
                from: "companies.id",
                to: "sells_emails.company_id",
            }
        },
    }
}