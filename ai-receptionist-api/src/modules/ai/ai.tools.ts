import { z } from "zod";
import { tool } from "@langchain/core/tools";
import * as bookingService from "../booking/booking.service.js";
import { getBooking } from "../booking/booking.service.js";
import * as staffService from "../staffs/staff.service.js";

/**
 * Build the full set of LangChain tools for a specific business.
 * Each tool bundles its own schema + executor — no separate switch-case needed.
 */
export function buildTools(businessId: string) {
  // ─── Search Services ────────────────────────────────────────────────────────
  const searchServicesTool = tool(
    async ({ query }) => {
      const result = await bookingService.searchServices(businessId, query);
      return JSON.stringify(result);
    },
    {
      name: "search_services",
      description:
        "Search active services offered by the business. Use this before booking when the customer names a service vaguely.",
      schema: z.object({
        query: z.string().optional().describe("Optional service name or keyword.")
      })
    }
  );

  // ─── Get Availability ────────────────────────────────────────────────────────
  const getAvailabilityTool = tool(
    async ({ serviceId, date, staffId }) => {
      const result = await bookingService.getAvailability(businessId, {
        serviceId,
        date,
        staffId
      });
      return JSON.stringify(result);
    },
    {
      name: "get_availability",
      description:
        "Find real available appointment slots for a service on a specific date. Always use this before creating or changing a booking.",
      schema: z.object({
        serviceId: z.string(),
        date: z.string().describe("Date in YYYY-MM-DD format."),
        staffId: z.string().optional().describe("Optional preferred staff ID.")
      })
    }
  );

  // ─── Create Booking ──────────────────────────────────────────────────────────
  const createBookingTool = tool(
    async ({ serviceId, staffId, customerName, customerPhone, customerEmail, startAt, notes }) => {
      const result = await bookingService.createBooking(businessId, {
        serviceId,
        staffId,
        customerName,
        customerPhone,
        customerEmail,
        startAt,
        notes
      });
      return JSON.stringify(result);
    },
    {
      name: "create_booking",
      description:
        "Create a real booking after the customer has selected an available time and provided their name and phone. Never invent availability.",
      schema: z.object({
        serviceId: z.string(),
        staffId: z.string().optional(),
        customerName: z.string(),
        customerPhone: z.string(),
        customerEmail: z.string().optional(),
        startAt: z.string().describe("ISO-8601 datetime."),
        notes: z.string().optional()
      })
    }
  );

  // ─── Get Booking ─────────────────────────────────────────────────────────────
  const getBookingTool = tool(
    async ({ bookingId }) => {
      const result = await getBooking(businessId, bookingId);
      return JSON.stringify(result);
    },
    {
      name: "get_booking",
      description:
        "Retrieve a booking by booking ID. Use when the customer asks about an existing booking.",
      schema: z.object({
        bookingId: z.string()
      })
    }
  );

  // ─── Update Booking ──────────────────────────────────────────────────────────
  const updateBookingTool = tool(
    async ({ bookingId, startAt, staffId, notes }) => {
      const result = await bookingService.updateBooking(businessId, bookingId, {
        startAt,
        staffId,
        notes
      });
      return JSON.stringify(result);
    },
    {
      name: "update_booking",
      description:
        "Change an existing booking. If changing time or staff, the backend checks availability.",
      schema: z.object({
        bookingId: z.string(),
        startAt: z.string().optional().describe("New ISO-8601 datetime."),
        staffId: z.string().optional(),
        notes: z.string().optional()
      })
    }
  );

  // ─── Cancel Booking ──────────────────────────────────────────────────────────
  const cancelBookingTool = tool(
    async ({ bookingId }) => {
      const result = await bookingService.cancelBooking(businessId, bookingId);
      return JSON.stringify(result);
    },
    {
      name: "cancel_booking",
      description:
        "Cancel an existing booking. Confirm the booking ID and cancellation intent before using it.",
      schema: z.object({
        bookingId: z.string()
      })
    }
  );

  // ─── Search Staff ─────────────────────────────────────────────────────────────
  const searchStaffTool = tool(
    async ({ name, role }) => {
      const allStaff = await staffService.listStaff(businessId, {
        isActive: true,
        ...(role ? { role: role as any } : {})
      });
      if (!name) return JSON.stringify(allStaff);
      const needle = name.toLowerCase();
      return JSON.stringify(allStaff.filter((s) => s.name.toLowerCase().includes(needle)));
    },
    {
      name: "search_staff",
      description:
        "Search active staff members by name or role. Use this when the customer mentions a staff member by name so you can resolve their ID for availability checks and booking.",
      schema: z.object({
        name: z.string().optional().describe("Optional partial name to search for."),
        role: z
          .string()
          .optional()
          .describe("Optional staff role to filter by (e.g. GENERAL, MANAGER).")
      })
    }
  );

  // ─── Get Staff Availability ──────────────────────────────────────────────────
  const getStaffAvailabilityTool = tool(
    async ({ staffId }) => {
      const DAY_NAMES = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ];
      const member = await staffService.getStaff(staffId, businessId);
      return JSON.stringify({
        id: member.id,
        name: member.name,
        role: member.role,
        isActive: member.isActive,
        weeklySchedule: member.availability
          .filter((a) => a.isActive)
          .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
          .map((a) => ({
            day: DAY_NAMES[a.dayOfWeek] ?? a.dayOfWeek,
            dayOfWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime
          }))
      });
    },
    {
      name: "get_staff_availability",
      description:
        "Get a specific staff member's weekly working schedule (days and hours). Use this to answer questions like 'When does [staff] work?' or 'Is [staff] available on weekends?' before checking slot-level availability.",
      schema: z.object({
        staffId: z.string().describe("The ID of the staff member.")
      })
    }
  );

  // ─── List Bookings ────────────────────────────────────────────────────────────
  const listBookingsTool = tool(
    async ({ date, status }) => {
      const result = await bookingService.listBookings(businessId, date, status as any);
      return JSON.stringify(result);
    },
    {
      name: "list_bookings",
      description:
        "List existing bookings for a date or by status. Use this to check the schedule, confirm a customer's existing bookings, or answer 'what appointments are today?'.",
      schema: z.object({
        date: z
          .string()
          .optional()
          .describe("Optional date in YYYY-MM-DD format to filter bookings."),
        status: z
          .enum(["PENDING", "CONFIRMED", "CANCELLED"])
          .optional()
          .describe("Optional booking status filter: PENDING, CONFIRMED, or CANCELLED.")
      })
    }
  );

  return [
    searchServicesTool,
    getAvailabilityTool,
    createBookingTool,
    getBookingTool,
    updateBookingTool,
    cancelBookingTool,
    searchStaffTool,
    getStaffAvailabilityTool,
    listBookingsTool
  ];
}
