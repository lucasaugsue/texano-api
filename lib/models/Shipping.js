import { Model } from "objection"

export class Shipping extends Model {
    static tableName = "shipping";
    static relationMappings = {
        product: {
            relation: Model.HasOneRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "shipping.product_id",
                to: "products.id",
            }
        },
    }
}