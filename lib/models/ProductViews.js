import { Model } from 'objection';

export class ProductViews extends Model {
    static tableName = "product_views" 
    static relationMappings = {
        product: {
            relation: Model.HasManyRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "product_views.product_id",
                to: "products.id",
            }
        },
        customer: {
            relation: Model.HasManyRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "product_views.customer_id",
                to: "customer.id",
            }
        },
    }
}