import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../app.js";
import User from "../../../models/user.js";
import Expense from "../../../models/expense.js";

describe("Expense API Integration Tests", () => {
  let employeeToken;
  let managerToken;
  let employee;
  let manager;
  let testExpense;

  beforeEach(async () => {
    await User.deleteMany({});
    await Expense.deleteMany({});

    // Create test users
    employee = new User({
      name: "Test Employee",
      email: "employee@test.com",
      password: "password123",
      role: "employee",
      active: true,
    });
    await employee.save();

    manager = new User({
      name: "Test Manager",
      email: "manager@test.com",
      password: "password123",
      role: "manager",
      active: true,
    });
    await manager.save();

    // Generate tokens
    employeeToken = employee.createJWT();
    managerToken = manager.createJWT();

    // Create test expense
    testExpense = new Expense({
      userId: employee._id,
      amount: 100,
      description: "Test expense",
      category: "office_supplies",
    });
    await testExpense.save();
  });

  describe("POST /api/v1/expenses", () => {
    it("should create a new expense for authenticated employee", async () => {
      const expenseData = {
        amount: 150,
        description: "Office supplies purchase",
        category: "office_supplies",
        expenseDate: new Date().toISOString(),
        notes: "Purchased office supplies",
      };

      const response = await request(app)
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(expenseData)
        .expect(201);

      expect(response.body.message).toContain("success");
      expect(response.body.expense.amount).toBe(expenseData.amount);
      expect(response.body.expense.description).toBe(expenseData.description);
      expect(response.body.expense.userId).toBe(employee._id.toString());
      expect(response.body.expense.status).toBe("pending");
    });

    it("should reject expense creation without authentication", async () => {
      const expenseData = {
        amount: 150,
        description: "Office supplies purchase",
        category: "office_supplies",
      };

      await request(app).post("/api/v1/expenses").send(expenseData).expect(401);
    });

    it("should reject expense creation with invalid data", async () => {
      const invalidExpenseData = {
        amount: -10, // Invalid negative amount
        description: "Te", // Too short description
        category: "invalid_category",
      };

      await request(app)
        .post("/api/v1/expenses")
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(invalidExpenseData)
        .expect(400);
    });
  });

  describe("GET /api/v1/expenses", () => {
    it("should get expenses for authenticated employee", async () => {
      const response = await request(app)
        .get("/api/v1/expenses")
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.expenses).toBeInstanceOf(Array);
      expect(response.body.expenses.length).toBeGreaterThan(0);
      expect(response.body.expenses[0].userId._id.toString()).toBe(
        employee._id.toString()
      );
    });

    it("should reject request without authentication", async () => {
      await request(app).get("/api/v1/expenses").expect(401);
    });
  });

  describe("GET /api/v1/expenses/:id", () => {
    it("should get specific expense by ID", async () => {
      const response = await request(app)
        .get(`/api/v1/expenses/${testExpense._id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.expense._id).toBe(testExpense._id.toString());
      expect(response.body.expense.amount).toBe(testExpense.amount);
    });

    it("should reject request for non-existent expense", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/v1/expenses/${fakeId}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(404);
    });

    it("should reject request without authentication", async () => {
      await request(app).get(`/api/v1/expenses/${testExpense._id}`).expect(401);
    });
  });

  describe("PUT /api/v1/expenses/:id", () => {
    it("should update expense for authenticated user", async () => {
      const updateData = {
        amount: 200,
        description: "Updated expense description",
        category: "meals",
      };

      const response = await request(app)
        .put(`/api/v1/expenses/${testExpense._id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.expense.amount).toBe(updateData.amount);
      expect(response.body.expense.description).toBe(updateData.description);
      expect(response.body.expense.category).toBe(updateData.category);
    });

    it("should reject update with invalid data", async () => {
      const invalidUpdateData = {
        amount: -50, // Invalid negative amount
        description: "Te", // Too short description
      };

      await request(app)
        .put(`/api/v1/expenses/${testExpense._id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .send(invalidUpdateData)
        .expect(400);
    });

    it("should reject update without authentication", async () => {
      const updateData = {
        amount: 200,
        description: "Updated expense description",
      };

      await request(app)
        .put(`/api/v1/expenses/${testExpense._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe("DELETE /api/v1/expenses/:id", () => {
    it("should soft delete expense for authenticated user", async () => {
      const response = await request(app)
        .delete(`/api/v1/expenses/${testExpense._id}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(200);

      expect(response.body.message).toContain("deleted");

      // Verify expense is soft deleted
      const deletedExpense = await Expense.findById(testExpense._id);
      expect(deletedExpense.isDeleted).toBe(true);
      expect(deletedExpense.deletedAt).toBeDefined();
    });

    it("should reject delete for non-existent expense", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .delete(`/api/v1/expenses/${fakeId}`)
        .set("Authorization", `Bearer ${employeeToken}`)
        .expect(404);
    });

    it("should reject delete without authentication", async () => {
      await request(app)
        .delete(`/api/v1/expenses/${testExpense._id}`)
        .expect(401);
    });
  });
});
