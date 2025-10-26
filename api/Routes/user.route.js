import express from "express";
import { test, sendMail, upload } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/test", test);
router.post("/send-mail", upload.array('attachments', 5), sendMail);

export default router;