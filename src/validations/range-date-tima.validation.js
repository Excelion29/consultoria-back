export const validateAvailabilityRange = (req, res, next) => {
  const availability = req.body.availability;
  
  if (Array.isArray(availability)) {
    for (const [i, slot] of availability.entries()) {
      const { start_time, end_time } = slot || {};
      if (start_time && end_time && start_time >= end_time) {
        return res.status(400).json({
          errors: [
            {
              msg: `El horario de disponibilidad en el índice ${i} es inválido: la hora de inicio debe ser menor que la de fin.`,
              param: `availability[${i}]`,
              location: 'body'
            }
          ]
        });
      }
    }
  }

  next();
};

export const validateDatetimeRange = (req, res, next) => {
  const { start_time, end_time } = req.body;

  if (new Date(end_time) <= new Date(start_time)) {
    return res.status(400).json({
      data: null,
      message: 'La fecha y hora de fin debe ser posterior a la de inicio',
    });
  }

  next();
};