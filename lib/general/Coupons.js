import CouponsService from "../../services/CouponsService";

export const Coupons = (router) => {
  router.get("/:company_id", async (ctx, next) => {
    const {company_id} = ctx.params
    ctx.body = await CouponsService.getCompanyCoupons(company_id);
  });
  
  router.get("/info/:coupon_id", async (ctx, next) => {
    const {coupon_id} = ctx.params
    ctx.body = await CouponsService.getCoupon(coupon_id);
  });

  router.get("/validate/:code", async (ctx, next) => {
    const {code} = ctx.params
    ctx.body = await CouponsService.getCouponByCode(code);
  });
  
  router.post("/create", async (ctx, next) => {
    const params = {...ctx.data}
    ctx.body = await CouponsService.createCoupon(params);
  }); 
  
  router.patch("/edit", async (ctx, next) => {
    const params = {...ctx.data}
    ctx.body = await CouponsService.editCoupon(params);
  });  
  
  router.patch("/delete", async (ctx, next) => {
    const params = {...ctx.data}
    ctx.body = await CouponsService.deleteCoupon(params);
  });
  router.post("/claim-coupon", async (ctx, next) => {
    const params = {...ctx.data}
    ctx.body = await CouponsService.claimCoupon(params);
  });   
};
