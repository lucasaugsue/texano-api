import { Model } from "objection"
import moment from "moment"

export class SalesStock extends Model {
    static tableName = "sales_stock";
    static relationMappings = {
        sales: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "sales_stock.sale_id",
                to: "sales.id",
            }
        },
        stock: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Stock").Stock,
            join: {
                from: "sales_stock.stock_id",
                to: "stock.id",
            }
        },   
    }
}