<template>
  <div class="editor-selector">
    <div class="editor-selector-cursor" ref="cursor"></div>
    <textarea ref="textarea"></textarea>
    <div class="editor-selector-selection"></div>
    <div class="editor-selector-box"></div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  methods: {
    openCursor() {
      var self = this;
      var ele = this.$refs.cursor as HTMLDivElement;
      ele.style.visibility = "visible";
      if (this.timer) clearInterval(this.timer);
      this.timer = setInterval(function () {
        ele.style.visibility =
          ele.style.visibility == "visible" ? "hidden" : "visible";
      }, 6e2);
    },
    closeCursor() {
      var ele = this.$refs.cursor as HTMLDivElement;
      ele.style.visibility = "hidden";
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
    },
    renderCursor(data: { top: number; left: number; height: number }) {
      var ele = this.$refs.cursor as HTMLDivElement;
      ele.style.top = data.top + "px";
      ele.style.left = data.left + "px";
      ele.style.height = data.height + "px";
    },
  },
});
</script>
<style lang="less">
.editor-selector {
  &-cursor {
    position: absolute;
    width: 2px;
    margin-left: -0.5px;
    background-color: #000;
  }
  > textarea {
    position: absolute;
    top: -30px;
    left: 0px;
    height: 30px;
  }
}
</style>