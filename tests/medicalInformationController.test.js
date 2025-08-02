
const medicalController = require("../Controllers/medicalInformationController");
const medicalModel = require("../Models/medicalInformationModel");

jest.mock("../Models/medicalInformationModel");

function mockRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("medicalController", () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = mockRes();
    jest.clearAllMocks();
  });

  describe("getMedicationByAccountID", () => {
    it("should return medications for a valid account ID", async () => {
      req.user = { id: "1" };
      const medications = [{ name: "Panadol" }];
      medicalModel.getMedicationByAccountID.mockResolvedValue(medications);

      await medicalController.getMedicationByAccountID(req, res);

      expect(medicalModel.getMedicationByAccountID).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(medications);
    });

    it("should return 400 for invalid account ID", async () => {
      req.user = { id: "abc" };

      await medicalController.getMedicationByAccountID(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid account ID." });
    });

    it("should return 404 when no medications found", async () => {
      req.user = { id: "1" };
      medicalModel.getMedicationByAccountID.mockResolvedValue(null);

      await medicalController.getMedicationByAccountID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "No medications found for this account." });
    });

    it("should return 500 on error", async () => {
      req.user = { id: "1" };
      medicalModel.getMedicationByAccountID.mockRejectedValue(new Error("DB Error"));

      await medicalController.getMedicationByAccountID(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error." });
    });
  });

  describe("getMedicationByID", () => {
    it("should return medication for valid ID", async () => {
      req.params = { id: "2" };
      const medication = { name: "Ibuprofen" };
      medicalModel.getMedicationByID.mockResolvedValue(medication);

      await medicalController.getMedicationByID(req, res);

      expect(medicalModel.getMedicationByID).toHaveBeenCalledWith(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(medication);
    });

    it("should return 400 for invalid ID", async () => {
      req.params = { id: "xyz" };

      await medicalController.getMedicationByID(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid medication ID." });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "2" };
      medicalModel.getMedicationByID.mockResolvedValue(null);

      await medicalController.getMedicationByID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Medication not found." });
    });

    it("should handle DB error", async () => {
      req.params = { id: "2" };
      medicalModel.getMedicationByID.mockRejectedValue(new Error("DB Error"));

      await medicalController.getMedicationByID(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error." });
    });
  });

  describe("getMedicalConditionByID", () => {
    it("should return condition if valid", async () => {
      req.params = { id: "3" };
      const condition = { name: "Diabetes" };
      medicalModel.getMedicalConditionByID.mockResolvedValue(condition);

      await medicalController.getMedicalConditionByID(req, res);

      expect(medicalModel.getMedicalConditionByID).toHaveBeenCalledWith(3);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(condition);
    });

    it("should return 400 if invalid ID", async () => {
      req.params = { id: "NaN" };

      await medicalController.getMedicalConditionByID(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid condition ID." });
    });

    it("should return 404 if condition not found", async () => {
      req.params = { id: "3" };
      medicalModel.getMedicalConditionByID.mockResolvedValue(null);

      await medicalController.getMedicalConditionByID(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "Medical condition not found." });
    });

    it("should handle DB error", async () => {
      req.params = { id: "3" };
      medicalModel.getMedicalConditionByID.mockRejectedValue(new Error("DB Error"));

      await medicalController.getMedicalConditionByID(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Server error." });
    });
  });
});
