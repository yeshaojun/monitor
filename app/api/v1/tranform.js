const Router = require("koa-router");
const { CheckErrorTranslateValidate } = require("../../validators/validator");
var SHA256 = require("crypto-js/sha256");
const axios = require("axios");
const config = require("../../../.config.json");
const router = new Router({
  prefix: "/v1/translate",
});

router.get("/text", async (ctx) => {
  const v = await new CheckErrorTranslateValidate().validate(ctx);
  const { text } = v.get("query");
  let input = text;
  const salt = new Date().getTime();
  const curtime = Math.round(new Date().getTime() / 1000);
  if (text.length > 200) {
    return;
  }
  if (text.length > 20) {
    input = text.substring(0, 10) + text.length + text.slice(-10);
  }
  const pattern = new RegExp("[\u4E00-\u9FA5]+");

  const sign = SHA256(config.appId + input + salt + curtime + config.key);
  const result = await axios({
    url: "https://openapi.youdao.com/api",
    method: "post",
    data: {
      q: text,
      appKey: config.appId,
      salt: salt,
      from: pattern.test(text) ? "zh-CHS" : "en",
      to: pattern.test(text) ? "en" : "zh-CHS",
      sign: sign,
      signType: "v3",
      curtime: curtime,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });
  ctx.body = {
    ...result.data,
  };
});

module.exports = router;
