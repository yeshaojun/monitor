const Koa = require("koa");
const parser = require("koa-bodyparser");
const koaStatic = require("koa-static");
const path = require("path");
const cors = require("koa2-cors");
const InitManager = require("./core/init");
const catchError = require("./middlewares/exception.js");

const app = new Koa();

app.use(
  cors({
    origin: "*",
  })
);

// 全局异常处理
app.use(catchError);
// 获取body数据
app.use(parser());
// 设置静态目录
app.use(koaStatic(path.join(__dirname, "./static")));
// 初始化路由
InitManager.initCore(app);

app.listen(9500);
