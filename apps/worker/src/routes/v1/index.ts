import { Hono } from "hono";
import { heroesRouter } from "./heroes";
import { wikisRouter } from "./wikis";
import type { Env } from "@/types";

export const v1Router = new Hono<Env>();

// Mount v1 routes
v1Router.route("/heroes", heroesRouter);
v1Router.route("/wikis", wikisRouter);
