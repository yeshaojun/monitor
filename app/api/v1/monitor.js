const Router = require("koa-router");
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
const { Success } = require("../../../core/httpException");
const Monitor = require("../../models/monitor");
const Project = require("../../models/project");
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
      ctx.body = {
        code: 0,
        data: "",
        msg: "未匹配到文件",
      };
    }
    // console.log("yes map", list, filename);
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
