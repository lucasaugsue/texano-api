import Axios from "axios";

export default class FridomService{
    
    static async generateBoleto(params){
            try{
                const {data} = await Axios.post(`${process.env.THIP_PAY_BASE_URL}/transactions/create/boleto`, params, {headers: {ThipKey: process.env.THIP_PAY_KEY}})

                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao emitir boleto")}
                catch(err2){ throw new Error(err.message || "Falha ao emitir boleto") }
            }
        }
    
    static async makeCreditTransaction(params){
            try{
                const {data} = await Axios.post(`${process.env.THIP_PAY_BASE_URL}/transactions/create/credit`, params, {headers: {ThipKey: process.env.THIP_PAY_KEY} })
                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao processar cartão")}
                catch(err2){ throw new Error(err.message || "Falha ao processar cartão") }
            }
        }

    static async createTokenCard(params){
            try{
                const {data} = await Axios.post(`${process.env.THIP_PAY_BASE_URL}/transactions/create/card`, params, {headers: {ThipKey: process.env.THIP_PAY_KEY}})

                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao verificar dados do cartão")}
                catch(err2){ throw new Error(err.message || "Falha ao verificar dados do cartão") }
            }
        }
    
    static async getRecurrence(key){
            try{
                const {data} = await Axios.get(`${process.env.THIP_PAY_BASE_URL}/transactions/recurrences/${key}`, {headers: {ThipKey: process.env.THIP_PAY_KEY}})

                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao consultar recorrência")}
                catch(err2){ throw new Error(err.message || "Falha ao consultar recorrência") }
            }
        }
    
    static async changeRecurrence(key, params){
            try{
                const {data} = await Axios.patch(`${process.env.THIP_PAY_BASE_URL}/transactions/recurrences/${key}`, params, {headers: {ThipKey: process.env.THIP_PAY_KEY}})

                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao consultar recorrência")}
                catch(err2){ throw new Error(err.message || "Falha ao consultar recorrência") }
            }
        }
    
    static async changeRecurrenceStatus(key, newStatus){
            try{
                const {data} = await Axios.patch(`${process.env.THIP_PAY_BASE_URL}/transactions/recurrences/${key}/${newStatus}`, {}, {headers: {ThipKey: process.env.THIP_PAY_KEY}})

                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao consultar recorrência")}
                catch(err2){ throw new Error(err.message || "Falha ao consultar recorrência") }
            }
        }
    
    static async voidPayment(key){
        console.log(key)
            try{
                console.log(key)
                const {data} = await Axios.patch(`${process.env.THIP_PAY_BASE_URL}/transactions/${key}/void`, {}, {headers: {ThipKey: process.env.THIP_PAY_KEY}})
                console.log(data)

                return data
            }catch(err){
                try{ throw new Error(err.response.data.error || "Falha ao consultar recorrência")}
                catch(err2){ throw new Error(err.message || "Falha ao consultar recorrência") }
            }
        }
    
    static async createPix(params){
        try{
            console.log(params)
            const {data} = await Axios.post(`${process.env.THIP_PAY_BASE_URL}/transactions/create/pix`, params, {headers: {ThipKey: process.env.THIP_PAY_KEY}})
            console.log(data)

            return data
        }catch(err){
            try{ throw new Error(err.response.data.error || "Falha ao consultar recorrência")}
            catch(err2){ throw new Error(err.message || "Falha ao consultar recorrência") }
        }
    }
}
