<template>
  <div class="settings">
    <h2>Settings</h2>
    <div>
      <label for="primaryColor">Primary Color:</label>
      <input
        type="color"
        id="primaryColor"
        v-model="localSettings.primaryColor"
        aria-label="Choose primary color"
      />
    </div>
    <div>
      <label for="backgroundColor">Background Color:</label>
      <input
        type="color"
        id="backgroundColor"
        v-model="localSettings.backgroundColor"
        aria-label="Choose background color"
      />
    </div>
    <div>
      <label for="textColor">Text Color:</label>
      <input
        type="color"
        id="textColor"
        v-model="localSettings.textColor"
        aria-label="Choose text color"
      />
    </div>
    <div>
      <label for="brightness">Brightness: {{ localSettings.brightness }}%</label>
      <input
        type="range"
        id="brightness"
        v-model.number="localSettings.brightness"
        min="50"
        max="150"
        aria-label="Adjust brightness"
      />
    </div>
    <button @click="saveSettings">Save Settings</button>
    <button @click="resetSettings">Reset Settings</button>
    <button @click="logout">Log Out</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      localSettings: {
        primaryColor: '#FF00FF',
        backgroundColor: '#000000',
        textColor: '#FF00FF',
        brightness: 100,
      },
    };
  },
  methods: {
    saveSettings() {
      this.$emit('update-settings', this.localSettings);
      console.log('Settings saved:', this.localSettings);
    },
    resetSettings() {
      this.localSettings = {
        primaryColor: '#FF00FF',
        backgroundColor: '#000000',
        textColor: '#FF00FF',
        brightness: 100,
      };
      this.saveSettings();
      console.log('Settings reset to default');
    },
    logout() {
      this.$emit('logout');
      console.log('Logout triggered from Settings');
    },
  },
  mounted() {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      this.localSettings = JSON.parse(savedSettings);
      console.log('Settings loaded in Settings.vue:', this.localSettings);
    }
  },
};
</script>

<style scoped>
.settings {
  margin: 20px 0;
  color: var(--text-color, magenta);
}

label {
  display: block;
  margin: 10px 0 5px;
  color: var(--text-color, magenta);
}

input[type="color"],
input[type="range"] {
  width: 100%;
}

button {
  background-color: var(--primary-color, magenta);
  color: var(--text-color, black);
  margin: 10px 5px;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}
</style>