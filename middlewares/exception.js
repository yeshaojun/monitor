const { HttpException } = require("../core/httpException");

// 自定义中间件，捕获异常信息
const catchError = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    // error 分为两种，一种主动抛出的已知错误，一种程序触发的未知错误
    const isHttpException = error instanceof HttpException;
    // 如果是开发环境，且为未知错误，则直接抛出异常
    if (global.config.environment === "development" && !isHttpException) {
      throw error;
    }

    if (isHttpException) {
      ctx.body = {
        msg: error.msg,
        errorCode: error.errorCode,
        request: `${ctx.method} ${ctx.path}`,
      };
      ctx.status = error.code;
    } else {
      ctx.body = {
        msg: "哎呀，服务报错了",
        errorCode: 999,
        reuqest: `${ctx.method} ${ctx.path}`,
      };
      ctx.status = 500;
    }
  }
};

module.exports = catchError;
