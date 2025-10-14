import { Hono } from "hono";
import { heroesRouter } from "./heroes";
import { matchupsRouter } from "./matchups";
import { metaRouter } from "./meta";
import type { Env } from "@/types";

export const v1Router = new Hono<Env>();

// Mount v1 routes
v1Router.route("/heroes", heroesRouter);
v1Router.route("/matchups", matchupsRouter);
v1Router.route("/meta", metaRouter);
