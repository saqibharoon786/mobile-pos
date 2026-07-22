import { productRepository } from "../repositories/product.repository.js";
import { AppError } from "../utils/AppError.js";

export const productService = {
  async getAll() {
    return productRepository.findAll();
  },

  async getByCode(code) {
    const product = await productRepository.findByCode(code);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async save(body) {
    const code = body.code?.trim();
    if (!code) throw new AppError("Code required", 400);

    const { product, created } = await productRepository.upsert({
      code,
      company: body.company,
      purchasePrice: body.purchasePrice,
      sellPrice: body.sellPrice,
      stock: body.stock,
    });

    return { product, status: created ? 201 : 200 };
  },

  async update(code, body) {
    const product = await productRepository.update(code, body);
    if (!product) throw new AppError("Product not found", 404);
    return product;
  },

  async remove(code) {
    const deleted = await productRepository.delete(code);
    if (!deleted) throw new AppError("Product not found", 404);
  },
};
