import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isEmpty } from 'lodash'

export const useToken = defineStore('counter', () => {
    const token = ref('')

    function set(t: string) {
        token.value = t
        sessionStorage.setItem("Api-Token", t)
    }

    function get() {
        return isEmpty(token.value) ? sessionStorage.getItem("Api-Token") : token.value
    }
  
    return { set, get }
  })
  