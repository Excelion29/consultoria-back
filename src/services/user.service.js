import AuthRepository from "../repositories/auth.repository.js";
import bcrypt from "bcrypt";
import UserRepository from "../repositories/user.repository.js";

class UserService {
  constructor() {
    this.userRepository = UserRepository;
    this.authRepository = AuthRepository;
  }

  async createWithRole({ name, email, dni }, roleName) {
    const roleId = await this.authRepository.getRoleIdByName(roleName);
    const password = await bcrypt.hash(dni, 10);

    const emailExist = await this.authRepository.findUserByEmail(email);
    if (emailExist) throw new Error("Este correo ya está en uso");

    const dniExist = await this.authRepository.findUserByDNI(dni);
    if (dniExist) throw new Error("Este DNI ya está en uso");

    const created = await this.userRepository.saveUser(
      name,
      email,
      dni,
      password,
      roleId
    );
    if (!created) throw new Error("El usuario no se pudo crear");

    return created;
  }

  async createDoctor({
    name,
    email,
    dni,
    specialties = [],
    availability = [],
  }) {
    const roleId = await this.authRepository.getRoleIdByName("medico");

    const emailExist = await this.authRepository.findUserByEmail(email);
    if (emailExist) throw new Error("Este correo ya está en uso");

    const dniExist = await this.authRepository.findUserByDNI(dni);
    if (dniExist) throw new Error("Este DNI ya está en uso");

    const password = await bcrypt.hash(dni, 10);
    const created = await this.userRepository.saveUser(
      name,
      email,
      dni,
      password,
      roleId
    );
    if (!created) throw new Error("El usuario no se pudo crear");

    const doctorId = created.id;

    await this.userRepository.syncSpecialties(doctorId, specialties);
    await this.userRepository.syncAvailability(doctorId, availability);

    return created;
  }

  async all({ name, dni, rol, page = 1, limit = 10 }) {
    return await this.userRepository
      .resetQuery()
      .filterByName(name)
      .filterByDNI(dni)
      .filterByRole(rol)
      .getPaginatedResults(page, limit);
  }

  async listStaff({ name, dni, page = 1, limit = 10 }) {
    return await this.all({ name, dni, rol: ["admin", "medico"], page, limit });
  }

  async listPatients({ name, dni, page = 1, limit = 10 }) {
    return await this.all({ name, dni, rol: ["paciente"], page, limit });
  }

  async getById(userId) {
    return await this.userRepository.findById(userId);
  }

  async updateUser(editorId, editorRole, targetUserId, data) {
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) throw new Error("Usuario no encontrado");

    const isSelf = editorId == targetUserId;

    if (editorRole === "admin") {
      if (targetUser.role === "medico") {
        const { specialties = [], availability = [], ...rest } = data;
        await this.userRepository.syncSpecialties(targetUserId, specialties);
        await this.userRepository.syncAvailability(targetUserId, availability);
        return await this.userRepository.updateUser(targetUserId, rest);
      }

      return await this.userRepository.updateUser(targetUserId, data);
    }

    
    if (editorRole === "medico" || editorRole === "paciente") {
      if (!isSelf) throw new Error("No puede editar a otros usuarios");

      const allowedFields = ["name", "email"];
      const filteredData = Object.fromEntries(
        Object.entries(data).filter(([key]) => allowedFields.includes(key))
      );

      return await this.userRepository.updateUser(targetUserId, filteredData);
    }

    throw new Error("Rol no autorizado para editar usuarios");
  }

  async deleteUser(targetUserId) {
    const targetUser = await this.userRepository.findById(targetUserId);
    if (!targetUser) throw new Error("Usuario no encontrado");

    return await this.userRepository.softDeleteUser(targetUserId);
  }

}

export default new UserService();
