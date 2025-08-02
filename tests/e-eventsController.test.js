const eventController = require("../Controllers/eventController");
const eventModel = require("../Models/eventModel");
const notification = require("../Services/notificationEngine");

jest.mock("../Models/eventModel");
jest.mock("../Services/notificationEngine");

// Reusable mock response object
function mockRes() {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
}

describe("eventController", () => {
    let req, res;

    beforeEach(() => {
        req = {};
        res = mockRes();
        jest.clearAllMocks();
    });

    describe("getEventRegisteredByID", () => {
        it("should return event if found", async () => {
            req.user = { id: 1 };
            const event = { id: 1, name: "Test Event" };
            eventModel.getEventRegisteredByID.mockResolvedValue(event);

            await eventController.getEventRegisteredByID(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(event);
        });

        it("should return 404 if event not found", async () => {
            req.user = { id: 1 };
            eventModel.getEventRegisteredByID.mockResolvedValue(null);

            await eventController.getEventRegisteredByID(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
        });

        it("should handle errors", async () => {
            req.user = { id: 1 };
            eventModel.getEventRegisteredByID.mockRejectedValue(new Error("DB error"));

            await eventController.getEventRegisteredByID(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("getEventDetailsByID", () => {
        it("should return event details if found", async () => {
            req.params = { id: 2 };
            const event = { id: 2, name: "Event 2" };
            eventModel.getEventDetailsByID.mockResolvedValue(event);

            await eventController.getEventDetailsByID(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(event);
        });

        it("should return 404 if not found", async () => {
            req.params = { id: 2 };
            eventModel.getEventDetailsByID.mockResolvedValue(null);

            await eventController.getEventDetailsByID(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "Event not found" });
        });

        it("should handle errors", async () => {
            req.params = { id: 2 };
            eventModel.getEventDetailsByID.mockRejectedValue(new Error("DB error"));

            await eventController.getEventDetailsByID(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("getAllEvents", () => {
        it("should return all events", async () => {
            const events = [{ id: 1 }, { id: 2 }];
            eventModel.getAllEvents.mockResolvedValue(events);

            await eventController.getAllEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(events);
        });

        it("should return 404 if no events found", async () => {
            eventModel.getAllEvents.mockResolvedValue([]);

            await eventController.getAllEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "No events found" });
        });

        it("should handle errors", async () => {
            eventModel.getAllEvents.mockRejectedValue(new Error("DB error"));

            await eventController.getAllEvents(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("registerEvent", () => {
        beforeEach(() => {
            req.params = { event_id: 3 };
            req.user = { id: 10 };
        });

        it("should register successfully", async () => {
            eventModel.registerEvent.mockResolvedValue(true);

            await eventController.registerEvent(req, res);

            expect(eventModel.registerEvent).toHaveBeenCalledWith(10, 3);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Successfully registered for the event" });
        });

        it("should return 409 if already registered", async () => {
            eventModel.registerEvent.mockResolvedValue(false);

            await eventController.registerEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ message: "Already registered for this event" });
        });

        it("should handle errors", async () => {
            eventModel.registerEvent.mockRejectedValue(new Error("DB error"));

            await eventController.registerEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("unregisterEvent", () => {
        beforeEach(() => {
            req.params = { event_id: 4 };
            req.user = { id: 11 };
        });

        it("should unregister successfully", async () => {
            eventModel.unregisterEvent.mockResolvedValue(true);

            await eventController.unregisterEvent(req, res);

            expect(eventModel.unregisterEvent).toHaveBeenCalledWith(11, 4);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Successfully unregistered from the event" });
        });

        it("should return 400 if not registered", async () => {
            eventModel.unregisterEvent.mockResolvedValue(false);

            await eventController.unregisterEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to unregister from the event (Not Registered?)" });
        });

        it("should handle errors", async () => {
            eventModel.unregisterEvent.mockRejectedValue(new Error("DB error"));

            await eventController.unregisterEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("createEvent", () => {
        beforeEach(() => {
            req.body = { name: "New Event" };
            req.user = { id: 12 };
        });

        it("should create event", async () => {
            eventModel.createEvent.mockResolvedValue(true);

            await eventController.createEvent(req, res);

            expect(eventModel.createEvent).toHaveBeenCalledWith({ name: "New Event" }, 12);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ message: "Event created successfully" });
        });

        it("should return 400 if creation fails", async () => {
            eventModel.createEvent.mockResolvedValue(false);

            await eventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to create event" });
        });

        it("should handle errors", async () => {
            eventModel.createEvent.mockRejectedValue(new Error("DB error"));

            await eventController.createEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("updateEvent", () => {
        beforeEach(() => {
            req.params = { event_id: 5 };
            req.body = { name: "Updated Event" };
            req.user = { id: 13 };
        });

        it("should update and notify", async () => {
            eventModel.updateEvent.mockResolvedValue(true);
            notification.updateEventNotification.mockResolvedValue(true);

            await eventController.updateEvent(req, res);

            expect(eventModel.updateEvent).toHaveBeenCalledWith(5, { name: "Updated Event" }, 13);
            expect(notification.updateEventNotification).toHaveBeenCalledWith(5, expect.stringContaining("Updated Event"));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: "Event updated successfully" });
        });

        it("should return 400 if update fails", async () => {
            eventModel.updateEvent.mockResolvedValue(false);

            await eventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to update event" });
        });

        it("should handle errors", async () => {
            eventModel.updateEvent.mockRejectedValue(new Error("DB error"));

            await eventController.updateEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });

    describe("deleteEvent", () => {
        beforeEach(() => {
            req.params = { event_id: 6 };
            req.user = { id: 14 };
        });


    it("should delete and notify", async () => {
        const eventData = { name: "To Delete" };
        eventModel.getEventDetailsByID.mockResolvedValue(eventData);
        eventModel.deleteEvent.mockResolvedValue(true);
        notification.deleteEventNotification.mockResolvedValue(true);

        await eventController.deleteEvent(req, res);

        expect(eventModel.getEventDetailsByID).toHaveBeenCalledWith(6);
        expect(eventModel.deleteEvent).toHaveBeenCalledWith(6, 14);
        expect(notification.deleteEventNotification).toHaveBeenCalledWith(6, expect.stringContaining("To Delete"));
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: "Event deleted successfully" });
    }); // ✅ THIS WAS MISSING


        it("should return 400 if deletion fails", async () => {
            eventModel.getEventDetailsByID.mockResolvedValue({ name: "Fail Delete" });
            eventModel.deleteEvent.mockResolvedValue(false);

            await eventController.deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: "Failed to delete event" });
        });

        it("should handle errors", async () => {
            eventModel.getEventDetailsByID.mockRejectedValue(new Error("DB error"));

            await eventController.deleteEvent(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
        });
    });
});
