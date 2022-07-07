import PopUpsService from "../../services/PopUpsService";

export const PopUps = (router) => {
  router.get("/:company_id", async (ctx, next) => {
    const {company_id} = ctx.params;
    ctx.body = await PopUpsService.getCompanyPopUps(company_id);
  });
  
  router.get("/today/:date", async (ctx, next) => {
    const {date} = ctx.params;
    const company_id = (ctx.companyInfo ? ctx.companyInfo.id : ctx.companyProfile.company_id)
    ctx.body = await PopUpsService.checkDateForPopUps(company_id, date);
  });
  
  router.get("/info/:popup_id", async (ctx, next) => {
    const {popup_id} = ctx.params;
    ctx.body = await PopUpsService.getPopUp(popup_id);
  });
  
  router.post("/create", async (ctx, next) => {
    const params = {...ctx.data};
    ctx.body = await PopUpsService.createPopUp(params);
  }); 
  
  router.post("/click/:popup_id", async (ctx, next) => {
    const {popup_id} = ctx.params;
    const params = {...ctx.data};
    ctx.body = await PopUpsService.userClickedPopUp(params, popup_id);
  }); 
  
  router.patch("/edit/:popup_id", async (ctx, next) => {
    const {popup_id} = ctx.params;
    const params = {...ctx.data};
    ctx.body = await PopUpsService.editPopUp(popup_id,params);
  });  
  
  router.patch("/delete/:popup_id", async (ctx, next) => {
    const {popup_id} = ctx.params;
    ctx.body = await PopUpsService.deletePopUp(popup_id);
  });  
};
