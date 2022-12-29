import jwt from 'jsonwebtoken'
const Password = process.env.JWT_PASSWORD
export const genToken =({name,id})=>{
    return jwt.sign({id,name}, Password,{expiresIn:"1d"})
}