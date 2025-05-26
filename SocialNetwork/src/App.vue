<script setup>

import Profile from './components/Profile.vue'
import Post from './components/Post.vue'
import Login from './components/Login.vue'
import Tabs from './components/Tabs.vue'
import Settings from './components/Settings.vue'
</script>

<template>
  <div id="app" :style="{ '--primary-color': settings.primaryColor, filter: `brightness(${settings.brightness}%)` }">
    <h1>School Social Network</h1>
    <Login v-if="!isLoggedIn" @login-success="onLoginSuccess" />

    <div v-else>
      <Tabs
        :tabs="tabs"
        :selectedTab="selectedTab"
        @update:selectedTab="selectTab"
      />

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
    onFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target.result;
          console.log('Post image loaded:', {
            size: e.target.result.length,
            url: e.target.result.slice(0, 50) + '...'
          });
        };
        reader.onerror = (e) => console.error('Failed to read post image:', e);
        reader.readAsDataURL(file);
      }
    },
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
          profilePicture: this.user.profilePicture
        },
        comments: [],
        createdAt: new Date().toLocaleString(),
      };
      console.log('Post created:', {
        id: newPost.id,
        userName: newPost.user.name,
        userPicture: newPost.user.profilePicture ? newPost.user.profilePicture.slice(0, 50) + '...' : 'No picture'
      });
      this.posts.push(newPost);
      this.savePosts();
      this.newPost = '';
      this.selectedImage = null;
      this.postError = '';
    },
    addComment(postId, comment) {
      const post = this.posts.find(p => p.id === postId);
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
      this.posts = this.posts.filter(post => post.id !== postId);
      this.savePosts();
      console.log('Post deleted:', postId);
    },
    savePosts() {
      try {
        localStorage.setItem('posts', JSON.stringify(this.posts));
        console.log('Posts saved to localStorage:', this.posts.length);
      } catch (e) {
        console.error('Failed to save posts:', e);
        alert('Failed to save posts. Try clearing browser storage.');
      }
    },
    loadPosts() {
      try {
        const savedPosts = localStorage.getItem('posts');
        if (savedPosts) {
          const parsedPosts = JSON.parse(savedPosts);
          if (!Array.isArray(parsedPosts)) {
            throw new Error('Posts is not an array');
          }
          this.posts = parsedPosts.map(post => ({
            ...post,
            user: post.user || { name: 'Unknown', profilePicture: '' },
            comments: Array.isArray(post.comments) ? post.comments : [],
          }));
          console.log('Posts loaded:', this.posts.map(p => ({
            id: p.id,
            userName: p.user.name,
            userPicture: p.user.profilePicture ? 'Present' : 'Missing'
          })));
        } else {
          console.log('No saved posts found');
        }
      } catch (e) {
        console.error('Failed to load posts:', e);
        localStorage.removeItem('posts');
        this.posts = [];
        alert('Failed to load posts. Corrupted data cleared. Please create new posts.');
      }
    },
    updateProfile(profile) {
      this.user = {
        email: this.user.email,
        name: profile.name || '',
        profilePicture: profile.picture || '',
        description: profile.description || '',
        status: profile.status || '',
        gallery: profile.gallery || [],
      };
      try {
        const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
        profiles[this.user.email] = {
          name: this.user.name,
          picture: this.user.profilePicture,
          description: this.user.description,
          status: this.user.status,
          gallery: this.user.gallery,
        };
        localStorage.setItem('profiles', JSON.stringify(profiles));
        console.log('Profile updated:', {
          email: this.user.email,
          name: this.user.name,
          picture: this.user.profilePicture ? this.user.profilePicture.slice(0, 50) + '...' : 'No picture',
          description: this.user.description ? this.user.description.slice(0, 50) + '...' : 'No description',
          status: this.user.status || 'No status',
          galleryCount: this.user.gallery.length
        });
      } catch (e) {
        console.error('Failed to save profile:', e);
        alert('Failed to save profile. Try clearing browser storage.');
      }
    },
    loadProfile(email) {
      try {
        const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
        const savedProfile = profiles[email];
        if (savedProfile) {
          this.user = {
            email,
            name: savedProfile.name || '',
            profilePicture: savedProfile.picture || '',
            description: savedProfile.description || '',
            status: savedProfile.status || '',
            gallery: Array.isArray(savedProfile.gallery) ? savedProfile.gallery : []
          };
          console.log('Profile loaded:', {
            email,
            name: this.user.name,
            picture: this.user.profilePicture ? this.user.profilePicture.slice(0, 50) + '...' : 'No picture',
            description: this.user.description ? this.user.description.slice(0, 50) + '...' : 'No description',
            status: this.user.status || 'No status',
            galleryCount: this.user.gallery.length
          });
        } else {
          this.user = { email, name: '', profilePicture: '', description: '', status: '', gallery: [] };
          console.log('No saved profile found for email:', email);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
        localStorage.removeItem('profiles');
        this.user = { email, name: '', profilePicture: '', description: '', status: '', gallery: [] };
        alert('Failed to load profile. Corrupted data cleared. Please re-upload profile.');
      }
    },
    updateSettings(settings) {
      this.settings = { ...this.settings, ...settings };
      try {
        localStorage.setItem('settings', JSON.stringify(this.settings));
        console.log('Settings updated:', this.settings);
      } catch (e) {
        console.error('Failed to save settings:', e);
      }
    },
    loadSettings() {
      try {
        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
          this.settings = JSON.parse(savedSettings);
          console.log('Settings loaded:', this.settings);
        }
      } catch (e) {
        console.error('Failed to load settings:', e);
        localStorage.removeItem('settings');
      }
    },
    logout() {
      try {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('posts');
        this.isLoggedIn = false;
        this.user = { email: '', name: '', profilePicture: '', description: '', status: '', gallery: [] };
        this.posts = [];
        this.selectedTab = { name: 'posts', label: 'View Posts' };
        console.log('Logged out successfully');
      } catch (e) {
        console.error('Logout failed:', e);
      }
    },
    onLoginSuccess(email) {
      this.isLoggedIn = true;
      this.user.email = email;
      this.loadProfile(email);
      this.loadPosts();
      console.log('Login successful:', email);
    },
    selectTab(tab) {
      this.selectedTab = tab;
      if (tab.name === 'profile') {
        this.loadProfile(this.user.email);
      }
      console.log('Tab selected:', tab.name);
    },
  },
  mounted() {
    const email = localStorage.getItem('userEmail');
    if (email && email.endsWith('@student.ucps.k12.nc.us')) {
      this.isLoggedIn = true;
      this.user.email = email;
      this.loadProfile(email);
      this.loadPosts();
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