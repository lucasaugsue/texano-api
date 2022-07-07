import { Model } from 'objection';

export class CompanyProfiles extends Model {
    static tableName = "company_profiles" 
    static relationMappings = {
        profiles: {
            relation: Model.HasOneRelation,
            modelClass: require("./Profiles").Profiles,
            join: {
                from: "company_profiles.profile_id",
                to: "profiles.id",
            }
        }
    }
}