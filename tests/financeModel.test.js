
const financeModel = require("../Models/financeModel");
const sql = require("mssql");
const { getPool } = require("../Services/pool");

jest.mock("../Services/pool");

describe("financeModel", () => {
  let mockRequest;

  beforeEach(() => {
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn(),
    };

    getPool.mockResolvedValue({ request: () => mockRequest });
  });

  describe("modifyExpenditureGoal", () => {
    it("should modify and return success message", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await financeModel.modifyExpenditureGoal(1, {
        food: 100,
        transport: 100,
        utilities: 100,
        others: 100
      }, "2025-08");

      expect(result).toEqual({ message: "Expenditure goals updated successfully." });
    });
  });

  describe("deleteTransaction", () => {
    it("should return success message if deleted", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [1] });

      const result = await financeModel.deleteTransaction(1, 10);
      expect(result).toEqual({ message: "Transaction deleted successfully" });
    });

    it("should return not found message if no row affected", async () => {
      mockRequest.query.mockResolvedValue({ rowsAffected: [0] });

      const result = await financeModel.deleteTransaction(1, 10);
      expect(result).toEqual({ message: "No transaction found to delete" });
    });
  });

  describe("getTransactionByID", () => {
    it("should return the transaction if found", async () => {
      const mockTransaction = { entry_id: 10, amount: 50 };
      mockRequest.query.mockResolvedValue({ recordset: [mockTransaction] });

      const result = await financeModel.getTransactionByID(1, 10);
      expect(result).toEqual(mockTransaction);
    });

    it("should return empty array if not found", async () => {
      mockRequest.query.mockResolvedValue({ recordset: [] });

      const result = await financeModel.getTransactionByID(1, 10);
      expect(result).toEqual([]);
    });
  });

  describe("addTransactionToAccount", () => {
    it("should return success message", async () => {
      mockRequest.query.mockResolvedValue({});

      const result = await financeModel.addTransactionToAccount(1, {
        amount: 20.5,
        date: "2025-08-01",
        description: "Lunch",
        category: "Food"
      });

      expect(result).toEqual({ message: "Transaction added successfully" });
    });
  });
});
