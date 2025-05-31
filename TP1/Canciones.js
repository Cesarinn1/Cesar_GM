const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://202260138:aMigoS6A@baloo.1nlyg.mongodb.net/DataBaseGrupoA?retryWrites=true&w=majority&appName=Baloo";
const client = new MongoClient(uri);

// Configuración del servidor
app.use(express.json({ limit: '10mb' }));
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'file://'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

// Variables globales para la base de datos
let db, cancionesCollection;
let isConnected = false;

// Función para conectar a MongoDB
async function conectarMongoDB() {
    try {
        console.log('🔄 Intentando conectar a MongoDB Atlas...');
        await client.connect();
        
        // Verificar la conexión
        await client.db("admin").command({ ping: 1 });
        
        db = client.db('DataBaseGrupoA');
        cancionesCollection = db.collection('canciones');
        isConnected = true;
        
        console.log('✅ Conectado exitosamente a MongoDB Atlas');
        
        // Insertar datos iniciales si la colección está vacía
        const count = await cancionesCollection.countDocuments();
        if (count === 0) {
            await cancionesCollection.insertMany([
                { id: 1, cancion: 'Shape of You', artista: 'Ed Sheeran', duracion: '4:24' },
                { id: 2, cancion: 'Blinding Lights', artista: 'The Weeknd', duracion: '3:20' },
                { id: 3, cancion: 'Rolling in the Deep', artista: 'Adele', duracion: '3:48' },
                { id: 4, cancion: 'Bohemian Rhapsody', artista: 'Queen', duracion: '5:55' },
                { id: 5, cancion: 'Hotel California', artista: 'Eagles', duracion: '6:30' }
            ]);
            console.log('📊 Datos iniciales insertados en la base de datos');
        }
    } catch (error) {
        console.error('❌ Error al conectar a MongoDB:', error.message);
        isConnected = false;
        
        // Intentar reconectar después de 5 segundos
        setTimeout(conectarMongoDB, 5000);
    }
}

// Middleware para verificar conexión a la base de datos
function verificarConexion(req, res, next) {
    if (!isConnected) {
        return res.status(503).json({ 
            error: 'Base de datos no disponible. Intentando reconectar...',
            code: 'DB_NOT_CONNECTED'
        });
    }
    next();
}

// Función para validar datos de canción
function validarCancion(cancion) {
    const errores = [];
    
    if (!cancion.cancion || cancion.cancion.trim().length === 0) {
        errores.push('El nombre de la canción es requerido');
    }
    
    if (!cancion.artista || cancion.artista.trim().length === 0) {
        errores.push('El nombre del artista es requerido');
    }
    
    if (!cancion.duracion || cancion.duracion.trim().length === 0) {
        errores.push('La duración es requerida');
    }
    
    // Validar formato de duración (MM:SS)
    const duracionRegex = /^\d{1,2}:\d{2}$/;
    if (cancion.duracion && !duracionRegex.test(cancion.duracion.trim())) {
        errores.push('El formato de duración debe ser MM:SS (ej: 3:45)');
    }
    
    return errores;
}

// Operaciones de base de datos con manejo de errores mejorado
const dbOperations = {
    getAll: async () => {
        try {
            return await cancionesCollection.find({}).sort({ id: 1 }).toArray();
        } catch (error) {
            console.error('Error en getAll:', error);
            throw new Error('Error al obtener las canciones de la base de datos');
        }
    },
    
    getById: async (id) => {
        try {
            const cancion = await cancionesCollection.findOne({ id: parseInt(id, 10) });
            return cancion;
        } catch (error) {
            console.error('Error en getById:', error);
            throw new Error('Error al buscar la canción en la base de datos');
        }
    },
    
    add: async (cancion) => {
        try {
            // Limpiar datos
            const cancionLimpia = {
                cancion: cancion.cancion.trim(),
                artista: cancion.artista.trim(),
                duracion: cancion.duracion.trim()
            };
            
            // Obtener el próximo ID
            const lastIdDoc = await cancionesCollection.find().sort({id: -1}).limit(1).toArray();
            const newId = lastIdDoc.length > 0 ? lastIdDoc[0].id + 1 : 1;
            cancionLimpia.id = newId;
            
            // Insertar en la base de datos
            const resultado = await cancionesCollection.insertOne(cancionLimpia);
            
            if (!resultado.acknowledged) {
                throw new Error('No se pudo insertar la canción en la base de datos');
            }
            
            return cancionLimpia;
        } catch (error) {
            console.error('Error en add:', error);
            throw new Error('Error al agregar la canción a la base de datos');
        }
    },
    
    update: async (id, newData) => {
        try {
    
            const datosLimpios = {
                cancion: newData.cancion.trim(),
                artista: newData.artista.trim(),
                duracion: newData.duracion.trim()
            };
            
            const resultado = await cancionesCollection.updateOne(
                { id: parseInt(id, 10) },
                { $set: datosLimpios }
            );
            
            if (resultado.matchedCount === 0) {
                throw new Error('Canción no encontrada');
            }
            
            if (resultado.modifiedCount === 0) {
                throw new Error('No se realizaron cambios en la canción');
            }
            
            return await cancionesCollection.findOne({ id: parseInt(id, 10) });
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    },
    
    delete: async (id) => {
        try {
            const resultado = await cancionesCollection.deleteOne({ id: parseInt(id, 10) });
            
            if (resultado.deletedCount === 0) {
                throw new Error('Canción no encontrada o ya fue eliminada');
            }
            
            return true;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    }
};


app.get('/', (req, res) => {
    res.json({ 
        message: '🎵 Servidor de Gestión de Canciones funcionando correctamente',
        status: 'OK',
        timestamp: new Date().toISOString(),
        database: isConnected ? 'Conectada' : 'Desconectada'
    });
});

// Obtener todas las canciones
app.get('/canciones', verificarConexion, async (req, res) => {
    try {
        console.log('📋 Obteniendo todas las canciones...');
        const canciones = await dbOperations.getAll();
        console.log(`✅ Se encontraron ${canciones.length} canciones`);
        res.json(canciones);
    } catch (error) {
        console.error('❌ Error al obtener canciones:', error.message);
        res.status(500).json({ 
            error: 'Error al obtener las canciones',
            details: error.message 
        });
    }
});

// Obtener canción por ID
app.get('/canciones/:id', verificarConexion, async (req, res) => {
    try {
        const id = req.params.id;
        
        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido, debe ser un número' });
        }
        
        console.log(`🔍 Buscando canción con ID: ${id}`);
        const cancion = await dbOperations.getById(id);
        
        if (cancion) {
            console.log(`✅ Canción encontrada: ${cancion.cancion}`);
            res.json(cancion);
        } else {
            console.log(`❌ Canción con ID ${id} no encontrada`);
            res.status(404).json({ error: 'Canción no encontrada' });
        }
    } catch (error) {
        console.error('❌ Error al obtener la canción:', error.message);
        res.status(500).json({ 
            error: 'Error al obtener la canción',
            details: error.message 
        });
    }
});

// Crear nueva canción
app.post('/canciones', verificarConexion, async (req, res) => {
    try {
        const datosCancion = req.body;
        console.log('➕ Creando nueva canción:', datosCancion);
        
        // Validar datos
        const errores = validarCancion(datosCancion);
        if (errores.length > 0) {
            return res.status(400).json({ 
                error: 'Datos inválidos',
                errores: errores 
            });
        }
        
        const nuevaCancion = await dbOperations.add(datosCancion);
        console.log(`✅ Canción creada exitosamente con ID: ${nuevaCancion.id}`);
        
        res.status(201).json(nuevaCancion);
    } catch (error) {
        console.error('❌ Error al crear canción:', error.message);
        res.status(500).json({ 
            error: 'Error al crear la canción',
            details: error.message 
        });
    }
});

// Actualizar canción
app.put('/canciones/:id', verificarConexion, async (req, res) => {
    try {
        const id = req.params.id;
        const datosActualizacion = req.body;
        
        // Validar que el ID sea un número
        if (isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido, debe ser un número' });
        }
        
        console.log(`✏️ Actualizando canción con ID: ${id}`);
        
        // Validar datos
        const errores = validarCancion(datosActualizacion);
        if (errores.length > 0) {
            return res.status(400).json({ 
                error: 'Datos inválidos',
                errores: errores 
            });
        }
        
        const cancionActualizada = await dbOperations.update(id, datosActualizacion);
        console.log(`✅ Canción actualizada exitosamente: ${cancionActualizada.cancion}`);
        
        res.json(cancionActualizada);
    } catch (error) {
        console.error('❌ Error al actualizar canción:', error.message);
