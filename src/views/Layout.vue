<template>
  <main>
    <Header class="header"></Header>
    <router-view class="body" v-slot="{ Component }">
      <transition name="slide-fade">
        <component :is="Component"></component>
      </transition>
    </router-view>
    <!-- <Footer class="footer"></Footer> -->
  </main>
</template>

<script setup>
import Header from "@/views/Header.vue";
import Footer from "@/views/Footer.vue";

</script>

<style scoped lang="scss">
main {
  display: flex;
  flex-direction: column;
  position: relative;

  & > .header {
    height: 3rem;
    box-shadow: 0 0 6PX rgba(0, 0, 0, 0.1);
    z-index: 1;
  }

  & > .body {
    flex: 1;
  }

  & > .footer {

  }
}
</style>
