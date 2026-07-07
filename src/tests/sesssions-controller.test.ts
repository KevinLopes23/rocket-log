import request from "supertest";
import { app } from "../app";

describe("SessionsController", () => {
  let user_id: string;

  it("should authenticate a and get access token", async () => {
    const userResponse = await request(app).post("/users").send({
      name: "Auth Test User",
      email: "auth_test_user@example.com",
      password: "password123",
    });

    user_id = userResponse.body.id;

    const sessionResponse = await request(app).post("/sessions").send({
      email: "auth_test_user@example.com",
      password: "password123",
    });

    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.token).toEqual(expect.any(String));
  });
});
