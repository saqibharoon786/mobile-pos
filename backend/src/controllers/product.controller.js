import { productService } from "../services/product.service.js";

export const productController = {
  async list(_req, res) {
    res.json(await productService.getAll());
  },

  async get(req, res) {
    res.json(await productService.getByCode(req.params.code));
  },

  async create(req, res) {
    const { product, status } = await productService.save(req.body);
    res.status(status).json(product);
  },

  async update(req, res) {
    res.json(await productService.update(req.params.code, req.body));
  },

  async remove(req, res) {
    await productService.remove(req.params.code);
    res.status(204).send();
  },
};
