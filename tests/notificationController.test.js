
const notificationsController = require("../Controllers/notificationsController");
const notificationModel = require("../Models/notificationsModel");

jest.mock("../Models/notificationsModel");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("notificationsController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getAllNotifications", () => {
    it("should return notifications", async () => {
      req.user = { id: 1 };
      const notifications = [{ id: 1, description: "Test notification" }];
      notificationModel.getAllNotificationsByAccountId.mockResolvedValue(notifications);

      await notificationsController.getAllNotifications(req, res);

      expect(notificationModel.getAllNotificationsByAccountId).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(notifications);
    });

    it("should return 404 if empty", async () => {
      req.user = { id: 1 };
      notificationModel.getAllNotificationsByAccountId.mockResolvedValue([]);

      await notificationsController.getAllNotifications(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No notifications found." });
    });
  });

  describe("getUnnotified", () => {
    it("should return unnotified notifications", async () => {
      req.user = { id: 2 };
      const data = [{ id: 2, description: "Reminder" }];
      notificationModel.getUnnotifiedByAccountId.mockResolvedValue(data);

      await notificationsController.getUnnotified(req, res);

      expect(notificationModel.getUnnotifiedByAccountId).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should return 404 if none found", async () => {
      req.user = { id: 2 };
      notificationModel.getUnnotifiedByAccountId.mockResolvedValue([]);

      await notificationsController.getUnnotified(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "No unnotified notifications found." });
    });
  });

  describe("markNotificationAsNotified", () => {
    it("should mark and return 200", async () => {
      req.params = { noti_id: 5 };
      req.user = { id: 1 };
      notificationModel.markNotificationAsNotified.mockResolvedValue({ rowsAffected: [1] });

      await notificationsController.markNotificationAsNotified(req, res);

      expect(notificationModel.markNotificationAsNotified).toHaveBeenCalledWith(5, 1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Notification marked as notified." });
    });

    it("should return 404 if not found", async () => {
      req.params = { noti_id: 5 };
      req.user = { id: 1 };
      notificationModel.markNotificationAsNotified.mockResolvedValue({ rowsAffected: [0] });

      await notificationsController.markNotificationAsNotified(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Notification not found or already notified." });
    });
  });
});
