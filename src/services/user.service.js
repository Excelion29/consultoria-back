import {
    findUserByEmail,
    findUserByDNI
} from '../repositories/auth.repository.js';
import bcrypt from 'bcrypt';
import UserRepository from '../repositories/user.repository.js';

export async function create(name, email, dni, roleId){
    const emailExist = await findUserByEmail(email);
    if (emailExist) throw new Error("Este correo ya está en uso");

    const dniExist = await findUserByDNI(dni);
    if (dniExist) throw new Error("Este dni ya está en uso");

    const password = await bcrypt.hash(dni,10);

    const create = await UserRepository.saveUser(name, email, dni, password, roleId); 
    if (!create) throw new Error('El usuario no se pudo crear');
    
    return create;  
}

export async function all({ name, dni, rol, page = 1, limit = 10 }) {
  const result = await UserRepository
    .resetQuery()
    .filterByName(name)
    .filterByDNI(dni)
    .filterByRole(rol)
    .getPaginatedResults(page, limit);

  return result;
}