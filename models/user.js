import mongoose from "mongoose"; 
import Joi from 'joi'
import { join } from "path";

//utiliser schema et model du module mongoose
const {Schema,model} = mongoose;

const userSchema=new Schema(
    {
        username:{
            type:String,
            required:true //cet attribut est obligatoire
        },
       
        email:{
            type:String,
            required:true,
            unique:true
        },
        password:{
            type:String,
            required:true
        },
        role:{
            type:String
        },
        otpCode: {
            type: String,
            required: true
        },
        // code: {
        //     type: String,
        //     default: '',
        //   },
        //   codeExpiration: {
        //     type: Date,
        //     default: null,
        //   },

        //   publickey: {
        //     type:String,
        //    // required:true //cet attribut est obligatoire
        //    default: ''
        //   }



    },

    {
        timestamps:true //ajouter auto createdAt et updatedAt
    }
);

export function userValidate(user){
    const schema = Joi.object({
        username: Joi.string().min(4).max(10).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(5).required()
       // publickey: Joi.string().min(0).max(43).required()
    });

    return schema.validate(user);
}

export function loginValidate(user){
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).required()
    });

    return schema.validate(user);
}


export default model("User",userSchema);