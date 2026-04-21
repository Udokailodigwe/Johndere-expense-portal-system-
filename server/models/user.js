import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please provide a valid email",
    ],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: [8, "Password must be at least 8 characters long"],
    required: true,
    select: false, // 🔥 prevent returning password by default
  },
  role: { type: String, enum: ["employee", "manager"], default: "employee" },
  approvals: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Approval",
    },
  ],
  active: { type: Boolean, default: false },
});

// 🔥 Explicit index (don’t rely on unique only)
UserSchema.index({ email: 1 }, { unique: true });

// 🔥 FIXED password hashing (no double hashing bug)
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const saltRounds = process.env.NODE_ENV === "production" ? 10 : 8;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    { userId: this._id, role: this.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    },
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", UserSchema);
export default User;
