const jwt = require('jsonwebtoken')
const config = require("../config/index")
const { Forbbiden } = require("../core/httpException")
class Auth {
  constructor(level) {
    this.level = level || 1
  }
  get check() {
    return async (ctx, next)=> {
      // token 检测
      const userToken = ctx.req.headers?.token || ""
      console.log('userToken', userToken)
      let errMsg = 'token不合法'
      if(!userToken) {
        throw new Forbbiden(errMsg)
      }
      try {
        var decode = jwt.verify(userToken, config.security.secretKey)
      } catch (error) {
        // token 不合法
        // token 过期
        if(error.name == 'TokenExpiredError'){
          errMsg = 'token令牌已过期'
        }
        throw new Forbbiden(errMsg)
      }

      if(decode.scope < this.level) {
        errMsg = '权限不足'
        throw new Forbbiden(errMsg)
      }

      ctx.auth = {
        uid: decode.uid,
        scope: decode.scope
      }

      await next()
    }
  }
  static verifyToken(token) {
    try {
      jwt.verify(token, config.security.secretKey)
      return true
    } catch (error) {
      return false
    }
    
  }
}

module.exports = {
  Auth
}