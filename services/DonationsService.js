import {Donations as DonationsModel} from '../lib/models/Donations'
import {Customer as CustomerModel} from '../lib/models/Customer'
import {CreditCards as CreditCardsModel} from '../lib/models/CreditCards'
import {Transactions as TransactionsModel} from '../lib/models/Transactions'
import CoalahPayService from './CoalahPayService'
import md5 from 'md5'
import moment from 'moment-timezone'
import { transaction as transactionObjection } from 'objection'

export default class DonationsService{
    static async makeCreditDonation(ctx, {company, value, customer, card}){
        const trx = await transactionObjection.start(DonationsModel.knex())
        try{
            if(!company || !company.coalah_pay_key) throw new Error("Empresa inabilidada para doações");

            value = parseFloat(value)
            if(isNaN(value) || value < 1) throw new Error("Valor deve ser maior que 1 real");
            
            customer.cpf = customer.cpf.replace(/\.| |\-/g, "")
            card.number = card.number.replace(/ /g, "")
            
            const customerObject = await CustomerModel.query(trx).insertAndFetch({company_id: company.id, ...customer})
            const cardResponse = await CoalahPayService.createTokenCard(company.coalah_pay_key, {
                cpf: customerObject.cpf,
                card: {
                    number: card.number,
                    brand: card.brand,
                    holder: card.holder,
                    expiry: `${card.expiry.split("/")[0]}/${`20${card.expiry.split("/")[1]}`.slice(-4)}`,
                    cvv: card.security,
                },
            })
            const crypted_number = md5(card.number)
            console.log({cardResponse})
            const creditCard = await CreditCardsModel.query(trx).insertAndFetch({
                key: cardResponse.token,
                origin: "coalah",
                crypted_number,
                brand: card.brand,
            })
            const transactionResponse = await CoalahPayService.makeCreditTransaction(company.coalah_pay_key, {
                description: "UNIDOS",
                value,
                installments: 1,
                token: creditCard.key,
                capture: true,
            })
            console.log({transactionResponse})
            if(![1, 2].includes(transactionResponse.status)) throw new Error(`${transactionResponse.return_code} (${transactionResponse.return_message})`)
            const transaction = await TransactionsModel.query(trx).insertAndFetch({
                credit_card_id: creditCard.id,
                key: transactionResponse.key,
                origin: "coalah",
                value,
                payed_value: value,
                due_date: moment().format(),
                payed_date: moment().format(),
            })
            await DonationsModel.query(trx).insertAndFetch({
                customer_id: customerObject.id,
                transaction_id: transaction.id,
                value,
            })

            await trx.commit();
            ctx.status = 201
        }catch(err){
            await trx.rollback();
            throw err
        }
    }
}