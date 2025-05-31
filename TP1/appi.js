const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const port = 4000; // Cambiado el puerto

// Configuración
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:4000' // Configuración específica de CORS
}));

// Conexión a MongoDB con opciones adicionales
mongoose.connect("mongodb+srv://Cesar:Gymbro39@cesarinn.9rmjh.mongodb.net/?retryWrites=true&w=majority&appName=Cesarinn", {

  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error de conexión:', err));

// Esquema de usuario con validaciones adicionales
const userSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/
  },
  passwordHash: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = this.generateHash(this.passwordHash);
  }
  next();
});

// Método para generar hash
userSchema.methods.generateHash = function(password) {
  return require('crypto').createHash('sha256').update(password).digest('hex');
};

// Método para verificar contraseña
userSchema.methods.validPassword = function(password) {
  return this.passwordHash === this.generateHash(password);
};

// Generar token JWT
userSchema.methods.generateJWT = function() {
  return jwt.sign(
    { id: this._id, username: this.username },
    'secretoSuperSecreto', 
    { expiresIn: '1h' }
  );
};

const User = mongoose.model('User', userSchema);


app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validación adicional
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario o correo ya existe' });
    }

    const newUser = new User({ username, email, passwordHash: password });
    await newUser.save();
    
    const token = newUser.generateJWT();
    
    res.status(201).json({ 
      message: 'Usuario creado exitosamente',
      token,
      user: { username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ruta de login mejorada
app.post('/api/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !user.validPassword(password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    const token = user.generateJWT();
    
    res.json({ 
      message: 'Inicio de sesión exitoso',
      token,
      user: { username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware de autenticación
const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Acceso no autorizado' });

  jwt.verify(token, 'secretoSuperSecreto', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Token inválido' });
    req.user = decoded;
    next();
  });
};

// Ruta protegida de ejemplo
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: 'Ruta protegida', user: req.user });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
