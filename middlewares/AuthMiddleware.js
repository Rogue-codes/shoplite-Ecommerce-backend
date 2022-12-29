import jwt from "jsonwebtoken";
import { genToken } from "../configs/jwtToken.js";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/email.js";

// export const AuthMiddleware = async (req, res, next) => {
//     // initializing token
//   let token;
// try{
// //   checking if header contains a token
//   if (req.headers.authorization.startsWith("Bearer")) {
//     token = req.headers.authorization.split(" ")[1];
//     // try {
//         // if there's a token decode the token
//       if (token) {
//         const decodedToken = jwt.decode(token, process.env.JWT_PASSWORD);
//         const loggedInUser = await User.findById(decodedToken.id)
//         req.user = loggedInUser
//         next()
//       }
//     // } catch (error) {
//     //     // no valid token
//     //   res.status(401).json({
//     //     status: "failed",
//     //     message: "token expired or not valid",
//     //   });
//     //   console.log(error.message)
//     // }
//   }else{
//     res.status(401).json({
//         status: "failed",
//         message: "no token found"
//     })
//   }
// }catch(error){
//         res.status(401).json({
//         status: "failed",
//         message: "token expired or not valid",
//       });
//       console.log(error.message)
// }
// };

export const AuthMiddleware = async (req, res, next) => {
  // initialize token
  let token;
  // check if header contains a token
  try {
    if (req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      if (token) {
        const decodedToken = jwt.decode(token, process.env.JWT_PASSWORD);
        const loggedInUser = await User.findById(decodedToken.id);
        req.user = loggedInUser;
        next();
      }
    }
  } catch (error) {
    res.status(401).json({
      status: "failed",
      message: "token is invalid or missing",
    });
  }
};
export const isAdmin = async (req, res, next) => {
  const { email } = req.user;
  const adminUser = await User.findOne({ email });
  if (adminUser.role !== "Admin") {
    res.status(403).json({
      status: "failed",
      message: "You do not have permission to access this route",
    });
  } else {
    next();
  }
};

export const forgotPassword = async (req, res, next) => {
  // get user by email
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404).json({
      status: "failed",
      message: "email not found",
    });
    next();
  }
  // generated a reset token
  const resetToken = await user.createPasswordResetToken();
  await user.save({
    validateBeforeSave: false,
  });

  // send the token to user's email address
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/shoplite/resetPassword/${resetToken}`;

  const message = `forgot your password? Submit a patch request with your new password and confirm passwprd to ${resetURL}. \nIf you didn't try to reset your password please ignore this email!`;

  try {
    sendEmail({
      email: req.body.email,
      subject: "Your password reset token, (valid for 10mins)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token has been sent to your email!",
    });
  } catch (error) {
    user.password = undefined;
    user.passwordResetExpiresIn = undefined;
    await user.save({
      validateBeforeSave: false,
    });
    res.status(500).json({
      status: "failed",
      message: "There was an error sending email try again later!",
    });
    next();
  }
};

// export

// update password while logged in
export const updatePassword = async (req, res, next) => {
  // get current signed in user
    const { email } = req.user;
    const {oldPassword, newPassword} = req.body;
    try{
      const user = await User.findOne({ email });

      // compare password in req.body with password in collection
      if (user && (await user.confirmPassword(oldPassword,user.password))) {
        // update password
         user.password = newPassword;
  
        await user.save()
  
        res.status(200).json({
          status: "success",
          message: "Password updated successfully",
          // send a JWT
          token: genToken({ name: user.name, id: user._id })
          
        })
        next()
      }else{
        res.status(400).json({
          status:"failed",
          message: "password does not match"
        })
      }
    }catch(error){
      res.status(500).json({
        status:"failed",
        message:"an error occured"
      })
    }

};



