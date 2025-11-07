
import { json } from "express";
import { User } from "../Models/user.model.js";
import { ApiError } from "../Utils/api-error.js";
import { ApiResponse } from "../Utils/apiresponse.js";
import { asynchandler } from "../Utils/asynch-handler.js";
import { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail } from "../Utils/mail.js";
import jwt from "jsonwebtoken";
import crypto from "crypto"

// function to generate access token , refresh token 
const generateAccessTokenandRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access Token ")
    }


}

const registerUser = asynchandler(async (req, res) => {
    // we are expecting data from Body sos did this 
    const { username, email, password, role } = req.body



    // check db for existence using moongoose functionalities
    // as a db call make it await '//
    // db is in another continent
    const existingUser = await User.findOne({
        $or: [{ username }, { email }],
    })

    //what isf user existed return an console.error();

    if (existingUser) {
        throw new ApiError(409, "User with this email, username Already Existes", [])
    }

    const user = await User.create({
        email,
        password,
        username,
        isEmailVerified: false,

    })
    // now we have user , which has a user schema 

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
   console.log(user)
    await user.save({ validateBeforeSave: false });
    console.log("Saved user token in DB (hashed):", user.emailVerificationToken);
    console.log(user)


    await sendEmail({
        email: user?.email,
        subject: "Please verify your Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            // GENERATION OF DYNAMIC LINKS
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),

    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    if (!createdUser) {
        throw new ApiError(500, "SOmething went wrong while register a user")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(
                200,
                { user: createdUser },
                "User registered SuccessFully and verification Email is sent on Your Email"
            ),
        )

});

const login = asynchandler(async (req, res) => {
    const { username, email, password } = req.body
    if (!email) {
        throw new ApiError(400, " Email is required");
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(400, " User Doesn't Exists");
    }
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(400, "Credential are incorect");
    }


    const { accessToken, refreshToken } = await generateAccessTokenandRefreshToken(user._id)
    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    const options = {
        httpOnly: true,
        secure: true,

    }
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "User Logged in succefully"
            )
        )


})

const logoutUser = asynchandler(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            // TO UPDATE AN VALUE WE USE SET
            $set: {
                refreshToken: ""
            }
        },
        { new: true },
    );
    const options = {
        httpOnly: true,
        secure: true,

    }
    return res.status(200).clearCookie("accessToken", options).clearCookie("refreshToken", options).json(new ApiResponse(200, {}, "UserLogged OUT"))
})

const getCurrentUser = asynchandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                req.user,
                "Current User Fetched Successfully"
            )
        )

})
// const verifyEmail = asynchandler(async (req, res) => {
//     const { verificationToken } = req.params

//     if (!verificationToken) {
//         return new ApiError(400, "Email verification Token Is Missing!!")
//     }


//     // here we know that we are saving a hashed token in database and unhashed  token 
//     // to use while crreating the user , So as we know that if we hashed the token same it will return the same hashed token that is 
//     // store in db then we check it and get result 


//     let hashedToken = crypto
//         .createHash("sha256")
//         .update(verificationToken)
//         .digest("hex")

//     const user = await User.findOne({
//         emailVerificationToken: hashedToken,
//         //  here one more think to take care about 
//         //the expiry of the token so check that also 


//         // WHENEVER HAVE TO WRITE A CONDITION WRITE IN {} BRACES

//         emailVerificationExpiry: { $gt: Date.now() }
//     })

//     if (!user) {
//         return new ApiError(400, "Email verification Token Is Incorrect or Expired !!")
//     }



//     user.emailVerificationExpiry = undefined;
//     user.emailVerificationToken = undefined;
//     /** NOW AS THE USER MODULE OR SCHEMA HAVE THE DATA SAME , SO IT IS A BETTER PRACTICE TO REMOVE THE
//      * UNNECESSARY DATA FROM THAT MODULE AS EMAILVERIFICQATION TOKEN  AND EMAILVERIFICATIONTOKENEXPIRY
//      */
//     user.isEmailVerified = true
//     await user.save({ validateBeforeSave: false })


//     return res
//         .status(200)
//         .json(
//             new ApiResponse(
//                 200,
//                 {
//                     isEmailVerified: true,
//                 },
//                 "Email verifiaction Is Successfull"
//             )
//         )


// })
const verifyEmail = asynchandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json(
      new ApiError(400, "Email verification Token is missing!!")
    );
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  console.log("🔍 Hashed Token:", hashedToken);

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(
      new ApiError(400, "Email verification Token is incorrect or expired!!")
    );
  }

  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });

  console.log("✅ Email verified for:", user.email);

  return res.status(200).json(
    new ApiResponse(
      200,
      { isEmailVerified: true },
      "Email verification is successful!"
    )
  );
});

const resendEmailVerification = asynchandler(async (req, res) => {
    const user = await User.findById(req.user?._id)
    if (!user) {
        throw new ApiError(404, "User doesnot found Error")
    }
    if (user.isEmailVerified) {
        throw new ApiError(409, "User is already verified")
    }

    const { unhashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken()

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({ validateBeforeSave: false });


    await sendEmail({
        email: user?.email,
        subject: "Please verify your Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            // GENERATION OF DYNAMIC LINKS
            `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`
        ),

    })

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Mail is sent to your email id"
            )
        )

})
const refreshAccessToken = asynchandler(async(req,res)=>{
 const incomingRefreshToken =   req.cookies.refreshToken || req.body.refreshToken

 if(!incomingRefreshToken){
    throw new ApiError(401,"Unauthorised Access")
 }


 try {
  const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)


  const user = await User.findById(decodedToken?._id)
  if(!user){
    throw new ApiError(401,"Invalid refresh token")
  }

  
  if(incomingRefreshToken!==user?.refreshToken){
    throw new ApiError(401,"Refresh token is Expired")
  }


  const options={
    httpOnly:true,
    secure:true, 
  }

    const {accessToken,refreshToken:newRefreshToken}=await generateAccessTokenandRefreshToken(user._id)
    user.refreshToken=newRefreshToken
    await user.save({validateBeforeSave:true})

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
        new ApiResponse(
            200,
            {accessToken,refreshToken:newRefreshToken},
            "Access Refresh Token"
        )
    )
    

 } catch (error) {
     throw new ApiError(401,"Invalid refresh token")
    
 }
})
const forgotPasswordRequest = asynchandler(async(req,res)=>{
  const {email}=  req.body

 const user= await User.findOne({email})

 if(!user){
    throw new ApiError(404,"User doen't exists")
 }

  const {unhashedToken,hashedToken,tokenExpiry}=user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken
    user.forgotPasswordExpiry = tokenExpiry

    await user.save({validateBeforeSave:false})

   await sendEmail({
        email: user?.email,
        subject: "Password reset Request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            // GENERATION OF DYNAMIC LINKS
            `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`,
        ),

    })
    return res 
    .status(200)
    .json(
        new ApiResponse(
            200,{},"Password Reset link email is sent "
        )
    )

    
  

})


const resetForgotPassword = asynchandler(async(req,res)=>{
     const {resetToken} = req.params
     const {newPassword}=req.body

     let hashedToken = crypto
     .createHash("sha256")
     .update(resetToken)
     .digest("hex")


   const user=  await User.findOne({
        forgotPasswordToken : hashedToken,
        forgotPasswordExpiry : {$gt:Date.now()}
     })
     if(!user){
        throw new ApiError (409,"Token is invalid or Expired")
     }
     user.forgotPasswordToken=undefined
     user.forgotPasswordExpiry=undefined

     user.password=newPassword
     await user.save({validateBeforeSave:false})

     return res 
     .status(200)
     .json(
        new ApiResponse (
            200,
            {},
            "Password Reset Successfully"
        )
     )
      

})
const changeCurrentPassword = asynchandler(async(req,res)=>{

     const {oldPassword,newPassword} = req.body
     const user = await User.findById(req.user?._id);

     const isPasswordValid = user.isPasswordCorrect(oldPassword)

     if(!isPasswordValid){
        throw new ApiError(400,"Invalid Old Password")
     }

     user.password = newPassword
     await user.save({validateBeforeSave:false})

     return res
     .status(200)
     .json(
        new ApiResponse (
            200,
            {},
            "Password changed Successfully"
        )
     )

})



export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification,
    refreshAccessToken,
    forgotPasswordRequest,
    resetForgotPassword,
    changeCurrentPassword,

};