import { Router } from "express";
import { healthcheck } from "../Controller/healthcheck.controllers.js";

const router = Router()
router.route("/").get(healthcheck)
// router.route("/instagram").get(healthcheck)

export default router;