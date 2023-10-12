import { defineStore } from "pinia";

export const useStore = defineStore("ci-pipeline-manage", {
  state: () => {
    return {
      id: <number | null>null,
      arrangeVisible: false,
      envSelectVisible: false
    };
  },
  getters: {},
  actions: {}
});
