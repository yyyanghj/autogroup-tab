<script lang="ts" setup>
import { ref, watch } from 'vue'
import { Rule } from '../common/types'
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

const handleExpand = () => {
  emit('expand', props.rule.id)
}

const handleDelete = () => {
  emit('delete', props.rule.id)
}

watch(
  [title, patterns],
  debounce(() => {
    emit('change', {
      id: props.rule.id,
      title: title.value,
      patterns: patterns.value.trim().split('\n'),
      type: 'url',
    })
  }, 200)
)
</script>

<template>
  <div class="rule-item overflow-hidden">
    <div class="flex items-center">
      <input
        v-model="title"
        type="text"
        placeholder="Group Title"
        class="cursor-text mr-4 px-2 w-[180px] field focus:border-zinc-300"
        :class="isExpand ? 'border-zinc-300' : 'border-transparent'"
      />

      <div class="flex ml-auto gap-2 items-center">
        <div class="delete-icon icon" @click="handleDelete">
          <lucide-trash-2 />
        </div>
        <div class="icon" @click="handleExpand">
          <lucide-chevron-right />
        </div>
      </div>
    </div>
    <div
      class="transition-all ease-in-out duration-200"
      :class="isExpand ? 'max-h-[200px]' : 'max-h-0'"
    >
      <div class="mt-2">
        <textarea
          v-model="patterns"
          placeholder="One line one pattern"
          class="p-2 field resize-none"
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

.rule-item .delete-icon {
  visibility: hidden;
}

.rule-item:hover .delete-icon {
  visibility: visible;
}
</style>
