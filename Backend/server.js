require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const newsRoutes = require("./routes/NewsRoutes");
const authRoutes = require("./routes/authRoutes");
const AdminRoutes = require("./routes/AdminRoutes");
const createAdmin = require("./config/createAdmin");

const app = express();

// ✅ Middlewares
app.use(cors({
  origin: "*",   // permite cualquier origen
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json()); // para JSON normal
app.use(express.urlencoded({ extended: true })); // para formularios simples

// ✅ Servir archivos subidos (imagenes)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 🔗 Conexión a Mongo Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Conectado a MongoDB Atlas");
  await createAdmin(); // crea admin si no existe
})
.catch(err => console.error("❌ Error de conexión:", err));

// ✅ Rutas
app.use("/api/news", newsRoutes);
app.use("/api/auth", authRoutes);
app.use("/admin", AdminRoutes); 

// Ruta base
app.get("/", (req, res) => {
  res.send("🚀 API ASECONSEVI funcionando correctamente.");
});

// Puerto
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));
