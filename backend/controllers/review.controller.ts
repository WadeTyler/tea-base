
import { Request, Response } from 'express';
import db from '../config/db';
import { Review } from '../../shared/types';
import { updateProductStars } from '../lib/util/review.util';

export const getReviewsByProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "Please provide product_id" });
    }

    const [reviews] = await db.query("SELECT reviews.*, users.name FROM reviews JOIN users ON reviews.user_id = users.user_id WHERE product_id = ?", [product_id]);
    return res.status(200).json(reviews);
  } catch (error) {
    console.error("Error in getReviewsByProduct: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const createReview = async (req: Request, res: Response): Promise<any> => {
  try {
    
    const { product_id } = req.params;
    const { user, rating, summary, content } = req.body;
    const user_id = user.user_id;

    if (!product_id || !user_id || !rating || !summary || !content) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if product exists
    const [product] = await db.query('SELECT * FROM products WHERE product_id = ?', [product_id]);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if user already reviewed this product
    const [existingReviews] = await db.query("SELECT * FROM reviews WHERE product_id = ? AND user_id = ?", [product_id, user_id]);
    if (existingReviews.length > 0) {
      return res.status(400).json({ message: "You have already reviewed this product" });
    }

    // Check if rating is between 1 and 5
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // check summary length
    if (summary.length > 50)
      return res.status(400).json({ message: "Summary must be less than 50 characters" });

    // check content length
    if (content.length > 300) 
      return res.status(400).json({ message: "Content must be less than 300 characters" });

    // Insert review
    const [review] = await db.query("INSERT INTO reviews (product_id, user_id, rating, summary, content) VALUES (?, ?, ?, ?, ?)", [product_id, user_id, rating, summary, content]);

    // Update product stars
    await updateProductStars(product_id);

    const [newReview] = await db.query("SELECT * FROM reviews WHERE review_id = ?", [review.insertId]);

    return res.status(201).json({ 
      message: "Review created successfully.", 
      review: newReview[0]
    });
  } catch (error) {
    console.error("Error in createReview: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// used to delete a user's review
export const deleteReview = async (req: Request, res: Response): Promise<any> => {
  try {
    const { review_id } = req.params;
    const user = req.body.user;
    const user_id = user.user_id;

    if (!review_id) {
      return res.status(400).json({ message: "Please provide review_id" });
    }

    const [reviews] = await db.query("SELECT * FROM reviews WHERE review_id = ?", [review_id]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const review = reviews[0] as Review;

    if (review.user_id !== user_id) {
      return res.status(403).json({ message: "You are not authorized to delete this review" });
    }

    await db.query("DELETE FROM reviews WHERE review_id = ?", [review_id]);

    // Update product stars
    await updateProductStars(review.product_id);

    return res.status(200).json({ message: "Review deleted successfully" });

  } catch (error) {
    console.error("Error in deleteReview: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

////////////////// Admin Routes //////////////////
export const deleteReviewByAdmin = async (req: Request, res: Response): Promise<any> => {
  try {
    const { review_id } = req.params;
    
    if (!review_id) {
      return res.status(400).json({ message: "Please provide review_id" });
    }

    const [reviews] = await db.query("SELECT * FROM reviews WHERE review_id = ?", [review_id]);

    if (reviews.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    await db.query("DELETE FROM reviews WHERE review_id = ?", [review_id]);

    // Update product stars
    await updateProductStars(reviews[0].product_id);

    return res.status(200).json({ message: "Review deleted successfully" });

  } catch (error) {
    console.error("Error in deleteReviewByAdmin: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}