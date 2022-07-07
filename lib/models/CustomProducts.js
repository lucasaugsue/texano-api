import { Model } from "objection"

export class CustomProducts extends Model {
    static tableName = "custom_products";
    static relationMappings = {
        custom_attributes_products: {
            relation: Model.HasManyRelation,
            modelClass: require("./CustomAttributesProducts").CustomAttributesProducts,
            join: {
                from: "custom_products.id",
                to: "custom_attributes_products.custom_product_id",
            }
        },
    }
}