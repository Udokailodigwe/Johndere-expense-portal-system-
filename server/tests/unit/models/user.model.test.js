import { describe, it, expect, beforeEach } from "@jest/globals";
import mongoose from "mongoose";
import User from "../../../models/user.js";

describe("User Model Unit Tests", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("Model Creation", () => {
    it("should create a user with valid data", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        role: "employee",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.name).toBe(userData.name);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.active).toBe(false); // default value
      expect(savedUser.password).not.toBe(userData.password); // should be hashed
    });

    it("should set default role to employee", async () => {
      const userData = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.role).toBe("employee");
    });

    it("should set default active status to false", async () => {
      const userData = {
        name: "Bob Smith",
        email: "bob@example.com",
        password: "password123",
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.active).toBe(false);
    });
  });

  describe("Validation", () => {
    it("should require name field", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require email field", async () => {
      const userData = {
        name: "Test User",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should require password field", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should validate email format", async () => {
      const userData = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should enforce unique email constraint", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    it("should enforce minimum password length", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "1234567", // 7 characters, minimum is 8
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should enforce minimum name length", async () => {
      const userData = {
        name: "Jo", // 2 characters, minimum is 3
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should enforce maximum name length", async () => {
      const userData = {
        name: "A".repeat(51), // 51 characters, maximum is 50
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it("should validate role enum values", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        role: "invalid_role",
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe("Password Hashing", () => {
    it("should hash password before saving", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(50); // bcrypt hash length
    });
  });

  describe("Instance Methods", () => {
    let user;

    beforeEach(async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
      };

      user = new User(userData);
      await user.save();
    });

    it("should create JWT token", () => {
      const token = user.createJWT();

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should compare password correctly", async () => {
      const isMatch = await user.comparePassword("password123");
      const isNotMatch = await user.comparePassword("wrongpassword");

      expect(isMatch).toBe(true);
      expect(isNotMatch).toBe(false);
    });
  });

  describe("Schema Indexes", () => {
    it("should have email index for uniqueness", async () => {
      const indexes = await User.collection.getIndexes();
      expect(indexes).toHaveProperty("email_1");
    });
  });
});


