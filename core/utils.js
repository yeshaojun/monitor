const jwt = require("jsonwebtoken");
const config = require("../config/index");
const nodemailer = require("nodemailer");
const emialConfig = require("../.config.json");
/***
 *
 */
const findMembers = function (instance, { prefix, specifiedType, filter }) {
  // 递归函数
  function _find(instance) {
    //基线条件（跳出递归）
    if (instance.__proto__ === null) return [];

    let names = Reflect.ownKeys(instance);
    names = names.filter((name) => {
      // 过滤掉不满足条件的属性或方法名
      return _shouldKeep(name);
    });

    return [...names, ..._find(instance.__proto__)];
  }

  function _shouldKeep(value) {
    if (filter) {
      if (filter(value)) {
        return true;
      }
    }
    if (prefix) if (value.startsWith(prefix)) return true;
    if (specifiedType)
      if (instance[value] instanceof specifiedType) return true;
  }

  return _find(instance);
};

const generateToken = function (uid, scope) {
  const secretKey = config.security.secretKey;
  const expiresIn = config.security.expiresIn;
  const token = jwt.sign(
    {
      uid,
      scope,
    },
    secretKey,
    {
      expiresIn,
    }
  );
  return token;
};

const sendEmail = async function (address, type, content) {
  console.log("emialConfig", emialConfig, address, type, content);
  try {
    // 创建邮件发送对象
    let transporter = nodemailer.createTransport({
      host: "smtp.163.com", // 发件人的邮箱的 SMTP 服务器地址
      port: 465, // SMTP 端口号
      secure: true, // 使用 SSL
      auth: {
        user: emialConfig.sysEmail, // 发件人的邮箱地址
        pass: emialConfig.password, // 发件人的邮箱密码或授权码
      },
    });

    // 邮件内容
    let mailOptions = {
      from: emialConfig.sysEmail, // 发件人地址
      to: address, // 收件人地址
      subject: type, // 邮件主题
      text: content, // 邮件正文
    };

    // 发送邮件
    let info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  findMembers,
  generateToken,
  sendEmail,
};
