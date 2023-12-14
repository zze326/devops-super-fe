<script setup lang="ts">
import MonacoEditor from "@/components/MonacoEditor/index.vue";
import { DockerRegistryAuthContent } from "@/api/resource/secret";
const props = defineProps<{ content: DockerRegistryAuthContent }>();
const authObj = {};
authObj[`${props.content.registryUrl}`] = {
  auth: btoa(`${props.content.username}:${props.content.password}`)
};

const contentJson = JSON.stringify(
  {
    auths: authObj
  },
  null,
  2
);
</script>
<template>
  <MonacoEditor
    height="250px"
    :show-minimap="false"
    :show-line-numbers="false"
    language="json"
    :editor-option="{
      readOnly: true,
      tabSize: 2
    }"
    v-model="contentJson"
  />
</template>
