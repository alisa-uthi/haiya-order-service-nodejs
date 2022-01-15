const express = require("express");
const router = express.Router();

const orderService = require("../services/order_service");
const deliveryService = require("../services/delivery_service");
const { OrderStatus } = require("../constants/order_status");
const { DeliveryStatus } = require("../constants/delivery_status");

// Get order history by order id
router.get("/:orderId", async (req, res) => {
  const orderId = req.params.orderId;
  const authorizationToken = req.headers.authorization;
  try {
    let order = await orderService.getOrderByOrderId(orderId);

    if (order) {
      let orderLines = await orderService.getOrderLinesByOrderId(
        orderId,
        authorizationToken
      );
      order.orderLines = orderLines;

      return res.status(200).json({ data: order });
    }

    return res.status(400).json({ error: "Order not found." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get delivery info by order id
router.get("/:orderId/delivery", async (req, res) => {
  try {
    const result = await deliveryService.getDeliveryByOrderId(
      req.params.orderId
    );
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update order status by order id
router.patch("/:orderId/status", async (req, res) => {
  let status = req.body.status.toUpperCase();

  try {
    if (Object.values(OrderStatus).toString().includes(status)) {
      const result = await orderService.updateOrderStatus(
        req.params.orderId,
        status
      );
      if (result == 1) {
        return res.status(200).json({ data: "Order status has been updated." });
      }
    }

    return res.status(400).json({ error: "Invalid order status." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update driver of the order by order id
router.patch("/:orderId/driver", async (req, res) => {
  const driverId = req.body.driverId;

  try {
    const result = await orderService.updateOrderDriverPerson(
      req.params.orderId,
      driverId
    );
    if (result == 1) {
      return res.status(200).json({ data: "Order's driver has been updated." });
    }
    return res.status(500).json({ error: "Invalide order." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get all order history by user id
router.get("/user/:userId", async (req, res) => {
  try {
    const result = await orderService.getOrderHistoryByUserId(
      req.params.userId
    );
    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create order by user id
router.post("/user/:userId", async (req, res) => {
  const data = req.body;
  const userId = req.params.userId;

  try {
    // Create order
    const orderId = await orderService.createOrderByUserId(userId, data);

    // Insert order line
    if (orderId) {
      for (const index in data.orderLines) {
        await orderService.createOrderLine(orderId, data.orderLines[index]);
      }
      return res.status(200).json({ orderId: orderId });
    }

    return res.status(400).json({ error: "Unable to create order." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get all orders by order status
router.get("/user/:userId/orderStatus/:status", async (req, res) => {
  try {
    const { userId, status } = req.params;

    if (Object.values(OrderStatus).toString().includes(status.toUpperCase())) {
      let order = await orderService.getOrderByOrderStatus(status, userId);
      return res.status(200).json({ data: order });
    }
    return res.status(400).json({ error: "Invalid order status." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get order history by pharmacy name
router.get("/pharmacy/:pharmacy", async (req, res) => {
  const pharmacy = req.params.pharmacy;
  try {
    let orders = await orderService.getOrderByPharmacy(pharmacy);
    return res.status(200).json({ data: orders });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create delivery of given order id associated with a driver Id
router.post("/:orderId/driver/:driverId/delivery", async (req, res) => {
  const { orderId, driverId } = req.params;
  const deliveryStatus = req.body.deliveryStatus.toUpperCase();

  try {
    if (Object.values(DeliveryStatus).toString().includes(deliveryStatus)) {
      const isInserted = await deliveryService.insertDelivery(
        orderId,
        driverId,
        deliveryStatus
      );
      if (isInserted) {
        return res
          .status(200)
          .json({ data: "The order has been " + deliveryStatus });
      }
    }

    return res.status(400).json({ error: "Invalid delivery status." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Create Order distribution by order id
router.post("/distribution/:orderId", async (req, res) => {
  const { orderId } = req.params;

  try {
    await orderService.createOrderDistribution(orderId);
    res.status(201).json({ data: "The order distribution has been created." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update Order distribution by order id
router.patch("/distribution/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status, rejectedBy, acceptedBy } = req.body;

  try {
    await orderService.updateOrderDistribution(
      orderId,
      status,
      rejectedBy,
      acceptedBy
    );
    res.status(200).json({ data: "The order distribution has been updated." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
