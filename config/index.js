module.exports = {
  environment: "development",
  database: {
    dbName: "monitor",
    host: "localhost",
    port: 27017,
    user: "",
    password: "",
  },
  security: {
    secretKey: "secret",
    expiresIn: 60 * 60 * 24 * 30,
  },
  sysEmail: "13276702002@163.com",
};

// 1.异常列表的删除，软删除
// 2.删除项目时，同时删除该项目的所以异常信息，物理删除
// 3.邮件通知内容，需要更加详细一些
// 4.成员可针对项目主动设置，是否接受邮件
