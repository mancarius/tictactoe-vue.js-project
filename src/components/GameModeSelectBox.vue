<template>
    <div class="body">
        <div class="btn-container">
            <span class="label">Robot</span>
            <button class="opponent-btn robot" @click="createMatch(MatchTypes.PLAYER_VS_COMPUTER)"></button>
        </div>
        <div class="btn-container">
            <span class="label">Human</span>
            <button class="opponent-btn human" @click="createMatch(MatchTypes.PLAYER_VS_PLAYER)"></button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject } from 'vue';
import { MatchTypes } from '@/helpers/enums/match-types.enum';
import MatchPlugin from '@/plugins/match/types/match-plugin.interface';
import store from '@/store';
import { Actions } from '@/helpers/enums/actions.enum';
 
export default defineComponent({
    name:"GameModeSelectBox",
    data() {
        return {
            MatchTypes
        }
    },

    methods: {
      createMatch(type: MatchTypes) {
        let params: {matchType: string} = { matchType: type };
        this.$router.push({name: 'RoomCode', params});
      }
    },
})
</script>

<style lang="scss" scoped>
.body {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    
    .btn-container {
        display: flex;
        flex-direction: column;
        gap: .5rem;
        align-items: center;

        button.opponent-btn {
            cursor: pointer;
            width: 5rem;
            height: 5rem;
            border-radius: 50%;
            border: 1px solid rgb(116, 116, 116);
            background-color: #ffffff;
            background-position: center;
            background-size: contain;

            &.robot {
                background-image: url('~@/assets/robot-black-icon.png');
            }

            &.human {
                background-image: url('~@/assets/people-black-icon.png');
            }
        }
    }
}
</style>
