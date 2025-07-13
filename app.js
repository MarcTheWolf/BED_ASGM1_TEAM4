const express = require("express");
const sql = require("mssql");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const accountController = require("./Controllers/accountController.js");
const medicalInformationController = require("./Controllers/medicalInformationController.js");
const eventController = require("./Controllers/eventController.js");
const financeController = require("./Controllers/financeController.js");
const { JsonWebTokenError } = require("jsonwebtoken");


const authorization = require("./Middlewares/authorization.js");

const {
  validateMedication,
  validateMedicalCondition,
} = require("./Middlewares/medicalInformationValidation.js"); // import Book Validation Middleware



const authorization = require("./Middlewares/authorization.js");

const {
  validateMedication,
  validateMedicalCondition,
} = require("./Middlewares/medicalInformationValidation.js"); // import Book Validation Middleware


////////////////////////////////////////////////////
/////////////API Endpoints//////////////////////////
////////////////////////////////////////////////////

//Account Profile Endpoints (By XinHui)
app.post("/authenticateUser", accountController.authenticateAccount);
app.get("/getAccountById/:id", authorization.verifyJWT, accountController.getAccountById);
app.post("/createAccount", accountController.createAccount);
app.post("/initializeAccountDetails/:id", accountController.initializeAccountDetails);

  
  
//Medical Information Endpoints (By Marcus)
app.get("/getMedicationByAccountID/:id", authorization.verifyJWT, medicalInformationController.getMedicationByAccountID);
app.get("/getMedicationByID/:id", authorization.verifyJWT, medicalInformationController.getMedicationByID);
//app.get("/getMedicalConditionByID/:id", authorization.verifyJWT, medicalInformationController.getMedicalConditionByID);
app.get("/getMedicalConditionByAccountID/:id", authorization.verifyJWT, medicalInformationController.getMedicalConditionByAccountID);
app.post("/createMedication/:id", authorization.verifyJWT, validateMedication, medicalInformationController.createMedication);
app.post("/createMedicalCondition/:id", authorization.verifyJWT, validateMedicalCondition, medicalInformationController.createMedicalCondition);
//app.put("/updateMedication/:id", authorization.verifyJWT, validateMedication, medicalInformationController.updateMedication);
//app.put("/updateMedicalCondition/:id", authorization.verifyJWT, validateMedicalCondition, medicalInformationController.updateMedicalCondition);
app.delete("/deleteMedication/:id", authorization.verifyJWT, medicalInformationController.deleteMedication);
app.delete("/deleteMedicalCondition/:id", authorization.verifyJWT, medicalInformationController.deleteMedicalCondition);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Events Endpoints (By Ansleigh)
app.get("/getEventRegisteredByID/:id", authorization.verifyJWT, eventController.getEventRegisteredByID);
app.get("/getEventDetailsByID/:id", authorization.verifyJWT, eventController.getEventDetailsByID);

app.get("/getExpenditureGoalByID/:id", financeController.getExpenditureGoalByID);
app.get("/getTotalExpenditureByID/:id", financeController.getTotalExpenditureByID);
app.get("/getMonthlyExpenditureByID/:id", financeController.getMonthlyExpenditureByID);
app.get("/getPhoneByAccountID/:id", authorization.verifyJWT, accountController.getPhoneByAccountID);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////////////
/////////////Create Express app////////////////
////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Index page: http://localhost:${port}/e-events.html`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});


app.use(express.static(path.join(__dirname, "Public")));