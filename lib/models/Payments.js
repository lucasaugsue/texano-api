import { Model } from "objection"

export class Payments extends Model {
    static tableName = "payments";
    static relationMappings = {
        method: {
            relation: Model.HasOneRelation,
            modelClass: require("./Methods").Methods,
            join: {
                from: "payments.method_id",
                to: "methods.id",
            }
        },
        sales: {
            relation: Model.HasManyRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "payments.id",
                to: "sales.payment_id"
            }
        },
    }
}