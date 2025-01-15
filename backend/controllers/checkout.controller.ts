import { Request, Response } from "express";
import stripe from "../lib/stripe";
import db from '../lib/db';
import { Coupon, LineItem, Product } from "../../shared/types";
import { calculatePriceAfterSales, createStripeCoupon, getProductsForCheckout, verifyInputChecks } from "../lib/util/checkout.util";

export const createCheckoutSession = async (req: Request, res: Response): Promise<any> => {
  try {
    const user = req.body.user;
    const { coupon_id } = req.body;

    // get cart items
    const products = await getProductsForCheckout(user.user_id);

    if (products.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    let lineItems: any[] = [];
    let totalAmount = 0;

    // Iterate over each product and create line items
    for (let i = 0; i < products.length; i++) {

      const product = products[i];

      // Check for product quantity
      if (!product.quantity) {
        return res.status(400).json({ message: `Quantity for ${product.name} is required.` });
      }

      // Check base verifications
      const verificationError = verifyInputChecks(product);
      if (verificationError) {
        console.log("here");
        return res.status(400).json({ message: verificationError });
      }

      // Check if product is on sale and Calculate price after sales
      if (product.sales_percentage > 0) {
        product.price = calculatePriceAfterSales(product.price, product.sales_percentage);
      }

      // calculate amount in cents
      const amount = Math.round(product.price * 100);

      // create line item
      const lineItem: LineItem = {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: product.image ? [product.image] : [],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };

      // Add line item to lineItems
      lineItems.push(lineItem);

      // Add amount to totalAmount
      totalAmount += amount * product.quantity;
    };

    // Check coupon
    let coupon = null;

    // if the user provided a coupon_id, verify the coupon and apply the discount
    if (coupon_id) {
      // verify coupon returns a string when not valid, otherwise it will return the coupon object
      const [coupons] = await db.query("SELECT * FROM coupons WHERE coupon_id = ?", [coupon_id]);
      if (coupons.length === 0) {
        return res.status(404).json({ message: "Coupon not found." });
      }

      coupon = coupons[0];


      // check is_active
      if (!coupon.is_active) {
        return res.status(400).json({ message: "Coupon is invalid or expired." });
      }

      // check expiration
      if (new Date(coupon.expiration) < new Date()) {
        await db.query("UPDATE coupons SET is_active = 0 WHERE coupon_id = ?", [coupon_id]);
        return res.status(400).json({ message: "Coupon has expired." });
      }

      // coupon is valid
      totalAmount -= Math.round(totalAmount * coupon.discount / 100);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ['US', 'CA'],
      },
      automatic_tax: {
        enabled: true,
      },
      success_url: `http://localhost:8000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `http://localhost:8000/cancel`,
      discounts: coupon ? [{ coupon: await createStripeCoupon(coupon.discount) }] : [],
      metadata: {
        user_id: user.user_id,
        total_amount: totalAmount,
        coupon_id: coupon_id || null,
        products: JSON.stringify(products.map((product: Product) => {
          return {
            product_id: product.product_id,
            quantity: product.quantity,
          }
        })),
      }
    });

    // Return session id and total amount
    return res.status(200).json({
      id: session.id,
      totalAmount: totalAmount,
      session_url: session.url,
    });

  } catch (error) {
    console.error("Error in createCheckoutSession: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

