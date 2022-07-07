import { Shipping as ShippingModel } from "../lib/models/Shipping"
import Correios from 'node-correios'


const getWeightFromString = (string) =>{
    const removedLetters = string.replace(/[a-z,A-Z,&,ç,~,',']/g,'')
    const numberCommas = removedLetters.split(',').length - 1
    const numberDots = removedLetters.split('.').length - 1
    var final = removedLetters
    if(numberCommas >1){
        final = final.replace(',','')
    }
    if(numberDots > 1){
        final = final.replace('.','')
    }
    return parseFloat(final)
}


const calculateShipping = async ({cep, product_id, products}) => {
    try{
        const correios = new Correios()
        var res
        var params;
        if(!cep || cep === '') throw new Error("Precisa do CEP de origem")
        if(!product_id && !products) throw new Error("Precisa do produto")
    
        if(products && products.length>0){
            console.log(products)
            const allShippingInfo = await Promise.all(products.map(async i=>{
                return await ShippingModel.query().findOne('product_id',i)
            }))
            console.log({allShippingInfo})
    
            if(allShippingInfo !== undefined) {
                params = allShippingInfo.reduce((o,n,index)=>(
                    (!o || !n) ? {}
                    : {
                    // nCdServico:(index===0)?n.nCdServico:o.nCdServico, //PARA APENAS UM TIPO DE FRETE
                    nCdServico:'04014,04510,40169,40215,40290', // PARA DIVERSOS TIPOS DE FRETE
                    sCepOrigem:(index===0)?n.sCepOrigem:o.sCepOrigem,
                    sCepDestino:(index===0)?cep:o.sCepDestino,
                    nVlPeso:o.nVlPeso + getWeightFromString(n.nVlPeso),
                    nCdFormato:o.nCdFormato + n.nCdFormato,
                    nVlComprimento:o.nVlComprimento + n.nVlComprimento,
                    nVlAltura:o.nVlAltura + n.nVlAltura,
                    nVlLargura:o.nVlLargura + n.nVlLargura,
                    nVlDiametro:o.nVlDiametro + n.nVlDiametro,
                    nCdEmpresa:"08082650",
                    sDsSenha:"564321"
                }),{
                    nCdServico:'',
                    sCepOrigem:'',
                    sCepDestino:'',
                    nVlPeso:0,
                    nCdFormato:0,
                    nVlComprimento:0,
                    nVlAltura:0,
                    nVlLargura:0,
                    nVlDiametro:0,
                    nCdEmpresa:0,
                    sDsSenha:0})
                    console.log({params})
                res = await correios.calcPrecoPrazo(params)
                console.log({res})
            }
            
            return res
            
        }else{
            const product_shipping = await ShippingModel.query().findOne('product_id',product_id)
            if(!product_shipping) throw new Error("Precisa do produto")
            params = {
                nCdServico:product_shipping.nCdServico,
                sCepOrigem:product_shipping.sCepOrigem,
                sCepDestino:cep,
                nVlPeso:getWeightFromString(product_shipping.nVlPeso),
                nCdFormato:product_shipping.nCdFormato,
                nVlComprimento:product_shipping.nVlComprimento,
                nVlAltura:product_shipping.nVlAltura,
                nVlLargura:product_shipping.nVlLargura,
                nVlDiametro:product_shipping.nVlDiametro}
            
            res = await correios.calcPrecoPrazo(params)
            return res
        }
    }catch(err){
        console.log({err})
        throw new Error(err)
    }
}

export default {getWeightFromString, calculateShipping}