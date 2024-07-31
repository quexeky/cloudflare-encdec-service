import { fromHono } from "chanfana";
import { Hono } from "hono";
import {Encrypt} from "./endpoints/encrypt";
import {Decrypt} from "./endpoints/decrypt";
import { logger } from 'hono/logger'

// Start a Hono app
const app = new Hono<{Bindings: Env}>( );
app.use(logger())

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});


// Register OpenAPI endpoints
openapi.post("/encrypt", Encrypt);
openapi.post("/decrypt", Decrypt);
// Export the Hono app
export default app;
