<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const email = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const router = useRouter()

async function entrar() {
  error.value = ''
  cargando.value = true
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })
  cargando.value = false
  if (err) error.value = 'Correo o contraseña incorrectos'
  else router.push('/admin')
}
</script>

<template>
  <div class="container">
    <form class="login" @submit.prevent="entrar">
      <h2>Ingreso administrador</h2>
      <input v-model="email" type="email" placeholder="Correo" required />
      <input v-model="password" type="password" placeholder="Contraseña" required />
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Entrando...' : 'Entrar' }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<style scoped>
.container {
  padding: 20px;
  background-color: #32065A;
  color: #fff;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.login {
  background: #fff;
  color: #333;
  padding: 30px;
  border-radius: 8px;
  width: 100%;
  max-width: 360px;
  margin-top: 60px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
}
button {
  padding: 10px;
  background: #6A22AA;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}
button:disabled {
  opacity: 0.6;
}
.error {
  color: #d32f2f;
}
</style>
