import AppointmentService from "../services/appointment.service.js";

class AppointmentController {
  appointmentService = AppointmentService;

  create = async (req, res) => {
    try {
      const result = await this.appointmentService.validatePatient(
        req.body,
        req.user
      );

      return res.status(201).json({
        data: result,
        message: "Cita creada correctamente",
      });
    } catch (error) {
      return res.status(400).json({
        data: null,
        message: error.message,
      });
    }
  };

  rescheduleAppointment = async (req, res) => {
    try {
      const { id } = req.params;
      const { new_date, new_time, reason, new_doctor_id } = req.body;

      const result = await AppointmentService.rescheduleAppointment({
        appointmentId: parseInt(id),
        newDate: new_date,
        newTime: new_time,
        newDoctorId: new_doctor_id,
        reason,
        adminId: req.user.id,
      });
      res
        .status(200)
        .json({ data: result, message: "Cita reprogramada correctamente" });
    } catch (error) {
      res.status(400).json({ data: null, message: error.message });
    }
  };

  listMyAppointments = async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const filters = req.body.filters || {};
      const result = await AppointmentService.getUserAppointments({
        userId: req.user.id,
        role: req.user.role,
        ...filters,
        page,
        limit,
      });

      res.status(200).json({ data: result, message: "Citas recuperadas" });
    } catch (error) {
      res.status(400).json({ data: null, message: error.message });
    }
  };

  getAppointmentDetail = async (req, res) => {
    try {
      const { id } = req.params;
      const appointment = await AppointmentService.getAppointmentDetail(
        parseInt(id),
        req.user.id,
        req.user.role
      );

      res
        .status(200)
        .json({ data: appointment, message: "Detalle de cita obtenido" });
    } catch (error) {
      res.status(400).json({ data: null, message: error.message });
    }
  };

  cancelAppointment = async (req, res) => {
    try {
      const { id } = req.params;
      const { comment } = req.body;

      const result = await AppointmentService.cancelAppointment({
        appointmentId: parseInt(id),
        userId: req.user.id,
        role: req.user.role,
        comment,
      });

      res
        .status(200)
        .json({ data: result, message: "Cita cancelada correctamente" });
    } catch (error) {
      res.status(400).json({ data: null, message: error.message });
    }
  };
}

export default new AppointmentController();
