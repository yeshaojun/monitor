const Router = require("koa-router");
const coBody = require("co-body");
const path = require("path");
const { sendEmail } = require("../../../core/utils");
const pathExists = require("path-exists");
const fs = require("fs-extra");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/monitor",
});
// 校验规则
const {
  ReportValidate,
  ErrorListValidate,
  CheckScreenValidate,
  MapFileValidate,
} = require("../../validators/validator.js");
const { Success, ParameterException } = require("../../../core/httpException");
const Monitor = require("../../models/monitor");
const Project = require("../../models/project");
router.post("/report", async (ctx) => {
  const v = await new ReportValidate().validate(ctx);
  let body = v.get("body");
  // 兼容Navigator.sendBeacon 无阻塞发送统计数据
  // 需要使用co-body处理
  if (Object.keys(body).length === 0) {
    body = await coBody.json(ctx.req);
  }
  const { apikey, status, type, name, message } = body;
  if (!apikey || apikey.length !== 24) {
    throw new ParameterException("apikey格式不正确");
  }
  await Monitor.verifyApiKey(apikey);
  await Monitor.create(body);
  if (status === "error") {
    const user = await Project.findOne({
      _id: apikey,
    }).populate("userId", {
      email: 1,
    });
    sendEmail(user.userId.get("email"), type + name, message);
  }
  throw new Success();
});

router.get("/list", new Auth().check, async (ctx) => {
  const v = await new ErrorListValidate().validate(ctx);
  const { projectId, current, pageSize } = v.get("query");
  const lists = await Monitor.find({
    apikey: projectId,
    status: "error",
  })
    .sort({
      created_at: -1,
    })
    .skip((current - 1) * pageSize)
    .limit(pageSize);
  const total = await Monitor.count({
    apikey: projectId,
    status: "error",
  });
  ctx.body = {
    total,
    data: lists,
  };
});

router.get("/map", new Auth().check, async (ctx) => {
  const v = await new MapFileValidate().validate(ctx);
  const root = process.cwd();
  const { apikey, filename } = v.get("query");
  console.log("file", filename, apikey);
  const fileDir = path.resolve(root, `static/${apikey}`);
  if (pathExists(fileDir)) {
    const reg = new RegExp(`${filename}.*js\.map`);
    const list = fs.readdirSync(fileDir).find((item) => reg.test(item));
    console.log("list", list);
    if (list) {
      const result = fs.readFileSync(path.resolve(fileDir, list));
      ctx.body = result;
    } else {
      throw new ParameterException("未匹配到文件");
    }
  }
});

router.get("/screen", new Auth().check, async (ctx) => {
  const v = await new CheckScreenValidate().validate(ctx);
  const screen = await Monitor.findOne({
    recordScreenId: v.get("query.screenId"),
    type: "recordScreen",
  });
  ctx.body = screen;
});

module.exports = router;
