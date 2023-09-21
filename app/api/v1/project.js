const Router = require("koa-router");

const { generateToken } = require("../../../core/utils");
const { Auth } = require("../../../middlewares/auth");
const router = new Router({
  prefix: "/v1/project",
});
// 校验规则
const {
  ProjectValidate,
  CheckProjectIDValidate,
} = require("../../validators/validator.js");
const { Success } = require("../../../core/httpException");
const Project = require("../../models/project");
const Monitor = require("../../models/monitor");

router.post("/create", new Auth().check, async (ctx) => {
  // console.log("create", ctx);
  const v = await new ProjectValidate().validate(ctx);
  const project = {
    name: v.get("body.name"),
    desc: v.get("body.desc"),
    userId: ctx.auth.uid,
    member: [ctx.auth.uid],
  };
  await Project.create(project);
  throw new Success();
});

router.get("/list", new Auth().check, async (ctx) => {
  const project = await Project.find({
    member: ctx.auth.uid,
  }).populate("member", {
    nickname: 1,
  });
  const checkProject = project.map((_) => {
    return {
      ..._.toObject(),
      isCreated: _.toObject().userId.toString() === ctx.auth.uid,
    };
  });

  ctx.body = checkProject;
});

router.delete("/:id", new Auth().check, async (ctx) => {
  const v = await new CheckProjectIDValidate().validate(ctx);
  await Project.deleteOne({
    _id: v.get("path.id"),
  });
  await Monitor.deleteMany({
    apikey: v.get("path.id"),
  });
  throw new Success();
});

router.put("/member", new Auth().check, async (ctx) => {
  const v = await new CheckProjectIDValidate().validate(ctx);
  const member = v.get("body.users");
  member.push(ctx.auth.uid);
  await Project.findOneAndUpdate(
    {
      _id: v.get("body.id"),
    },
    {
      $set: {
        member: member,
      },
    }
  );
  throw new Success();
});

router.put("/exit", new Auth().check, async (ctx) => {
  const v = await new CheckProjectIDValidate().validate(ctx);
  console.log("member", ctx.auth.uid);
  await Project.update(
    {
      _id: v.get("query.id"),
    },
    { $pull: { member: ctx.auth.uid } }
  );
  throw new Success();
});

module.exports = router;
