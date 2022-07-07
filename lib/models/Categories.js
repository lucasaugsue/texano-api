import { Model } from "objection"
import moment from "moment"

export class Categories extends Model {
    static tableName = "categories";
    static relationMappings = {
        users: {
            relation: Model.HasOneRelation,
            modelClass: require("./Users").Users,
            join: {
                from: "categories.user_id",
                to: "user.id",
            }
        },
        product_category: {
            relation: Model.HasManyRelation,
            modelClass: require("./ProductCategory").ProductCategory,
            join: {
                from: "categories.id",
                to: "product_category.category_id"
            }
        }

    }
}