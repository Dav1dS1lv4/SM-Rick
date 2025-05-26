<script setup>
import SignUp from './components/SignUp.vue';
import Profile from './components/Profile.vue';
import Post from './components/Post.vue';
import Tabs from './components/Tabs.vue';
import Settings from './components/Settings.vue';
</script>

<template>
  <div id="app" :style="{ '--primary-color': settings.primaryColor, filter: `brightness(${settings.brightness}%)` }">
    <h1>School Social Network</h1>
    <SignUp v-if="!isLoggedIn" @login-success="onLoginSuccess" @register-success="onRegisterSuccess" />

    <div v-else>
      <Tabs :tabs="tabs" :selectedTab="selectedTab" @update:selectedTab="selectTab" />
      <div v-if="selectedTab.name === 'profile'">
        <Profile @update-profile="updateProfile" />
      </div>
      <div v-else-if="selectedTab.name === 'posts'">
        <div class="user-profile">
          <img
            :src="user.profilePicture || 'https://via.placeholder.com/50?text=User'"
            :alt="`${user.name}'s profile picture`"
            class="profile-img"
          />
          <span>{{ user.name }}</span>
        </div>
        <div class="post-input">
          <input
            v-model="newPost"
            placeholder="What's on your mind?"
            @keyup.enter="createPost"
            aria-label="Create a new post"
          />
          <input type="file" @change="onFileChange" accept="image/*" aria-label="Upload an image" />
          <button @click="createPost">Post</button>
          <p v-if="postError" class="error">{{ postError }}</p>
        </div>
        <div v-if="selectedImage" class="image-preview">
          <h4>Image Preview:</h4>
          <img :src="selectedImage" alt="Selected image" />
        </div>
        <div class="posts">
          <Post
            v-for="post in sortedPosts"
            :key="post.id"
            :post="post"
            :user="user"
            @add-comment="addComment"
            @delete-post="deletePost"
          />
        </div>
      </div>
      <div v-else-if="selectedTab.name === 'settings'">
        <Settings @update-settings="updateSettings" @logout="logout" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: [],
      newPost: '',
      selectedImage: null,
      postError: '',
      isLoggedIn: false,
      user: {
        email: '',
        name: '',
        profilePicture: '',
        description: '',
        status: '',
        gallery: [],
      },
      selectedTab: { name: 'posts', label: 'View Posts' },
      tabs: [
        { name: 'posts', label: 'View Posts' },
        { name: 'profile', label: 'Edit Profile' },
        { name: 'settings', label: 'Settings' },
      ],
      settings: {
        primaryColor: '#FF00FF',
        brightness: 100,
      },
    };
  },

  computed: {
    sortedPosts() {
      return [...this.posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
  },

  methods: {
    // Image Handling
    async onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedImage = await this.resizeImage(file);
        console.log('Post image loaded:', {
          size: this.selectedImage.length,
          url: this.selectedImage.slice(0, 50) + '...',
        });
      }
    },

    async resizeImage(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const maxSize = 800; // Máximo de 800px em largura ou altura
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxSize) {
                height *= maxSize / width;
                width = maxSize;
              }
            } else {
              if (height > maxSize) {
                width *= maxSize / height;
                height = maxSize;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8)); // Qualidade 80%
          };
          img.src = e.target.result;
        };
        reader.onerror = (e) => console.error('Failed to read image:', e);
        reader.readAsDataURL(file);
      });
    },

    // Post Management
    createPost() {
      if (!this.newPost && !this.selectedImage) {
        this.postError = 'Please enter some content or select an image.';
        console.warn('Post creation failed: no content or image');
        return;
      }

      const newPost = {
        id: Date.now(),
        content: this.newPost,
        image: this.selectedImage,
        user: {
          name: this.user.name,
          profilePicture: this.user.profilePicture,
        },
        comments: [],
        createdAt: new Date().toLocaleString(),
      };

      const payload = JSON.stringify([newPost]);
      console.log('Post payload size:', payload.length, 'bytes');
      if (payload.length > 5 * 1024 * 1024) { // Limite de 5MB
        this.postError = 'Post too large. Please reduce the image size or content.';
        return;
      }

      console.log('Post created:', {
        id: newPost.id,
        userName: newPost.user.name,
        userPicture: newPost.user.profilePicture ? newPost.user.profilePicture.slice(0, 50) + '...' : 'No picture',
      });
      this.posts.push(newPost);
      this.savePosts();
      this.newPost = '';
      this.selectedImage = null;
      this.postError = '';
    },

    addComment(postId, comment) {
      const post = this.posts.find((p) => p.id === postId);
      if (post) {
        post.comments.push({
          content: comment,
          user: this.user.name,
          createdAt: new Date().toLocaleString(),
        });
        this.savePosts();
        console.log('Comment added to post:', postId);
      }
    },

    deletePost(postId) {
      this.posts = this.posts.filter((post) => post.id !== postId);
      this.savePosts();
      console.log('Post deleted:', postId);
    },

    // Data Persistence
    async savePosts() {
      console.log('Attempting to save posts:', this.posts.length, 'posts');
      try {
        const response = await fetch('http://localhost:3000/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.posts.map((post) => ({ ...post, email: this.user.email }))),
        });
        const text = await response.text();
        console.log('Posts save response:', { status: response.status, text });
        const data = JSON.parse(text);
        if (!response.ok) throw new Error(data.error || 'Failed to save posts');
        console.log('Posts saved to MongoDB:', this.posts.length);
      } catch (error) {
        console.error('Failed to save posts:', error.message);
        alert(`Failed to save posts: ${error.message} (Is the backend running on http://localhost:3000?)`);
      }
    },

    async loadPosts() {
      console.log('Attempting to load posts for email:', this.user.email);
      try {
        const response = await fetch(`http://localhost:3000/posts/${this.user.email}`, {
          method: 'GET',
        });
        const text = await response.text();
        console.log('Posts load response:', { status: response.status, text });
        const posts = JSON.parse(text);
        if (!response.ok) throw new Error(posts.error || 'Failed to load posts');
        this.posts = posts.map((post) => ({
          ...post,
          user: post.user || { name: 'Unknown', profilePicture: '' },
          comments: Array.isArray(post.comments) ? post.comments : [],
        }));
        console.log('Posts loaded:', this.posts.length);
      } catch (error) {
        console.error('Failed to load posts:', error.message);
        alert(`Failed to load posts: ${error.message} (Is the backend running on http://localhost:3000?)`);
        this.posts = [];
      }
    },

    async updateProfile(profile) {
      this.user = {
        email: this.user.email,
        name: profile.name || '',
        profilePicture: profile.picture || '',
        description: profile.description || '',
        status: profile.status || '',
        gallery: profile.gallery || [],
      };
      console.log('Attempting to save profile:', { email: this.user.email, name: this.user.name });
      try {
        const response = await fetch('http://localhost:3000/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.user),
        });
        const text = await response.text();
        console.log('Profile save response:', { status: response.status, text });
        const data = JSON.parse(text);
        if (!response.ok) throw new Error(data.error || 'Failed to save profile');
        console.log('Profile updated:', {
          email: this.user.email,
          name: this.user.name,
          picture: this.user.profilePicture ? 'Present' : 'Absent',
        });
      } catch (error) {
        console.error('Failed to save profile:', error.message);
        alert(`Failed to save profile: ${error.message} (Is the backend running on http://localhost:3000?)`);
      }
    },

    async loadProfile(email) {
      console.log('Attempting to load profile for email:', email);
      try {
        const response = await fetch(`http://localhost:3000/profile/${email}`, {
          method: 'GET',
        });
        const text = await response.text();
        console.log('Profile load response:', { status: response.status, text });
        const savedProfile = JSON.parse(text);
        if (!response.ok) throw new Error(savedProfile.error || 'Failed to load profile');
        this.user = {
          email,
          name: savedProfile.name || '',
          profilePicture: savedProfile.picture || '',
          description: savedProfile.description || '',
          status: savedProfile.status || '',
          gallery: Array.isArray(savedProfile.gallery) ? savedProfile.gallery : [],
        };
        console.log('Profile loaded:', { email, name: this.user.name });
      } catch (error) {
        console.error('Failed to load profile:', error.message);
        alert(`Failed to load profile: ${error.message} (Is the backend running on http://localhost:3000?)`);
        this.user = { email, name: '', profilePicture: '', description: '', status: '', gallery: [] };
      }
    },

    // Settings Management
    updateSettings(settings) {
      this.settings = { ...this.settings, ...settings };
      try {
        localStorage.setItem('settings', JSON.stringify(this.settings));
        console.log('Settings updated:', this.settings);
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    },

    loadSettings() {
      try {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
          this.settings = JSON.parse(savedSettings);
          console.log('Settings loaded:', this.settings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        localStorage.removeItem('settings');
      }
    },

    // Authentication
    async logout() {
      try {
        localStorage.removeItem('userEmail');
        this.isLoggedIn = false;
        this.user = { email: '', name: '', profilePicture: '', description: '', status: '', gallery: [] };
        this.posts = [];
        this.selectedTab = { name: 'posts', label: 'View Posts' };
        console.log('Logged out successfully');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },

    async onLoginSuccess(email) {
      console.log('Attempting to verify login for email:', email);
      try {
        const response = await fetch(`http://localhost:3000/profile/${email}`, {
          method: 'GET',
        });
        const text = await response.text();
        console.log('Login verification response:', { status: response.status, text });
        const data = JSON.parse(text);
        if (!response.ok || !data || !data.email) {
          alert('Email not found. Please register first.');
          return;
        }
        this.isLoggedIn = true;
        this.user.email = email;
        localStorage.setItem('userEmail', email);
        await this.loadProfile(email);
        await this.loadPosts();
        console.log('Login successful:', email);
      } catch (error) {
        console.error('Login verification failed:', error.message);
        alert(`Login failed: ${error.message} (Is the backend running on http://localhost:3000?)`);
      }
    },

    async onRegisterSuccess(email) {
      console.log('Attempting to register user:', email);
      try {
        const response = await fetch('http://localhost:3000/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const text = await response.text();
        console.log('Register response:', { status: response.status, text });
        const data = JSON.parse(text);
        if (!response.ok) throw new Error(data.error || 'Unknown error during registration');
        this.isLoggedIn = true;
        localStorage.setItem('userEmail', email);
        this.user.email = email;
        await this.loadProfile(email);
        await this.loadPosts();
        console.log('Registered and logged in successfully:', email);
      } catch (error) {
        console.error('Registration failed:', error.message);
        alert(`Failed to register: ${error.message} (Is the backend running on http://localhost:3000?)`);
      }
    },

    selectTab(tab) {
      this.selectedTab = tab;
      if (tab.name === 'profile') {
        this.loadProfile(this.user.email);
      }
      console.log('Tab selected:', tab.name);
    },
  },

  async mounted() {
    const email = localStorage.getItem('userEmail');
    if (email && email.endsWith('@student.ucps.k12.nc.us')) {
      console.log('Checking if email exists in DB before auto-login:', email);
      try {
        const response = await fetch(`http://localhost:3000/profile/${email}`, {
          method: 'GET',
        });
        const text = await response.text();
        console.log('Auto-login verification response:', { status: response.status, text });
        const data = JSON.parse(text);
        if (response.ok && data && data.email) {
          this.isLoggedIn = true;
          this.user.email = email;
          await this.loadProfile(email);
          await this.loadPosts();
        } else {
          localStorage.removeItem('userEmail');
          console.log('Email not found in DB, clearing localStorage');
        }
      } catch (error) {
        console.error('Auto-login failed:', error.message);
        localStorage.removeItem('userEmail');
      }
    }
    this.loadSettings();
    console.log('App mounted, isLoggedIn:', this.isLoggedIn);
  },
};
</script>

<style scoped>
#app {
  max-width: 90vw;
  margin: auto;
  padding: 2rem;
  border: 5px solid var(--primary-color, magenta);
  border-radius: 10px;
  background-color: black;
  color: var(--primary-color, magenta);
}

h1 {
  color: var(--primary-color, magenta);
}

.user-profile {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.user-profile span {
  color: var(--primary-color, magenta);
}

.profile-img {
  max-width: 10vw;
  height: auto;
  border-radius: 50%;
  margin-right: 1rem;
}

.post-input input {
  color: var(--primary-color, magenta);
}

.post-input button {
  background-color: var(--primary-color, magenta);
  color: black;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.post-input button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

.image-preview img {
  max-width: 100%;
  height: auto;
}

.image-preview h4 {
  color: var(--primary-color, magenta);
}

.error {
  color: red;
}

@media (max-width: 600px) {
  .profile-img {
    max-width: 15vw;
  }
  .post-input input {
    width: 100%;
  }
}
</style>