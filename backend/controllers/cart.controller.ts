import { Request, Response } from "express";
import db from '../config/db';
import { Product } from "../../shared/types";

export const addToCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user, product_id, quantity } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    if (!quantity) {
      return res.status(400).json({ message: "Quantity is required" });
    }

    if (quantity < 1) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    if (typeof product_id !== "string" || typeof quantity !== "number") {
      return res.status(400).json({ message: "Invalid data type" });
    }

    // Check if product exists
    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already in the cart
    const [existingCartItem] = await db.query("SELECT * FROM cart_items WHERE product_id = ? AND user_id = ?", [product_id, user.user_id]);

    // If the product is already in the cart, update the quantity
    if (existingCartItem.length > 0) {
      const newQuantity = existingCartItem[0].quantity + quantity;

      await db.query(`UPDATE cart_items SET quantity = ? WHERE product_id = ? AND user_id = ?`, [newQuantity, product_id, user.user_id]);
      console.log("updating quantity");

      const newCartItem = existingCartItem[0];
      newCartItem.quantity = newQuantity;

      return res.status(200).json({ 
        message: "Product quantity updated successfully",
        cart_item: newCartItem
      });
    }

    // If the product is not in the cart, add the product
    await db.query("INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)", [user.user_id, product_id, quantity]);

    const [newCartItem] = await db.query("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?", [user.user_id, product_id]);

    return res.status(200).json({
      message: "Product added to cart successfully",
      cart_item: newCartItem[0]
    });

  } catch (error) {
    console.error("Error in addToCart: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getCartItems = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user } = req.body;

    const [cartItems]: Product[] = await db.query("SELECT products.*, cart_items.quantity FROM cart_items JOIN products ON cart_items.product_id = products.product_id WHERE cart_items.user_id = ?", [user.user_id]);

    return res.status(200).json(cartItems);
  } catch (error) {
    console.error("Error in getCartItems: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const updateQuantity = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user, product_id, quantity } = req.body;

    if (!product_id || quantity === undefined || quantity === null) {
      return res.status(400).json({ message: "Product ID and quantity are required" });
    }

    if (quantity < 0) {
      return res.status(400).json({ message: "Quantity must be greater than or equal to 0" });
    }
    
    const [cart_item] = await db.query("SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?", [user.user_id, product_id]);
    if (cart_item.length === 0) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // if quantity is 0, remove the product from the cart
    if (quantity === 0) {
      await db.query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [user.user_id, product_id]);
      return res.status(200).json({ message: "Product removed from cart", product_id });
    }

    // otherwise update the quantity
    await db.query("UPDATE cart_items SET quantity = ? WHERE user_id = ? AND product_id = ?", [quantity, user.user_id, product_id]);

    const updatedCartItem: Product = cart_item[0];
    updatedCartItem.quantity = quantity;

    return res.status(200).json({ message: "Product quantity updated successfully", cart_item: updatedCartItem });

  } catch (error) {
    console.error("Error in updateQuantity: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Deletes all items if product_id is not provided, will only delete specific item with product_id
export const deleteFromCart = async (req: Request, res: Response): Promise<any> => {
  try {
    const { user, product_id } = req.body;

    // Delete all items if no produc_id
    if (!product_id) {
      await db.query("DELETE FROM cart_items WHERE user_id = ?", [user.user_id]);
      return res.status(200).json({ message: "All items removed from cart" });
    }

    // Delete specific item with product_id
    await db.query("DELETE FROM cart_items WHERE user_id = ? AND product_id = ?", [user.user_id, product_id]);
    return res.status(200).json({ message: "Product removed from cart", product_id });
  } catch (error) {
    console.error("Error in deleteFromCart: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}