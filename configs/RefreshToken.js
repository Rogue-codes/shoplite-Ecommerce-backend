import jwt from 'jsonwebtoken'
const Password = process.env.JWT_PASSWORD
export const genRefreshToken =(id)=>{
    return jwt.sign({id}, Password,{expiresIn:"3d"})
}