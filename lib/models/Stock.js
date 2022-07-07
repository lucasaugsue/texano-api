import { Model } from "objection"

export class Stock extends Model {
    static tableName = "stock";
    static relationMappings = {
        product: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "stock.product_id",
                to: "products.id",
            }
        },
        salesStock: {
            relation: Model.HasManyRelation,
            modelClass: require("./SalesStock").SalesStock,
            join: {
                from: "stock.id",
                to: "sales_stock.stock_id"
            }
        },
        customization: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./CustomProducts").CustomProducts,
            join: {
                from: "stock.custom_products_id",
                to: "custom_products.id",
            }
        },
    }
}