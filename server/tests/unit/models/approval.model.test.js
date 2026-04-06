import { describe, it, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import Approval from "../../../models/approval.js";
import Expense from "../../../models/expense.js";
import User from "../../../models/user.js";

describe("Approval Model Unit Tests", () => {
  let testUser;
  let testManager;
  let testExpense;

  beforeEach(async () => {
    await Approval.deleteMany({});
    await Expense.deleteMany({});
    await User.deleteMany({});

    // Create test users
    testUser = new User({
      name: "Test Employee",
      email: "employee@example.com",
      password: "password123",
      role: "employee",
    });
    await testUser.save();

    testManager = new User({
      name: "Test Manager",
      email: "manager@example.com",
      password: "password123",
      role: "manager",
    });
    await testManager.save();

    // Create test expense
    testExpense = new Expense({
      userId: testUser._id,
      amount: 100,
      description: "Test expense",
    });
    await testExpense.save();
  });

  describe("Model Creation", () => {
    it("should create an approval with valid data", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
        rejectReason: null,
      };

      const approval = new Approval(approvalData);
      const savedApproval = await approval.save();

      expect(savedApproval._id).toBeDefined();
      expect(savedApproval.expenseId.toString()).toBe(
        testExpense._id.toString()
      );
      expect(savedApproval.managerId.toString()).toBe(
        testManager._id.toString()
      );
      expect(savedApproval.status).toBe("approved");
      expect(savedApproval.date).toBeDefined();
      expect(savedApproval.date).toBeInstanceOf(Date);
      expect(savedApproval.rejectReason).toBeNull();
    });

    it("should create a rejection with reason", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "rejected",
        rejectReason: "Expense not justified",
      };

      const approval = new Approval(approvalData);
      const savedApproval = await approval.save();

      expect(savedApproval.status).toBe("rejected");
      expect(savedApproval.rejectReason).toBe("Expense not justified");
    });

    it("should set default date to current date", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      const savedApproval = await approval.save();

      expect(savedApproval.date).toBeDefined();
      expect(savedApproval.date).toBeInstanceOf(Date);

      // Check if date is within last minute
      const now = new Date();
      const timeDiff = Math.abs(now.getTime() - savedApproval.date.getTime());
      expect(timeDiff).toBeLessThan(60000); // 1 minute
    });
  });

  describe("Validation", () => {
    it("should require expenseId field", async () => {
      const approvalData = {
        managerId: testManager._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      await expect(approval.save()).rejects.toThrow();
    });

    it("should require managerId field", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      await expect(approval.save()).rejects.toThrow();
    });

    it("should require status field", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
      };

      const approval = new Approval(approvalData);
      await expect(approval.save()).rejects.toThrow();
    });

    it("should validate status enum values", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "invalid_status",
      };

      const approval = new Approval(approvalData);
      await expect(approval.save()).rejects.toThrow();
    });

    it("should enforce maximum rejectReason length", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "rejected",
        rejectReason: "A".repeat(201), // 201 characters, maximum is 200
      };

      const approval = new Approval(approvalData);
      await expect(approval.save()).rejects.toThrow();
    });

    it("should allow null rejectReason", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
        rejectReason: null,
      };

      const approval = new Approval(approvalData);
      const savedApproval = await approval.save();

      expect(savedApproval.rejectReason).toBeNull();
    });

    it("should allow undefined rejectReason", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      const savedApproval = await approval.save();

      expect(savedApproval.rejectReason).toBeUndefined();
    });
  });

  describe("Populate Functionality", () => {
    it("should populate expenseId with expense data", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      await approval.save();

      const populatedApproval = await Approval.findById(approval._id).populate(
        "expenseId"
      );

      expect(populatedApproval.expenseId).toBeDefined();
      expect(populatedApproval.expenseId.amount).toBe(testExpense.amount);
      expect(populatedApproval.expenseId.description).toBe(
        testExpense.description
      );
    });

    it("should populate managerId with manager data", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      await approval.save();

      const populatedApproval = await Approval.findById(approval._id).populate(
        "managerId"
      );

      expect(populatedApproval.managerId).toBeDefined();
      expect(populatedApproval.managerId.name).toBe(testManager.name);
      expect(populatedApproval.managerId.email).toBe(testManager.email);
      expect(populatedApproval.managerId.role).toBe("manager");
    });

    it("should populate both expenseId and managerId", async () => {
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      };

      const approval = new Approval(approvalData);
      await approval.save();

      const populatedApproval = await Approval.findById(approval._id)
        .populate("expenseId")
        .populate("managerId");

      expect(populatedApproval.expenseId).toBeDefined();
      expect(populatedApproval.managerId).toBeDefined();
      expect(populatedApproval.expenseId.amount).toBe(testExpense.amount);
      expect(populatedApproval.managerId.name).toBe(testManager.name);
    });
  });

  describe("Multiple Approvals", () => {
    it("should allow multiple approvals for different expenses", async () => {
      // Create another expense
      const anotherExpense = new Expense({
        userId: testUser._id,
        amount: 200,
        description: "Another test expense",
      });
      await anotherExpense.save();

      const approval1 = new Approval({
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      });

      const approval2 = new Approval({
        expenseId: anotherExpense._id,
        managerId: testManager._id,
        status: "rejected",
        rejectReason: "Not justified",
      });

      await approval1.save();
      await approval2.save();

      const approvals = await Approval.find({});
      expect(approvals).toHaveLength(2);
      expect(approvals[0].status).toBe("approved");
      expect(approvals[1].status).toBe("rejected");
    });

    it("should allow multiple managers to approve same expense", async () => {
      // Create another manager
      const anotherManager = new User({
        name: "Another Manager",
        email: "anothermanager@example.com",
        password: "password123",
        role: "manager",
      });
      await anotherManager.save();

      const approval1 = new Approval({
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
      });

      const approval2 = new Approval({
        expenseId: testExpense._id,
        managerId: anotherManager._id,
        status: "rejected",
        rejectReason: "Different opinion",
      });

      await approval1.save();
      await approval2.save();

      const approvals = await Approval.find({ expenseId: testExpense._id });
      expect(approvals).toHaveLength(2);
    });
  });

  describe("Date Handling", () => {
    it("should allow custom date to be set", async () => {
      const customDate = new Date("2023-01-01");
      const approvalData = {
        expenseId: testExpense._id,
        managerId: testManager._id,
        status: "approved",
        date: customDate,
      };

      const approval = new Approval(approvalData);
      const savedApproval = await approval.save();

      expect(savedApproval.date.getTime()).toBe(customDate.getTime());
    });
  });
});


