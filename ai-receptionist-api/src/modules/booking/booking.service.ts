import {
  BookingStatus,
  Prisma,
  StaffRole
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError, assertFound } from "../../lib/errors.js";
import {
  addMinutes,
  combineDateAndTime,
  getUtcDayOfWeek
} from "../../utils/dates.js";
import type {
  AvailabilityInput,
  CreateBookingInput,
  UpdateBookingInput
} from "./booking.schemas.js";

const ACTIVE_STATUSES: BookingStatus[] = [
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED
];

async function getService(businessId: string, serviceId: string) {
  return assertFound(
    await prisma.service.findFirst({
      where: { id: serviceId, businessId, isActive: true }
    }),
    "Service not found or inactive"
  );
}

async function getStaff(businessId: string, staffId: string) {
  return assertFound(
    await prisma.staff.findFirst({
      where: { id: staffId, businessId, isActive: true },
      include: { availability: true }
    }),
    "Staff member not found or inactive"
  );
}

async function isSlotFree(
  businessId: string,
  startAt: Date,
  endAt: Date,
  staffId?: string
) {
  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { in: ACTIVE_STATUSES },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(staffId ? { staffId } : {})
    }
  });

  return bookings.length === 0;
}

async function findAvailableStaff(
  businessId: string,
  startAt: Date,
  endAt: Date,
  requestedStaffId?: string
) {
  const staff = requestedStaffId
    ? [await getStaff(businessId, requestedStaffId)]
    : await prisma.staff.findMany({
        where: { businessId, isActive: true },
        include: { availability: true }
      });

  const dayOfWeek = getUtcDayOfWeek(startAt);
  const startMinutes = startAt.getUTCHours() * 60 + startAt.getUTCMinutes();
  const endMinutes = endAt.getUTCHours() * 60 + endAt.getUTCMinutes();

  for (const member of staff) {
    const windows = member.availability.filter(
      (window) => window.isActive && window.dayOfWeek === dayOfWeek
    );

    const insideWorkingHours = windows.some((window) => {
      const [sh = 0, sm = 0] = window.startTime.split(":").map(Number);
      const [eh = 0, em = 0] = window.endTime.split(":").map(Number);
      const windowStart = sh * 60 + sm;
      const windowEnd = eh * 60 + em;
      return startMinutes >= windowStart && endMinutes <= windowEnd;
    });

    if (!insideWorkingHours) continue;

    if (await isSlotFree(businessId, startAt, endAt, member.id)) {
      return member;
    }
  }

  return null;
}

export async function searchServices(businessId: string, query?: string) {
  return prisma.service.findMany({
    where: {
      businessId,
      isActive: true,
      ...(query
        ? {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } }
            ]
          }
        : {})
    },
    orderBy: { name: "asc" }
  });
}

export async function getAvailability(
  businessId: string,
  input: AvailabilityInput
) {
  const service = await getService(businessId, input.serviceId);
  const dayStart = new Date(`${input.date}T00:00:00.000Z`);
  const dayEnd = new Date(`${input.date}T23:59:59.999Z`);

  if (Number.isNaN(dayStart.getTime())) {
    throw new AppError(400, "Invalid date");
  }

  const bookings = await prisma.booking.findMany({
    where: {
      businessId,
      status: { in: ACTIVE_STATUSES },
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
      ...(input.staffId ? { staffId: input.staffId } : {})
    }
  });

  const requestedStaff = input.staffId
    ? await getStaff(businessId, input.staffId)
    : null;

  const staff = requestedStaff
    ? [requestedStaff]
    : await prisma.staff.findMany({
        where: { businessId, isActive: true },
        include: { availability: true }
      });

  const slots: Array<{
    startAt: string;
    endAt: string;
    staff: Array<{ id: string; name: string; role: StaffRole }>;
  }> = [];

  for (let minute = 0; minute < 24 * 60; minute += 30) {
    const hour = Math.floor(minute / 60).toString().padStart(2, "0");
    const min = (minute % 60).toString().padStart(2, "0");
    const startAt = combineDateAndTime(input.date, `${hour}:${min}`);
    const endAt = addMinutes(startAt, service.durationMin);

    if (endAt > dayEnd) continue;

    const availableStaff = staff.filter((member) => {
      const dayOfWeek = getUtcDayOfWeek(startAt);
      const startMinutes = startAt.getUTCHours() * 60 + startAt.getUTCMinutes();
      const endMinutes = endAt.getUTCHours() * 60 + endAt.getUTCMinutes();

      const insideHours = member.availability.some((window) => {
        const [sh = 0, sm = 0] = window.startTime.split(":").map(Number);
        const [eh = 0, em = 0] = window.endTime.split(":").map(Number);
        return (
          window.isActive &&
          window.dayOfWeek === dayOfWeek &&
          startMinutes >= sh * 60 + sm &&
          endMinutes <= eh * 60 + em
        );
      });

      if (!insideHours) return false;

      return !bookings.some((booking) => {
        if (booking.staffId !== member.id) return false;
        return booking.startAt < endAt && booking.endAt > startAt;
      });
    });

    if (availableStaff.length > 0) {
      slots.push({
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        staff: availableStaff.map((member) => ({
          id: member.id,
          name: member.name,
          role: member.role
        }))
      });
    }
  }

  return {
    service: {
      id: service.id,
      name: service.name,
      durationMin: service.durationMin,
      price: service.price?.toString() ?? null
    },
    date: input.date,
    slots
  };
}

export async function createBooking(
  businessId: string,
  input: CreateBookingInput
) {
  const service = await getService(businessId, input.serviceId);
  const startAt = new Date(input.startAt);
  const endAt = addMinutes(startAt, service.durationMin);

  if (startAt <= new Date()) {
    throw new AppError(400, "Booking time must be in the future");
  }

  const staff = await findAvailableStaff(
    businessId,
    startAt,
    endAt,
    input.staffId
  );

  if (!staff) {
    throw new AppError(
      409,
      "No available staff member for that time. Search availability again."
    );
  }

  const customer = await prisma.customer.upsert({
    where: {
      businessId_phone: {
        businessId,
        phone: input.customerPhone
      }
    },
    update: {
      name: input.customerName,
      email: input.customerEmail
    },
    create: {
      businessId,
      name: input.customerName,
      phone: input.customerPhone,
      email: input.customerEmail
    }
  });

  const conflict = await prisma.booking.findFirst({
    where: {
      businessId,
      staffId: staff.id,
      status: { in: ACTIVE_STATUSES },
      startAt: { lt: endAt },
      endAt: { gt: startAt }
    }
  });

  if (conflict) {
    throw new AppError(
      409,
      "That slot was just booked. Please search availability again."
    );
  }

  return prisma.booking.create({
    data: {
      businessId,
      customerId: customer.id,
      serviceId: service.id,
      staffId: staff.id,
      startAt,
      endAt,
      status: BookingStatus.CONFIRMED,
      notes: input.notes,
      source: "AI"
    },
    include: {
      customer: true,
      service: true,
      staff: true
    }
  });
}

export async function getBooking(businessId: string, bookingId: string) {
  return assertFound(
    await prisma.booking.findFirst({
      where: { id: bookingId, businessId },
      include: { customer: true, service: true, staff: true }
    }),
    "Booking not found"
  );
}

export async function listBookings(
  businessId: string,
  date?: string,
  status?: BookingStatus
) {
  let dateFilter: Prisma.BookingWhereInput = {};

  if (date) {
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    dateFilter = { startAt: { gte: start, lte: end } };
  }

  return prisma.booking.findMany({
    where: {
      businessId,
      ...(status ? { status } : {}),
      ...dateFilter
    },
    include: { customer: true, service: true, staff: true },
    orderBy: { startAt: "asc" }
  });
}

export async function updateBooking(
  businessId: string,
  bookingId: string,
  input: UpdateBookingInput
) {
  const booking = await getBooking(businessId, bookingId);

  if (booking.status === BookingStatus.CANCELLED) {
    throw new AppError(400, "Cancelled booking cannot be updated");
  }

  let staffId = input.staffId === undefined ? booking.staffId : input.staffId;
  let startAt = input.startAt ? new Date(input.startAt) : booking.startAt;
  let endAt = addMinutes(startAt, booking.service.durationMin);

  if (input.startAt || input.staffId !== undefined) {
    if (!staffId) {
      const staff = await findAvailableStaff(
        businessId,
        startAt,
        endAt
      );
      staffId = staff?.id ?? null;
    } else {
      const staff = await findAvailableStaff(
        businessId,
        startAt,
        endAt,
        staffId
      );
      if (!staff) {
        throw new AppError(409, "Selected staff member is not available");
      }
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        businessId,
        id: { not: bookingId },
        staffId: staffId ?? undefined,
        status: { in: ACTIVE_STATUSES },
        startAt: { lt: endAt },
        endAt: { gt: startAt }
      }
    });

    if (conflict) {
      throw new AppError(409, "Requested time conflicts with another booking");
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      startAt,
      endAt,
      staffId,
      notes: input.notes,
      status: input.status
    },
    include: { customer: true, service: true, staff: true }
  });
}

export async function cancelBooking(businessId: string, bookingId: string) {
  const booking = await getBooking(businessId, bookingId);

  if (booking.status === BookingStatus.CANCELLED) {
    return booking;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
    include: { customer: true, service: true, staff: true }
  });
}
