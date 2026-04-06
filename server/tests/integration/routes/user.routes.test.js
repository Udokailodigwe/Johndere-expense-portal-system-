import { describe, it, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../../app.js";
import User from "../../../models/user.js";

describe("User/Auth API Integration Tests", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register a new employee", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      expect(response.body.message).toContain("registered");
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe("employee");
      expect(response.body.user.active).toBe(false);
      expect(response.body.tempPassword).toBeDefined();
    });

    it("should reject registration with invalid data", async () => {
      const invalidUserData = {
        name: "Jo", // Too short
        email: "invalid-email", // Invalid email format
        password: "1234567", // Too short password
      };

      await request(app)
        .post("/api/v1/auth/register")
        .send(invalidUserData)
        .expect(400);
    });

    it("should reject registration with duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      };

      // First registration
      await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(201);

      // Second registration with same email
      await request(app)
        .post("/api/v1/auth/register")
        .send(userData)
        .expect(400);
    });
  });

  describe("POST /api/v1/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "employee",
        active: true,
      });
      await user.save();
    });

    it("should login with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/login")
        .send(loginData)
        .expect(201); // Login returns 201, not 200

      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.user.active).toBe(true);
      expect(response.body.user.token).toBeDefined();
    });

    it("should reject login with invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      await request(app).post("/api/v1/auth/login").send(loginData).expect(401);
    });

    it("should reject login with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      await request(app).post("/api/v1/auth/login").send(loginData).expect(401);
    });

    it("should reject login with invalid data format", async () => {
      const invalidLoginData = {
        email: "invalid-email",
        password: "123", // Too short
      };

      await request(app)
        .post("/api/v1/auth/login")
        .send(invalidLoginData)
        .expect(400);
    });
  });

  describe("POST /api/v1/auth/activate-account", () => {
    let inactiveUser;
    let tempPassword;

    beforeEach(async () => {
      // Create an inactive user with temp password
      tempPassword = Math.random().toString(36).slice(-8);
      inactiveUser = new User({
        name: "Inactive User",
        email: "inactive@example.com",
        password: tempPassword,
        role: "employee",
        active: false,
      });
      await inactiveUser.save();
    });

    it("should activate account with valid credentials", async () => {
      const activationData = {
        email: "inactive@example.com",
        code: tempPassword, // Use temp password as code
        password: "newpassword123",
      };

      const response = await request(app)
        .post("/api/v1/auth/activate-account")
        .send(activationData)
        .expect(200);

      expect(response.body.message).toContain("activated");

      // Verify user is now active
      const activatedUser = await User.findById(inactiveUser._id);
      expect(activatedUser.active).toBe(true);
    });

    it("should reject activation with invalid credentials", async () => {
      const activationData = {
        email: "inactive@example.com",
        code: "wrong-code",
        password: "newpassword123",
      };

      await request(app)
        .post("/api/v1/auth/activate-account")
        .send(activationData)
        .expect(401);
    });

    it("should reject activation without required fields", async () => {
      await request(app)
        .post("/api/v1/auth/activate-account")
        .send({})
        .expect(400);
    });
  });

  describe("POST /api/v1/auth/bootstrap", () => {
    it("should create first manager when no users exist", async () => {
      const bootstrapData = {
        name: "Bootstrap Manager",
        email: "bootstrap@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/bootstrap")
        .send(bootstrapData)
        .expect(201);

      expect(response.body.message).toContain("registered");
      expect(response.body.user.name).toBe(bootstrapData.name);
      expect(response.body.user.email).toBe(bootstrapData.email);
      expect(response.body.user.role).toBe("manager");
      expect(response.body.user.active).toBe(false); // Bootstrap users are not active by default
    });

    it("should allow bootstrap even when other users exist (only prevents duplicate emails)", async () => {
      // Create a user first
      const existingUser = new User({
        name: "Existing User",
        email: "existing@example.com",
        password: "password123",
        role: "employee",
        active: true,
      });
      await existingUser.save();

      const bootstrapData = {
        name: "Bootstrap Manager",
        email: "bootstrap@example.com", // Different email
        password: "password123",
      };

      const response = await request(app)
        .post("/api/v1/auth/bootstrap")
        .send(bootstrapData)
        .expect(201);

      expect(response.body.message).toContain("registered");
      expect(response.body.user.role).toBe("manager");
    });
  });
});
