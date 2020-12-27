<template>
  <div class="editor-box" :style="style">
    <editor-selector ref="selector"></editor-selector>
    <div class="editor-box-content">
      <div
        v-for="block in blocks"
        :key="block.id"
        :is="block.componentName"
        v-bind="block.props"
        v-on="block.events"
      ></div>
    </div>
  </div>
</template>
<style lang="less">
.editor-box {
  position: relative;
}
</style>
<script lang="ts">
import Vue from "vue";
import EditorSelector from "./selector.vue";
export default Vue.extend({
  props: {
    width: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
  },
  provide() {
    return { view: this };
  },
  data() {
    return {
      blocks: [],
    };
  },
  components: {
    EditorSelector,
  },
  computed: {
    style() {
      var style: Record<string, any> = {};
      style.width = this.width + "px";
      style.height = this.height + "px";
      return style;
    },
    selector() {
      return this.$refs.selector;
    },
  },
  methods: {
    /**
     * 更新数据视图
     */
    updateBlocks(blocks: any[]) {
      this.$set(this, "blocks", blocks);
    },
    layout(data: { width: number; height: number }) {
      this.width = data.width;
      this.height = data.height;
    },
  },
});
</script>