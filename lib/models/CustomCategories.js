import { Model } from "objection"

export class CustomCategories extends Model {
    static tableName = "custom_categories";
    static relationMappings = {
        custom_attributes: {
            relation: Model.HasManyRelation,
            modelClass: require("./CustomAttributes").CustomAttributes,
            join: {
                from: "custom_categories.id",
                to: "custom_attributes.custom_category_id",
            }
        },
    }
}