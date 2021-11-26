<template>
  <page-header></page-header>
  <main class="main-container">
    <router-view v-slot="{Component}">
      <component :is="Component"></component>
    </router-view>
  </main>
  <footer>
    <p>Mattia Mancarella</p>
  </footer>
  <!-- Loader spinner -->
  <page-loading />
  <!-- User Auth -->
  <user-auth />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import PageHeader from './components/PageHeader.vue'
import PageLoading from './components/PageLoading.vue'
import UserAuth from './components/UserAuth.vue'
import { Actions } from './helpers/enums/actions.enum'
import store from './store'

export default defineComponent({
  components: { PageHeader, PageLoading, UserAuth },
  name: 'App',

  data () {
    return {
      //
    }
  },

  beforeCreate() {
    store.dispatch(Actions.STATE_INIT);
  },
})
</script>

<style lang="scss" scope>
  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  footer {
    display: flex;
    justify-content: center;
  }
</style>