<template>
  <div data-name="ve-row-text" :style="style">
    {{ text }}<slot></slot>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { mixins } from "../mixins";
export default Vue.extend({
  name: "VcText",
  mixins: [mixins],
  props: {
    text: { type: String, default: "" },
    height: { type: String },
  },
  computed: {
    style() {
      var style: Record<string, any> = {};
      if (typeof this.height != "undefined") style.height = this.height + "px";
      return style;
    },
  },
});
</script>
<style lang="less">
</style>