import { Model } from 'objection';

export class SellsEmails extends Model {
    static tableName = "sells_emails" 
    static relationMappings = {
        company : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "companies.id",
                to: "sells_emails.company_id",
            }
        },
    }
}