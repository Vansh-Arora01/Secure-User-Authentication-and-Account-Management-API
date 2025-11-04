import{ApiResponse} from "../Utils/apiresponse.js"
import { asynchandler } from "../Utils/asynch-handler.js";

// const healthcheck=(req,res)=>{
//     try {
//         res
//         .status(200)
//         .json(new ApiResponse(200,{message:"Server is running"

//         }));
        
//     } catch (error) {
        
//     }

// }
const healthcheck = asynchandler(async (req,res)=>{
    res.status(200).json(new ApiResponse(200,{message:"Server is running fast"}))
    
})

export {healthcheck};