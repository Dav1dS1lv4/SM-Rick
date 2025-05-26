import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();

// Configurar o limite do body-parser para 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cors({ origin: 'http://localhost:5173' })); // Ajustado para Vite

// Conectar ao MongoDB
mongoose.connect('mongodb://localhost:27017/social-network')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err.message));

// Schema para perfis
const profileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  description: String,
  status: String,
  gallery: [String],
});
const Profile = mongoose.model('Profile', profileSchema);

// Schema para posts
const postSchema = new mongoose.Schema({
  email: String,
  content: String,
  image: String,
  user: { name: String, profilePicture: String },
  comments: [{ content: String, user: String, createdAt: String }],
  createdAt: String,
});
const Post = mongoose.model('Post', postSchema);

// Rota padrão para GET /
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Social Network Backend is running' });
});

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
  const { email } = req.body;
  console.log('Register request received:', { email, body: req.body });
  try {
    const profile = new Profile({ email });
    await profile.save();
    console.log('Profile saved successfully:', email);
    res.status(201).json({ message: 'User registered', email });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(400).json({ error: 'Registration failed', details: error.message });
  }
});

// Rota para salvar perfil
app.post('/profile', async (req, res) => {
  const { email, name, picture, description, status, gallery } = req.body;
  console.log('Profile update request received:', { email, name, picture, bodySize: JSON.stringify(req.body).length });
  try {
    await Profile.findOneAndUpdate(
      { email },
      { name, picture, description, status, gallery },
      { upsert: true, new: true, runValidators: true }
    );
    console.log('Profile updated successfully:', { email, name });
    res.status(200).json({ message: 'Profile saved' });
  } catch (error) {
    console.error('Profile save error:', error.message);
    res.status(400).json({ error: 'Failed to save profile', details: error.message });
  }
});

// Rota para carregar perfil
app.get('/profile/:email', async (req, res) => {
  console.log('Profile load request for:', req.params.email);
  try {
    const profile = await Profile.findOne({ email: req.params.email });
    console.log('Profile found:', profile ? profile.email : 'Not found');
    res.status(200).json(profile || { email: req.params.email, name: '', picture: '', description: '', status: '', gallery: [] });
  } catch (error) {
    console.error('Profile load error:', error.message);
    res.status(400).json({ error: 'Failed to load profile', details: error.message });
  }
});

// Rota para salvar posts
app.post('/posts', async (req, res) => {
  const posts = req.body;
  console.log('Posts save request received:', { count: posts.length, email: posts[0]?.email, bodySize: JSON.stringify(req.body).length });
  try {
    await Post.deleteMany({ email: posts[0]?.email });
    await Post.insertMany(posts);
    console.log('Posts saved successfully:', posts.length);
    res.status(200).json({ message: 'Posts saved' });
  } catch (error) {
    console.error('Posts save error:', error.message);
    res.status(400).json({ error: 'Failed to save posts', details: error.message });
  }
});

// Rota para carregar posts
app.get('/posts/:email', async (req, res) => {
  console.log('Posts load request for:', req.params.email);
  try {
    const posts = await Post.find({ email: req.params.email });
    console.log('Posts found:', posts.length);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Posts load error:', error.message);
    res.status(400).json({ error: 'Failed to load posts', details: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));