<template>
  <div class="login">
    <h2>Login</h2>
    <input
      type="email"
      v-model="email"
      placeholder="Enter your email"
      aria-label="Enter your email"
      @keyup.enter="login"
    />
    <button @click="login">Login</button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      error: '',
    };
  },
  methods: {
    login() {
      if (this.email.endsWith('@student.ucps.k12.nc.us')) {
        try {
          localStorage.setItem('userEmail', this.email);
          const profiles = JSON.parse(localStorage.getItem('profiles') || '{}');
          if (!profiles[this.email]) {
            profiles[this.email] = {
              name: '',
              picture: '',
              description: '',
              status: '',
              gallery: []
            };
            localStorage.setItem('profiles', JSON.stringify(profiles));
            console.log('Initialized new profile for email:', this.email);
          }
          this.$emit('login-success', this.email);
          console.log('Login successful:', this.email);
          this.error = '';
        } catch (e) {
          console.error('Failed to initialize profile:', e);
          this.error = 'Failed to login. Try clearing browser storage.';
        }
      } else {
        this.error = 'Please use a valid UCPS student email.';
        console.error('Invalid login attempt:', this.email);
      }
    },
  },
};
</script>

<style scoped>
.login {
  max-width: 400px;
  margin: 20px auto;
  padding: 20px;
  border: 2px solid var(--primary-color, magenta);
  border-radius: 10px;
  background-color: var(--background-color, black);
  color: var(--text-color, magenta);
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid var(--primary-color, magenta);
  border-radius: 5px;
  background-color: var(--background-color, black);
  color: var(--text-color, magenta);
}

button {
  background-color: var(--primary-color, magenta);
  color: var(--text-color, black);
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  width: 100%;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}

.error {
  color: red;
  margin-top: 10px;
}
</style>