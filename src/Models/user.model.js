// here we create user model schema 
import bcrypt from "bcrypt"
import mongoose , {Schema}from "mongoose";
import jwt from "jsonwebtoken"
import crypto from "crypto"

// here validation , casting ansd several more::::::
const userSchema = new Schema(
    {
        avatar:{
            type:{
                url: String,
                localPath : String,
            },
            default:{
                url:`https://placehold.co/200x200`,
                localPath:"",
            }
        },
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true,

        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,

        },
        fullName:{
            type:String,
            trim:true,
        },
        password:{
            type:String,
            required:[true,"Password is required"]
        },
        isEmailVerified:{
            type:Boolean,
            default:false,
        },
        refreshToken:{
            type:String,
        },
        forgotPasswordToken:{
            type:String,

        },
        forgotPasswordExpiry:{
            type:Date,
        },
        emailVerificationToken:{
            type:String,
        },
        emailVerificationExpiry:{
            type:Date,
        }





    }
)
//HERE WE USE FUNCTION AS WE NEED REFERENCE OF ITS PARENT AS WNAT TO ACCESS IT
userSchema.pre("save", async function(next) {
    // AS THIS PRE HOOK EVERY TIME EHEN WE SAVE PASSSWORD 
    // WE DONT NEED IN THAT WAY SO WE USED IN DIFFERENET WAY
    if(!this.isModified("password")) return next()
   this.password= await bcrypt.hash(this.password,10)
   next()
     
})



// function to check password is correct or not 
userSchema.methods.isPasswordCorrect=async function 
(password) {
    return await bcrypt.compare(password,this.password)  
}

// GENERATION OF JWT TOKEN 


userSchema.methods.generateAccessToken = function (){
   return jwt.sign(
        {
            _id : this._id,
            email:this.email,
            userName:this.username
        },
        //have to provide the secret
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn:process.env.ACCESS_TOKEN_EXPIRY},
    )
}

userSchema.methods.generateRefreshToken = function (){
   return jwt.sign(
        {
            _id : this._id,
            
        },
        //have to provide the secret
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:process.env.REFRESH_TOKEN_EXPIRY},
    )
}


// generation of token without data 
// temporary token made 
userSchema.methods.generateTemporaryToken= function(){
  const unhashedToken =  crypto.randomBytes(20).toString("hex")


  // to generate hash one 
  const hashedToken = crypto
  .createHash("sha256")
  .update(unhashedToken)
  .digest("hex")


  const tokenExpiry = Date.now() +(20*60*1000)  // 20minutes
  return {unhashedToken,hashedToken,tokenExpiry}
}




export const User = mongoose.model("User",userSchema)
