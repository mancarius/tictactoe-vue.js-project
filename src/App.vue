<template>
  <page-header-vue/>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageHeaderVue from './components/PageHeader.vue'

export default defineComponent({
  name:"App",
  components: {PageHeaderVue},
 
})
</script>


<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Rancho&display=swap');

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
