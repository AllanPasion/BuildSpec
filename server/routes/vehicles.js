const express = require('express');
const prisma = require('../db');
const { requireOwner } = require('../auth');

const router = express.Router();
const vehicleFields = ['make', 'model', 'year', 'variant', 'engine', 'transmission', 'color', 'nickname', 'imageUrl', 'finalImageUrl'];

function sanitizeVehicle(body) {
  return vehicleFields.reduce((vehicle, field) => {
    vehicle[field] = field === 'year' ? Number(body[field]) : String(body[field] || '').trim();
    return vehicle;
  }, {});
}

function validateVehicle(vehicle) {
  if (!vehicle.make || !vehicle.model || !vehicle.year) return 'Make, model, and year are required.';
  if (!Number.isInteger(vehicle.year) || vehicle.year < 1886 || vehicle.year > new Date().getFullYear() + 1) return 'Enter a valid vehicle year.';
  return null;
}

function withSummary(vehicle) {
  const modifications = vehicle.modifications || [];
  const { modifications: omitted, ...details } = vehicle;
  void omitted;
  const installedCount = modifications.filter((item) => item.status === 'INSTALLED').length;
  const completionEligible = modifications.length > 0 && installedCount === modifications.length && Boolean(vehicle.finalImageUrl);
  const completedAt = completionEligible ? modifications.reduce((latest, item) => item.installDate > latest ? item.installDate : latest, '') : null;
  return {
    ...details,
    modificationCount: modifications.length,
    plannedCount: modifications.filter((item) => item.status === 'PLANNED').length,
    purchasedCount: modifications.filter((item) => item.status === 'PURCHASED').length,
    installedCount,
    currentCost: modifications.filter((item) => item.status !== 'PLANNED').reduce((sum, item) => sum + item.price, 0),
    projectedCost: modifications.reduce((sum, item) => sum + item.price, 0),
    completionEligible,
    completedAt,
    showcasePublished: Boolean(vehicle.showcasePublished && completionEligible),
  };
}

router.get('/showcase/published', async (request, response, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { showcasePublished: true },
      include: { modifications: { orderBy: { installDate: 'asc' } } },
      orderBy: { showcasedAt: 'desc' },
    });
    return response.json(vehicles.map(withSummary).filter((vehicle) => vehicle.showcasePublished));
  } catch (error) { return next(error); }
});

router.use(requireOwner);

router.get('/', async (request, response, next) => {
  try {
    const vehicles = await prisma.vehicle.findMany({ include: { modifications: true }, orderBy: { createdAt: 'asc' } });
    response.json(vehicles.map(withSummary));
  } catch (error) { next(error); }
});

router.get('/:id', async (request, response, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: request.params.id }, include: { modifications: { orderBy: { createdAt: 'asc' } } } });
    if (!vehicle) return response.status(404).json({ error: 'Vehicle not found.' });
    const modifications = vehicle.modifications;
    return response.json({ vehicle: withSummary(vehicle), modifications });
  } catch (error) { return next(error); }
});

router.post('/', async (request, response, next) => {
  const vehicle = sanitizeVehicle(request.body);
  const error = validateVehicle(vehicle);
  if (error) return response.status(400).json({ error });
  try { return response.status(201).json(await prisma.vehicle.create({ data: vehicle })); }
  catch (databaseError) { return next(databaseError); }
});

router.put('/:id', async (request, response, next) => {
  const vehicle = sanitizeVehicle(request.body);
  const error = validateVehicle(vehicle);
  if (error) return response.status(400).json({ error });
  try {
    const exists = await prisma.vehicle.findUnique({ where: { id: request.params.id }, select: { id: true, finalImageUrl: true, showcasePublished: true } });
    if (!exists) return response.status(404).json({ error: 'Vehicle not found.' });
    const finalPhotoChanged = exists.finalImageUrl !== vehicle.finalImageUrl;
    return response.json(await prisma.vehicle.update({ where: { id: request.params.id }, data: { ...vehicle, ...(finalPhotoChanged && exists.showcasePublished ? { showcasePublished: false, showcasedAt: null } : {}) } }));
  } catch (databaseError) { return next(databaseError); }
});

router.patch('/:id/showcase', async (request, response, next) => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: request.params.id }, include: { modifications: true } });
    if (!vehicle) return response.status(404).json({ error: 'Vehicle not found.' });
    const publish = request.body?.published === true;
    const summary = withSummary(vehicle);
    if (publish && !summary.completionEligible) {
      return response.status(400).json({ error: 'Install every tracked modification and add a final build photo before publishing.' });
    }
    const updated = await prisma.vehicle.update({
      where: { id: request.params.id },
      data: { showcasePublished: publish, showcasedAt: publish ? new Date() : null },
      include: { modifications: true },
    });
    return response.json(withSummary(updated));
  } catch (error) { return next(error); }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const exists = await prisma.vehicle.findUnique({ where: { id: request.params.id }, select: { id: true } });
    if (!exists) return response.status(404).json({ error: 'Vehicle not found.' });
    await prisma.vehicle.delete({ where: { id: request.params.id } });
    return response.status(204).send();
  } catch (error) { return next(error); }
});

module.exports = router;
