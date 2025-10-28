import express from 'express';
import { ordersStore } from '../models/ordersStore.js';
const router = express.Router();

router.get('/', (req, res) => res.render('admin/orders/index', { orders: ordersStore.list() }));

router.post('/:id/accept', (req, res) => {
	const id = req.params.id;
	const order = ordersStore.getById(id);
	if (!order) return res.status(404).send('Order not found');
	ordersStore.update(id, { status: 'accepted' });
	req.session.flash = `Order ${id} accepted`;
	res.redirect('/admin/orders');
});

router.post('/:id/reject', (req, res) => {
	const id = req.params.id;
	const order = ordersStore.getById(id);
	if (!order) return res.status(404).send('Order not found');
	ordersStore.update(id, { status: 'rejected' });
	req.session.flash = `Order ${id} rejected`;
	res.redirect('/admin/orders');
});

router.get('/:id', (req, res) => {
	const order = ordersStore.getById(req.params.id);
	if (!order) return res.status(404).send('Order not found');
	res.render('admin/orders/show', { order });
});

export default router;