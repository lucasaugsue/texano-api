import moment from 'moment'
import Authenticate from '../../middlewares/Authenticate'
import { Resources as ResourcesModel } from '../models/Resources'
import { ResourcesProfiles as ResourcesProfilesModel } from '../models/ResourcesProfiles'
import CoalahPayService from '../../services/CoalahPayService'
import { CustomerCards } from '../models/CustomerCards'
import { Addresses } from '../models/Addresses'
import { isCEP } from '../../utils/Util'
import isValidCep from '@brazilian-utils/is-valid-cep';
import { transaction } from 'objection'
import cardsRepository from '../../repositories/CardsRepository'
import { Companies } from '../models/Companies'


export const Cards = (router) => {

    router.get('/', async (ctx, next) => {
        ctx.body = await cardsRepository.getAll()
    })
    
    router.get('/customers', async (ctx, next) => {
        ctx.body = await cardsRepository.getAllUsersCards()
    })
    
    router.get('/all/:customer_id', async (ctx, next) => {
        const {customer_id} = ctx.params
        ctx.body = await cardsRepository.getUserCards(customer_id)
    })
    
    router.get('/active/:customer_id', async (ctx, next) => {
        const {customer_id} = ctx.params
        ctx.body = await cardsRepository.getActiveUserCards(customer_id)
    })
    
    // router.post('/new/:customer_id', async (ctx, next) => {
    //     const data = {...ctx.data}
    //     const {customer_id} = ctx.params
    //     const trx = await transaction.start(CustomerCards.knex())
    //     try{
    //         const company = await Companies.query().findById(ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
    //         console.log(company);
    //         if (!company || !company.coalah_pay_key || company.coalah_pay_key==='')throw new Error('Nao foi possivel cadastrar o cartao, entre em contato com a empresa')
    //         if(!params.number) throw new Error("Para cadastrar um cartao de credito e necessario o numero")
    //         if(!params.brand) throw new Error("Para cadastrar um cartao de credito e necessario a marca")
    //         if(!params.holder) throw new Error("Para cadastrar um cartao de credito e necessario o nome do portador")
    //         if(!params.security) throw new Error("Para cadastrar um cartao de credito e necessario o cvc")
    //         if(!params.expiry) throw new Error("Para cadastrar um cartao de credito e necessario o prezo de expirar")

    //         const cardResponse = await CoalahPayService.createTokenCard(company.coalah_pay_key, {
    //             cpf: customer.cpf,
    //             card: {
    //                 number: params.number,
    //                 brand: params.brand,
    //                 holder: params.holder,
    //                 expiry: `${params.expiry.split("/")[0]}/${`20${params.expiry.split("/")[1]}`.slice(-4)}`,
    //                 cvv: params.security,
    //             },
    //         })

    //         const crypted_number = md5(params.number)
    //         const creditCard = await CreditCardsModel.query(trx).insertAndFetch({
    //             key: cardResponse.token,
    //             origin: "coalah",
    //             crypted_number,
    //             brand: params.brand,
    //         })
    //         const response = await CustomerCardsModel.query(trx).insertAndFetch({
    //             customer_id:customer.id,
    //             credit_card_id:creditCard.id,
    //             last_digits:params.number.slice(-4)
    //         })
    //         trx.commit()
    //         ctx.body = response
            
    //         await trx.commit();
    //         ctx.body = creditCard
    //         ctx.status = 200
    //     }catch(err){
    //         await trx.rollback();
    //         ctx.status = 400
    //         throw new Error(`Houve um problema com o cadastro do cartão: ${err.message}`)
    //     }
        
    // })


    router.patch('/delete/:customer_id/:card_id', async (ctx, next) => {
        const {customer_id,card_id} = ctx.params
        const trx = await transaction.start(CustomerCards.knex())
        try{
            if(!card_id) throw new Error("Não encontramos este cartão, por favor tente novamente!");
            const deletedCard = await cardsRepository.deleteUserCard(customer_id,card_id, trx);
            
            await trx.commit();
            ctx.body = deletedCard
            ctx.status = 200
        }catch(err){
            await trx.rollback();
            ctx.status = 400
            throw new Error(`Houve um problema ao deletar o cartão: ${err.message}`)
        }
        
    })
    
}
