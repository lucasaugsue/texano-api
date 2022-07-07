import { Model } from "objection"

export class Sales extends Model {
    static tableName = "sales";
    static relationMappings = {
        salesStock: {
            relation: Model.HasManyRelation,
            modelClass: require("./SalesStock").SalesStock,
            join: {
                from: "sales.id",
                to: "sales_stock.sale_id"

            }
        },
        payments: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Payments").Payments,
            join: {
                from: "sales.payment_id",
                to: "payments.id",
            }
        },
        discount: {
            relation: Model.HasManyRelation,
            modelClass: require("./Discounts").Discounts,
            join: {
                from: "sales.id",
                to: "discounts.sale_id"

            }
        },
        saleHistory: {
            relation: Model.HasManyRelation,
            modelClass: require("./SaleHistory").SaleHistory,
            join: {
                from: "sales.id",
                to: "sale_history.sale_id"

            }
        },
        promotion_sale: {
            relation: Model.HasManyRelation,
            modelClass: require("./PromotionSale").PromotionSale,
            join: {
                from: "sales.id",
                to: "promotion_sale.promotion_id",
            }
        },
        customer: {
            relation: Model.BelongsToOneRelation,
            modelClass: require("./Customer").Customer,
            join: {
                from: "sales.customer_id",
                to: "customer.id",
            }
        },
        transaction: {
            relation: Model.HasOneRelation,
            modelClass: require("./Transactions").Transactions,
            join: {
                from: "sales.transaction_id",
                to: "transactions.id",
            }
        },
        shippingAddress: {
            relation: Model.HasOneRelation,
            modelClass: require("./SaleAddress").SaleAddress,
            join: {
                from: "sales.id",
                to: "sale_address.sale_id",
            }
        },
    }
}