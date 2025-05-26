<template>
  <div class="tabs">
    <button
      v-for="tab in tabs"
      :key="tab.name"
      :class="{ active: tab.name === selectedTab.name }"
      @click="selectTab(tab)"
      :aria-label="`Select ${tab.label} tab`"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script>
export default {
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    selectedTab: {
      type: Object,
      required: true,
    },
  },
  methods: {
    selectTab(tab) {
      this.$emit('update:selectedTab', tab);
      console.log('Tab selected in Tabs.vue:', tab.name);
    },
  },
};
</script>

<style scoped>
.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  background-color: var(--background-color, black);
}

button {
  background-color: var(--background-color, black);
  color: var(--text-color, magenta);
  border: 2px solid var(--primary-color, magenta);
  padding: 10px 20px;
  margin: 0 5px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

button:hover {
  background-color: var(--primary-color, magenta);
  color: var(--text-color, black);
  transform: scale(1.05);
}

button.active {
  background-color: var(--primary-color, magenta);
  color: var(--text-color, black);
}
</style>