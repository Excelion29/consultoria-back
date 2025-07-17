
import AuthRepository from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/user.repository.js';
class UserService {
 
  constructor() {
    this.userRepository = UserRepository;
    this.authRepository = AuthRepository;
  }

  async create(name, email, dni, roleId) {
    const emailExist = await this.authRepository .findUserByEmail(email);
    if (emailExist) throw new Error("Este correo ya está en uso");

    const dniExist = await this.authRepository .findUserByDNI(dni);
    if (dniExist) throw new Error("Este dni ya está en uso");

    const password = await bcrypt.hash(dni, 10);

    const create = await this.userRepository.saveUser(name, email, dni, password, roleId);
    if (!create) throw new Error("El usuario no se pudo crear");

    return create;
  }

  async all({ name, dni, rol, page = 1, limit = 10 }) {
    return await this.userRepository
      .resetQuery()
      .filterByName(name)
      .filterByDNI(dni)
      .filterByRole(rol)
      .getPaginatedResults(page, limit);
  }
}

export default new UserService();
