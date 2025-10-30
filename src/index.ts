import express from "express";
import cors from "cors";
import "dotenv/config";

import auth from "./routes/auth.js";
import restaurants from "./routes/restaurants.js";
import items from "./routes/items.js";
import orders from "./routes/orders.js";
import reviews from "./routes/reviews.js";
import analytics from "./routes/analytics.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ ok: true, name: "Edécio Delivery API" }));

app.use("/auth", auth);
app.use("/restaurants", restaurants);
app.use("/items", items);
app.use("/orders", orders);
app.use("/reviews", reviews);
app.use("/analytics", analytics);

const port = process.env.PORT || 3333;
app.listen(port, () => console.log("API on http://localhost:" + port));
