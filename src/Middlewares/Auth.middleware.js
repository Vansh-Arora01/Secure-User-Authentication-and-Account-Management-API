import{User} from "../Models/user.model.js"
import { ApiError } from "../Utils/api-error.js"
import {asynchandler} from "../Utils/asynch-handler.js"
import jwt from "jsonwebtoken"


export const verifyJWT = asynchandler(async(req,res,next)=>{

    const token =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
    if(!token){
        throw new ApiError(401,"Unauthorize request")
    }
    try {
       const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
      const user =  await User.findById(decodedToken?._id).select( "-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

       if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }
    req.user=user
    next()
    } 
   
    
    catch (error) {
        
        throw new ApiError(401,"Invalid Access Token request")
    
        
    }


})