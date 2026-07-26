import express from 'express';
import jwt from 'jsonwebtoken';
import Organization from '../models/organization.model.js';
import Barber from '../models/barber.model.js';
import Appointment from '../models/appointment.model.js';
import Service from '../models/service.model.js';

const router = express.Router();

router.get('/organization/:orgId', async (req, res) => {
  try {
    const { orgId } = req.params;
    const { date, barberId, serviceId } = req.query;

    const organization = await Organization.findById(orgId);
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const openingTime = organization.openingTime || '10:00';
    const closingTime = organization.closingTime || '20:00';

    let barbers = await Barber.find({ organizationId: orgId, isAvailable: true });

    if (barberId) {
      barbers = barbers.filter(b => b._id.toString() === barberId);
    }

    let serviceDuration = 30;
    if (serviceId) {
      const service = await Service.findById(serviceId);
      if (service) {
        serviceDuration = service.duration || 30;
      }
    }

    const slots = [];
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);

    let currentHour = openHour;
    let currentMin = openMin;

    while (currentHour < closeHour || (currentHour === closeHour && currentMin < closeMin)) {
      const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

      const nextMin = currentMin + serviceDuration;
      const nextHour = currentHour + Math.floor(nextMin / 60);
      const remainingMin = nextMin % 60;

      if (nextHour > closeHour || (nextHour === closeHour && remainingMin > closeMin)) {
        break;
      }

      const slotEnd = `${String(nextHour).padStart(2, '0')}:${String(remainingMin).padStart(2, '0')}`;

      const slotDate = new Date(date || new Date());
      slotDate.setHours(currentHour, currentMin, 0, 0);

      const slotStartDate = new Date(slotDate);
      const slotEndDate = new Date(slotDate);
      slotEndDate.setMinutes(slotEndDate.getMinutes() + serviceDuration);

      const barberAvailabilityPromises = barbers.map(async (barber) => {
        if (barber.workingHours && (barber.workingHours.start || barber.workingHours.end)) {
          const [barberStartHour, barberStartMin] = (barber.workingHours.start || openingTime).split(':').map(Number);
          const [barberEndHour, barberEndMin] = (barber.workingHours.end || closingTime).split(':').map(Number);

          const slotTotalMinutes = currentHour * 60 + currentMin;
          const barberStartMinutes = barberStartHour * 60 + barberStartMin;
          const barberEndMinutes = barberEndHour * 60 + barberEndMin;

          if (slotTotalMinutes < barberStartMinutes || slotTotalMinutes + serviceDuration > barberEndMinutes) {
            return {
              barberId: barber._id,
              barberName: barber.name,
              available: false,
            };
          }
        }

        const existingAppointment = await Appointment.findOne({
          barberId: barber._id,
          date: {
            $gte: new Date(slotStartDate.getFullYear(), slotStartDate.getMonth(), slotStartDate.getDate(), slotStartDate.getHours(), slotStartDate.getMinutes(), 0),
            $lt: new Date(slotEndDate.getFullYear(), slotEndDate.getMonth(), slotEndDate.getDate(), slotEndDate.getHours(), slotEndDate.getMinutes(), 0),
          },
          status: { $nin: ['cancelled', 'rejected', 'no-show'] },
        });

        return {
          barberId: barber._id,
          barberName: barber.name,
          available: !existingAppointment,
        };
      });

      const barberAvailability = await Promise.all(barberAvailabilityPromises);

      slots.push({
        time: slotStart,
        endTime: slotEnd,
        barbers: barberAvailability,
        available: barberAvailability.some(b => b.available),
      });

      currentMin += 30;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }

    res.json({ slots, openingTime, closingTime });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
