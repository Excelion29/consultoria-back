import UserService from "../services/user.service.js";

class UserController {
  userService = UserService;

  createAdmin = async (req, res) => {
    const { name, email, dni } = req.body;
    try {
      const result = await this.userService.createWithRole(
        { name, email, dni },
        "admin"
      );
      res
        .status(200)
        .json({ data: result, message: "Administrador creado correctamente" });
    } catch (err) {
      res.status(400).json({ data: null, message: err.message });
    }
  };

  createPatient = async (req, res) => {
    const { name, email, dni } = req.body;
    try {
      const result = await this.userService.createWithRole(
        { name, email, dni },
        "paciente"
      );
      res
        .status(200)
        .json({ data: result, message: "Paciente creado correctamente" });
    } catch (err) {
      res.status(400).json({ data: null, message: err.message });
    }
  };

  createDoctor = async (req, res) => {
    const { name, email, dni, specialties, availability } = req.body;

    try {
      const result = await this.userService.createDoctor({
        name,
        email,
        dni,
        specialties,
        availability,
      });

      res.status(200).json({
        data: result,
        message:
          "Médico creado correctamente con especialidades y disponibilidad",
      });
    } catch (err) {
      res.status(400).json({
        data: null,
        message: err.message || "Error al registrar médico",
      });
    }
  };

  all = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const filters = req.body.filters || {};
    try {
      const result = await this.userService.all({
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
  };

  listStaff = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const filters = req.body.filters || {};
    try {
      const result = await this.userService.listStaff({
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
        message: "Médicos y administradores listados correctamente",
      });
    } catch (err) {
      res.status(400).json({
        data: null,
        message: err.message || "Error al obtener usuarios",
      });
    }
  };

  listPatients = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const filters = req.body.filters || {};
    try {
      const result = await this.userService.listPatients({
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
        message: "Pacientes listados correctamente",
      });
    } catch (err) {
      res.status(400).json({
        data: null,
        message: err.message || "Error al obtener pacientes",
      });
    }
  };

  getById = async (req, res) => {
    const { id } = req.params;
    const requesterId = req.user.id;
    const requesterRole = req.user.role;

    try {
      if (requesterId !== parseInt(id) && requesterRole !== "admin") {
        return res.status(403).json({
          data: null,
          message: "No autorizado para ver este usuario",
        });
      }

      const user = await this.userService.getById(id);
      if (!user) {
        return res.status(404).json({
          data: null,
          message: "Usuario no encontrado",
        });
      }

      res.status(200).json({
        data: user,
        message: "Usuario obtenido correctamente",
      });
    } catch (err) {
      res.status(500).json({
        data: null,
        message: "Error al obtener usuario",
      });
    }
  };

  updateUser = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const editorId = req.user.id;
    const editorRole = req.user.role;

    try {
      const result = await this.userService.updateUser(
        editorId,
        editorRole,
        id,
        data
      );
      res
        .status(200)
        .json({ data: result, message: "Usuario actualizado correctamente" });
    } catch (err) {
      res.status(403).json({ data: null, message: err.message });
    }
  };

  deleteUser = async (req, res) => {
    try {
      const targetUserId = parseInt(req.params.id);

      const result = await this.userService.deleteUser(
        targetUserId
      );

      return res.json({
        message: "Usuario dado de baja correctamente",
        data: result,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}
export default new UserController();
