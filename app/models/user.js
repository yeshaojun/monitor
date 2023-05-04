const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const { ParameterException, AuthFailed } = require("../../core/httpException");

const UserScheme = new mongoose.Schema(
  {
    nickname: String,
    email: String,
    password: {
      type: String,
      set: (val) => {
        const salt = bcrypt.genSaltSync(10);
        // 10表示花费的成本
        return bcrypt.hashSync(val, salt);
      },
    },
    level: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    },
  }
);

const User = new mongoose.model("user", UserScheme);

User.verifyEmailPassword = async (email, plainPassword) => {
  const user = await User.findOne({
    email,
  });
  if (!user) {
    throw new ParameterException("用户不存在");
  }
  const correct = await bcrypt.compareSync(plainPassword, user.password);
  if (!correct) {
    throw new AuthFailed("密码不正确");
  }
  return user;
};

module.exports = User;
