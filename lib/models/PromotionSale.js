import { Model } from "objection"

export class PromotionSale extends Model {
    static tableName = "promotion_sale";
    static relationMappings = {
        promotion: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Promotion").Promotion,
            join: {
                from: "promotion.id",
                to: "promotion_sale.promotion_id",
            }
        },
        sales: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "sales.id",
                to: "promotion_sale.sale_id",
            }
        },
 
    }
}