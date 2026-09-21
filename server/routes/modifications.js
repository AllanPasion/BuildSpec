const express = require('express');
const prisma = require('../db');

const router = express.Router();
const fields = ['vehicleId', 'name', 'category', 'brand', 'price', 'status', 'purchaseDate', 'installDate', 'installer', 'installImageUrl', 'notes'];
const statuses = ['PLANNED', 'PURCHASED', 'INSTALLED'];

function sanitize(body) {
  return fields.reduce((modification, field) => {
    modification[field] = field === 'price' ? Number(body[field]) : String(body[field] || '').trim();
    return modification;
  }, {});
}

async function validate(modification) {
  if (!modification.vehicleId || !(await prisma.vehicle.findUnique({ where: { id: modification.vehicleId }, select: { id: true } }))) return 'Select a valid vehicle.';
  if (!modification.name || !modification.category) return 'Name and category are required.';
  if (!Number.isFinite(modification.price) || modification.price < 0) return 'Price must be zero or greater.';
  if (!statuses.includes(modification.status)) return 'Select a valid status.';
  if (modification.status === 'INSTALLED' && !modification.installDate) return 'Install date is required for installed modifications.';
  if (modification.installDate && modification.installDate > new Date().toISOString().slice(0, 10)) return 'Install date cannot be in the future.';
  return null;
}

router.get('/:id', async (request, response, next) => {
  try {
    const modification = await prisma.modification.findUnique({ where: { id: request.params.id } });
    if (!modification) return response.status(404).json({ error: 'Modification not found.' });
    return response.json(modification);
  } catch (error) { return next(error); }
});

router.post('/', async (request, response, next) => {
  const modification = sanitize(request.body);
  try {
    const error = await validate(modification);
    if (error) return response.status(400).json({ error });
    const created = await prisma.$transaction(async (transaction) => {
      const result = await transaction.modification.create({ data: modification });
      await transaction.vehicle.update({ where: { id: modification.vehicleId }, data: { showcasePublished: false, showcasedAt: null } });
      return result;
    });
    return response.status(201).json(created);
  } catch (error) { return next(error); }
});

router.put('/:id', async (request, response, next) => {
  const modification = sanitize(request.body);
  try {
    const error = await validate(modification);
    if (error) return response.status(400).json({ error });
    const exists = await prisma.modification.findUnique({ where: { id: request.params.id }, select: { id: true, vehicleId: true } });
    if (!exists) return response.status(404).json({ error: 'Modification not found.' });
    const updated = await prisma.$transaction(async (transaction) => {
      const result = await transaction.modification.update({ where: { id: request.params.id }, data: modification });
      await transaction.vehicle.updateMany({ where: { id: exists.vehicleId, showcasePublished: true }, data: { showcasePublished: false, showcasedAt: null } });
      return result;
    });
    return response.json(updated);
  } catch (error) { return next(error); }
});

router.delete('/:id', async (request, response, next) => {
  try {
    const exists = await prisma.modification.findUnique({ where: { id: request.params.id }, select: { id: true, vehicleId: true } });
    if (!exists) return response.status(404).json({ error: 'Modification not found.' });
    await prisma.$transaction([
      prisma.modification.delete({ where: { id: request.params.id } }),
      prisma.vehicle.updateMany({ where: { id: exists.vehicleId, showcasePublished: true }, data: { showcasePublished: false, showcasedAt: null } }),
    ]);
    return response.status(204).send();
  } catch (error) { return next(error); }
});

module.exports = router;
