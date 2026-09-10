import { Router } from "express";

// Pure error-handling correctness — not a product decision. Express 4
// does not forward a rejected promise from an `async (req, res) => {...}`
// route handler to the error-handling middleware in server.ts. An
// unhandled rejection (e.g. any unexpected Prisma/DB error) therefore
// crashes the entire Node process — taking down Consumer, Company and
// TAJRIBTI Operations for every concurrent user, not just returning a 500
// to the one failing request. This patches every route handler so a
// rejected promise is forwarded to `next(err)`, landing on the existing
// JSON 500 handler already defined in server.ts. No successful response
// is changed by this file; only the failure path stops crashing the
// server. Applied once, before any route file registers its handlers.
// Express's Router factory (lib/router/index.js) sets each HTTP-verb
// method as an own property of the exported Router function/object
// itself — router instances get it via setPrototypeOf(router, Router),
// not through Router.prototype. So the patch targets Router directly.
const methods = ["get", "post", "put", "patch", "delete"] as const;

for (const method of methods) {
  const original = (Router as any)[method];
  (Router as any)[method] = function (...args: any[]) {
    const wrapped = args.map((arg) => {
      if (typeof arg !== "function") return arg;
      return function (this: unknown, req: unknown, res: unknown, next: (err?: unknown) => void) {
        try {
          const result = arg.call(this, req, res, next);
          if (result && typeof result.catch === "function") {
            result.catch(next);
          }
          return result;
        } catch (err) {
          next(err);
        }
      };
    });
    return original.apply(this, wrapped);
  };
}
