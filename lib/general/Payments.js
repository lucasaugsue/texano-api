import moment from 'moment'
import { Payments as PaymentsModel} from '../models/Payments';
import { Methods } from '../models/Methods';
import { transaction } from 'objection'

export const Payments = (router) => {
    router.get('/payment-by/:company_id', async (ctx, next) => {
        let params = {...ctx.data}
        ctx.body = await PaymentsModel.query()
        .join("methods", "payments.method_id", "methods.id")
        .select("payments.id", "payments.discount", "payments.company_id", "methods.type")
        .where({company_id:ctx.params.company_id,active:true})
    })

    router.get('/all-methods', async (ctx,next) => {
        ctx.body = await Methods.query()
    })

    router.patch('/delete-payment/:id', async (ctx,next) => {
        const trx = await transaction.start(PaymentsModel.knex())
        
        try{
            if(!ctx.params.id) throw new Error("Informe o Id para continuar")
            const desactivatedPayment = await PaymentsModel.query(trx).patchAndFetchById(ctx.params.id,{active:false})
            if(!desactivatedPayment) throw new Error("Não foi possivel encontrar o id do payment")

            await trx.commit()
            ctx.status = 200
            ctx.body = desactivatedPayment

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })

    router.post('/add-payment', async (ctx, next) => {
        let params = {...ctx.data}
        if(!params.method_id) throw new Error("Para cadastrar um tipo de pagamento é preciso do method_id")
        if(!params.company_id) throw new Error("Para cadastrar um tipo de pagamento é preciso do company_id")

        let existentMethod = await PaymentsModel.query()
        .findOne({"method_id": params.method_id, "company_id": params.company_id})
        console.log("existentMethod",existentMethod);
        if(existentMethod && existentMethod.active){
            throw new Error("Já existe um metodo de pagamento para esse user")
        }else if(existentMethod){
            console.log("existentMethod ataualizar",existentMethod);
            const updatedPayment = await existentMethod.$query().patchAndFetch({ active:true,updated_at: Date.now() })
            ctx.status = 200
            ctx.body = updatedPayment
        }

        const payment = await PaymentsModel.query().insertAndFetch({
            discount: params.discount,
            method_id: params.method_id,
            company_id: params.company_id,
        })

        ctx.status = 200
        ctx.body = payment
    })

    router.delete('/delete-payment/:id', async (ctx, next) => {
        const trx = await transaction.start(PaymentsModel.knex())
        
        try{
            if(!ctx.params.id) throw new Error("Informe o Id para continuar")
            const deletedstock = await PaymentsModel.query(trx).findById(ctx.params.id)
            if(!deletedstock) throw new Error("Não foi possivel encontrar o id do payment")

            await PaymentsModel.query(trx).deleteById(ctx.params.id)

            await trx.commit()
            ctx.status = 200
            ctx.body = deletedstock

        } catch(err){

            await trx.rollback()
            ctx.body = err
        }
    })
    router.get('/company-methods/:company_id', async (ctx,next) => {
        ctx.body = await PaymentsModel.query().withGraphFetched("method")
        .where('company_id', ctx.params.company_id).where('active',true);
    })

}