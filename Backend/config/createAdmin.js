const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function createAdmin() {
  try {
    const adminExists = await User.findOne({ username: "admin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("admin1234", 10); // ✅ encriptamos la contraseña

      const admin = new User({
        username: "admin",
        password: hashedPassword
      });

      await admin.save();
      console.log("✅ Usuario admin creado con contraseña: admin1234");
    } else {
      console.log("⚡ Admin ya existe");
    }
  } catch (err) {
    console.error("❌ Error creando admin:", err);
  }
}

module.exports = createAdmin;
