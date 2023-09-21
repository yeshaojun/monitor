const { LinValidator, Rule } = require("../../core/validator");

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
}

class LoginValidate extends LinValidator {
  constructor() {
    super();
    this.email = [new Rule("isEmail", "邮箱不符合规范")];
    this.password = [
      // 密码 用户制定范围
      new Rule("isLength", "密码至少6位，最多为32位", { min: 6, max: 32 }),
      new Rule(
        "matches",
        "密码不符合规范",
        "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]"
      ),
    ];
  }
}

class ErrorListValidate extends LinValidator {
  constructor() {
    super();
    this.current = [new Rule("isInt", "参数必须是整型")];
    this.pageSize = [new Rule("isInt", "参数必须是整型")];
    this.projectId = [
      new Rule("isLength", "项目id为24位", { min: 24, max: 24 }),
    ];
  }
}

class ReportValidate extends LinValidator {}

class ProjectValidate extends LinValidator {}

class CheckScreenValidate extends LinValidator {
  constructor() {
    super();
    this.screenId = new Rule("isLength", "不允许为空", { min: 1 });
  }
}

class MapFileValidate extends LinValidator {
  constructor() {
    super();
    this.fileName = new Rule("isLength", "不允许为空", { min: 1 });
    this.apikey = [new Rule("isLength", "项目id为24位", { min: 24, max: 24 })];
  }
}

class CheckProjectIDValidate extends LinValidator {
  constructor() {
    super();
    this.validateType = checkId;
  }
}

class CheckErrorIDsValidate extends LinValidator {
  constructor() {
    super();
    this.validateType = checkIds;
  }
}

function checkId(vals) {
  const id = vals.body.id || vals.path.id || vals.query.id;
  if (!id) {
    throw new Error("id是必传的");
  }
}

function checkIds(vals) {
  const ids = vals.body.ids || vals.path.ids || vals.query.ids;
  if (!ids) {
    throw new Error("id是必传的");
  }
}

module.exports = {
  RegisterValidate,
  LoginValidate,
  ReportValidate,
  ProjectValidate,
  ErrorListValidate,
  CheckScreenValidate,
  CheckProjectIDValidate,
  MapFileValidate,
  CheckErrorIDsValidate,
  LinValidator,
};
