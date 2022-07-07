import { Model } from 'objection';

export class CompanyInstallments extends Model {
    static tableName = "company_installments" 
    static relationMappings = {
        companies: {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "company_installments.company_id",
                to: "companies.id",
            }
        }
    }
}