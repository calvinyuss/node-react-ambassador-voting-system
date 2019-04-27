const router = require("express").Router();
const controller = require("../controllers/voteToken");
const { requireAuth, hasRole } = require("../middlewares/auth");

router.post(
  "/",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.createVoteTokens
);
router.get("/", requireAuth, hasRole("SUPER_ADMIN"), controller.getVoteTokens);
router.get("/captcha", controller.getVoteTokenCaptchaImageByIp);
router.get("/:voteTokenId", requireAuth, controller.getVoteTokenById);
router.get(
  "/value/:voteTokenValue",
  requireAuth,
  controller.getVoteTokenByValue
);
router.put("/", controller.updateVoteTokenByValue);
router.put(
  "/:voteTokenId/replace",
  requireAuth,
  controller.replaceVoteTokenById
);
router.delete(
  "/:voteTokenId",
  requireAuth,
  hasRole("SUPER_ADMIN"),
  controller.deleteVoteTokenById
);

module.exports = router;
