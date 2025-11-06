import { Hono } from "hono";
import type { Env } from "@/types";

export const usersRouter = new Hono<Env>();

/**
 * [random description]
 * GET /v1/users/?
 */
