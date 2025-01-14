import { Request, Response } from "express";
import db from '../config/db';
import { generateProductId } from "../lib/util/product.util";
import cloudinary from "../lib/cloudinary";
import { ProductImage } from "../../shared/types";


// get all products
export const getAllProducts = async (req: Request, res: Response): Promise<any> => {
  try {
    const [products] = await db.query("SELECT * FROM products");

    // Add product images
    for (let i = 0; i < products.length; i++) {
      const [product_images]: ProductImage[] = await db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY image_order ASC", [products[i].product_id]);
      products[i].product_images = product_images;
    }

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

    // Add product images
    for (let i = 0; i < products.length; i++) {
      const [product_images]: ProductImage[] = await db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY image_order ASC", [products[i].product_id]);
      products[i].product_images = product_images;
    }

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


    // add product images
    for (let i = 0; i < products.length; i++) {
      const [product_images]: ProductImage[] = await db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY image_order ASC", [products[i].product_id]);
      products[i].product_images = product_images;
    }

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

    // Add product images
    const [product_images]: ProductImage[] = await db.query("SELECT * FROM product_images WHERE product_id = ? ORDER BY image_order ASC", [product_id]);
    product[0].product_images = product_images;

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

    if (!name || !category_id || price === null || stock === null || !description) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // at least one image is required.
    if (images.length === 0) {
      return res.status(400).json({ message: "At least one image is required." });
    }

    // check if product already exists
    const [existingProduct] = await db.query("SELECT * FROM products WHERE LOWER(name) = LOWER(?)", [name]);
    if (existingProduct.length > 0) {
      return res.status(400).json({ message: "Product with that name already exists" });
    }

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

    // Add product images
    let cloudinaryResponse = null;
    let product_images: ProductImage[] = [];

    for (let i = 0; i < images.length; i++) {
      cloudinaryResponse = await cloudinary.uploader.upload(images[i], { folder: "products" });

      // add image to db
      const [productImage] = await db.query("INSERT INTO product_images (product_id, image, image_order) VALUES(?, ?, ?)", [product_id, cloudinaryResponse.secure_url, i]);

      const newImage: ProductImage = {
        product_image_id: productImage.insertId,
        product_id,
        image: cloudinaryResponse.secure_url,
        image_order: i
      };

      product_images.push(newImage);
    }

    newProduct[0].product_images = product_images;

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

    // delete product images from cloudinary
    const [product_images] = await db.query("SELECT * FROM product_images WHERE product_id = ?", [product_id]);
    for (let i = 0; i < product_images.length; i++) {
      const publicId = product_images[i].image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    // delete from db
    await db.query("DELETE FROM products WHERE product_id = ?", [product_id]);

    // product_images should cascade on delete, so no need to manually delete.
    


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

// set the product_image order
export const setImageOrder = async (req: Request, res: Response): Promise<any> => {
  try {
    const { product_id } = req.params;
    const { product_images } = req.body;

    if (!product_id || !product_images) {
      return res.status(400).json({ message: "Product ID and product_images are required" });
    }

    // Check product exists
    const [product] = await db.query("SELECT * FROM products WHERE product_id = ?", [product_id]);
    if (product.length === 0) {
      return res.status(404).json({ message: "Product does not exist" });
    }

    // Check if all images belong to the product
    for (let i = 0; i < product_images.length; i++) {
      const [image] = await db.query("SELECT * FROM product_images WHERE product_image_id = ? AND product_id = ?", [product_images[i].product_image_id, product_id]);
      if (image.length === 0) {
        return res.status(404).json({ message: "Image does not belong to the product" });
      }
    }

    // update image order. order is determined based on the arrangement in the array.
    for (let i = 0; i < product_images.length; i++) {
      await db.query("UPDATE product_images SET image_order = ? WHERE product_image_id = ?", [i, product_images[i].product_image_id]);
      product_images[i].image_order = i;
    }

    return res.status(200).json({ 
      message: "Image order updated",
      product_images
    });

  } catch (error) {
    console.error("Error in setImageOrder: ", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}