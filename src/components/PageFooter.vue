<template>
  <footer>
    <p><strong>{{appName}}</strong> was developed by Mattia Mancarella as Vue case study for <a href="//start2impact.it" title="Link to start2impact">Start2Impact</a>.</p>
    <p>The source code is available in <a href="//github.com/mancarius/tictactoe-vue.js-project">git repository</a></p>
  </footer>
</template>
    
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: "PageFooter",
  setup() {

    return {
      appName: process.env.VUE_APP_NAME
    }
  },
})
</script>



<style lang="scss" scoped>
  footer {
    display: flex;
    flex-flow: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background-color: #fafafa;
    margin: -1rem;
    margin-top: 2rem;
    padding: 1rem;
    padding-bottom: 0;
  }
</style>