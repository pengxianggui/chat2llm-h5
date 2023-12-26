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
        const t = isEmpty(token.value) ? sessionStorage.getItem("Api-Token") : token.value
        if (t == 'null') {
            return null
        }
        return t
    }

    function clear() {
        token.value = ''
        sessionStorage.removeItem("Api-Token")
    }
  
    return { set, get, clear }
  })
  