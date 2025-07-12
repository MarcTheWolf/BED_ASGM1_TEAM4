const accountModel = require("../Models/eventModel.js");

async function getEventRegisteredByID(req, res) {
    const id = req.params.id;
    try {
        const event = await accountModel.getEventRegisteredByID(id);
        if (event) {
            res.status(200).json(event);
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function getEventDetailsByID(req, res) {
    const id = req.params.id;
    try {
        const event = await accountModel.getEventDetailsByID(id);
        if (event) {
            res.status(200).json(event);
        } else {
            res.status(404).json({ message: "Event not found" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }

}

async function getAllEvents(req, res) {
    try {
        const events = await accountModel.getAllEvents();
        if (events && events.length > 0) {
            res.status(200).json(events);
        } else {
            res.status(404).json({ message: "No events found" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function registerEvent(req, res) {
    const eventId = req.params.event_id;
    const accountId = req.user.id; // Assuming user ID is stored in the JWT token

    try {
        const result = await accountModel.registerEvent(accountId, eventId);
        if (result) {
            res.status(200).json({ message: "Successfully registered for the event" });
        } else {
            res.status(400).json({ message: "Failed to register for the event" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

async function unregisterEvent(req, res) {
    const eventId = req.params.event_id;
    const accountId = req.user.id; // Assuming user ID is stored in the JWT token

    try {
        const result = await accountModel.unregisterEvent(accountId, eventId);
        if (result) {
            res.status(200).json({ message: "Successfully unregistered from the event" });
        } else {
            res.status(400).json({ message: "Failed to unregister from the event (Not Registered?)" });
        }
    } catch (error) {
        console.error("Controller error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getEventRegisteredByID,
    getEventDetailsByID,
    getAllEvents,
    registerEvent,
    unregisterEvent
};