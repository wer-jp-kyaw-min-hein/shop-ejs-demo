import express from 'express';
import { ordersStore } from '../models/ordersStore.js';
const router = express.Router();
router.get('/', (req,res)=> res.render('admin/orders/index',{ orders: ordersStore.list() }));
export default router;