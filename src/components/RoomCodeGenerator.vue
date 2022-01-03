<template>
    <card class="room-code-generator full-width">
      <template #title>
          <h6>Room code</h6>
      </template>
      <template #default>
        <template  v-if="roomCode">
          <div class="fake-input room-code-field">
            <span id="room-code">{{roomCode}}</span>
            <my-button color="accent" @click="shareCode">Share</my-button>
          </div>
          <p>Share this room code with the friend you want to invite to play.</p>
        </template>
        <template v-else>
          <p>Invalid code</p>
        </template>
      </template>
    </card>
</template>

<script lang="ts">
import Card from '@/components/Card.vue';
import MyButton from '@/components/MyButton.vue';
import { Actions } from '@/helpers/enums/actions.enum';
import store from '@/store';
import { defineComponent } from 'vue';
import { useMatch } from '@/plugins/match';


export default defineComponent({
  name:"RoomCodeGenerator",

  components: { Card, MyButton },

  setup() {
    const $match = useMatch();

    return {
      roomCode: $match.service?.id
    }
  },

  data() {
    return {
      //
    }
  },

  mounted() {
    store.dispatch(Actions.LOADING_STOP);
  },

  methods: {
    composeLink(code: string): string {
      const baseUrl = window.location.origin;
      const fullPath = process.env.VUE_APP_BASE_URL as string;
      return baseUrl + fullPath + '?roomCode=' + code;
    },
    copyToClipboard(content: string) {
      navigator.clipboard.writeText(content);
      this.$q.notify({message: 'Link copied on te clipboard'});
    },
    shareCode() {
      if (this.roomCode) {
        const shareData = {
          title: 'Tic Tac Toe',
          text: 'Join the room and play with me',
          url: this.composeLink(this.roomCode)
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (navigator.canShare && navigator.canShare(shareData)) {
          navigator.share(shareData)
            .catch(error => {
              this.copyToClipboard(shareData.url);
            });
        } else {
          this.copyToClipboard(shareData.url);
        }
      }
    }
  },
})
</script>

<style lang="scss" scoped>
.room-code-generator {
  .room-code-field {
    padding: 0;
    display: flex;
    margin-bottom: 2rem;

    #room-code{
      flex:1;
      display: flex;
      align-items: center;
      font-size: 2rem;
      padding: 0 1rem;
    }

    p {
      margin: 0;
    }
  }
}
</style>