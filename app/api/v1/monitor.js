const Router = require("koa-router");
const coBody = require("co-body");
const path = require("path");
const { sendEmail } = require("../../../core/utils");
const pathExists = require("path-exists");
const fs = require("fs-extra");
const { Auth } = require("../../../middlewares/auth");
const dayjs = require("dayjs");
const router = new Router({
  prefix: "/v1/monitor",
});
// 校验规则
const {
  ReportValidate,
  ErrorListValidate,
  CheckScreenValidate,
  MapFileValidate,
  CheckErrorIDsValidate,
} = require("../../validators/validator.js");
const { Success, ParameterException } = require("../../../core/httpException");
const Monitor = require("../../models/monitor");
const Project = require("../../models/project");
const { NOTICEAUTH } = require("../../../config/dict");
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
    const p = await Project.findOne({
      _id: apikey,
    }).populate("member", {
      email: 1,
      noticeAuth: 1,
    });
    p.member.forEach((user) => {
      // 获取用户通知配置
      const auth = user.noticeAuth;
      let list = [];
      auth.forEach((_) => {
        list.push(...NOTICEAUTH[_]);
      });
      console.log("auth", list);
      if (list.indexOf(type) !== -1) {
        sendEmail(
          user.email,
          type + name,
          `
          时间： ${dayjs(body.time).format("YYYY-MM-DD HH:mm:ss")}
          报错类型： ${type}
          报错用户： ${body.userId}
          报错项目： ${name}
          报错内容： ${message}
        `
        );
      }
    });
  }
  throw new Success();
});

router.get("/list", new Auth().check, async (ctx) => {
  const v = await new ErrorListValidate().validate(ctx);
  const { projectId, current, pageSize, name, date } = v.get("query");
  console.log("projectId", projectId);
  let endTime = dayjs().endOf("day");
  let startTime = dayjs().subtract(1, "month").startOf("day");
  if (date) {
    endTime = dayjs(date.split(",")[1]).endOf("day");
    startTime = dayjs(date.split(",")[0]).startOf("day");
  }
  const lists = await Monitor.find({
    apikey: projectId,
    status: "error",
    userId: {
      $regex: name,
      $options: "i",
    },
    created_at: { $gte: startTime, $lte: endTime },
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
    const reg = new RegExp(`${filename}\.map`);
    const list = fs.readdirSync(fileDir).find((item) => reg.test(item));
    // console.log("list", list);
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
  if (screen) {
    ctx.body = screen;
  } else {
    throw new ParameterException("未匹配到录屏文件");
  }
});

router.delete("/delete", new Auth().check, async (ctx) => {
  const v = await new CheckErrorIDsValidate().validate(ctx);
  try {
    await Monitor.deleteMany({
      _id: { $in: v.get("query.ids").split(",") },
    });
    throw new Success();
  } catch (error) {
    ctx.body = "删除异常" + error.message;
  }
});

module.exports = router;
