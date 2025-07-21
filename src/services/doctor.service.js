import dayjs from "dayjs";
import DoctorRepository from "../repositories/doctor.repository.js";

class DoctorService {

  constructor() {
    this.doctorRepository = DoctorRepository;
  }

  async findAvailableDoctors(start_datetime, end_datetime) {
    const start = dayjs(start_datetime);
    const end = dayjs(end_datetime);

    const weekday = start.day();
    const startTime = start.format('HH:mm:ss');
    const endTime = end.format('HH:mm:ss');

    return await this.doctorRepository.findDoctorsByTimeRange(
      weekday,
      startTime,
      endTime
    );
  }
  
}

export default new DoctorService();
