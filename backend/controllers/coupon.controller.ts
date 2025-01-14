import { Request, Response } from "express";
import db from '../config/db';
import { Coupon } from "../../shared/types";




export const verifyCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { coupon_id } = req.params;

    if (!coupon_id) {
      return res.status(400).json({ message: "Please provide a coupon_id" });
    }

    // Check if the coupon exists
    const [existingCoupon] = await db.query("SELECT * FROM coupons WHERE coupon_id = ?", [coupon_id]);
    if (existingCoupon.length === 0) {
      return res.status(404).json({ message: "Coupon invalid or expired." });
    }

    const coupon: Coupon = existingCoupon[0];

    // check active status
    if (!coupon.is_active) {
      return res.status(400).json({ message: "Coupon is invalid or expired." });
    }

    // Check expiration date
    const expirationDate = new Date(coupon.expiration);
    if (expirationDate < new Date()) {
      // update is_active to false
      await db.query("UPDATE coupons SET is_active = 0 WHERE coupon_id = ?", [coupon_id]);
      return res.status(400).json({ message: "Coupon is invalid or expired." });
    }

    return res.status(200).json({
      message: "Coupon is active and verified.",
      coupon
    });




  } catch (error) {
    console.error("Error in verifyCoupon: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

////////////////// Admin Routes //////////////////////

export const createCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { coupon_id, discount, expiration, is_active } = req.body;

    if (!coupon_id || !discount || !expiration || is_active === undefined || is_active === null) {
      return res.status(400).json({ message: "Please fill all fields" });
    }

    // Check if the coupon already exists
    const [existingCoupon] = await db.query("SELECT * FROM coupons WHERE coupon_id = ?", [coupon_id]);
    if (existingCoupon.length > 0) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    // Check is coupon_id alphnum
    if (!coupon_id.match(/^[0-9a-zA-Z]+$/)) {
      return res.status(400).json({ message: "Coupon code should be alphanumeric" });
    }

    // Check if the expiration date is in the future
    const expirationDate = new Date(expiration);
    if (expirationDate < new Date()) {
      return res.status(400).json({ message: "Expiration date has already passed." });
    }

    // check if the discount is between 1 and 100
    if (discount < 1 || discount > 100) {
      return res.status(400).json({ message: "Discount should be between 1 and 100" });
    }


    // Check if is_active is a boolean
    if (typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active should be a boolean" });
    }

    // Create the coupon
    await db.query("INSERT INTO coupons (coupon_id, discount, expiration, is_active) VALUES(?, ?, ?, ?)", [coupon_id, discount, expiration, is_active]);

    // TODO: Add system log

    const coupon: Coupon = {
      coupon_id,
      discount,
      expiration,
      is_active
    };

    return res.status(201).json({ 
      message: "Coupon created successfully", 
      coupon 
    });

  } catch (error) {
    console.error("Error in createCoupon: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAllCoupons = async (req: Request, res: Response): Promise<any> => {
  try {
    const [coupons] = await db.query("SELECT * FROM coupons ORDER BY is_active AND expiration DESC");
    return res.status(200).json(coupons);
  } catch (error) {
    console.error("Error in getAllCoupons: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const updateCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { coupon_id } = req.params;
    const { discount, expiration, is_active } = req.body;

    if (!discount && !expiration && (is_active === undefined || is_active === null)) {
      return res.status(400).json({ message: "Please provide at least one field to update" });
    }

    // Check if the coupon exists
    const [existingCoupon] = await db.query("SELECT * FROM coupons WHERE coupon_id = ?", [coupon_id]);
    if (existingCoupon.length === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }

  
    // Check if the expiration date is in the future
    if (expiration) {
      const expirationDate = new Date(expiration);
      if (expirationDate < new Date()) {
        return res.status(400).json({ message: "Expiration date has already passed." });
      }
    }

    // check if the discount is between 1 and 100
    if (discount && (discount < 1 || discount > 100)) {
      return res.status(400).json({ message: "Discount should be between 1 and 100" });
    }

    // Check if is_active is a boolean
    if (is_active !== null && typeof is_active !== "boolean") {
      return res.status(400).json({ message: "is_active should be a boolean" });
    }


    const newFields: Coupon = {
      coupon_id,
      discount: discount || existingCoupon[0].discount,
      expiration: expiration || existingCoupon[0].expiration,
      is_active: is_active === undefined ? existingCoupon[0].is_active : is_active
    }


    // Update the coupon
    await db.query("UPDATE coupons SET discount = ?, expiration = ?, is_active = ? WHERE coupon_id = ?", [newFields.discount, newFields.expiration, newFields.is_active, coupon_id]);

    // TODO: Add system log

    return res.status(200).json({
      message: "Coupon updated successfully",
      coupon: newFields
    });

  } catch (error) {
    console.error("Error in updateCoupon: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const deleteCoupon = async (req: Request, res: Response): Promise<any> => {
  try {
    const { coupon_id } = req.params;

    if (!coupon_id) {
      return res.status(400).json({ message: "Please provide a coupon_id" });
    }

    // Check if the coupon exists
    const [existingCoupon] = await db.query("SELECT * FROM coupons WHERE coupon_id = ?", [coupon_id]);
    if (existingCoupon.length === 0) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // Delete the coupon
    await db.query("DELETE FROM coupons WHERE coupon_id = ?", [coupon_id]);

    // TODO: Add system log

    return res.status(200).json({ message: `Coupon '${coupon_id}' deleted successfully` });
  } catch (error) {
    console.error("Error in deleteCoupon: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}