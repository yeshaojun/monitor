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
