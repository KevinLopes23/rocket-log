/// <reference types="jest" />

import request from "supertest";
import { app } from "../app";
import { prisma } from "../database/prisma";

describe("UsersController", () => {
  let user_id: string;

  afterAll(async () => {
    await prisma.user.delete({
      where: {
        id: user_id,
      },
    });
  });

  it("should create a new user successfully", async () => {
    const email = `testuser-${Date.now()}@example.com`;

    const response = await request(app).post("/users").send({
      name: "Test User",
      email,
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Test User");

    user_id = response.body.id;
  });
});
