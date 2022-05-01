<script setup lang="ts">
import { sendMessage } from 'webext-bridge'
import { ref, onMounted, watch } from 'vue'
import RuleItem from './Rule.vue'
import { Rule, Settings } from '../common/types'
import { GET_SETTINGS, UPDATE_SETTINGS, GROUP_TABS } from '../common/constants'

const rules = ref<Rule[]>([])
const expand = ref('')

const autogroup = ref(false)
const groupByDomain = ref(false)

watch([autogroup, groupByDomain], () => {
  updateSettings()
})

const updateSettings = () => {
  sendMessage(UPDATE_SETTINGS, {
    rules: rules.value,
    autogroup: autogroup.value,
    groupByDomain: groupByDomain.value,
  })
}

onMounted(async () => {
  const settings = await sendMessage<Settings, string>(GET_SETTINGS, {})

  rules.value = settings.rules || []
  autogroup.value = settings.autogroup
  groupByDomain.value = settings.groupByDomain
})

const groupTabs = async () => {
  await sendMessage(GROUP_TABS, {})
}

const handleExpand = (id: string) => {
  if (expand.value === id) {
    expand.value = ''
  } else {
    expand.value = id
  }
}

const handleChange = (data: Rule) => {
  const rule = rules.value.find(item => item.id === data.id)
  if (!rule) {
    return
  }

  rule.min = data.min
  rule.title = data.title
  rule.patterns = data.patterns

  updateSettings()
}

const handleDelete = (id: string) => {
  rules.value = rules.value.filter(item => item.id !== id)
  updateSettings()
}

const handleAddRule = () => {
  const newRule: Rule = {
    id: Math.random().toString(36).slice(2),
    title: 'Untitled',
    patterns: [''],
    type: 'url',
    min: 3,
  }
  rules.value.unshift(newRule)
  expand.value = newRule.id

  updateSettings()
}
</script>

<template>
  <main class="bg-zinc-100 min-h-[300px] p-4 text-zinc-700 w-[320px]">
    <Button class="rounded-full flex w-full" @click="groupTabs">Group Tabs</Button>

    <div class="mt-4 card">
      <div class="border-b flex py-2 justify-between">
        <div>Auto Group</div>
        <Switch v-model="autogroup"></Switch>
      </div>
      <div class="border-b flex py-2 justify-between">
        <div>Group By Domain</div>
        <Switch v-model="groupByDomain"></Switch>
      </div>
    </div>

    <div class="mt-4 rules card">
      <div class="flex items-end">
        <h2 class="font-medium text-lg">Rules</h2>
        <div class="cursor-pointer ml-auto text-sm text-accent" @click="handleAddRule">
          Add Rule
        </div>
      </div>
      <div class="mt-2 max-h-[300px] overflow-y-auto">
        <RuleItem
          v-for="rule of rules"
          :key="rule.id"
          :is-expand="expand === rule.id"
          :rule="rule"
          @expand="handleExpand"
          @change="handleChange"
          @delete="handleDelete"
        />
      </div>
    </div>
  </main>
</template>

<style>
.card {
  @apply bg-white rounded-lg p-4;
}
</style>
