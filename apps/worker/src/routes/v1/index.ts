import { Hono } from "hono";
import { heroesRouter } from "./heroes";
import { wikisRouter } from "./wikis";
import { usersRouter } from "./users";
import type { Env } from "@/types";
import { aiRouter } from "@/routes/v1/ai";
import { subscriptionRouter } from "@/routes/v1/subscription";

export const v1Router = new Hono<Env>();

// Mount v1 routes
v1Router.route("/heroes", heroesRouter);
v1Router.route("/wikis", wikisRouter);
v1Router.route("/ai", aiRouter);
v1Router.route("/users", usersRouter);
v1Router.route("/subscription", subscriptionRouter);
