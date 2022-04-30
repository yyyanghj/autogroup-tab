<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    outline: boolean
  }>(),
  {
    outline: false,
  }
)
</script>

<template>
  <button
    class="rounded cursor-pointer flex h-8 items-center justify-center px-4"
    :class="outline ? 'text-accent border-currentColor border bg-white' : 'bg-accent text-zinc-50'"
  >
    <slot></slot>
  </button>
</template>
