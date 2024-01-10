<script lang="ts" setup>
import { useToken } from "@/stores/token";
import { isEmpty } from "lodash";
import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();
const { token } = route.query
const tokenStore = useToken()

if (!isEmpty(token)) {
    tokenStore.set(token + '')
    router.push({name: 'home'})
} else {
    tokenStore.clear()
    router.push({name: '401', query: {message: 'token无效'}})
}
</script>