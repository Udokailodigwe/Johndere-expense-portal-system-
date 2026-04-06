import { describe, it, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import Expense from "../../../models/expense.js";
import User from "../../../models/user.js";

describe("Expense Model Unit Tests", () => {
  let testUser;

  beforeEach(async () => {
    await Expense.deleteMany({});
    await User.deleteMany({});

    // Create a test user
    testUser = new User({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });
    await testUser.save();
  });

  describe("Model Creation", () => {
    it("should create an expense with valid data", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100.5,
        description: "Office supplies purchase",
        category: "office_supplies",
        expenseDate: new Date(),
        notes: "Purchased office supplies for the team",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense._id).toBeDefined();
      expect(savedExpense.userId.toString()).toBe(testUser._id.toString());
      expect(savedExpense.amount).toBe(expenseData.amount);
      expect(savedExpense.description).toBe(expenseData.description);
      expect(savedExpense.category).toBe(expenseData.category);
      expect(savedExpense.status).toBe("pending"); // default value
      expect(savedExpense.isDeleted).toBe(false); // default value
      expect(savedExpense.deletedAt).toBeNull(); // default value
    });

    it("should set default values correctly", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 50,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense.status).toBe("pending");
      expect(savedExpense.category).toBe("other");
      expect(savedExpense.expenseDate).toBeDefined();
      expect(savedExpense.expenseDate).toBeInstanceOf(Date);
    });
  });

  describe("Validation", () => {
    it("should require userId field", async () => {
      const expenseData = {
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should require amount field", async () => {
      const expenseData = {
        userId: testUser._id,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should require description field", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should enforce minimum amount of 0", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: -10,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should enforce minimum description length", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Te", // 2 characters, minimum is 3
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should enforce maximum description length", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "A".repeat(501), // 501 characters, maximum is 500
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should validate category enum values", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
        category: "invalid_category",
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should validate status enum values", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
        status: "invalid_status",
      };

      const expense = new Expense(expenseData);
      await expect(expense.save()).rejects.toThrow();
    });

    it("should trim description whitespace", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "  Test expense  ",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense.description).toBe("Test expense");
    });
  });

  describe("Soft Delete Functionality", () => {
    it("should have isDeleted field with default false", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense.isDeleted).toBe(false);
    });

    it("should have deletedAt field with default null", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense.deletedAt).toBeNull();
    });

    it("should allow setting isDeleted to true", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      expense.isDeleted = true;
      expense.deletedAt = new Date();
      const savedExpense = await expense.save();

      expect(savedExpense.isDeleted).toBe(true);
      expect(savedExpense.deletedAt).toBeDefined();
    });
  });

  describe("Timestamps", () => {
    it("should have createdAt and updatedAt timestamps", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();

      expect(savedExpense.createdAt).toBeDefined();
      expect(savedExpense.updatedAt).toBeDefined();
      expect(savedExpense.createdAt).toBeInstanceOf(Date);
      expect(savedExpense.updatedAt).toBeInstanceOf(Date);
    });

    it("should update updatedAt when document is modified", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      const savedExpense = await expense.save();
      const originalUpdatedAt = savedExpense.updatedAt;

      // Wait a bit and then update
      await new Promise((resolve) => setTimeout(resolve, 100));
      savedExpense.description = "Updated description";
      const updatedExpense = await savedExpense.save();

      expect(updatedExpense.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("Schema Indexes", () => {
    it("should have compound index on userId and status", async () => {
      const indexes = Expense.schema.indexes();
      const compoundIndex = indexes.find(
        (index) =>
          JSON.stringify(index[0]) === JSON.stringify({ userId: 1, status: 1 })
      );
      expect(compoundIndex).toBeDefined();
    });

    it("should have index on expenseDate", async () => {
      const indexes = Expense.schema.indexes();
      const dateIndex = indexes.find(
        (index) =>
          JSON.stringify(index[0]) === JSON.stringify({ expenseDate: -1 })
      );
      expect(dateIndex).toBeDefined();
    });

    it("should have index on category", async () => {
      const indexes = Expense.schema.indexes();
      const categoryIndex = indexes.find(
        (index) => JSON.stringify(index[0]) === JSON.stringify({ category: 1 })
      );
      expect(categoryIndex).toBeDefined();
    });
  });

  describe("Populate Functionality", () => {
    it("should populate userId with user data", async () => {
      const expenseData = {
        userId: testUser._id,
        amount: 100,
        description: "Test expense",
      };

      const expense = new Expense(expenseData);
      await expense.save();

      const populatedExpense = await Expense.findById(expense._id).populate(
        "userId"
      );

      expect(populatedExpense.userId).toBeDefined();
      expect(populatedExpense.userId.name).toBe(testUser.name);
      expect(populatedExpense.userId.email).toBe(testUser.email);
    });
  });
});
