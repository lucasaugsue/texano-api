import { Model } from 'objection';

export class ProductRelations extends Model {
    static tableName = "product_relations" 
    static relationMappings = {
        from: {
            relation: Model.HasManyRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "product_relations.from_id",
                to: "products.id",
            }
        },
        to: {
            relation: Model.HasManyRelation,
            modelClass: require("./Products").Products,
            join: {
                from: "product_relations.to_id",
                to: "products.id",
            }
        },
    }
}