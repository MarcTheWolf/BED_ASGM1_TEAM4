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
module.exports = {
    getEventRegisteredByID,
    getEventDetailsByID
};