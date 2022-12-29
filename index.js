import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDb } from './configs/dbConnection.js'
import colors from 'colors'
import router from './routes/regiterRoute.js'
import cookieParser from 'cookie-parser'
import productRouter from './routes/productRoute.js'
const app = express()

app.use(express.json())
app.use(cors())
app.use(cookieParser())
dotenv.config()

const PORT =  process.env.PORT || 4000
app.get('/',(req,res) => {
    res.send("welcome to ecommerce")
})

app.use("/api/v1/shoplite", router)
app.use("/api/v1/shoplite", productRouter)

app.listen(PORT,()=>{
    console.log(`App running on port ${PORT}`)
})

connectDb()