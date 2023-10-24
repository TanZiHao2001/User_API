const Router = require('koa-router');
const router = new Router();
const { login, logout, checkTokenIsValid } = require('../controllers/user');

router.post("/login", login);
// router.post("/register", register);
router.delete("/logout", logout);
router.get("/check-token-is-valid", checkTokenIsValid);

module.exports = router;