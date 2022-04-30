<script setup lang="ts">
import { sendMessage } from 'webext-bridge'
import { ref, onMounted } from 'vue'
import Form from './Form.vue'
import { Rule } from '~/rule'

const rules = ref<Rule[]>([])

onMounted(async () => {
  const data = await sendMessage<Rule[], 'get-rules'>('get-rules', {})
  rules.value = data || []
})

const groupTabs = async () => {
  await sendMessage('group-tabs', {})
}

const autogroup = ref(false)

const editing = ref<Rule | null>(null)

const editRule = (rule: Rule) => {
  editing.value = rule
}

const deleteRule = (id: string) => {
  rules.value = rules.value.filter(item => item.id !== id)
}

const handleSave = (newRule: Rule) => {
  const rule = editing.value
  Object.assign(rule, newRule)
  editing.value = null
  sendMessage('update-rules', { rules: rules.value })
}

const handleClose = () => {
  editing.value = null
}

const addRule = () => {
  rules.value.push({
    id: Math.random().toString(36).slice(2),
    title: 'Untitled',
    patterns: [''],
    type: 'url',
    min: 3,
  })

  sendMessage('update-rules', { rules: rules.value })
}
</script>

<template>
  <main class="bg-zinc-100 min-h-[300px] p-4 text-zinc-700 w-[320px]">
    <Button class="rounded-full flex w-full" @click="groupTabs">Group Tabs</Button>

    <div class="mt-4 card">
      <!-- <div class="border-b flex py-2 justify-between">
        <div>Autogroup Tabs</div>
        <Switch v-model="autogroup"></Switch>
      </div>
      <div class="border-b flex py-2 justify-between">
        <div>Group By Domain</div>
        <Switch v-model="autogroup"></Switch>
      </div> -->
    </div>

    <div class="mt-4 rules card">
      <h2 class="font-medium text-lg">Rules</h2>
      <div v-for="rule of rules" :key="rule.id" class="border-b flex py-2 rule-item">
        <h4 class="flex-1">{{ rule.title }}</h4>
        <div class="icon" @click="editRule(rule)">
          <lucide-edit />
        </div>
        <div class="icon" @click="deleteRule(rule.id)">
          <lucide-trash-2 />
        </div>
      </div>

      <div class="mt-2">
        <Button @click="addRule">Add Rule</Button>
      </div>
    </div>

    <teleport to="body">
      <Form v-if="editing" :rule="editing" @save="handleSave" @close="handleClose" />
    </teleport>
  </main>
</template>

<style>
.card {
  @apply bg-white rounded-lg p-4;
}

.rule-item .icon {
  @apply rounded cursor-pointer flex flex-shrink-0  h-6 text-lg ml-2 opacity-0 text-zinc-500 w-6 justify-center items-center hover:bg-zinc-300/40;
}

.rule-item:hover .icon {
  @apply opacity-100;
}
</style>
