const accountModel = require("../Models/accountModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

async function authenticateAccount(req, res) {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const account = await accountModel.getAccountByPhone(phone_number);

    if (!account) {
      return res.status(404).json({ error: "Account not found." });
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (isMatch) {
      const payload = {
      id: account.id,
      role: account.account_type,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });
      return res.status(200).json({
        message: "Password match.",
        account_id: account.id,
        token: token,
      });
    } else {
      return res.status(401).json({ error: "Incorrect password." });
    }
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function getAccountById(req, res) {
  try {
    const accountId = parseInt(req.params.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    if (!accountId) {
      return res.status(400).json({ error: "Account ID is required." });
    }

    const accountDetails = await accountModel.getAccountById(accountId);

    if (!accountDetails) {
      return res.status(404).json({ error: "Account not found." });
    }

    res.status(200).json(accountDetails);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function createAccount(req, res) {
  try {
    const { phone_number, password } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ error: "Phone number and password are required." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const accountId = await accountModel.createAccount(phone_number, hashedPassword);
    const payload = {
      id: accountId,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3600s" });
    
    res.status(201).json({ message: "Account created successfully.", account_id: accountId, token: token});
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

async function initializeAccountDetails(req, res) {
  try {
    const accountId = parseInt(req.params.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const accountDetails = req.body;
    const updatedDetails = await accountModel.initializeAccountDetails(accountId, accountDetails);

    if (updatedDetails) {
      return res.status(200).json({ success: true, message: "Account details initialized successfully.", account_id: accountId });
    } else {
      return res.status(500).json({ success: false, error: "Failed to insert account details." });
    }
  } catch (error) {
    console.error("Controller error:", error);
    return res.status(500).json({ success: false, error: "Server error." });
  }
}

async function getPhoneByAccountID(req, res) {
  try {
    const accountId = parseInt(req.params.id);
    if (isNaN(accountId)) {
      return res.status(400).json({ error: "Invalid account ID." });
    }

    const phoneNumber = await accountModel.getPhoneByAccountID(accountId);

    if (!phoneNumber) {
      return res.status(404).json({ error: "No phone number found for this account." });
    }

    res.status(200).json(phoneNumber);
  } catch (error) {
    console.error("Controller error:", error);
    res.status(500).json({ error: "Server error." });
  }
}

module.exports = {
  authenticateAccount,
  getAccountById,
  createAccount,
  initializeAccountDetails,
  getPhoneByAccountID
};