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
app.get("/getPhoneByAccountID/:id", authorization.verifyJWT, accountController.getPhoneByAccountID);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


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
app.get("/getAllEvents", eventController.getAllEvents);
app.post("/registerEvent/:event_id", authorization.verifyJWT, eventController.registerEvent);
app.delete("/unregisterEvent/:event_id", authorization.verifyJWT, eventController.unregisterEvent);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


//Finance Endpoints (By Belle)
app.get("/getExpenditureGoalByID/:id", authorization.verifyJWT, financeController.getExpenditureGoalByID);
app.get("/getTotalExpenditureByID/:id", authorization.verifyJWT, financeController.getTotalExpenditureByID);
app.get("/getMonthlyExpenditureByID/:id", authorization.verifyJWT, financeController.getMonthlyExpenditureByID);
app.get("/getAllTransactionsByID/:id", authorization.verifyJWT, financeController.getAllTransactionsByID);

app.post("/addTransactionToAccount/:id", authorization.verifyJWT, financeController.addTransactionToAccount);



//Use of External API from backend (By Belle)
app.get("/getExpenditureByMonthBarChart/:id", authorization.verifyJWT, financeController.getExpenditureByMonthBarChart);
app.get("/getBudgetExpenditureDoughnutChart/:month/:id", financeController.getBudgetExpenditureDoughnutChart);
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



app.post("/postImage", authorization.verifyJWT); //WIP


//Calendar Endpoints (Calendar API endpoints using existing EventList) (By Yuxuan)
app.get("/calendar/events", eventController.getEventsByMonth);
app.get("/calendar/events/today", eventController.getTodayEvents);
app.get("/calendar/events/tomorrow", eventController.getTomorrowEvents);
app.get("/calendar/events/:date", eventController.getEventsByDate);

app.get("/getExpenditureGoalByID/:id", financeController.getExpenditureGoalByID);
app.get("/getTotalExpenditureByID/:id", financeController.getTotalExpenditureByID);
app.get("/getMonthlyExpenditureByID/:id", financeController.getMonthlyExpenditureByID);
app.get("/getPhoneByAccountID/:id", authorization.verifyJWT, accountController.getPhoneByAccountID);

// Task management API endpoints (By Yuxuan)
app.post("/tasks", taskController.addTask);
app.delete("/tasks/:task_id",  taskController.deleteTask);
app.put("/tasks/:task_id",  taskController.updateTask);
app.get("/tasks", taskController.getAllTasks);
app.get("/tasks/:task_id",  taskController.getTaskById);
app.get("/tasks/month",  taskController.getTasksByMonth);
app.get("/tasks/date/:date",  taskController.getTasksByDate);
app.patch("/tasks/:task_id/status",  taskController.updateTaskStatus);
app.post("/tasks/initialize", taskController.initializeTaskTable);
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