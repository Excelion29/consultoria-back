import * as userService from "../services/user.service.js";

export async function create(req, res) {
  const { name, email, dni, roleId } = req.body;

  try {
    const result = await userService.create(name, email, dni, roleId);
    res.status(200).json({
      data: result,
      message: "Usuario creado",
    });
  } catch (err) {
    res.status(401).json({
      data: null,
      message: err.message || "Data inválida",
    });
  }
}

export async function all(req, res) {
  const { page = 1, limit = 10 } = req.query;
  const filters = req.body.filters || {};

  try {
    const result = await userService.all({
      ...filters,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.status(200).json({
      data: result.data,
      pagination: {
        total: result.total,
        currentPage: result.page,
        perPage: result.limit,
        lastPage: result.lastPage,
      },
      message: "Usuarios listados correctamente",
    });
  } catch (err) {
    res.status(401).json({
      data: null,
      message: err.message || "Data inválida",
    });
  }
}
