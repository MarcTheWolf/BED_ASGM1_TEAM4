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
const medicationController = require("./Controllers/medicationController.js");
const eventController = require("./Controllers/eventController.js");
const financeController = require("./Controllers/financeController.js");


const authorization = require("./Middlewares/authorization.js");

////////////////////////////////////////////////////
/////////////API Endpoints//////////////////////////
////////////////////////////////////////////////////
app.post("/authenticateUser", accountController.authenticateAccount);
app.get("/getAccountById/:id", authorization.verifyJWT, accountController.getAccountById);
app.post("/createAccount", accountController.createAccount);
app.post("/initializeAccountDetails/:id", accountController.initializeAccountDetails);

app.get("/getMedicationByAccountID/:id", authorization.verifyJWT, medicalInformationController.getMedicationByAccountID);
app.get("/getMedicationByID/:id", authorization.verifyJWT, medicalInformationController.getMedicationByID);
app.get("/getMedicalConditionByAccountID/:id", authorization.verifyJWT, medicalInformationController.getMedicalConditionByAccountID);
//app.post("/createMedication", authorization.verifyJWT, medicalInformationController.createMedication);
app.post("/createMedicalCondition/:id", authorization.verifyJWT, medicalInformationController.createMedicalCondition);


app.get("/getEventRegisteredByID/:id", authorization.verifyJWT, eventController.getEventRegisteredByID);
app.get("/getEventDetailsByID/:id", authorization.verifyJWT, eventController.getEventDetailsByID);

app.get("/getExpenditureGoalByID/:id", financeController.getExpenditureGoalByID);
app.get("/getTotalExpenditureByID/:id", financeController.getTotalExpenditureByID);
app.get("/getMonthlyExpenditureByID/:id", financeController.getMonthlyExpenditureByID);



////////////////////////////////////////////////////
/////////////Create Express app////////////////
////////////////////////////////////////////////////

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Index page: http://localhost:${port}/login.html`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  await sql.close();
  console.log("Database connections closed");
  process.exit(0);
});


app.use(express.static(path.join(__dirname, "Public")));