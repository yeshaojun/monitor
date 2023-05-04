const mongoose = require("mongoose");

const { ParameterException } = require("../../core/httpException");
const { STRING } = require("sequelize");
const Project = require("./project");

const MonitorScheme = new mongoose.Schema(
  {
    apikey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
    },
    deviceInfo: {
      browser: String,
      browserVersion: String,
      device: String,
      device_type: String,
      os: String,
      osVersion: String,
      ua: String,
    },
    name: String,
    pageUrl: String,
    resourceList: Array,
    rating: String,
    sdkVersion: String,
    status: String,
    time: String,
    type: String,
    userId: String,
    uuid: String,
    value: String,
    longTask: {
      attribution: Array,
      duration: String,
      entryType: String,
      name: String,
      startTime: String,
    },
    fileName: String,
    breadcrumb: Array,
    column: Number,
    line: Number,
    message: String,
    recordScreenId: String,
    events: Buffer,
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  }
);

const Monitor = new mongoose.model("monitor", MonitorScheme);

Monitor.verifyApiKey = async (apikey) => {
  const project = await Project.findOne({
    _id: apikey,
  });
  // console.log("project", project);
  if (!project) {
    throw new ParameterException("项目id不存在");
  }
};

module.exports = Monitor;
