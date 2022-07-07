import { Model } from "objection"

export class CustomAttributes extends Model {
    static tableName = "custom_attributes";
    static relationMappings = {
        custom_categories: {
            relation: Model.HasOneRelation,
            modelClass: require("./CustomCategories").CustomCategories,
            join: {
                from: "custom_attributes.custom_category_id",
                to: "custom_categories.id",
            }
        },
        custom_attributes_products: {
            relation: Model.HasManyRelation,
            modelClass: require("./CustomAttributesProducts").CustomAttributesProducts,
            join: {
                from: "custom_attributes.id",
                to: "custom_attributes_products.custom_attribute_id",
            }
        },
    }
}