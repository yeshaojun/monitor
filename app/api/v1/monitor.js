const Router = require("koa-router");

const { sendEmail } = require("../../../core/utils");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/monitor",
});
// 校验规则
const {
  ReportValidate,
  ErrorListValidate,
  CheckScreenValidate,
} = require("../../validators/validator.js");
const { Success } = require("../../../core/httpException");
const Monitor = require("../../models/monitor");
const Project = require("../../models/project");
// 注册 新增数据
router.post("/report", async (ctx) => {
  const v = await new ReportValidate().validate(ctx);
  await Monitor.verifyApiKey(v.get("body.apikey"));
  await Monitor.create(v.get("body"));
  if (v.get("body.status") === "error") {
    const user = await Project.findOne({
      _id: v.get("body.apikey"),
    }).populate("userId", {
      email: 1,
    });
    sendEmail(
      user.userId.get("email"),
      v.get("body.type") + v.get("body.name"),
      v.get("body.message")
    );
  }
  throw new Success();
});

router.get("/list", new Auth().check, async (ctx) => {
  const v = await new ErrorListValidate().validate(ctx);
  const { projectId, current, pageSize } = v.get("query");
  const lists = await Monitor.find({
    apikey: projectId,
  })
    .skip(current * pageSize)
    .limit(pageSize);
  const total = await Monitor.count({
    apikey: projectId,
  });
  ctx.body = {
    total,
    data: lists,
  };
});

router.get("/map", new Auth().check, async (ctx) => {
  const v = await new ReportValidate().validate(ctx);
  console.log("map", v);
});

router.get("/screen", new Auth().check, async (ctx) => {
  const v = await new CheckScreenValidate().validate(ctx);
  const screen = Monitor.findOne({
    recordScreenId: v.get("query.screenId"),
  });
  ctx.body = screen;
});

module.exports = router;
