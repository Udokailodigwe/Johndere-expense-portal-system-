import request from "supertest";
import app from "../../../app.js";
import mongoose from "mongoose";
import User from "../../../models/user.js";
import Expense from "../../../models/expense.js";
import Approval from "../../../models/approval.js";
import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

describe("Approval Routes Integration Tests", () => {
  let managerToken;
  let employeeToken;
  let manager;
  let employee;
  let expense;

  beforeEach(async () => {
    await User.deleteMany({});
    await Expense.deleteMany({});
    await Approval.deleteMany({});

    manager = await User.create({
      name: "Manager",
      email: "manager@test.com",
      password: "hashedpassword",
      role: "manager",
    });

    employee = await User.create({
      name: "Employee",
      email: "employee@test.com",
      password: "hashedpassword",
      role: "employee",
    });

    managerToken = generateToken(manager._id, "manager");
    employeeToken = generateToken(employee._id, "employee");

    expense = await Expense.create({
      userId: employee._id,
      amount: 100,
      description: "Test expense",
      category: "travel",
      status: "pending",
      expenseDate: new Date(),
    });
  });

  describe("PUT /api/v1/approvals/:id", () => {
    it("should allow manager to approve expense", async () => {
      const res = await request(app)
        .put(`/api/v1/approvals/${expense._id}`)
        .set("Authorization", `Bearer ${managerToken}`)
        .send({ status: "approved" });

      expect(res.status).toBe(200);
      expect(res.body.expense.status).toBe("approved");

      const approval = await Approval.findOne({ expenseId: expense._id });
      expect(approval).toBeTruthy();
      expect(approval.status).toBe("approved");
    });

    it("should reject non-manager access", async () => {
      const res = await request(app)
        .put(`/api/v1/approvals/${expense._id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send({ status: "approved" });

      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/v1/approvals/all", () => {
    it("should allow manager to fetch all approvals", async () => {
      await Approval.create({
        expenseId: expense._id,
        managerId: manager._id,
        status: "approved",
      });

      const res = await request(app)
        .get("/api/v1/approvals/all")
        .set("Authorization", `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.approvals.length).toBeGreaterThan(0);
    });
  });

  describe("GET /api/v1/approvals/", () => {
    it("should return employee approvals only", async () => {
      await Approval.create({
        expenseId: expense._id,
        managerId: manager._id,
        status: "approved",
      });

      const res = await request(app)
        .get("/api/v1/approvals/")
        .set("Authorization", `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.approvals.length).toBe(1);
    });
  });
});
