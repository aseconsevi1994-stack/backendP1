// models/News.js
const mongoose = require("mongoose");

const NewsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String }, // ✅ aquí se guarda la ruta de la imagen
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("News", NewsSchema);
