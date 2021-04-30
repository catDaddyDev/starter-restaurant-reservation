const service = require("./tables.services");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationService = require("../reservations/reservations.services");

// middleware functions

async function isValidId(req, res, next) {
  const { table_id } = req.params;
  const data = await service.read(table_id);
  if(!data.length) {
    return next({ status: 404, message: `Table ${table_id} cannot be found.`});
  }
  res.locals.table = data;
  next();
};

async function isValidTable(req, res, next) {
  const table = req.body.data;
  if(!table) {
    return next({
      status: 400,
      message: `Table is missing.`
    });
  };
  if(table.capacity < 1 || !table.capacity) {
    return next({
      status: 400,
      message: `Table capacity must be able to seat at least one guest.`
    });
  };
  if(!table.table_name || table.table_name.length < 2) {
    return next({
      status: 400,
      message: `Please enter a valid table_name.`
    });
  };
  next();
};

async function isValidUpdate(req, res, next) {
  if (!req.body.data || !req.body.data.reservation_id) {
    return next({ status: 400, message: 'Please provide a reservation_id.' });
  }

  const reservation = await reservationService.read(req.body.data.reservation_id);
  if (!reservation.length) {
    return next({ status: 404, message: `${req.body.data.reservation_id} cannot be found.` });
  };
  if (reservation[0].status === 'seated') {
    return next({ status: 400, message: 'Party is already seated' });
  };
  res.locals.reservation = reservation[0];
  next();
};

async function isValidCapacity(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(table_id);
  const reservation = res.locals.reservation;

  if (table[0].capacity < reservation.people)
    return next({ status: 400, message: `This table cannot seat this party due to seat capacity.` });

  if (table[0].occupied)
    return next({ status: 400, message: `${table.table_name} is currently occupied.` });

  next();
};

async function isValidComplete(req, res, next) {
  const { table_id } = req.params;
  const table = await service.read(Number(table_id));
  if (table.length <= 0) {
    return next({ 
      status: 400,
      message: `${table_id} cannot be found.`
    });
  };
  if (!table[0].reservation_id) {
    return next({
      status: 400,
      message: `${table_id} is not occupied.`
    });
  };
  next();
};

// CRUD functions

async function list(req, res) {
  const tables = await service.list();
  res.json({ data: tables });
};

async function read(req, res) {
  res.json({
    data: res.locals.table
  });
};

async function create(req, res) {
  const table = req.body.data;
  const newTable = await service.create(table);
  res.status(201).json({ data: newTable[0] });
};

async function update(req, res, next) {
  const table_id = req.params.table_id;
  const reservation_id = req.body.data.reservation_id;
  let update;
  try {
    update = await service.update(table_id, reservation_id);
    await reservationService.updateStatus(reservation_id, 'seated');
  } catch (error) {
    next(error);
  }
  res.status(200).json({ data: update });
};

async function complete(req, res) {
  const { table_id } = req.params;
  const lookup = await service.read(table_id);
  const update = await service.complete(table_id);

  await reservationService.updateStatus(lookup[0].reservation_id, 'finished');
  res.status(200).json({ data: update });
};

module.exports = {
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(isValidId), asyncErrorBoundary(read)],
  create: [asyncErrorBoundary(isValidTable), asyncErrorBoundary(create)],
  update: [asyncErrorBoundary(isValidUpdate), asyncErrorBoundary(isValidCapacity), asyncErrorBoundary(update)],
  delete: [asyncErrorBoundary(isValidId), asyncErrorBoundary(isValidComplete), asyncErrorBoundary(complete)]
}