
<template>
  <div class="editor-box-cursor" :style="style"></div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  props: {
    top: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    height: { type: Number, default: 22 },
    color: { type: String, default: "#000" },
  },
  computed: {
    style() {
      var style: Record<string, any> = {};
      style.top = this.top + "px";
      style.left = this.left + "px";
      style.width = "1px";
      style.marginLeft = "-0.5px";
      style.height = this.height + "px";
      style.backgroundColor = this.color;
      return style;
    },
  },
  methods: {
    setPosition(data: { top: number; height: number; left: number }) {
      var ele = this.$el as HTMLDivElement;
      ele.style.top = data.top + "px";
      ele.style.left = data.left + "px";
      ele.style.height = data.height + "px";
    },
  },
});
</script>
<style lang="less">
.editor-box-cursor {
  pointer-events: none;
  position: absolute;
}
</style>