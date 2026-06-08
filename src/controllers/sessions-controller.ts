import { Request, Response } from "express";
import { AppError } from "../utils/AppError";
import { prisma } from "../database/prisma";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { authConfig } from "../configs/auth";

class SessionsController {
  async create(Request: Request, response: Response) {
    const bodySchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(Request.body);

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user) {
      throw new AppError("Email or password incorrect", 404);
    }

    const passwordMatched = await compare(password, user.password);

    if (!passwordMatched) {
      throw new AppError("Email or password incorrect", 404);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ role: user.role ?? "customer" }, secret, {
      subject: user.id,
      expiresIn,
    });

    const { password: hashedPassword, ...userWithoutPassword } = user;

    return response.json({ token, user: userWithoutPassword });
  }
}

export { SessionsController };
