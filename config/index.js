module.exports = {
  environment: "development",
  database: {
    dbName: "monitor",
    host: "127.0.0.1",
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
