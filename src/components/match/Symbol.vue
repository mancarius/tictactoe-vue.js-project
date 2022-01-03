<template>
  <img v-if="src" :src="src"/>
</template>

<script lang="ts">
import { useSymbols } from '@/plugins/symbols'
import { defineComponent, onMounted, Ref, ref, watch } from 'vue'

export default defineComponent({
  name: "Symbol",

  props: {
    bordered: Boolean,
    code: String
  },

  setup(props) {
    const symbols = useSymbols();
    const src: Ref<string | null> = ref(null);
  
    watch(() => props.code, async (newCode, oldCode) => {
      if( newCode !== oldCode )
      symbols.getFilename(newCode as string).then(value => src.value = value);
    } );

    onMounted(async () => {
      await symbols.getFilename(props.code as string).then(value => src.value = value);
    });

    return {
      src
    }
  },
})
</script>

<style lang="scss" scoped>

</style>