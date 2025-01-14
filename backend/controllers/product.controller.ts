import { Request, Response } from "express";
import db from '../config/db';
import { generateProductId } from "../lib/util/product.util";


// get all products
export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const [products] = await db.query("SELECT * FROM products");

    // TODO: Add product images

    return res.status(200).json(products);

  } catch (error) {
    console.error("Error in getAllProducts: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// get featured products
export const getFeaturedProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const [products] = await db.query("SELECT * FROM products WHERE is_featured = 1");

    // TODO: Add product images

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error in getFeaturedProducts: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// get products by category
export const getAllProductsInCategory = async (req: Request, res: Response): Promise<any> => {
  try {
    const { category_id } = req.params;

    if (!category_id) {
      return res.status(400).json({ message: "Category ID is required" });
    }

    // check category exists
    const [category] = await db.query("SELECT * FROM categories WHERE category_id = ?", [category_id]);
    if (category.length === 0) {
      return res.status(404).json({ message: "Category does not exist" });
    }

    const [products] = await db.query("SELECT * FROM products WHERE category_id = ?", [category_id]);

    return res.status(200).json(products);
  } catch (error) {
    console.error("Error in getAllProductsInCategory: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// get product by id
export const getProductById = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);

    if (product.length === 0) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // TODO: Add product images

    return res.status(200).json(product[0]);

  } catch (error) {
    console.error("Error in getProductById: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/////////////////////////////////////// ADMIN ONLY ///////////////////////////////////////

// create product
export const createProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    
    const { name, category_id, price, stock, description, images } = req.body;

    if (!name || !category_id || price === null || stock === null || !description /* || !images */) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // check if product already exists
    const [existingProduct] = await db.query("SELECT * FROM products WHERE LOWER(name) = LOWER(?)", [name]);
    if (existingProduct.length > 0) {
      return res.status(400).json({ message: "Product already exists" });
    }

    // TODO: Add image upload functionality

    if (price < 0) {
      return res.status(400).json({ message: "Price cannot be negative" });
    }

    if (stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    if (name.length > 255) {
      return res.status(400).json({ message: "Name is too long: max 255 characters." });
    }

    // check category exists
    const [category] = await db.query("SELECT * FROM categories WHERE category_id = ?", [category_id]);
    if (category.length === 0) {
      return res.status(400).json({ message: "Category does not exist" });
    }

    // create product
    const product_id = generateProductId();

    // save product
    await db.query("INSERT INTO products (product_id, category_id, name, price, stock, description) VALUES (?, ?, ?, ?, ?, ?)", [product_id, category_id, name, price, stock, description]);

    const [newProduct] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);

    // TODO: Add system log

    return res.status(201).json({
      message: "Product created successfully",
      product: newProduct[0]
    });

  } catch (error) {
    console.error("Error in createProduct: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// toggle featured
export const toggleFeatured = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);

    if (product.length === 0) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    const is_featured = !product[0].is_featured;

    await db.query("UPDATE products SET is_featured = ? WHERE product_id = ?", [is_featured, product_id]);

    return res.status(200).json({
      message: "Product featured status updated",
      product_id,
      is_featured
    });

  } catch (error) {
    console.error("Error in toggleFeatured: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// delete target product
export const deleteProduct = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);

    if (product.length === 0) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    await db.query("DELETE FROM products WHERE product_id = ?", [product_id]);

    // TODO: Add system log

    return res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error in deleteProduct: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// set sale percentage
export const setSalePercentage = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;
    const { sales_percentage } = req.body;

    if (!product_id || !sales_percentage) {
      return res.status(400).json({ message: "Product ID and sales percentage are required" });
    }

    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    if (sales_percentage < 0 || sales_percentage > 100) {
      return res.status(400).json({ message: "Sales percentage should be between 0 and 100" });
    }

    await db.query("UPDATE products SET sales_percentage = ? WHERE product_id = ?", [sales_percentage, product_id]);


    // TODO: Add system log


    return res.status(200).json({
      message: "Sale percentage updated",
      product_id,
      sales_percentage
    });

  } catch (error) {
    console.error("Error in setSale: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

// set stock
export const setStock = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;
    const { stock } = req.body;

    if (!product_id || stock === null || stock === undefined) {
      return res.status(400).json({ message: "Product ID and stock are required" });
    }

    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);

    if (product.length === 0) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    if (stock < 0) {
      return res.status(400).json({ message: "Stock cannot be negative" });
    }

    await db.query("UPDATE products SET stock = ? WHERE product_id = ?", [stock, product_id]);

    // TODO: Add system log

    return res.status(200).json({
      message: "Stock updated to " + stock,
      product_id,
      stock
    });
  } catch (error) {
    console.error("Error in setStock: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}