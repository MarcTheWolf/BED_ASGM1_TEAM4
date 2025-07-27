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
const taskController = require("./Controllers/taskController.js");


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
app.get("/getAccountById", authorization.verifyJWT, accountController.getAccountById);
app.post("/createAccount", accountController.createAccount);
app.post("/initializeAccountDetails/:id", accountController.initializeAccountDetails);
app.get("/getPhoneByAccountID", authorization.verifyJWT, accountController.getPhoneByAccountID);
app.put("/updateProfile", authorization.verifyJWT, accountController.updateProfile);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Medical Information Endpoints (By Marcus)
app.get("/getMedicationByAccountID", authorization.verifyJWT, medicalInformationController.getMedicationByAccountID);
app.get("/getMedicationByID/:id", authorization.verifyJWT, medicalInformationController.getMedicationByID);
//app.get("/getMedicalConditionByID/:id", authorization.verifyJWT, medicalInformationController.getMedicalConditionByID);
app.get("/getMedicalConditionByAccountID", authorization.verifyJWT, medicalInformationController.getMedicalConditionByAccountID);

app.post("/createMedication", authorization.verifyJWT, validateMedication, medicalInformationController.createMedication);
app.post("/createMedicalCondition", authorization.verifyJWT, validateMedicalCondition, medicalInformationController.createMedicalCondition);

//app.put("/updateMedication/:id", authorization.verifyJWT, validateMedication, medicalInformationController.updateMedication);
//app.put("/updateMedicalCondition/:id", authorization.verifyJWT, validateMedicalCondition, medicalInformationController.updateMedicalCondition);

app.delete("/deleteMedication/:id", authorization.verifyJWT, medicalInformationController.deleteMedication);
app.delete("/deleteMedicalCondition/:id", authorization.verifyJWT, medicalInformationController.deleteMedicalCondition);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Events Endpoints (By Ansleigh)
app.get("/getEventRegisteredByID", authorization.verifyJWT, eventController.getEventRegisteredByID);
app.get("/getEventDetailsByID/:id", authorization.verifyJWT, eventController.getEventDetailsByID);
app.get("/getAllEvents", eventController.getAllEvents);
app.post("/registerEvent/:event_id", authorization.verifyJWT, eventController.registerEvent);
app.delete("/unregisterEvent/:event_id", authorization.verifyJWT, eventController.unregisterEvent);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Finance Endpoints (By Belle)
app.get("/getExpenditureGoalByID", authorization.verifyJWT, financeController.getExpenditureGoalByID);
app.get("/getTotalExpenditureByID", authorization.verifyJWT, financeController.getTotalExpenditureByID);
app.get("/getMonthlyExpenditureByID", authorization.verifyJWT, financeController.getMonthlyExpenditureByID);
app.get("/getAllTransactionsByID/", authorization.verifyJWT, financeController.getAllTransactionsByID);


app.post("/addTransactionToAccount", authorization.verifyJWT, financeController.addTransactionToAccount);



//Use of External API from backend (By Belle)
app.get("/getExpenditureByMonthBarChart/:id", authorization.verifyJWT, financeController.getExpenditureByMonthBarChart);
app.get("/getBudgetExpenditureDoughnutChart/:month", authorization.verifyJWT, financeController.getBudgetExpenditureDoughnutChart);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.post("/postImage", authorization.verifyJWT); //WIP


// Task management API endpoints (By Yuxuan)
app.post("/tasks", authorization.verifyJWT, taskController.addTask);
app.delete("/tasks/:task_id", authorization.verifyJWT, taskController.deleteTask);
app.put("/tasks/:task_id", authorization.verifyJWT, taskController.updateTask);
app.get("/tasks", authorization.verifyJWT, taskController.getAllTasks);
app.get("/tasks/:task_id", authorization.verifyJWT, taskController.getTaskById);
app.get("/tasks/month", authorization.verifyJWT, taskController.getTasksByMonth);
app.get("/tasks/date/:date", authorization.verifyJWT, taskController.getTasksByDate);
app.patch("/tasks/:task_id/status", authorization.verifyJWT, taskController.updateTaskStatus);
app.post("/tasks/initialize", taskController.initializeTaskTable);

app.put("/account/password", authorization.verifyJWT, accountController.updatePassword); // Edit password (authenticated user)
app.post("/account/forgot-password", accountController.forgotPassword); // Forgot password (via phone)
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