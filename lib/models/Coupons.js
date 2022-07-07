import { Model } from 'objection';

export class Coupons extends Model {
    static tableName = "coupons" 
    static relationMappings = {
        coupon_users : {
            relation: Model.HasManyRelation,
            modelClass: require("./CouponsUsers").CouponsUsers,
            join: {
                from: "coupons.id",
                to: "coupons_users.coupon_id",
            }
        },
        coupon_emails : {
            relation: Model.HasManyRelation,
            modelClass: require("./CouponsEmails").CouponsEmails,
            join: {
                from: "coupons.id",
                to: "coupons_emails.coupon_id",
            }
        },
    }
}