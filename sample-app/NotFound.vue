<script lang='ts'>
import { isArray } from 'lodash';
import { defineComponent } from 'vue';

export default defineComponent({
  props: {
    route: { type: Object },
  },
  computed: {
    pathMatch() { return this.route.params.pathMatch; },
    path() {
      return '/' + this.pathMatch.join('/');
    },
  },
  methods: {
    back() {
      window.history.go(-1);
    }
  },
  data(): any { return {}; } // "Property '$route' does not exist on .." Yes it does!
});
</script>


<template>
  <div>
    <h1>Not Found</h1>
    <h3 class='path'><i>{{ path }}</i></h3>
    <br>
    <i><a href="#" @click.stop=back>Go Back</a></i>&nbsp;|&nbsp;
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
