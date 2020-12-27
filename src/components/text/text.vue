<template>
  <span data-name="ve-text">{{ text }}</span>
</template>
<script lang="ts">
import Vue from "vue";
import { mixins } from "../mixins";
export default Vue.extend({
  name: "VcText",
  mixins: [mixins],
  props: {
    text: { type: String, default: "" },
  },
});
</script>
<style lang="less">
</style>