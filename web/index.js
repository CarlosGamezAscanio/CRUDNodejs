const http = require('http');
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Recursos
app.use(express.static(__dirname + '/'));

// Configuración del servidor
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, ""));
app.use(express.urlencoded({ extended: false }));
app.listen(5000);
console.log("Servidor corriendo exitosamente en el puerto 5000");

// Base de Datos
const db_name = path.join(__dirname, "db", "base.db");
const db = new sqlite3.Database(db_name, (err) => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("Conexión exitosa con la base de Datos");
    }
});

// Eliminar la tabla si existe
const sql_drop = "DROP TABLE IF EXISTS Productos;";
db.run(sql_drop, (err) => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("Tabla Productos eliminada (si existía)");
    }
});

// Crear la tabla
const sql_create = "CREATE TABLE IF NOT EXISTS Productos(Producto_ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, Nombre VARCHAR(100) NOT NULL, Precio REAL NOT NULL, Descripcion TEXT, ID );";
db.run(sql_create, (err) => {
    if (err) {
        return console.error(err.message);
    } else {
        console.log("Tabla Productos creada correctamente");
    }
});

// Enrutamiento
app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/acerca', (req, res) => {
    res.render('acerca.ejs');
});

app.get('/contacto', (req, res) => {
    res.render('contacto.ejs');
});

app.get('/comprar', (req, res) => {
    res.render('comprar.ejs');
});


// Mostrar tabla de Productos
app.get('/productos', (req, res) => {
    const sql = "SELECT * FROM Productos ORDER BY Nombre";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        } else {
            res.render("productos.ejs", { modelo: rows });
        }
    });
});

// Crear un nuevo Registro
app.get('/crear', (req, res) => {
    res.render('crear.ejs', { modelo: {} });
});

// POST /crear
app.post('/crear', (req, res) => {
    const sql = "INSERT INTO Productos(Nombre, Precio, Descripcion) VALUES(?,?,?)";
    const nuevo_producto = [req.body.Nombre, req.body.Precio, req.body.Descripcion];
    db.run(sql, nuevo_producto, (err) => {
        if (err) {
            return console.error(err.message);
        } else {
            res.redirect("/productos");
        }
    });
});

// GET /edit/id
app.get("/editar/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Productos WHERE Producto_ID=?";
    db.get(sql, id, (err, rows) => {
        res.render("editar.ejs", { modelo: rows });
    });
});

// POST /edit/id
app.post("/editar/:id", (req, res) => {
    const id = req.params.id;
    const info_producto = [req.body.Nombre, req.body.Precio, req.body.Descripcion, id];
    const sql = "UPDATE Productos SET Nombre=?, Precio=?, Descripcion=? WHERE (Producto_ID=?)";
    db.run(sql, info_producto, (err) => {
        if (err) {
            return console.error(err.message);
        } else {
            res.redirect("/productos");
        }
    });
});

// Eliminar Registros
app.get("/eliminar/:id", (req, res) => {
    const id = req.params.id;
    const sql = "SELECT * FROM Productos WHERE Producto_ID=?";
    db.get(sql, id, (err, rows) => {
        res.render("eliminar.ejs", { modelo: rows });
    });
});



// POST /eliminar/id
app.post("/eliminar/:id", (req, res) => {
    const id = req.params.id;
    const sql = "DELETE FROM Productos WHERE Producto_ID=?";
    db.run(sql, id, (err) => {
        if (err) {
            return console.error(err.message);
        } else {
            res.redirect("/productos");
        }
    });
});

// POST /comprar/:id
app.post("/comprar/:id", (req, res) => {
    const id = req.params.id;

    // Lógica para procesar la compra
    const sql = "SELECT * FROM Productos WHERE Producto_ID = ?";
    db.get(sql, [id], (err, producto) => {
        if (err) {
            return console.error(err.message);
        }

        if (producto) {
            console.log(`Producto comprado: ${producto.Nombre} - $${producto.Precio}`);
            // Aquí puedes agregar la lógica para procesar el pago, enviar un correo, etc.
            res.send(`¡Gracias por comprar ${producto.Nombre}!`);
        } else {
            res.status(404).send("Producto no encontrado");
        }
    });
});


// Este método siempre debe ir al final
app.get('/*', (req, res) => {
    res.render('notfound.ejs');
});