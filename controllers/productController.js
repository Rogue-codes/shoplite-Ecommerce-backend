import Product from "../models/productsModel.js";
import slugify from "slugify";
// create product
export const createProduct = async (req, res) => {
  const {
    title,
    slug,
    description,
    oldPrice,
    price,
    category,
    brand,
    quantity,
    coverImage,
    images,
    size,
    featuredProduct,
    discount,
    featuredCollection,
    sold,
    ratings,
    totalrating,
  } = req.body;
  try {
    const product = await Product.create({
      title,
      slug: slugify(title),
      description,
      oldPrice,
      price,
      category,
      brand,
      quantity,
      coverImage,
      images,
      size,
      discount: Math.round(((oldPrice - price) / oldPrice) * 100),
      featuredProduct,
      featuredCollection,
      sold,
      ratings,
      totalrating,
    });

    res.status(201).json({
      status: "success",
      product,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: " an error occurred while creating",
    });
    console.log(error.message);
  }
};

// getProductById

export const productById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    res.status(200).json({
      status: "success",
      product,
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: "cannot find a product with this id",
    });
    console.log(error.message);
  }
};

// get all products
export const getAllProducts = async (req, res) => {
  //   console.log(req.query);
  try {
    // (1) filtering
    // destructuring our req.query object
    const queryObj = { ...req.query };

    // fields we want to exclude from our query object
    const excludedField = ["page", "sort", "limit", "fields"];

    // loop through the excluded fields array and delete any
    // excluded field present in our query object
    excludedField.forEach((el) => delete queryObj[el]);

    // stringifying our queryObj in order to perform some advanced filtering
    let queryString = JSON.stringify(queryObj);

    // a regex to replace [gte, gt, lte, lt] with `$gte,$gt,$lte,$lt` in our queryobject
    queryString = queryString.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    // parsing the queryString and using it to filter through our product model
    let query = Product.find(JSON.parse(queryString));
    // (2) sorting
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort("-price");
    }

    // pagination
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    if (req.query.page) {
      const numberOfProducts = await Product.countDocuments();
      if (skip >= numberOfProducts) throw new Error("This page does not exist");
    }
    // assigning filtered products to the product constant and sending the response back to our user.
    const products = await query;
    res.status(200).json({
      status: "success",
      result: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "cannot get products, an error occurred",
    });
  }
};

// update product
export const updateProduct = async (req, res) => {
  try {
    const newProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      status: "success",
      newProduct,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "cannot update product, an error occurred",
    });
    console.log(error.message);
  }
};

// delete product

export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: "success",
      message: "product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error occured",
    });
    console.log(error.message);
  }
};

// search

export const search = async (req, res) => {
  try {
    const searchData = await Product.find({
      $or: [
        { title: { $regex: req.params.key } },
        { brand: { $regex: req.params.key } },
        { category: { $regex: req.params.key } },
        { description: { $regex: req.params.key } },
      ],
    });

    res.status(200).send({
      status: "success",
      result: searchData.length,
      searchData,
    });
  } catch (error) {
    res.status(500).json({
      status: "failed",
      message: "an error occurred",
    });
  }
};
