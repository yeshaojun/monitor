// 文件自动导入插件
const requireDirectory = require("require-directory");
const Router = require("koa-router");

// 连接数据库
require("./db.js");
// 使用静态方法，不需要实例化
class InitManager {
  static initCore(app) {
    InitManager.app = app;
    InitManager.initRouters();
    InitManager.loadConfig();
  }
  // 动态加载路由
  static initRouters() {
    const apiDirectory = `${process.cwd()}/app/api`;
    requireDirectory(module, apiDirectory, {
      visit: (obj) => {
        if (obj instanceof Router) {
          InitManager.app.use(obj.routes());
        } else {
          // 兼容多模块导出
          if (obj instanceof Object && obj.router) {
            for (let r in obj) {
              if (r instanceof Router) {
                InitManager.app.use(obj[r].routes());
              }
            }
          }
        }
      },
    });
  }
  // 加载全局变量
  static loadConfig(path = "") {
    const configPath = path || process.cwd() + "/config/index.js";
    const config = require(configPath);
    global.config = config;
  }
}

module.exports = InitManager;
