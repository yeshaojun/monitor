const mongoose = require("mongoose");

const { ParameterException, AuthFailed } = require("../../core/httpException");
const { STRING } = require("sequelize");

const ProjectScheme = new mongoose.Schema(
  {
    name: String,
    desc: String,
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    member: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
    ],
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  }
);

const Project = new mongoose.model("project", ProjectScheme);

module.exports = Project;
