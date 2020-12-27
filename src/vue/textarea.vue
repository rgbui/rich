<template>
  <div class="editor-box-textarea">
    <textarea ref="textarea"></textarea>
  </div>
</template>
<style lang="less">
.editor-box-textarea {
  position: relative;
  textarea {
    position: absolute;
    height: 22px;
    top: -22px;
    left: 0px;
  }
}
</style>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  inject: ["view"],
  computed: {
    textarea() {
      return this.$refs.textarea as HTMLTextAreaElement;
    },
  },
  methods: {},
});
</script>