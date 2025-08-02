
const medicalModel = require("../Models/medicalInformationModel");
const sql = require("mssql");

jest.mock("mssql");
jest.mock("../Services/pool", () => ({
  getPool: jest.fn(),
}));

const { getPool } = require("../Services/pool");

describe("medicalModel", () => {
  let mockRequest, mockQueryResult;

  beforeEach(() => {
    mockQueryResult = { recordset: [{ id: 1, name: "Panadol" }], rowsAffected: [1] };
    mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue(mockQueryResult),
    };

    getPool.mockResolvedValue({
      request: () => mockRequest,
    });

    jest.clearAllMocks();
  });

  describe("getMedicationByAccountID", () => {
    it("should return medications for a given account ID", async () => {
      const result = await medicalModel.getMedicationByAccountID(1);
      expect(mockRequest.input).toHaveBeenCalledWith("accountId", expect.anything(), 1);
      expect(result).toEqual(mockQueryResult.recordset);
    });

    it("should throw error on failure", async () => {
      mockRequest.query.mockRejectedValue(new Error("DB error"));
      await expect(medicalModel.getMedicationByAccountID(1)).rejects.toThrow("DB error");
    });
  });

  describe("getMedicationByID", () => {
    it("should return a single medication by ID", async () => {
      const result = await medicalModel.getMedicationByID(10);
      expect(mockRequest.input).toHaveBeenCalledWith("medicationId", expect.anything(), 10);
      expect(result).toEqual(mockQueryResult.recordset[0]);
    });

    it("should throw error on failure", async () => {
      mockRequest.query.mockRejectedValue(new Error("DB error"));
      await expect(medicalModel.getMedicationByID(10)).rejects.toThrow("DB error");
    });
  });

  describe("getMedicalConditionByID", () => {
    it("should return a single condition by ID", async () => {
      const result = await medicalModel.getMedicalConditionByID(5);
      expect(mockRequest.input).toHaveBeenCalledWith("conditionId", expect.anything(), 5);
      expect(result).toEqual(mockQueryResult.recordset[0]);
    });

    it("should throw error on failure", async () => {
      mockRequest.query.mockRejectedValue(new Error("DB error"));
      await expect(medicalModel.getMedicalConditionByID(5)).rejects.toThrow("DB error");
    });
  });
});
