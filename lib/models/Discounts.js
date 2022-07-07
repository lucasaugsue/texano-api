import { Model } from "objection"

export class Discounts extends Model {
    static tableName = "discounts";
    static relationMappings = {
        sales: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "discounts.sale_id",
                to: "sales.id",
            }
        },
    }
} 