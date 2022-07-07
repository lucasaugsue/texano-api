import { Model } from "objection"

export class CustomAttributesProducts extends Model {
    static tableName = "custom_attributes_products";
    static relationMappings = {
        custom_attributes: {
            relation: Model.HasOneRelation,
            modelClass: require("./CustomAttributes").CustomAttributes,
            join: {
                from: "custom_attributes_products.custom_attribute_id",
                to: "custom_attributes.id",
            }
        },
        custom_products: {
            relation: Model.HasOneRelation,
            modelClass: require("./CustomProducts").CustomProducts,
            join: {
                from: "custom_attributes_products.custom_product_id",
                to: "custom_products.id",
            }
        }
    }
}