const Router = require("koa-router");

const { generateToken } = require("../../../core/utils");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/project",
});
// 校验规则
const { ProjectValidate } = require("../../validators/validator.js");
const { Success } = require("../../../core/httpException");
const Project = require("../../models/project");

router.post("/create", new Auth().check, async (ctx) => {
  console.log("create", ctx);
  const v = await new ProjectValidate().validate(ctx);
  // 密码需要加密，放在模型中统一处理
  const project = {
    name: v.get("body.name"),
    desc: v.get("body.desc"),
    userId: ctx.auth.uid,
  };
  await Project.create(project);
  throw new Success();
});

router.get("/list", new Auth().check, async (ctx) => {
  const project = await Project.find();
  ctx.body = project;
});

module.exports = router;
