<template>
  <div class="profile" @mouseover="hover = true" @mouseleave="hover = false">
    <h2>Edit Profile</h2>
    <div class="profile-picture">
      <img 
        :src="profile.picture || 'https://via.placeholder.com/150?text=User'" 
        alt="Profile Picture" 
        class="profile-img" 
      />
      <input 
        type="file" 
        @change="onFileChange" 
        accept="image/*" 
        aria-label="Upload profile picture" 
      />
    </div>
    <div>
      <label>Name:</label>
      <input 
        v-model="profile.name" 
        placeholder="Enter your name" 
        required 
        aria-label="Enter your name" 
      />
    </div>
    <div>
      <label>Description:</label>
      <textarea 
        v-model="profile.description" 
        placeholder="Tell us about yourself" 
        aria-label="Enter your description" 
      />
    </div>
    <div>
      <label>Status:</label>
      <input 
        v-model="profile.status" 
        placeholder="What's your status?" 
        aria-label="Enter your status" 
      />
    </div>
    <div class="gallery-section">
      <h3>Photo Gallery</h3>
      <input 
        type="file" 
        @change="onGalleryFileChange" 
        accept="image/*" 
        aria-label="Upload gallery photo" 
      />
      <div class="gallery-grid" v-if="profile.gallery.length">
        <div v-for="(photo, index) in profile.gallery" :key="index" class="gallery-item">
          <img :src="photo" :alt="`Gallery photo ${index + 1}`" class="gallery-img" />
          <button class="delete-btn" @click="deleteGalleryPhoto(index)">Delete</button>
        </div>
      </div>
      <p v-else>No photos in gallery yet.</p>
    </div>
    <button @click="saveProfile">Save Profile</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      profile: {
        picture: '',
        name: '',
        description: '',
        status: '',
        gallery: [],
      },
      hover: false,
    };
  },
  methods: {
    onFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        console.warn('No file selected for profile picture');
        return;
      }
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        alert('Please upload a valid image (JPEG/PNG).');
        return;
      }
      if (file.size > 500 * 1024) {
        console.error('Image too large:', file.size);
        alert('Image must be smaller than 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          this.profile.picture = result;
          console.log('Profile picture uploaded:', {
            size: result.length,
            url: result.slice(0, 50) + '...'
          });
        } else {
          console.error('Invalid image data URL');
          alert('Failed to process image. Try another.');
        }
      };
      reader.onerror = (e) => {
        console.error('File read error:', e);
        alert('Failed to upload image. Try again.');
      };
      reader.readAsDataURL(file);
    },
    onGalleryFileChange(event) {
      const file = event.target.files[0];
      if (!file) {
        console.warn('No file selected for gallery');
        return;
      }
      if (!file.type.startsWith('image/')) {
        console.error('Invalid file type:', file.type);
        alert('Please upload a valid image (JPEG/PNG).');
        return;
      }
      if (file.size > 500 * 1024) {
        console.error('Image too large:', file.size);
        alert('Image must be smaller than 500KB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target.result;
        if (typeof result === 'string' && result.startsWith('data:image/')) {
          this.profile.gallery.push(result);
          console.log('Gallery photo uploaded:', {
            size: result.length,
            url: result.slice(0, 50) + '...',
            galleryCount: this.profile.gallery.length
          });
        } else {
          console.error('Invalid image data URL');
          alert('Failed to process image. Try another.');
        }
      };
      reader.onerror = (e) => {
        console.error('File read error:', e);
        alert('Failed to upload image. Try again.');
      };
      reader.readAsDataURL(file);
    },
    deleteGalleryPhoto(index) {
      console.log('Deleting gallery photo at index:', index);
      this.profile.gallery.splice(index, 1);
    },
    saveProfile() {
      if (!this.profile.name) {
        console.warn('No name provided');
        alert('Please enter a name.');
        return;
      }
      try {
        localStorage.setItem('profile', JSON.stringify(this.profile));
        this.$emit('update-profile', this.profile);
        console.log('Profile saved:', {
          name: this.profile.name,
          picture: this.profile.picture ? this.profile.picture.slice(0, 50) + '...' : 'No picture',
          description: this.profile.description ? this.profile.description.slice(0, 50) + '...' : 'No description',
          status: this.profile.status || 'No status',
          galleryCount: this.profile.gallery.length
        });
      } catch (e) {
        console.error('Failed to save profile:', e);
        alert('Failed to save profile. Clear browser storage and try again.');
      }
    },
    loadProfile() {
      try {
        const savedProfile = localStorage.getItem('profile');
        if (savedProfile) {
          const parsedProfile = JSON.parse(savedProfile);
          this.profile = {
            picture: parsedProfile.picture || '',
            name: parsedProfile.name || '',
            description: parsedProfile.description || '',
            status: parsedProfile.status || '',
            gallery: Array.isArray(parsedProfile.gallery) ? parsedProfile.gallery : []
          };
          console.log('Profile loaded:', {
            name: this.profile.name,
            picture: this.profile.picture ? this.profile.picture.slice(0, 50) + '...' : 'No picture',
            description: this.profile.description ? this.profile.description.slice(0, 50) + '...' : 'No description',
            status: this.profile.status || 'No status',
            galleryCount: this.profile.gallery.length
          });
        } else {
          console.log('No saved profile found');
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
        localStorage.removeItem('profile');
        alert('Failed to load profile. Cleared corrupted data. Please re-upload.');
      }
    },
  },
  mounted() {
    this.loadProfile();
  },
};
</script>

<style scoped>
.profile {
  margin: 20px 0;
  color: var(--text-color, magenta);
  background-color: var(--background-color, black);
  padding: 20px;
  border-radius: 10px;
}

.profile-img {
  max-width: 150px;
  height: auto;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.profile-img:hover {
  transform: scale(1.05);
}

input,
textarea {
  color: var(--text-color, magenta);
  transition: border-color 0.3s ease;
  width: 100%;
  padding: 10px;
  margin: 5px 0;
  border: 1px solid var(--primary-color, magenta);
  border-radius: 5px;
  background-color: var(--background-color, black);
}

input:focus,
textarea:focus {
  border-color: var(--primary-color, magenta);
}

textarea {
  height: 100px;
  resize: vertical;
}

label {
  display: block;
  margin: 10px 0 5px;
  color: var(--text-color, magenta);
}

button {
  background-color: var(--primary-color, magenta);
  color: var(--text-color, black);
  transition: background-color 0.3s ease, transform 0.2s ease;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

.gallery-section {
  margin-top: 20px;
}

.gallery-section h3 {
  color: var(--text-color, magenta);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.gallery-item {
  position: relative;
}

.gallery-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: 5px;
  border: 2px solid var(--primary-color, magenta);
  transition: transform 0.3s ease;
}

.gallery-img:hover {
  transform: scale(1.05);
}

.delete-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: red;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.delete-btn:hover {
  background-color: darkred;
}

@media (max-width: 600px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}
</style>