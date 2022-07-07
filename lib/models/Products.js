import { Model } from "objection"

export class Products extends Model {
    static tableName = "products";
    static relationMappings = {
        categories: {
            relation: Model.ManyToManyRelation,
            modelClass: require("./Categories").Categories,
            join: {
                from: "products.category_id",
                through: {
                    from: "categories.id",
                    to: "categories.id",
                }
            }
        },
        stock: {
            relation: Model.HasManyRelation,
            modelClass: require("./Stock").Stock,
            join: {
                from: "products.id",
                to: "stock.product_id",
            }
        }, 
        promotion_product: {
            relation: Model.HasManyRelation,
            modelClass: require("./PromotionProduct").PromotionProduct,
            join: {
                from: "products.id",
                to: "promotion_product.product_id",
            }
        },
        product_category: {
            relation: Model.HasManyRelation,
            modelClass: require("./ProductCategory").ProductCategory,
            join: {
                from: "products.id",
                to: "product_category.product_id",
            }
        },
        product_relations: {
            relation: Model.HasManyRelation,
            modelClass: require("./ProductRelations").ProductRelations,
            join: {
                from: "products.id",
                to: "product_relations.from_id",
            }
        },
        product_images:{
            relation: Model.HasManyRelation,
            modelClass: require("./ProductImages").ProductImages,
            join: {
                from: "products.id",
                to: "product_images.product_id",
            }
        },
        images:{
            relation: Model.HasManyRelation,
            modelClass: require("./ProductImages").ProductImages,
            join: {
                from: "products.id",
                to: "product_images.product_id",
            }
        },
        product_views:{
            relation: Model.HasManyRelation,
            modelClass: require("./ProductViews").ProductViews,
            join: {
                from: "products.id",
                to: "product_views.product_id",
            }
        },
        shipping: {
            relation: Model.HasOneRelation,
            modelClass: require("./Shipping").Shipping,
            join: {
                from: "products.id",
                to: "shipping.product_id",
            }
        },   
        custom_products: {
            relation: Model.HasManyRelation,
            modelClass: require("./CustomProducts").CustomProducts,
            join: {
                from: "products.id",
                to: "custom_products.product_id",
            }
        },  
    }
}