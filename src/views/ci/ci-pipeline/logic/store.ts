import { defineStore } from "pinia";
import { FormDataProps } from "./types";

export const useStore = defineStore("ci-pipeline-manage", {
  state: () => {
    return {
      id: <number | null>null,
      arrangeCurrent: <FormDataProps>null,
      arrangeVisible: false,
      envSelectVisible: false,
      current: <FormDataProps>null,
      historyCounter: 0
    };
  },
  getters: {},
  actions: {
    reloadHistory() {
      this.historyCounter++;
    }
  }
});
