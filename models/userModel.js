import mongoose from "mongoose";
import bcrypt from "bcrypt";
import crypto from "crypto";
// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    cart: {
      type: Array,
      default: [],
    },
    address: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
      },
    ],
    wishList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Products",
      },
    ],
    refreshToken: {
      type: String,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetExpiresIn: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// userSchema.pre("save", async function (next) {
//   if(!this.isModified("password")){
//     next()
//   }
//   const salt = await bcrypt.genSaltSync(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next()
// });

// userSchema.methods.confirmPassword = async function (enteredPassword) {
//   return  bcrypt.compare(enteredPassword, this.password);
// };

userSchema.pre("save", async function (next) {
  // only run if password is added or modified
  if (!this.isModified("password")) return next();

  // hash the password
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.confirmPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.createPasswordResetToken = async function () {
  //use the crypto module from node to encrypt the resetToken
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
    console.log({resetToken}, this.passwordResetToken)
  this.passwordResetExpiresIn = Date.now() + 10 * 60 * 1000
  return resetToken
};
//Export the model
const User = mongoose.model("User", userSchema);

export default User;
