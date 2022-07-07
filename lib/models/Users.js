import { Model } from 'objection';

export class Users extends Model {
    static tableName = "users" 
    static relationMappings = {
        address: {
            relation: Model.HasOneRelation,
            modelClass: require("./Addresses").Addresses,
            join: {
                from: "users.address_id",
                to: "addresses.id",
            }
        },
        companyProfiles: {
            relation: Model.HasManyRelation,
            modelClass: require("./CompanyProfiles").CompanyProfiles,
            join: {
                from: "users.id",
                to: "company_profiles.user_id",
            }
        },
        categories: {
            relation: Model.HasManyRelation,
            modelClass: require("./Categories").Categories,
            join: {
                from: "users.id",
                to: "categories.user_id",
            }
        },
        
    }
}