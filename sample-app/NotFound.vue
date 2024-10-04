<script setup lang='ts'>
import { isArray } from 'lodash';
import { computed, defineProps } from 'vue';

type props = {
  route: any, // Can use paramsToProps instead. Just testing.
}

const { route } = defineProps<props>();
const pathMatch = computed(() => route.params.pathMatch);
const resource = computed(() => route.params.resource);
const path = computed(() => pathMatch.value ? '/' + pathMatch.value?.join('/') : undefined);
const thing = computed(() => (path.value || resource.value));

function back() {
  window.history.go(-2);
}

</script>

<template>
  <div>
    <h1>{{ resource && 'Resource'}} Not Found</h1>
    <h3 v-if='thing' class='path'><i>{{ thing }}</i></h3>
    <br>
    <i><a href='#' @click.stop.prevent="back">Go Back</a></i>&nbsp;|&nbsp;
    <i><a href="/">Go Home</a></i>
    <hr>
    <pre>{{ route }}</pre>
  </div>
</template>

<style scoped>
  .path {
    color: grey;
  }

  pre {
    padding: 1em;
  }
</style>
