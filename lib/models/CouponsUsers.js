import { Model } from 'objection';

export class CouponsUsers extends Model {
    static tableName = "coupons_users" 
    static relationMappings = {
        coupon : {
            relation: Model.HasManyRelation,
            modelClass: require("./Coupons").Coupons,
            join: {
                from: "coupons_users.coupon_id",
                to: "coupons.id",
            }
        },
        user : {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "coupons_users.customer_id",
                to: "customer.id",
            }
        },
    }
}