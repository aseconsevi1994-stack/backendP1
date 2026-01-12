const express = require("express");
const News = require("../models/News");

const router = express.Router();

// ✅ Obtener todas las noticias
router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener noticias" });
  }
});

// ✅ Obtener las últimas 3 noticias para el index
router.get("/latest", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).limit(3);
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener noticias recientes" });
  }
});

// ✅ Obtener una sola noticia por ID (para ver detalle)
router.get("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "Noticia no encontrada" });
    res.json(news);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener noticia" });
  }
});

module.exports = router;
