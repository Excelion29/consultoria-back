import DoctorService from "../services/doctor.service.js";

class DoctorController {
  doctorService = DoctorService;

  getAvailableDoctors = async (req, res) => {
    try {
      const { start_time, end_time } = req.body;

      const doctors = await this.doctorService.findAvailableDoctors(
        start_time,
        end_time
      );
      return res.json({
        message: "Doctores disponibles obtenidos correctamente",
        data: doctors,
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

export default new DoctorController();
