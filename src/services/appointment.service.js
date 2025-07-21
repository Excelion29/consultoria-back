// services/appointment.service.js
import AppointmentRepository from "../repositories/appointment.repository.js";
import AuthRepository from "../repositories/auth.repository.js";
import UserRepository from "../repositories/user.repository.js";
import { addMinutesToTimeString, getTodayDate } from "../utils/time.js";
import bcrypt from "bcrypt";

class AppointmentService {
  constructor() {
    this.appointmentRepository = AppointmentRepository;
    this.authRepository = AuthRepository;
    this.userRepository = UserRepository;
  }

  async validatePatient(body, user) {
    const {
      doctor_id,
      appointment_date,
      appointment_time,
      reason,
      patient_dni,
      patient_name,
    } = body;

    const createdByUserId = user.id;
    let patientId = user.id;

    if (user.role === "admin") {
      if (!patient_dni || !patient_name)
        throw new Error("Faltan datos del paciente");

      let patient = await this.authRepository.findUserByDNI(patient_dni);

      if (!patient) {
        const roleId = await this.authRepository.getRoleIdByName("paciente");
        const hashedPassword = await bcrypt.hash(patient_dni, 10);

        patient = await this.userRepository.saveUser(
          patient_name,
          null,
          patient_dni,
          hashedPassword,
          roleId
        );
      }

      patientId = patient.id;
    }

    return await this.createAppointment({
      patientId,
      doctorId: doctor_id,
      appointmentDate: appointment_date,
      appointmentTime: appointment_time,
      reason,
      createdByUserId,
    });
  }

  async createAppointment({
    patientId,
    doctorId,
    appointmentDate,
    appointmentTime,
    reason,
    createdByUserId,
  }) {
    const exists = await this.appointmentRepository.checkDoctorExists(doctorId);
    if (!exists) throw new Error("El médico no existe o fue eliminado");

    const weekday = new Date(appointmentDate).getDay() + 1;

    const isAvailable =
      await this.appointmentRepository.checkDoctorAvailability(
        doctorId,
        weekday,
        appointmentTime
      );

    if (!isAvailable)
      throw new Error(
        "La hora seleccionada no está dentro de la disponibilidad del médico"
      );

    const endTime = addMinutesToTimeString(appointmentTime, 30);

    const conflict =
      await this.appointmentRepository.checkOverlappingWithDuration(
        doctorId,
        appointmentDate,
        appointmentTime,
        endTime
      );
    if (conflict)
      throw new Error("El médico ya tiene una cita en ese rango de tiempo");

    const appointmentId = await this.appointmentRepository.createAppointment({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      reason,
    });

    await this.appointmentRepository.addHistory({
      appointmentId,
      changedBy: createdByUserId,
      status: "pendiente",
      comment: reason,
    });

    return { appointmentId };
  }

  async getUserAppointments({ userId, role, filters, page = 1, limit = 10 }) {
    const repo = this.appointmentRepository.resetQuery();

    if (filters?.status) repo.filterByStatus(filters.status);
    if (filters?.doctorName) repo.filterByDoctorName(filters.doctorName);
    if (filters?.date) repo.filterByDate(filters.date);
    else repo.filterByDate(getTodayDate());
    if (filters?.time) repo.filterByTime(filters.time);

    repo.filterByUserRole(role, userId);

    return await repo.getPaginatedResults(page, limit);
  }

  async getAppointmentDetail(appointmentId, userId, role) {
    const appointment = await this.appointmentRepository.getAppointmentById(
      appointmentId
    );
    if (!appointment) throw new Error("La cita no existe");

    if (role === "paciente" && appointment.patient_id !== userId)
      throw new Error("No tienes acceso a esta cita");

    if (role === "medico" && appointment.doctor_id !== userId)
      throw new Error("No tienes acceso a esta cita");

    return appointment;
  }

  async cancelAppointment({ appointmentId, userId, role, comment }) {
    const appointment = await this.appointmentRepository.getAppointmentById(
      appointmentId
    );
    if (!appointment) throw new Error("La cita no existe");

    if (appointment.status === "cancelada")
      throw new Error("La cita ya fue cancelada");

    if (appointment.status === "completada")
      throw new Error("No se puede cancelar una cita completada");

    if (role === "medico" && appointment.doctor_id !== userId)
      throw new Error("No puedes cancelar una cita que no te pertenece");

    if (!["admin", "medico"].includes(role))
      throw new Error("No tienes permiso para cancelar citas");

    await this.appointmentRepository.updateAppointmentStatus(
      appointmentId,
      "cancelada",
      comment
    );

    await this.appointmentRepository.addHistory({
      appointmentId,
      changedBy: userId,
      status: "cancelada",
      comment,
    });

    return { success: true };
  }

  async rescheduleAppointment({
    appointmentId,
    newDate,
    newTime,
    newDoctorId,
    reason,
    adminId,
  }) {
    const appointment = await this.appointmentRepository.getAppointmentById(
      appointmentId
    );
    if (!appointment) throw new Error("La cita no existe");

    if (["cancelada", "completada"].includes(appointment.status)) {
      throw new Error(
        "No se puede reprogramar una cita completada o cancelada"
      );
    }

    const doctorId = newDoctorId || appointment.doctor_id;
    const weekday = new Date(newDate).getDay()+1;

    const exists = await this.appointmentRepository.checkDoctorExists(doctorId);
    if (!exists) throw new Error("El médico seleccionado no existe");

    const isAvailable =
      await this.appointmentRepository.checkDoctorAvailability(
        doctorId,
        weekday,
        newTime
      );
    if (!isAvailable)
      throw new Error(
        "La hora seleccionada no está dentro de la disponibilidad del médico"
      );

    const endTime = addMinutesToTimeString(newTime, 30);

    const conflict =
      await this.appointmentRepository.checkOverlappingWithDuration(
        doctorId,
        newDate,
        newTime,
        endTime
      );
    if (conflict)
      throw new Error("El médico ya tiene una cita en ese rango de tiempo");

    await this.appointmentRepository.rescheduleAppointment({
      appointmentId,
      newDate,
      newTime,
      reason,
      newDoctorId: doctorId,
    });

    await this.appointmentRepository.addHistory({
      appointmentId,
      changedBy: adminId,
      status: "reprogramada",
      comment: `Reprogramada para el ${newDate} a las ${newTime} con doctor ID ${doctorId}`,
    });

    return { success: true };
  }
}

export default new AppointmentService();
