import { Router } from "express";
import{changeCurrentPassword, forgotPasswordRequest, getCurrentUser, refreshAccessToken, registerUser, resendEmailVerification, resetForgotPassword, verifyEmail} from "../Controller/auth.controller.js"
import { login } from "../Controller/auth.controller.js";
import { logoutUser } from "../Controller/auth.controller.js";

import { validate } from "../Middlewares/Validator.middleware.js";
import {userForgotPasswordValidator, userLoginValidator, userRegisterValidator,userResetForgotPasswordValidator} from "../Validators/index.js"
import { verifyJWT } from "../Middlewares/Auth.middleware.js";



const router = Router()
router.route("/register").post(userRegisterValidator(), validate, registerUser);

router.route("/login").post(userLoginValidator(),validate ,login);
router.route("/verify-email/:verificationToken").get(verifyEmail)/**ye krni ha */
router.route("/refresh-token").post(refreshAccessToken)
router.route("/Forgot-password").post(userForgotPasswordValidator(),validate,  forgotPasswordRequest)
router.route("/reset-password/:resetToken").post(userResetForgotPasswordValidator(),validate,  resetForgotPassword)/**ye krni ha */

//secure route
router.route("/logout").post(verifyJWT ,logoutUser);
router.route("/current-user").post(verifyJWT ,getCurrentUser);
router.route("/change-password").post(verifyJWT , userResetForgotPasswordValidator(),validate ,changeCurrentPassword);
router.route("/resend-email-verification").post(verifyJWT,resendEmailVerification)


export default router;