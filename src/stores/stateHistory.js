import { defineStore } from 'pinia';
import { ref, computed, reactive } from 'vue';

export const useStateHistory = defineStore('state-history', () => {
  const stateArchive = reactive([]);
  const currentStateNumber = ref(-1);

  const currentState = computed(() => stateArchive[currentStateNumber.value]);

  const navigationRequest = ref(0);

  function goBack() {
    if (currentStateNumber.value > 0) {
      currentStateNumber.value--;
      navigationRequest.value++ ;
    }
  }

  function goForward() {
    if (currentStateNumber.value < stateArchive.length - 1){
      currentStateNumber.value++;
      navigationRequest.value++ ;
    }
  }

  function clearFutureHistory(){
    while (stateArchive.length > currentStateNumber.value + 1) {
      stateArchive.pop();
    }
  }

  function addState(state) {
    if (state) {
      clearFutureHistory();
      stateArchive.push(state);
      currentStateNumber.value++;
    }
  }

  return { stateArchive, navigationRequest, currentStateNumber, currentState, goBack, goForward, clearFutureHistory, addState };
});