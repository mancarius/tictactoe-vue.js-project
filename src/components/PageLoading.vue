<template>
    <div class="loading-container" :class="{active: loading.active}">
        <q-card class="card shadow-1">
            <q-spinner-grid
                color="accent"
                size="2em"
                />
            <span class="message">{{loading.message}}</span>
        </q-card>
    </div>
</template>


<script lang="ts">
import { defineComponent } from 'vue'
import { mapGetters } from 'vuex'

export default defineComponent({
    name: "PageLoading",
    computed: {
        ...mapGetters(['loading'])
    },
})
</script>

<style lang="scss" scoped>
.loading-container {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background-color: #00000069;
    display: none;
}

.active {
    display: flex;
    justify-content: center;
    align-items: center;
}

.card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    padding: 1.5rem;
}
</style>