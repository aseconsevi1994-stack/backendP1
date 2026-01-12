// backend/fixAdminPassword.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

// 🔗 Conexión a Mongo Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(async () => {
  console.log("✅ Conectado a MongoDB");

  // Cambia la contraseña del usuario admin a "admin1234"
  const hashedPassword = await bcrypt.hash("admin1234", 10);

  const result = await User.findOneAndUpdate(
    { username: "admin" },             // buscar usuario
    { password: hashedPassword },      // actualizar contraseña
    { new: true }                      // retornar el doc actualizado
  );

  if (result) {
    console.log("🔑 Contraseña del admin restablecida a 'admin1234'");
  } else {
    console.log("⚠️ Usuario admin no encontrado");
  }

  mongoose.disconnect();
})
.catch(err => {
  console.error("❌ Error:", err);
  mongoose.disconnect();
});
