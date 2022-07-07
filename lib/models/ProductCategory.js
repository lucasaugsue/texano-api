import { Model } from "objection"
import moment from "moment"

export class ProductCategory extends Model {
    static tableName = "product_category";
    static relationMappings = {
        product: {
            relation: Model.HasOneRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "product_category.product_id",
                to: "products.id",
            }
        },
        category: {
            relation: Model.HasOneRelation,
            modelClass: require("./Categories").Categories,
            join: {
                from: "product_category.category_id",
                to: "categories.id",
            }
        },   
    }
}