const mongoose = require("mongoose");
const { dbName, host, port, user, password } =
  require("../config/index").database;

const url = user
  ? `mongodb://${user}:${password}@${host}:${port}/${dbName}`
  : `mongodb://${host}:${port}/${dbName}`;

mongoose
  .connect(url)
  .then(() => {
    console.log("数据库连接成功！");
  })
  .catch((error) => {
    console.log("数据库连接失败：", error);
  });
