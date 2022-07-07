import { Model } from "objection"

export class PromotionProduct extends Model {
    static tableName = "promotion_product";
    static relationMappings = {
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "promotion_product.product_id",
                to: "products.id"
            }
        },
        promotion: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Promotion").Promotion,
            join:{
                from: "promotion_product.promotion_id",
                to: "promotion.id"
            }
        }
    }
}