import db from '../../config/db';


export async function updateProductStars(product_id: string) {
  try {
    const [reviews] = await db.query("SELECT rating FROM reviews WHERE product_id = ?", [product_id]);

    if (reviews.length === 0) {
      return;
    }

    const totalStars = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const stars = totalStars / reviews.length;
    
    // update stars
    await db.query("UPDATE products SET stars = ? WHERE product_id = ?", [stars, product_id]);
  } catch (error) {
    throw error;
  }
}