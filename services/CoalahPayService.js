const { default: Axios } = require("axios")

export default class CoalahPayService{
    
    static generateBoleto(CoalahPayKey, params){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.post(`${process.env.COALAH_PAY_BASE_URL}/transactions/create/boleto`, params, {headers: {ThipKey: CoalahPayKey}})

                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao emitir boleto"))}
                catch(err2){ reject(new Error(err.message || "Falha ao emitir boleto")) }
            }
        })
    }
    
    static makeCreditTransaction(CoalahPayKey, params){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.post(`${process.env.COALAH_PAY_BASE_URL}/transactions/create/credit`, params, {headers: {ThipKey: CoalahPayKey}})
                
                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao processar cartão"))}
                catch(err2){ reject(new Error(err.message || "Falha ao processar cartão")) }
            }
        })
    }

    static createTokenCard(CoalahPayKey, params){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.post(`${process.env.COALAH_PAY_BASE_URL}/transactions/create/card`, params, {headers: {ThipKey: CoalahPayKey}})
                
                resolve(data)
            }catch(err){
                console.log({err})
                console.log("MESSAGE",err.message)
                console.log("RESPONSE1:",err.response)
                console.log("RESPONSE2:",err.response.data)
                console.log("RESPONSE3:",err.response.data.error)
                try{ reject(new Error(err.response.data.error || "Falha ao verificar dados do cartão"))}
                catch(err2){ reject(new Error(err.message || "Falha ao verificar dados do cartão")) }
            }
        })
    }
    
    static getRecurrence(CoalahPayKey, key){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.get(`${process.env.COALAH_PAY_BASE_URL}/transactions/recurrences/${key}`, {headers: {ThipKey: CoalahPayKey}})

                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao consultar recorrência"))}
                catch(err2){ reject(new Error(err.message || "Falha ao consultar recorrência")) }
            }
        })
    }
    
    static getTransaction(CoalahPayKey, key){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.get(`${process.env.COALAH_PAY_BASE_URL}/transactions/consult/transaction/${key}`, {headers: {ThipKey: CoalahPayKey}})

                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao consultar recorrência"))}
                catch(err2){ reject(new Error(err.message || "Falha ao consultar recorrência")) }
            }
        })
    }
    
    static changeRecurrence(CoalahPayKey, key, params){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.patch(`${process.env.COALAH_PAY_BASE_URL}/transactions/recurrences/${key}`, params, {headers: {ThipKey: CoalahPayKey}})

                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao consultar recorrência"))}
                catch(err2){ reject(new Error(err.message || "Falha ao consultar recorrência")) }
            }
        })
    }
    
    static changeRecurrenceStatus(CoalahPayKey, key, newStatus){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.patch(`${process.env.COALAH_PAY_BASE_URL}/transactions/recurrences/${key}/${newStatus}`, {}, {headers: {ThipKey: CoalahPayKey}})

                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao consultar recorrência"))}
                catch(err2){ reject(new Error(err.message || "Falha ao consultar recorrência")) }
            }
        })
    }
    
    static voidPayment(CoalahPayKey, key){
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.patch(`${process.env.COALAH_PAY_BASE_URL}/transactions/${key}/void`, {}, {headers: {ThipKey: CoalahPayKey}})
                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao consultar recorrência"))}
                catch(err2){ reject(new Error(err.message || "Falha ao consultar recorrência")) }
            }
        })
    }

    static generatePix(CoalahPayKey,params){
        console.log({CoalahPayKey,params});
        return new Promise(async (resolve, reject) => {
            try{
                const {data} = await Axios.post(`${process.env.COALAH_PAY_BASE_URL}/transactions/create/pix`, params, {headers: {ThipKey: CoalahPayKey}})
                resolve(data)
            }catch(err){
                try{ reject(new Error(err.response.data.error || "Falha ao gerar o código PIX, por favor tente novamente!"))}
                catch(err2){ reject(new Error(err.message || "Falha ao gerar o código PIX, por favor tente novamente!")) }
            }
        })
    }

    static validatePix(data, pixKey) {
        return {data, pixKey}
    }
    
}
