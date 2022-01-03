<template>
<div class="sign-board" :class="{ disabled: disabled }">
  <ul class="item-list">
    <li v-for="item in itemList" :key="item.code" class="item" :class="{selected: selectedSymbol === item.code, disabled: disableSymbol === item.code}">
      <label :for="'item_'+item.code">
        <input type="radio" name="symbol" :id="'item_'+item.code" v-model="selection" :value="item.code" />
        <symbol-vue class="image" :code="item.code" />
      </label>
    </li>
  </ul>
</div>
</template>

<script lang="ts">
import { useSymbols } from '@/plugins/symbols'
import { defineComponent, ref, watch } from 'vue'
import { Symbol_ as SymbolType } from '@/plugins/symbols/types/symbols-plugin.interface';
import SymbolVue from './Symbol.vue';

export default defineComponent({
  name: "SymbolsBoard",

  components: { SymbolVue },

  props: {
    disabled: Boolean,
    disableSymbol: String,
    selectedSymbol: String
  },

  emits: ['update:selectedSymbol'],

  async setup(props, {emit}) {
    const symbols = useSymbols();
    const selection = ref(null);

    watch(selection, (current) => {
      emit('update:selectedSymbol', current);
    });

    const itemList: SymbolType[] = await symbols.all();

    return {
      itemList,
      selection
    }
  },
});
</script>


<style lang="scss" scoped>
.disabled {
  pointer-events: none;
}

.sign-board {
  width: 100%;
  position: relative;

  .item-list {
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(5rem, 100%), 1fr));
    gap: .5rem;

    .item {
      position: relative;
      padding: 1rem;
      aspect-ratio: 1/1;

      &.selected {
        .image {
          filter: drop-shadow(0 0 5px #9838bb);
        }
      }
      
      &.disabled {
        &::before {
          content: "Opponent";
          position: absolute;
          z-index: 2;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: #ffffff9c;
          border-radius: 5px;
          box-shadow: 0 0 5px -2px rgba(34, 34, 34, 0.466);
          padding: .5rem;
          font-size: .8em;
          color: #333;
        }
      }

      input[type="radio"] {
        display: none;
      }

      label {
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        cursor: pointer;

        .image {
          aspect-ratio: 1/1;
          object-fit: contain;
          width: 100%;
        }
      }
    }
  }
}
</style>
