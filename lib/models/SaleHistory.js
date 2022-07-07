import { Model } from "objection"

export class SaleHistory extends Model {
    static tableName = "sale_history";
    static relationMappings = {
        sales: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "sale_history.sale_id",
                to: "sales.id",
            }
        },
    }
}