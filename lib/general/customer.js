import { Customer as CustomerModel } from "../models/Customer";
import { raw, transaction } from 'objection'

export const Customer = (router) => {
  router.get("/all/:user_id", async (ctx, next) => {
    let params = { ...ctx.data };

    ctx.body = await CustomerModel.query().where({"company_id": ctx.params.user_id,active:true});

  });

  router.get("/:user_id", async (ctx, next) => {
    let params = { ...ctx.data };
    if(!params.customer_id) throw new Error("insira um id de cliente existente")
    
    ctx.body = await CustomerModel.query().where("company_id", ctx.params.user_id).findById(params.customer_id);

  });

  router.post('/add-customer', async (ctx, next) => {
    let params = {...ctx.data}
    const trx = await transaction.start(
        CustomerModel.knex()
    )
    
    try {
        const updateUser = async(user) =>{
          const updated = await user.$query().patchAndFetch({active:true})
          return updated 
        }
        
        let params = {...ctx.data}
        if(!params.name) throw new Error("Para registarmos um cliente precisamos do seu nome")
        if(!params.cpf) throw new Error("Para registarmos um cliente precisamos de um cpf")
        if(!params.email) throw new Error("Para registarmos um cliente precisamos de um email")
        if(!params.phone) throw new Error("Para registarmos um cliente precisamos de um telefone")

        params.cpf = params.cpf.replace(/ |\.|\-|\_/g, "")

        let existent = await CustomerModel.query().findOne(raw("LOWER(email)"), params.email.toLowerCase())
        if(existent && existent.active){
          throw new Error("Já existe um cliente com esse email")
        }else if(existent){
           await trx.commit()  
           ctx.body = await updateUser(existent)
        }else{
          existent = await CustomerModel.query().findOne("cpf", params.cpf)
          if(existent && existent.active){
            throw new Error("Já existe um cliente com esse cpf")
          }else if(existent){
            await trx.commit() 
            ctx.body = await updateUser(existent)
          }else{
            const Customer = await CustomerModel.query().insertGraphAndFetch({
              name: params.name,
              cpf: params.cpf,
              email: params.email,
              phone: params.phone,
              company_id: params.company_id,
            })
            await trx.commit()  
            ctx.body = Customer
            ctx.status = 200
          }
        }
        
    } catch (err) {
      await trx.rollback();
      console.log(err.message)
      ctx.status = 400
      throw new Error(`Cliente não adicionado ${err.message}`)

    }
    })
  
    router.patch('/edit-customer/:id', async (ctx, next) => {
      let params = {...ctx.data}
      const trx = await transaction.start(CustomerModel.knex())

      try{
          const editedCustomer = await CustomerModel.query(trx)
          .patchAndFetchById(ctx.params.id, params)
              
          await trx.commit()
          ctx.status = 200
          ctx.body = editedCustomer

      } catch(err){

          await trx.rollback()
          ctx.body = err
        //   console.log(err)
      }
  })
  router.delete('/delete-customer/:id', async (ctx, next) => {
    const trx = await transaction.start(CustomerModel.knex())

    try{
        const deletedCustomer = await CustomerModel.query().findById(ctx.params.id)
        if(!deletedCustomer) throw new Error("Não foi possivel encontrar o id")
        
        await CustomerModel.query(trx).deleteById(ctx.params.id)

        await trx.commit()
        ctx.status = 200
        ctx.body = deletedCustomer

    } catch(err){

        await trx.rollback()
        ctx.body = err
    }
})
router.patch('/delete-customer/:id', async (ctx, next) => {
  const trx = await transaction.start(CustomerModel.knex())

  try{
      const customer = await CustomerModel.query(trx).findById(ctx.params.id)
      if(!customer) throw new Error("Não foi possivel encontrar o id")
      const updated = await customer.$query(trx).patchAndFetch({active:false})
      if(!updated) throw new Error("Não foi possivel deletar o customer")

      await trx.commit()
      ctx.status = 200
      ctx.body = updated

  } catch(err){

      await trx.rollback()
      ctx.body = err
  }
})
};
