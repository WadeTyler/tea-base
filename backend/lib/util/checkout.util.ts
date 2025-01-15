import { Coupon, Product } from "../../../shared/types";
import db from "../db";
import stripe from "../stripe";


export function calculatePriceAfterSales (price: number, sales_percentage: number) {
  return price - (price * sales_percentage / 100);
}

export async function createStripeCoupon(discount: number) {
  const coupon = await stripe.coupons.create({
    percent_off: discount,
    duration: "once",
  });

  return coupon.id;
}

export async function getProductsForCheckout(user_id: string) {
  const [products] = await db.query(`
    SELECT products.*, 
       (SELECT image 
        FROM product_images 
        WHERE products.product_id = product_images.product_id 
        ORDER BY product_images.image_order DESC 
        LIMIT 1) as image, 
       cart_items.quantity
    FROM products
    JOIN cart_items ON products.product_id = cart_items.product_id
    WHERE cart_items.user_id = ?
    `, [user_id]);

    return products;
}

export function verifyInputChecks(product: Product): string | undefined {
  // Check if product is out of stock
  if (product.stock <= 0) {
    return `${product.name} is out of stock.`;
  }

  if (!product.quantity) {
    return `Quantity for ${product.name} is required.`;
  }

  // Check quantity is not more than stock count
  if (product.quantity && product.quantity > product.stock) {
    return `The quantity for ${product.name} is too much`;
  }

  // Check if quantity is less than 0
  if (product.quantity && product.quantity <= 0) {
    return `The quantity for ${product.name} is too low.`;
  }

  return undefined;
  
}