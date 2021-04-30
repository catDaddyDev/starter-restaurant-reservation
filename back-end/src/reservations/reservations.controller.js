const service = require("./reservations.services");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// middleware validation
async function isValidId(req, res, next) {
  const id = req.params.reservation_Id;
  const reservation =  await service.read(id);
  if (reservation.length <= 0) {
    return next({ status: 404, message: `${id} not found!`});
  }
  res.locals.reservation = reservation;
  next();
};

async function isValidReservation(req, res, next) {
  if (!req.body.data) return next({ status: 400, message: 'Need more info!'});

  const { reservation_date, reservation_time, people, status } = req.body.data;
  const requiredFields = [
    'first_name',
    'last_name',
    'mobile_number',
    'reservation_date',
    'reservation_time',
    'people',
  ];

  for (const field of requiredFields) {
    if (!req.body.data[field]) {
      return next({ status: 400, message: `${field} is missing.` });
    }
  };

  if (!reservation_date.match(/\d{4}-\d{2}-\d{2}/g)){ 
    return next({
      status: 400,
      message: `reservation_date ${reservation_date} is invalid.`,
    });
  }

  if (typeof people !== 'number') {
    return next({
      status: 400,
      message: `people ${people} is invalid.`,
    });
  }

  if (!reservation_time.match(/[0-9]{2}:[0-9]{2}/g)) {
    return next({
      status: 400,
      message: `reservation_time ${reservation_time} is invalid.`,
    });
  }
    
  if (status === 'seated' || status === 'finished')
    return next({ status: 400, message: `Status can not be ${status}!` });

  res.locals.isValidReservation = req.body.data;
  next();
};

async function isValidDate(req, res, next) {
  let newDate = new Date(
    `${req.body.data.reservation_date} ${req.body.data.reservation_time}`
  );
  const currentDay = new Date();
  if (
    newDate.getDay() === 2 ||
    newDate.valueOf() < currentDay.valueOf()
  )
    return next({
      status: 400,
      message: `This is not a valid date. Must fall in the future or when restaurant isn't closed.`,
    });
  next();
};

async function isValidTime(req, res, next) {
  let time = Number(req.body.data.reservation_time.replace(":", ""));
  if (time < 1030 || time > 2130)
    return next({
      status: 400,
      message: `Reservations can only be set from 10:30 AM to 9:30 PM.`,
    });
  next();
};

async function isValidStatus(req, res, next) {
  const currentStatus = res.locals.reservation[0].status;
  const { status } = req.body.data;

  if (currentStatus === `finished`)
    return next({
      status: 400,
      message: `Reservation has already finished`,
    });

  if (status === `cancelled`) return next();

  if (status !== `booked` && status !== `seated` && status !== `finished`)
    return next({ status: 400, message: `Status unknown` });

  next();
}

/**
 * List handler for reservation resources
 */
async function list(req, res) {
  const { date, mobile_number } = req.query;
  if(mobile_number) {
    const data = await service.listByMobileNumber(mobile_number);
    return res.json({ data: data });
  };
  const data = await service.list(date);

  res.json({ data: data });
};

async function read(req, res) {
  const reservation = res.locals.reservation;
  res.status(200).json({ data: reservation[0] });
};

async function create(req, res) {
  const reservation = res.locals.isValidReservation;
  const newReservation = await service.create(reservation);
  res.status(201).json({ data: newReservation[0] });
};

async function update(req, res) {
  const { reservation_Id } = req.params;
  const data = await service.update(reservation_Id, req.body.data);
  res.status(200).json({
    data: data[0],
  })
}

async function updateStatus(req, res) {
  const { reservation_Id } = req.params;
  const status = req.body.data.status;
  const data = await service.updateStatus(reservation_Id, status);

  res.status(200).json({
    data: { status: data[0] },
  });
}

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(isValidId), asyncErrorBoundary(read)],
  create: [
    asyncErrorBoundary(isValidReservation),
    asyncErrorBoundary(isValidDate),
    asyncErrorBoundary(isValidTime), 
    asyncErrorBoundary(create)],
  update: [
    asyncErrorBoundary(isValidId),
    asyncErrorBoundary(isValidReservation),
    asyncErrorBoundary(isValidDate),
    asyncErrorBoundary(isValidTime),
    asyncErrorBoundary(update)],
  updateStatus: [
    asyncErrorBoundary(isValidId),
    asyncErrorBoundary(isValidStatus),
    asyncErrorBoundary(updateStatus),
  ]
};
