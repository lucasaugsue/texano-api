import { Model } from 'objection';

export class CompanyAddress extends Model {
    static tableName = "company_addresses";
    static relationMappings = {
        company:{
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "company_addresses.company_id",
                to: "companies.id",
            }
        },
        address:{
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Addresses").Addresses,
            join: {
                from: "company_addresses.address_id",
                to: "addresses.id",
            }
        },
    }
}