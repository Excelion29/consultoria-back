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
    if (dniExist) throw new Error("Este dni ya está en uso");

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
    if (dniExist) throw new Error("Este dni ya está en uso");

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

    for (const specialtyId of specialties) {
      await this.userRepository.attachSpecialtyToDoctor(doctorId, specialtyId);
    }

    for (const slot of availability) {
      const { weekday, start_time, end_time } = slot;
      await this.userRepository.saveAvailability(
        doctorId,
        weekday,
        start_time,
        end_time
      );
    }

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
}

export default new UserService();
