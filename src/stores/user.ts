import { ref } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@/views/profile/model'
import { getUserInfo } from '@/api/user'

export const useUserStore = defineStore('user', () => {
  const user = ref<User>({} as User)

  function init() {
    getUserInfo().then(({data}) => {
        const { client_id, user_id, username, enable } = data
        user.value = new User(client_id, user_id, username, enable)
    })
  }

  function isEmpty() {
    return !user.value.user_id
  }

  return { init, user, isEmpty }
})
