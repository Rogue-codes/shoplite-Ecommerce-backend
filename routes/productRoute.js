import express from 'express';
import { createProduct, deleteProduct, getAllProducts, productById, search, updateProduct } from '../controllers/productController.js';
import { AuthMiddleware, isAdmin } from '../middlewares/AuthMiddleware.js';

const productRouter = express.Router()

productRouter.post('/product',AuthMiddleware, isAdmin, createProduct)
productRouter.get('/product/all', getAllProducts)
productRouter.get('/product/:key', search)
productRouter.get('/product/:id', productById)
productRouter.patch('/product/:id',AuthMiddleware, isAdmin, updateProduct)
productRouter.delete('/product/:id',AuthMiddleware, isAdmin, deleteProduct)


export default productRouter