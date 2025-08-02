
const financeController = require("../Controllers/financeController");
const financeModel = require("../Models/financeModel");

jest.mock("../Models/financeModel");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("financeController", () => {
  let req, res;

  beforeEach(() => {
    req = { user: { id: 1 }, body: {}, params: {} };
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getExpenditureGoalByID", () => {
    it("should return 200 and goal", async () => {
      const mockGoal = { recordset: [{ total_goal: 200 }] };
      financeModel.getExpenditureGoalByID.mockResolvedValue(mockGoal);

      await financeController.getExpenditureGoalByID(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockGoal.recordset[0]);
    });

    it("should return 404 if no goal", async () => {
      financeModel.getExpenditureGoalByID.mockResolvedValue({ recordset: [] });

      await financeController.getExpenditureGoalByID(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getTotalExpenditureByID", () => {
    it("should return 200 and total", async () => {
      const mockTotal = { recordset: [{ total: 150.25 }] };
      financeModel.getTotalExpenditureByID.mockResolvedValue(mockTotal);

      await financeController.getTotalExpenditureByID(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTotal.recordset[0]);
    });

    it("should return 404 if no data", async () => {
      financeModel.getTotalExpenditureByID.mockResolvedValue({ recordset: [] });

      await financeController.getTotalExpenditureByID(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getMonthlyExpenditureByID", () => {
    it("should return 200 and monthly data", async () => {
      const data = [{ month: "2025-08", total: 123.45 }];
      financeModel.getMonthlyExpenditureByID.mockResolvedValue(data);

      await financeController.getMonthlyExpenditureByID(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(data);
    });

    it("should return 404 if no records", async () => {
      financeModel.getMonthlyExpenditureByID.mockResolvedValue([]);

      await financeController.getMonthlyExpenditureByID(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getAllTransactionsByID", () => {
    it("should return 200 and all transactions", async () => {
      const transactions = [{ entry_id: 1, amount: 50 }];
      financeModel.getAllTransactionsByID.mockResolvedValue(transactions);

      await financeController.getAllTransactionsByID(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(transactions);
    });

    it("should return 404 if no transactions", async () => {
      financeModel.getAllTransactionsByID.mockResolvedValue([]);

      await financeController.getAllTransactionsByID(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getTransactionByID", () => {
    it("should return 200 and transaction", async () => {
      const txn = { entry_id: 1, amount: 100 };
      financeModel.getTransactionByID.mockResolvedValue(txn);
      req.params.id = 1;

      await financeController.getTransactionByID(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(txn);
    });

    it("should return 404 if not found", async () => {
      financeModel.getTransactionByID.mockResolvedValue([]);
      req.params.id = 2;

      await financeController.getTransactionByID(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("addTransactionToAccount", () => {
    it("should return 201 if added", async () => {
      req.body = {
        amount: 25.5,
        date: "2025-08-02",
        description: "Coffee",
        category: "Food"
      };
      financeModel.addTransactionToAccount.mockResolvedValue({ message: "Transaction added successfully" });

      await financeController.addTransactionToAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should return 400 if fields missing", async () => {
      req.body = { amount: 10, date: "", description: "", category: "" };

      await financeController.addTransactionToAccount(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("deleteTransaction", () => {
  it("should return 200 if deleted", async () => {
    req.params.id = 1;
    financeModel.deleteTransaction.mockResolvedValue({ rowsAffected: [1] });

    await financeController.deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return 404 if not found", async () => {
    req.params.id = 1;
    financeModel.deleteTransaction.mockResolvedValue({ rowsAffected: [0] });

    await financeController.deleteTransaction(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
  });
  });
  });