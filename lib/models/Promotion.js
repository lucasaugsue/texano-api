import { Model } from "objection"

//BY_PRICE_TYPE: 
// 1 = Frete Grátis
// 2 = 10% OFF
// 3 = R$10 OFF

export class Promotion extends Model {
    static tableName = "promotion";
    static relationMappings = {
        promotion_product: {
            relation: Model.HasManyRelation,
            modelClass: require("./PromotionProduct").PromotionProduct,
            join: {
                from: "promotion.id",
                to: "promotion_product.promotion_id",
            }
        },
        promotion_sale: {
            relation: Model.HasManyRelation,
            modelClass: require("./PromotionSale").PromotionSale,
            join: {
                from: "promotion.id",
                to: "promotion_sale.promotion_id",
            }
        },
 
    }
}