import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { verifyToken, requireRole } from "../middlewares/auth.js";

const prisma = new PrismaClient();
const router = Router();

router.get("/", async (_req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { name: "asc" },
    include: { reviews: { select: { rating: true } } }
  });
  const withAvg = restaurants.map((r:any) => ({
    ...r,
    avgRating: r.reviews.length ? (r.reviews.reduce((s:number,x:any)=>s+x.rating,0)/r.reviews.length) : null
  }));
  res.json(withAvg);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const restaurant = await prisma.restaurant.findUnique({ where: { id }, include: { items: true } });
  if (!restaurant) return res.status(404).json({ error: "Restaurante não encontrado" });
  res.json(restaurant);
});

const upsertSchema = z.object({ name: z.string().min(2), imageUrl: z.string().optional(), category: z.string().optional() });

router.post("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  res.json(await prisma.restaurant.create({ data: parsed.data }));
});

router.put("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const parsed = upsertSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());
  res.json(await prisma.restaurant.update({ where: { id }, data: parsed.data }));
});

router.delete("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  await prisma.restaurant.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
