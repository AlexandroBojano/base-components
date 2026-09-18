import express from "express"
import cors from "cors"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import sqlite3 from "sqlite3"
import dotenv from "dotenv"

dotenv.config()
sqlite3.verbose()

const app = express()
const PORT = 3000
const JWT_SECRET = process.env.JWT_SECRET

app.use(cors())
app.use(express.json())

const db = new sqlite3.Database("./database.sqlite", (error) => {
    if (error) {
        console.error("Erro ao conectar ao SQLite:", error.message)
    } else {
        console.log("Conectado ao banco de dados SQLite.")
    }
})

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
})

const authenticateToken = (req, res, next) => {
    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(401).json({ error: "Token não informado" })
    }

    const token = authorization.split(" ")[1]

    if (!token) {
        return res.status(401).json({ error: "Token inválido" })
    }

    jwt.verify(token, JWT_SECRET, (error, user) => {
        if (error) {
            return res.status(403).json({ error: "Token inválido ou expirado" })
        }

        req.user = user
        next()
    })
}

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
        return res.status(400).json({ error: "Nome, email e senha são obrigatórios" })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10)

        db.run(
            "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword],
            function (error) {
                if (error) {
                    if (error.message.includes("UNIQUE")) {
                        return res.status(409).json({ error: "Email já cadastrado" })
                    }
                    return res.status(500).json({ error: "Erro ao cadastrar usuário" })
                }

                res.status(201).json({
                    message: "Usuário criado",
                    user: { id: this.lastID, name, email }
                })
            }
        )
    } catch (error) {
        res.status(500).json({ error: "Erro interno" })
    }
})

app.post("/login", (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ error: "Email e senha são obrigatórios" })
    }

    db.get("SELECT * FROM users WHERE email = ?", [email], async (error, user) => {
        if (error) {
            return res.status(500).json({ error: "Erro no banco de dados" })
        }

        if (!user) {
            return res.status(401).json({ error: "Email ou senha inválidos" })
        }

        const passwordMatch = await bcrypt.compare(password, user.password)

        if (!passwordMatch) {
            return res.status(401).json({ error: "Email ou senha inválidos" })
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "2h" }
        )

        res.json({
            message: "Login realizado",
            token,
            user: { id: user.id, name: user.name, email: user.email }
        })
    })
})

app.get("/users", authenticateToken, (req, res) => {
    db.all("SELECT id, name, email, created_at FROM users", [], (error, users) => {
        if (error) {
            return res.status(500).json({ error: "Erro ao buscar usuários" })
        }
        res.json(users)
    })
})

app.get("/users/:id", authenticateToken, (req, res) => {
    const { id } = req.params

    db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [id], (error, user) => {
        if (error) {
            return res.status(500).json({ error: "Erro ao buscar usuário" })
        }

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        res.json(user)
    })
})

app.put("/users/:id", authenticateToken, async (req, res) => {
    const { id } = req.params

    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: "Você só pode editar sua própria conta" })
    }

    const { name, email, password } = req.body

    if (!name || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios" })
    }

    try {
        let sql, values

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10)
            sql = "UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?"
            values = [name, email, hashedPassword, id]
        } else {
            sql = "UPDATE users SET name = ?, email = ? WHERE id = ?"
            values = [name, email, id]
        }

        db.run(sql, values, function (error) {
            if (error) {
                if (error.message.includes("UNIQUE")) {
                    return res.status(409).json({ error: "Email já cadastrado" })
                }
                return res.status(500).json({ error: "Erro ao atualizar usuário" })
            }

            if (this.changes === 0) {
                return res.status(404).json({ error: "Usuário não encontrado" })
            }

            res.json({ message: "Usuário atualizado" })
        })
    } catch (error) {
        res.status(500).json({ error: "Erro interno" })
    }
})

app.delete("/users/:id", authenticateToken, (req, res) => {
    const { id } = req.params

    if (parseInt(id) !== req.user.id) {
        return res.status(403).json({ error: "Você só pode excluir sua própria conta" })
    }

    db.run("DELETE FROM users WHERE id = ?", [id], function (error) {
        if (error) {
            return res.status(500).json({ error: "Erro ao excluir usuário" })
        }

        if (this.changes === 0) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        res.json({ message: "Usuário excluído" })
    })
})

app.get("/me", authenticateToken, (req, res) => {
    db.get("SELECT id, name, email, created_at FROM users WHERE id = ?", [req.user.id], (error, user) => {
        if (error) {
            return res.status(500).json({ error: "Erro ao buscar usuário" })
        }

        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" })
        }

        res.json(user)
    })
})

app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`)
})