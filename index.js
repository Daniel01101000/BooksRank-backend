import express from "express"; 
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

app.post("/books", async (req, res) => {
  console.log("Recibido en POST /books:", req.body);
  const { title, author, genero, rating } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO books (title, author, genero, rating) VALUES (?, ?, ?, ?)",
      [title, author, genero, rating]
    );
    res.status(201).json({ id: result.insertId, title, author, genero, rating });
  } catch (err) {
    console.error("Error en POST /books:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/books", async (req, res) => {
  console.log("Petición GET /books recibida");
  try {
    console.log("Intentando consultar libros...");
    const [rows] = await pool.query("SELECT id, title, author, genero, rating FROM books");
    console.log("Consulta exitosa, filas obtenidas:", rows.length);
    res.json(rows);
  } catch (err) {
    console.error("Error en GET /books:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para probar conexión y tablas en la BD
app.get("/test-db", async (req, res) => {
  try {
    const [tables] = await pool.query("SHOW TABLES");
    console.log("Tablas en la base de datos:", tables);
    res.json(tables);
  } catch (err) {
    console.error("Error en /test-db:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("API de BookRank funcionando 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});