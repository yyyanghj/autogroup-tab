<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

interface Props {
  modelValue?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
})

const handleInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    v-bind="$attrs"
    :value="props.modelValue"
    class="bg-transparent border rounded-md outline-none h-8 px-4"
    @input="handleInput"
  />
</template>
