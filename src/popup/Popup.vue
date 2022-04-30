<script setup lang="ts">
import { sendMessage, onMessage } from 'webext-bridge'

const getTabs = async () => {
  await sendMessage('group-tabs', {})
}
</script>

<template>
  <main class="w-[300px] px-4 py-5 text-center text-gray-700">
    <button @click="getTabs">Autogroup Tabs</button>
  </main>
</template>
