<script setup>
// Definimos las propiedades que la tarjeta va a recibir desde afuera
defineProps({
  titulo: String,
  descripcion: String,
  estado: String
})
</script>

<template>
  <div class="card">
    <h3>{{ titulo }}</h3>
    <p>{{ descripcion }}</p>
    <span class="badge">{{ estado }}</span>
  </div>
</template>

<style scoped>
.card {
  background: #1a1a1a;
  color: #ffffff;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border-left: 6px solid #7c3aed;
  border-top: 1px solid #333;
  border-right: 1px solid #333;
  border-bottom: 1px solid #333;
  text-align: left;
}
.card h3 {
  margin-top: 0;
  color: #f3e8ff;
}
.badge {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.3rem 0.8rem;
  background-color: #581c87;
  color: #f3e8ff;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: bold;
}
</style>