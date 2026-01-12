console.log("📩 Petición POST /admin/news recibida");

const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const News = require("../models/News");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

/* =========================
   📂 CONFIGURACIÓN DE MULTER
   ========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // carpeta donde se guardan
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // conserva extensión (.jpg, .png...)
  }
});

const upload = multer({ storage });

/* =========================
   🔑 VARIABLES JWT
   ========================= */
const JWT_SECRET = process.env.JWT_SECRET || "secreto";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh_secreto";

/* =========================
   🔑 LOGIN DE ADMIN
   ========================= */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await User.findOne({ username });
    if (!admin) return res.status(401).json({ error: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: "Contraseña incorrecta" });

    // accessToken (15 min)
    const accessToken = jwt.sign(
      { id: admin._id, role: "admin" },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // refreshToken (7 días)
    const refreshToken = jwt.sign(
      { id: admin._id },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ accessToken, refreshToken });
  } catch (err) {
    console.error("❌ Error en login:", err.message, err);
    res.status(500).json({ error: err.message || "Error en el servidor" });
  }
});

/* =========================
   🔄 REFRESH TOKEN
   ========================= */
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ error: "Token requerido" });

    jwt.verify(refreshToken, JWT_REFRESH_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ error: "Token inválido o expirado" });

      const accessToken = jwt.sign(
        { id: decoded.id, role: "admin" },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.json({ accessToken });
    });
  } catch (err) {
    console.error("❌ Error en refresh:", err.message, err);
    res.status(500).json({ error: err.message || "Error en el servidor" });
  }
});

/* =========================
   🔐 CAMBIO DE CONTRASEÑA
   ========================= */
router.post("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Contraseña actual incorrecta" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err) {
    console.error("❌ Error cambiando contraseña:", err.message, err);
    res.status(500).json({ error: err.message || "Error en el servidor" });
  }
});

/* =========================
   📰 CRUD DE NOTICIAS
   ========================= */

// Crear noticia con imagen
router.post("/news", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    console.log("📦 Body recibido:", req.body);
    console.log("🖼️ File recibido:", req.file);

    const { title, summary, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const news = new News({ title, summary, content, imageUrl });
    await news.save();

    res.json(news);
  } catch (err) {
    console.error("❌ Error al crear noticia:", err.message, err);
    res.status(500).json({ error: err.message || "Error al crear noticia" });
  }
});

// Editar noticia con posibilidad de cambiar imagen
router.put("/news/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { title, summary, content } = req.body;
    const updateData = { title, summary, content };

    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const news = await News.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!news) return res.status(404).json({ error: "Noticia no encontrada" });

    res.json(news);
  } catch (err) {
    console.error("❌ Error al editar noticia:", err.message, err);
    res.status(500).json({ error: err.message || "Error al editar noticia" });
  }
});

// Eliminar noticia
router.delete("/news/:id", authMiddleware, async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "Noticia eliminada" });
  } catch (err) {
    console.error("❌ Error al eliminar noticia:", err.message, err);
    res.status(500).json({ error: err.message || "Error al eliminar noticia" });
  }
});

module.exports = router;
