import {body} from "express-validator"



const userRegisterValidator =()=>{
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email Should not be empty")
            .isEmail()
            .withMessage("Email should be in corect  format"),
        body("username")
            .trim()
            .notEmpty()
            .withMessage("Name sholdnot be empty")
            .isLowercase()
            .withMessage("Username must be in lower case")
            .isLength({min:3})
            .withMessage("Username must be 3 length characters"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("password is required"),
        body("full Name")
          .optional()
          .trim()



    ]
}


const userLoginValidator=()=>{
    return[
        body("email")
            .optional()
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
         .notEmpty()
         .withMessage("Password is required"),

        
    ]

}
const userCurrentPasswordChangeValidator =()=>{
    return[
        body("oldPassword")
        .notEmpty()
        .withMessage("Old password is required")
        .body("newPassword")
         .notEmpty()
        .withMessage("New password is required")

    ]
}

 const userForgotPasswordValidator = ()=>{
    return [
    body("email")
    .notEmpty()
    .withMessage("Email is Required")
    .isEmail()
    .withMessage("Email is Invalid")
    ]

 }
 const userResetForgotPasswordValidator =()=>{
    return[
        body("newPassword")
        .notEmpty()
        .withMessage("New Password is Required")
    ]
 }



export {userRegisterValidator,userLoginValidator ,userCurrentPasswordChangeValidator, userForgotPasswordValidator,userResetForgotPasswordValidator} 