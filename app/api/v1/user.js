const Router = require("koa-router");

const { generateToken } = require("../../../core/utils");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/user",
});
// 校验规则
const {
  RegisterValidate,
  LoginValidate,
} = require("../../validators/validator.js");
const { Success, ParameterException } = require("../../../core/httpException");
const User = require("../../models/user.js");
// 注册 新增数据
router.post("/register", async (ctx) => {
  const v = await new RegisterValidate().validate(ctx);
  const user = await User.findOne({
    email: v.get("body.email"),
  });
  const nickname = await User.findOne({
    nickname: v.get("body.nickname"),
  });

  if (nickname) {
    throw new ParameterException("nickname名字已注册！");
  }

  if (!user) {
    // 密码需要加密，放在模型中统一处理
    const user = {
      nickname: v.get("body.nickname"),
      email: v.get("body.email"),
      password: v.get("body.password1"),
    };
    await User.create(user);
    throw new Success();
  } else {
    throw new ParameterException("该邮箱已注册！");
  }
});

router.post("/login", async (ctx) => {
  const v = await new LoginValidate().validate(ctx);
  console.log("user", v.get("body"));
  const user = await User.verifyEmailPassword(
    v.get("body.email"),
    v.get("body.password")
  );
  ctx.body = {
    token: generateToken(user._id, user.level),
  };
});

router.get("/info", new Auth().check, async (ctx) => {
  const user = await User.findOne(
    {
      _id: ctx.auth.uid,
    },
    ["_id", "email", "nickname"]
  );
  ctx.body = user;
});

router.get("/list", new Auth().check, async (ctx) => {
  const user = await User.find(
    {
      _id: {
        $ne: ctx.auth.uid,
      },
    },
    ["_id", "email", "nickname"]
  );
  ctx.body = user;
});

module.exports = router;
