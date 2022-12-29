import { genToken } from "../configs/jwtToken.js";
import { genRefreshToken } from "../configs/RefreshToken.js";
import User from "../models/userModel.js";
import { validateMongodbId } from "../utils/validateMongoDbId.js";
import jwt from 'jsonwebtoken'
// create new user
export const CreateUser = async (req, res) => {
  try {
    const { Fname, Lname, email, mobile, password } = req.body;

    //    check if account already exists
    const oldUser = await User.findOne({
      $or: [{ email: email }, { mobile: mobile }],
    });
    // if user does not exist create newUser
    if (!oldUser) {
      const newUser = await User.create({
        email,
        name: `${Fname} ${Lname}`,
        mobile,
        password,
      });
      res.status(201).json({
        status: "success",
        name: newUser.name,
        id: newUser._id,
        token: genToken({ name: newUser.name, id: newUser._id }),
      });
    } else {
      // if already user exists
      res.status(403).json({
        status: "failed",
        message: "Account with this phone number or email already exists",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error occurred",
    });
    console.log(error.message);
  }
};

// user Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // check if user exists
    const user = await User.findOne({ email });
    // check if email and password are valid
    if (user && (await user.confirmPassword(password, user.password))) {
      const refreshToken = await genRefreshToken(user._id);
      const updateUser = await User.findByIdAndUpdate(
        user._id,
        {
          refreshToken: refreshToken,
        },
        {
          new: true,
        }
      );
      res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        maxAge: 72 * 60 * 60 * 1000
      })
      res.status(200).json({
        status: "success",
        name: user.name,
        id:user._id,
        token: genToken({ id: user._id, name: user.name }),
      });
    } else {
      res.status(403).json({
        message: "Invalid credentails",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error occurred",
    });
    console.log(error.message);
  }
};

// refresh Token
export const refreshToken = async (req, res) => {
  const cookie = req.cookies
  if(!cookie.refreshToken) throw new Error("Refresh token missing")
  const refreshToken = cookie.refreshToken
  const user = await User.findOne({refreshToken})
  if(!user) throw new Error("No refresh token found")
  jwt.verify(refreshToken,process.env.JWT_PASSWORD, (err,decoded) => {
    if(err || user.id !== decoded.id) throw new Error("Invalid refresh token")
    const accessToken = genRefreshToken(user._id)
    res.status(200).json({
      status: "success",
      accessToken
    })
  })
}

// logout functionality
export const logout = async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("No Refresh Token in Cookies");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204); // forbidden
  }
  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  res.sendStatus(204); // forbidden
};

// get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      status: "success",
      response: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error occurred",
    });
    console.log(error.message);
  }
};

// get individual user
export const getUser = async (req, res) => {
  try {
    validateMongodbId(req.params.id);
    const user = await User.findById(req.params.id);
    res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: "user not found",
    });
  }
};

// delete user

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message:`${deletedUser.name} has been deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "user not found",
    });
  }
};

// update user
export const updateUser = async (req, res) => {
  validateMongodbId(req.params.id);
  try {
    const {Fname,Lname,mobile} = req.body
    const updatedUser = await User.findByIdAndUpdate(req.params.id,{
      name:`${Fname}``${Lname}`,
      mobile
    }, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "user not found",
    });
  }
};

// block user

export const blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      message: `${user.name} has been blocked successfully`,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error has occurred",
    });
  }
};

// unblock user
export const unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: false },
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      message: `${user.name} has been unblocked successfully`,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error has occurred",
    });
  }
};
