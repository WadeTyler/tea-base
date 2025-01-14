
import { Request, Response } from 'express';
import db from '../lib/db';
import { createSystemLog } from '../lib/util/system_log.util';

export const getAllCategories = async (req: Request, res: Response): Promise<any> => {
  try {
    const [categories] = await db.query("SELECT * FROM categories");
    return res.status(200).json(categories);
  } catch (error) {
    console.error("Error in getAllCategories: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// admin only
export const createCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { name, label } = req.body;
    if (!name || !label) {
      return res.status(400).json({ message: "Please enter all fields" });
    }

    // check if category already exists
    const [existingCategory] = await db.query("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)", [name]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ message: `Category with the name: '${existingCategory[0].name}' already exists.` });
    }

    // save category
    await db.query("INSERT INTO categories (name, label) VALUES (?, ?)", [name, label]);

    // return the category
    const [newCategory] = await db.query("SELECT * FROM categories WHERE LOWER(name) = LOWER(?)", [name]);


    // add system log
    const user = req.body.user;
    createSystemLog({
      user_id: user.user_id,
      log: `${user.name} created a new category: ${name}`
    });

    
    return res.status(201).json({
      message: "Category created successfully",
      category: newCategory[0]
    });
  } catch (error) {
    console.error("Error in createCategory: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// admin only
export const deleteCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category_id } = req.params;

    // check if category exists
    const [existingCategory] = await db.query("SELECT category_id FROM categories WHERE category_id = ?", [category_id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // delete category
    await db.query("DELETE FROM categories WHERE category_id = ?", [category_id]);

    // add system log
    const user = req.body.user;
    createSystemLog({
      user_id: user.user_id,
      log: `${user.name} deleted a category: ${existingCategory.name}`
    });

    return res.status(200).json({ message: "Category deleted successfully" });

  } catch (error) {
    console.error("Error in deleteCategory: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// admin only
export const updateCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category_id } = req.params;
    const { name, label } = req.body;

    // check if category exists
    const [existingCategory] = await db.query("SELECT * FROM categories WHERE category_id = ?", [category_id]);

    if (existingCategory.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // update category
    const newFields = {
      name: name || existingCategory[0].name,
      label: label || existingCategory[0].label
    }

    // save changes
    await db.query("UPDATE categories SET name = ?, label = ? WHERE category_id = ?", [newFields.name, newFields.label, category_id]);

    // return the updated category
    const [updatedCategory] = await db.query("SELECT * FROM categories WHERE category_id = ?", [category_id]);

    // add system log
    const user = req.body.user;
    createSystemLog({
      user_id: user.user_id,
      log: `${user.name} updated a category: ${category_id}. New name: ${newFields.name}, New label: ${newFields.label}`
    });

    return res.status(200).json({
      message: "Category updated successfully",
      category: updatedCategory[0]
    });
    
  } catch (error) {
    console.error("Error in updateCategory: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
}