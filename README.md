# koa-service-template

大部分前端对于 node 的应用都在工程化上，对于如何搭建一个 node 服务提供接口可能并不熟悉。再加上 koa 灵活性很高，需要搭配很多中间件一起使用，对于新手可能不是特别友好。

因此搭建一个 koa 服务模板，供有需要的人使用

### 使用方式

1. 克隆项目到本地，执行 npm install 安装依赖
2. 在 config 中配置数据库信息
3. npm run serve 启动服务

项目中无任何业务逻辑，但是提供了三个用户相关的接口

注册用户 POST: 'localhost:9000/v1/user/register'

用户登录返回 token POST: localhost:9000/v1/user/login

在 header 中携带 toekn 获取用户信息 GET: localhost:9000/v1/user/info

### 项目介绍

本项目适合，node 新手或者想快速搭建一套 node 服务。本项目包含以下 5 个优点

#### 1.路由自动加载

路由通过 koa-router 实现，项目使用 requireDirectory 插件，自动加载 app/api 下的文件，并自动注册

#### 2.全局异常处理

根据 koa 的洋葱模型，自定义异常处理中间件。

项目的异常分为已知异常（主动抛出）未知异常（程序抛出）两类, 通过对 Error 类的二次处理，进行全局的异常抛出

#### 3.参数校验

可自定义校验规则进行校验，核心是对 validator 的二次封装

具体使用方式可参考以下代码,也可以自定义校验函数

```
class RegisterValidate extends LinValidator {
  constructor() {
    super();
    this.email = [new Rule("isEmail", "邮箱不符合规范")];
    this.password1 = [
      // 密码 用户制定范围
      new Rule("isLength", "密码至少6位，最多为32位", { min: 6, max: 32 }),
      new Rule(
        "matches",
        "密码不符合规范",
        "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]"
      ),
    ];
    this.password2 = this.password1;
    this.nickname = [
      new Rule("isLength", "昵称长度不符合", { min: 2, max: 12 }),
    ];
  }

  validatePassword(vals) {
    const psw1 = vals.body.password1
    const psw2 = vals.body.password2
    if(psw1 !== psw2) {
      throw new Error('两个密码必须相同')
    }
  }

}
```

同时，校验器对取参方式也做了处理，可以更加方便的进行取值

```
  const v = await new RegisterValidate().validate(ctx);

  const user = {
    nickname: v.get("body.nickname"),
    email: v.get("body.email"),
    password: v.get("body.password1"),
  };
  ctx.body = "register success";
```

validate 执行时，会遍历 RegisterValidate 上的 validate 开头的函数，以及数组属性进行校验，并且会沿着原型链去找对应的校验规则和方法，也就是说 validate 类之间可以相互继承

#### 4.通用的用户权限

使用自定义中间件对用户权限以及 token 校验，只需要在需要校验的路由上，使用 Auth 中间件即可

```
router.get('/info',new Auth().check,  async (ctx) => {
  const user = await  User.findOne({
    attributes: {
      exclude: ['password']
    },
    where: {
      id: ctx.auth.uid
    }
  })
  ctx.body =  user
})
```

如果需要对接口进行权限校验，可在 new Auth()中传入权限等级，中间件会判断，用户信息中的 level 是否大于传入的等级

```
    if(decode.scope < this.level) {
      errMsg = '权限不足'
      throw new Forbbiden(errMsg)
    }
```

#### 5.支持 mysql 数据库，以及 mongodb

项目支持 mysql 以及 mongodb 连接，可按需下载

main 分支对应 mysql

mongodb 分支对应 mongodb

<!-- 上报地址 -->

/report 上报接口做 apikey 限制，apiKey 走申请审核机制
/其余接口 需要 token,登录查看
/有异常，自动发送邮件
