<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Rule } from '../rule'
import { debounce } from 'lodash-es'

const props = defineProps<{
  rule: Rule
  isExpand: boolean
}>()

const emit = defineEmits<{
  (e: 'expand', id: string): void
  (e: 'change', rule: Rule): void
  (e: 'delete', id: string): void
}>()

const patterns = ref(props.rule.patterns.join('\n'))
const title = ref(props.rule.title || '')
const minCount = ref(props.rule.min || 3)

const handleExpand = () => {
  emit('expand', props.rule.id)
}

const handleDelete = () => {
  emit('delete', props.rule.id)
}

watch(
  [title, patterns, minCount],
  debounce(() => {
    emit('change', {
      id: props.rule.id,
      title: title.value,
      patterns: patterns.value.trim().split('\n'),
      type: 'url',
      min: minCount.value,
    })
  }, 200)
)
</script>

<template>
  <div class="rule-item overflow-hidden">
    <div class="flex py-2">
      <input
        v-model="title"
        type="text"
        class="bg-transparent border-b border-transparent cursor-text outline-none mr-2 focus:border-zinc-200"
      />

      <div class="ml-auto icon" @click="handleExpand">
        <lucide-chevron-right />
      </div>
      <div class="ml-2 icon" @click="handleDelete">
        <lucide-trash-2 />
      </div>
    </div>
    <div
      class="transition-all ease-in-out duration-200"
      :class="isExpand ? 'max-h-[200px]' : 'max-h-0'"
    >
      <div>
        <input
          v-model="minCount"
          type="number"
          :min="1"
          :max="9"
          :step="1"
          inputmode="numeric"
          placeholder="min count of tabs per group"
          class="bg-transparent border-b border-transparent outline-none text-sm w-20 focus:border-zinc-200"
        />
      </div>
      <div class="mt-2">
        <textarea
          v-model="patterns"
          class="bg-transparent border rounded-md outline-none p-2 resize-none"
          rows="4"
        >
        </textarea>
      </div>
    </div>
  </div>
</template>

<style>
.rule-item .icon {
  @apply rounded cursor-pointer flex flex-shrink-0 h-6 text-zinc-500 w-6 justify-center items-center;
}
</style>
