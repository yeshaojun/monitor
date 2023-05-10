// 继承系统的异常
class HttpException extends Error {
  constructor(msg = "服务器异常", errorCode = 10000, code = 400) {
    super();
    this.errorCode = errorCode;
    this.code = code;
    this.msg = msg;
  }
}
// 参数异常
class ParameterException extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.code = 400;
    this.msg = msg || "参数错误";
    this.errorCode = errorCode || 10000;
  }
}

// 成功[有很多接口，无需返回数据，只需要返回成功提示，也统一放到这里]
class Success extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.code = 200;
    this.msg = msg || "ok";
    this.errorCode = errorCode || 0;
  }
}

// 404
class NotFound extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "资源未找到";
    this.errorCode = errorCode || 10000;
    this.code = 404;
  }
}
// 403
class Forbbiden extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "禁止范文";
    this.errorCode = errorCode || 10006;
    this.code = 403;
  }
}

// 401
class AuthFailed extends HttpException {
  constructor(msg, errorCode) {
    super();
    this.msg = msg || "授权失败";
    this.errorCode = errorCode || 10004;
    this.code = 401;
  }
}

module.exports = {
  HttpException,
  ParameterException,
  NotFound,
  Forbbiden,
  AuthFailed,
  Success,
};
