import PromotionService from "../../services/PromotionService";

export const Promotion = (router) => {
  router.get("/all/:company_id", async (ctx, next) => {
    let {company_id} = ctx.params
    if (!company_id) throw new Error("É necessario um company_id")

    ctx.body = await PromotionService.getAllPromotionByCompany(company_id)
  });

  router.post("/add-promotion", async (ctx, next) => {
    let {company_id,exact_amount,products,by_price,by_price_type, total_value} = ctx.data;
    try {
      let response
      if(!by_price || (by_price == "false") || (by_price == false)){
        if(!company_id) throw new Error("É necessario um company id")
        if((typeof exact_amount) === 'undefined') throw new Error("É necessário um exact amount")
        if(!products) throw new Error("é necessário uma lista com no mínimo 1 produto")
        if(!products.length) throw new Error("é necessário uma lista com no mínimo 1 produto")
        response = await PromotionService.makePromotion(ctx.data);
      }else{
        if(!by_price_type) throw new Error("Informe o tipo de Desconto")
        if(!total_value) throw new Error("Informe o valor mínimo em compras para ativar a promoção!")
        response = await PromotionService.makePricePromotion(ctx.data);

      }
      ctx.body = response;
      ctx.status = 200;
    } catch (err) {
      throw new Error(err.message);
    }
  });

  router.patch("/delete-promotion/:id", async (ctx, next) => {

    const {company_id} = ctx.data
     const {id} = ctx.params
    try {
      if(!id) throw new Error("Para deletar é necessario um id")
      if(!company_id) throw new Error("Para deletar é necessario falar qual company")
      const response = await PromotionService.deletePromotion(id,company_id)
      ctx.body = response
    } catch (error) {     
      throw new Error(error.message)
    }
  });
  router.get("/has-promotion/:company_id/:sale_id", async (ctx, next) => {
    let {company_id,sale_id} = ctx.params
    if (!company_id) throw new Error("Não encontramos esta companhia, por favor entre em contato com o suporte!")
    if (!sale_id) throw new Error("não encontramos esta venda!")

    ctx.body = await PromotionService.getAvailablePromotionByCompanyAndSale(company_id,sale_id)
  });
};
