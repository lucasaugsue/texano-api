import { Model } from 'objection';

export class ProductImages extends Model {
    static tableName = "product_images" 
    static relationMappings = {
        product: {
            relation: Model.HasManyRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "product_images.product_id",
                to: "products.id",
            }
        },
    }
}