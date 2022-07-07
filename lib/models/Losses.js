import { Model } from "objection"
import { Stock } from '../models/Stock';

export class Losses extends Model {
    static tableName = "losses";
    static relationMappings = {
        stock: {
            relation: Model.HasOneRelation,
            modelClass: require("./Stock").Stock,
            join: {
                from: "losses.stock_id",
                to: "stock.id",
            }
        },
    }
}