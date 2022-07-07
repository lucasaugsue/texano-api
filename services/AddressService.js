import md5 from 'md5'
import { raw } from 'objection'
import { Users as UsersModel } from "../lib/models/Users"
import { Customer as CustomerModel } from "../lib/models/Customer"

class AddressService{

    static async validateData(data){
        try{
            return 
        }catch(err){
            throw Error(err)
        }
    }
}

export default AuthService