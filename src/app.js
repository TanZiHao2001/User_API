const Koa = require('koa');
const { koaBody } = require('koa-body');
require('dotenv').config();
const db = require('./models/db');
const userRouter = require('./api/user/routes/user');

const app = new Koa();

//connect to mysql database
app.use(async (ctx, next) => {
    ctx.db = await db.getConnection();
    await next();
    ctx.db.release();
  });

app.use(koaBody()).use(userRouter.routes()).use(userRouter.allowedMethods());

app.listen(3000, () => console.log('Server started...'));