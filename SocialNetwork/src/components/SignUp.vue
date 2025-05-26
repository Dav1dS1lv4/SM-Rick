<template>
  <div class="signup">
    <h2>School Social Network</h2>
    <input 
      v-model="email" 
      type="email" 
      placeholder="Enter your school email" 
      aria-label="Email"
    />
    <button @click="register">Register</button>
    <button @click="login">Login</button>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const error = ref('')
const emit = defineEmits(['login-success', 'register-success'])

const register = () => {
  if (!email.value) {
    error.value = 'Email is required'
    return
  }

  if (!email.value.includes('@') || !email.value.includes('.')) {
    error.value = 'Please enter a valid email address'
    return
  }

  if (!email.value.endsWith('@student.ucps.k12.nc.us')) {
    error.value = 'Use a valid school email (@student.ucps.k12.nc.us)'
    return
  }

  emit('register-success', email.value)
  email.value = ''
  error.value = ''
}

const login = () => {
  if (!email.value) {
    error.value = 'Email is required'
    return
  }

  if (!email.value.includes('@') || !email.value.includes('.')) {
    error.value = 'Please enter a valid email address'
    return
  }

  if (!email.value.endsWith('@student.ucps.k12.nc.us')) {
    error.value = 'Login only allowed with a school email (@student.ucps.k12.nc.us)'
    return
  }

  emit('login-success', email.value)
  email.value = ''
  error.value = ''
}
</script>

<style scoped>
.signup {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 2px solid var(--primary-color, magenta);
  border-radius: 10px;
  background-color: black;
  color: var(--primary-color, magenta);
}
h2 {
  color: var(--primary-color, magenta);
}
button {
  background-color: var(--primary-color, magenta);
  color: black;
  padding: 5px;
  border: none;
  cursor: pointer;
  margin: 5px 0;
  width: 100%;
}
button:hover {
  background-color: #e0e0e0;
}
.error {
  color: red;
}
</style>