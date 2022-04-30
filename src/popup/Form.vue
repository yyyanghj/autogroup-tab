<script lang="ts" setup>
import { ref } from 'vue'
import { Rule } from '../rule'

const props = defineProps<{
  rule: Rule
}>()

const patterns = ref(props.rule.patterns || [])
const title = ref(props.rule.title || '')
const minCount = ref(props.rule.min || 3)

const emit = defineEmits<{
  (e: 'save', rule: Rule): void
  (e: 'close'): void
}>()

const handleSave = () => {
  if (!title.value) {
    return
  }

  if (patterns.value.length === 1 && !patterns.value[0]) {
    return
  }

  emit('save', {
    id: props.rule.id,
    title: title.value,
    patterns: patterns.value,
    type: 'url',
    min: minCount.value,
  })
}

const handleBack = () => {
  emit('close')
}

const addPattern = (index: number) => {
  patterns.value.splice(index, 0, '')
}

const removePattern = (index: number) => {
  patterns.value.splice(index, 1)
}
</script>

<template>
  <div class="bg-zinc-50 p-4 form">
    <div class="px-2">
      <div
        class="icon"
        :style="{ fontSize: 20, width: 32, height: 32, opacity: 1 }"
        @click="handleBack"
      >
        <lucide-chevron-left />
      </div>
    </div>

    <div class="p-4">
      <div>
        <Input v-model="title" class="w-[192px]" type="text" placeholder="title" />
      </div>

      <div class="mt-2">
        <Input
          v-model="minCount"
          :min="1"
          :step="1"
          class="w-[192px]"
          type="number"
          placeholder="min count"
        />
      </div>

      <div>
        <div
          v-for="(pattern, index) of patterns"
          :key="index"
          class="flex mt-2 pattern items-center"
        >
          <Input v-model="patterns[index]" class="w-[192px]" type="text" placeholder="pattern" />
          <div class="icon" @click="addPattern(index)">
            <lucide-plus />
          </div>
          <div v-show="patterns.length > 1" class="icon" @click="removePattern(index)">
            <lucide-minus />
          </div>
        </div>
      </div>
    </div>

    <div class="flex px-4 justify-center">
      <Button class="w-full" @click="handleSave">Save Rule</Button>
    </div>
  </div>
</template>

<style>
.form {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.form .icon {
  @apply rounded cursor-pointer flex flex-shrink-0 h-6 text-lg ml-2 opacity-0 text-zinc-500 w-6 justify-center items-center hover:bg-zinc-300/40;
}

.form .pattern:hover .icon {
  @apply opacity-100;
}
</style>
