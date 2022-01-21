const express = require("express");
const router = express.Router();
const cartService = require("../services/cart_service");

// Get cart
router.get("/", async (req, res) => {
  const { cartId, userId } = req.query;
  try {
    let result;

    if (cartId) {
      result = await cartService.getCartByCartId(cartId);
    } else if (userId) {
      result = await cartService.getCartByUserId(userId);
    } else {
      return res
        .status(400)
        .json({ error: "Unable to get cart by either cart id or user id." });
    }

    result.cartItems = await cartService.getCartItemsByCartId(result.ID);

    return res.status(200).json({ data: result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Add product to user cart, done by pharmacist
router.post("/", async (req, res) => {
  const data = req.body;
  const userId = req.query.userId;

  try {
    if (userId) {
      // Create cart
      const cartId = await cartService.createCartByUserId(
        userId,
        data.pharmacyId
      );

      // Insert cart item
      if (cartId) {
        for (const index in data.cartItems) {
          await cartService.createCartItemByCartId(
            cartId,
            data.cartItems[index]
          );
        }
        return res.status(200).json({ cartId });
      }
    }

    return res.status(400).json({ error: "Unable to create cart." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Update flag delete by cart id
router.patch("/:cartId", async (req, res) => {
  try {
    await cartService.updateFlagDeleteByCartId(
      req.params.cartId,
      req.body.flagDelete
    );
    return res.status(200).json({ message: "Update flag successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
