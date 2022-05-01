<script setup lang="ts">
import { sendMessage } from 'webext-bridge'
import { ref, onMounted, watch } from 'vue'
import RuleItem from './Rule.vue'
import { Rule, Settings } from '../common/types'
import { GET_SETTINGS, UPDATE_SETTINGS, GROUP_TABS } from '../common/constants'
import { throttle } from 'lodash-es'

const rules = ref<Rule[]>([])
const expand = ref('')

const autoGroup = ref(true)
const groupByDomain = ref(true)
const minCount = ref(2)

watch([autoGroup, groupByDomain, minCount], () => {
  updateSettings()
})

const updateSettings = throttle(() => {
  const count = Number(minCount.value)
  sendMessage(UPDATE_SETTINGS, {
    rules: rules.value,
    autoGroup: autoGroup.value,
    groupByDomain: groupByDomain.value,
    minCount: Number.isNaN(count) ? 3 : Math.max(2, minCount.value),
  })
}, 200)

onMounted(async () => {
  const settings = await sendMessage<Settings, string>(GET_SETTINGS, {})
  console.log('settings', settings)
  rules.value = settings.rules || []
  autoGroup.value = settings.autoGroup
  groupByDomain.value = settings.groupByDomain
  minCount.value = settings.minCount
})

const groupTabs = throttle(async () => {
  await sendMessage(GROUP_TABS, {})
}, 1000)

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

  rule.title = data.title
  rule.patterns = data.patterns

  updateSettings()
}

const handleDelete = (id: string) => {
  rules.value = rules.value.filter(item => item.id !== id)
  updateSettings()
}

const handleAddRule = throttle(() => {
  const newRule: Rule = {
    id: Math.random().toString(36).slice(2),
    title: '',
    patterns: [''],
    type: 'url',
  }
  rules.value.unshift(newRule)
  expand.value = newRule.id

  updateSettings()
}, 1000)
</script>

<template>
  <main class="bg-zinc-100 min-h-[300px] p-4 text-zinc-700 w-[320px]">
    <Button class="rounded-full flex w-full" @click="groupTabs">Group All Tabs</Button>

    <div class="mt-4 p-4 card">
      <div class="flex py-1 justify-between">
        <div>Auto Group</div>
        <Switch v-model="autoGroup"></Switch>
      </div>
      <div class="flex py-1 justify-between">
        <div>Group By Domain</div>
        <Switch v-model="groupByDomain"></Switch>
      </div>

      <div class="flex py-1 justify-between items-center">
        <div>Minimum Tabs Of Group</div>
        <input
          v-model="minCount"
          type="number"
          :min="2"
          :max="9"
          :step="1"
          inputmode="numeric"
          class="px-2 w-16 field"
        />
      </div>
    </div>

    <div class="mt-4 py-4 px-2 rules card">
      <div class="flex px-2 items-center">
        <h2 class="font-medium text-lg">Rules</h2>
        <div
          class="cursor-pointer flex ml-auto h-6 w-6 justify-center items-center"
          @click="handleAddRule"
        >
          <lucide-plus class="text-lg text-zinc-500" />
        </div>
      </div>
      <div class="mt-2 max-h-[300px] pr-2 overflow-y-auto">
        <RuleItem
          v-for="rule of rules"
          :key="rule.id"
          :is-expand="expand === rule.id"
          :rule="rule"
          @expand="handleExpand"
          @change="handleChange"
          @delete="handleDelete"
        />
        <div
          v-if="!rules.length"
          class="cursor-pointer text-accent text-center py-4"
          @click="handleAddRule"
        >
          Add a rule now!
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.card {
  @apply bg-white rounded-lg;
}

.field {
  @apply bg-transparent border rounded outline-none;
}
</style>
