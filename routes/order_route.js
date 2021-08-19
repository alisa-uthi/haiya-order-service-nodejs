const express = require('express')
const router = express.Router()

const orderService = require('../services/order_service')
const deliveryService = require('../services/delivery_service')
const { OrderStatus } = require('../constants/order_status')

// Get order history by order id
router.get('/:orderId', async (req, res) => {
    const orderId = req.params.orderId

    try {
        let order = await orderService.getOrderByOrderId(orderId)

        if(order) {
            let orderLines = await orderService.getOrderLinesByOrderId(orderId)
            order.orderLines = orderLines
    
            return res.status(200).json({ data: order })
        }
        
        return res.status(400).json({ error: "Order not found." })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

// Get delivery info by order id
router.get('/:orderId/delivery', async (req, res) => {
    try {
        const result = await deliveryService.getDeliveryByOrderId(req.params.orderId)
        return res.status(200).json({ data: result })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

// Update order status by order id
router.patch('/:orderId/status', async (req, res) => {
    let status = req.body.status.toUpperCase()

    try {
        if(Object.values(OrderStatus).toString().includes(status)) {
            const result = await orderService.updateOrderStatus(req.params.orderId, status)
            if(result == 1) {
                return res.status(200).json({ data: "Order status has been updated." })
            }
        }

        return res.status(400).json({ error: "Invalid order status." })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

// Get all order history by user id
router.get('/user/:userId', async (req, res) => {
    try {
        const result = await orderService.getOrderHistoryByUserId(req.params.userId)
        return res.status(200).json({ data: result })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

// Create order by user id
router.post('/user/:userId', async (req, res) => {
    const data = req.body
    const userId = req.params.userId

    try {
        // Create order
        const orderId = await orderService.createOrderByUserId(userId, data)

        // Insert order line
        if(orderId) {
            for(const index in data.orderLines) {
                await orderService.createOrderLine(orderId, data.orderLines[index])
            }
            return res.status(200).json({ orderId: orderId })
        }
        
        return res.status(400).json({ error: "Unable to create order." })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

// Create delivery of given order id associated with a driver Id
router.post('/:orderId/driver/:userId/delivery', async (req, res) => {
    const { orderId, userId } = req.params

    try {
        // Insert delivery into table
        const isInserted = await deliveryService.insertDelivery(orderId, userId)

        if(isInserted) {
            // Update order status to be PICKED_UP
            const result = await orderService.updateOrderStatus(req.params.orderId, OrderStatus.PICKED_UP.toString())
            if(result == 1) {
                return res.status(200).json({ data: "The order has been picked up by the driver." })
            }
        }

        return res.status(400).json({ error: "Unable to pick up the order" })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
})

module.exports = router