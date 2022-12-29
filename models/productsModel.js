import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
        type: Number,
    },
    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    coverImage: {
      type: String,
      required: true,
    },
    images: [],
    size: ["string"],
    featuredProduct: {
      type: Boolean,
      default: false,
    },
    featuredCollection: {
      type: Boolean,
      default: false,
    },
    ratings: [
      {
        star: Number,
        comment: String,
        postedby: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    totalrating: {
      type: String,
      default: 0,
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
