import express from "express";
import routes from "./routes/index.js";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
// import rateLimiter from "express-rate-limit";
import passport from "./config/passport.js";

const app = express();


// a middleware that helps secure the application by setting various HTTP headers.
app.use(helmet());

// middleware  responsible for parsing incoming JSON payloads in the request body
app.use(express.json());

//  middleware  for parsing incoming requests with URL-encoded payloads
app.use(compression());

// middleware to compresses HTTP responses using the gzip algorithm
app.use(compression());

// middleware to add the necessary HTTP headers to enable or restrict cross-origin requests
app.use(cors());

// middleware to rate-limit apis for ip-addresses
// app.use(rateLimiter);

app.use(passport.initialize());

app.use(express.static("public"));

app.use("/api",routes);

// app.use(error.converter);

// app.use(error.notFound);

// app.use(error.handler);

export default app