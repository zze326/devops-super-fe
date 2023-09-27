import { defineStore } from "pinia";

export const useStore = defineStore("host-manage", {
  state: () => {
    return {
      terminalSessionDrawerVisible: false
    };
  },
  getters: {},
  actions: {}
});
