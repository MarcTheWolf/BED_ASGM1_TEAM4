
const notificationModel = require("../Models/notificationsModel");
const { getPool } = require("../Services/pool");

jest.mock("../Services/pool");

describe("notificationModel", () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn()
    };

    getPool.mockResolvedValue({ request: () => mockRequest });
  });

  it("should fetch all notifications by account", async () => {
    const expected = [{ noti_id: 1, description: "Hello" }];
    mockRequest.query.mockResolvedValue({ recordset: expected });

    const result = await notificationModel.getAllNotificationsByAccountId(1);
    expect(result).toEqual(expected);
  });

  it("should fetch unnotified notifications", async () => {
    const expected = [{ noti_id: 2, notified: 0 }];
    mockRequest.query.mockResolvedValue({ recordset: expected });

    const result = await notificationModel.getUnnotifiedByAccountId(2);
    expect(result).toEqual(expected);
  });

  it("should mark notification as notified", async () => {
    mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

    const result = await notificationModel.markNotificationAsNotified(5, 1);
    expect(result.rowsAffected[0]).toBe(1);
  });
});
