import { Model } from 'objection';
import Services from './Services'

export class Customer extends Model {
    static tableName = "customer";
    static relationMappings = {
      
         schedules: {
            relation: Model.HasOneRelation,
            modelClass: require("./Schedules").Schedules,
            join: {
                from: "customer.id",
                to: "schedules.client_id",
            }
        },
        companies: {
            relation: Model.HasOneRelation,
            modelClass: require("./Companies").Companies,
            join: {
                from: "companies.id",
                to: "customer.company_id",
            }
        },
        sales: {
            relation: Model.HasManyRelation,
            modelClass: require("./Sales").Sales,
            join: {
                from: "customer.id",
                to: "sales.customer_id",
            }
        },
        product_views:{
            relation: Model.HasManyRelation,
            modelClass: require("./ProductViews").ProductViews,
            join: {
                from: "customer.id",
                to: "product_views.customer_id",
            }
        },
        password:{
            relation: Model.HasOneRelation,
            modelClass: require("./CustomerPassword").CustomerPassword,
            join: {
                from: "customer.id",
                to: "customer_password.customer_id",
            }
        },
        cards:{
            relation: Model.HasManyRelation,
            modelClass: require("./CustomerCards").CustomerCards,
            join: {
                from: "customer.id",
                to: "customer_cards.customer_id",
            }
        },
        address:{
            relation: Model.HasManyRelation,
            modelClass: require("./CustomerAddress").CustomerAddress,
            join: {
                from: "customer.id",
                to: "customer_address.customer_id",
            }
        },
    }
}