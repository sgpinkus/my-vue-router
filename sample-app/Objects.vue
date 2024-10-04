<script setup lang="ts">
import { computed, defineProps, ref, watch } from 'vue';
import router from './router';

interface Props {
  objectId?: string,
}

const { objectId } = defineProps<Props>(); // You can destructure a prop from v3.4 but you can't watch it .. ->
const watchObjectId = computed(() => ({ objectId }));

const data = {
  'fcc7080c-815a-11ef-894e-5be1fea10946': {
    id: 'fcc7080c-815a-11ef-894e-5be1fea10946',
    type: 'cat',
  },
  '65a18852-815b-11ef-9b3b-03b44db50a32': {
    id: '65a18852-815b-11ef-9b3b-03b44db50a32',
    type: 'dog',
  },
  '771f2030-815b-11ef-bb2b-d364e7ba531c': {
    id: '771f2030-815b-11ef-bb2b-d364e7ba531c',
    type: 'pony',
  }
}

watch([watchObjectId],
  () => {
    console.log(objectId);
    if (objectId && !(objectId in data)) {
      router.dispatch({ name: 'resource-not-found', params: { resource: objectId } });
    }
  }, {
    immediate: true
  }
);

</script>

<template>
  <div class='container'>
    <div class='nav'>
      <ul>
        <li><route-name name='objects'>Top</route-name></li>
        <li v-for='(k, v) in data' :key='k.id'>
          <route-path :path='`/objects/${v}`'>{{ v }}</route-path>
        </li>
        <li><route-path :path='`/objects/dne`'>deleted</route-path></li>
      </ul>
    </div>
    <div class='main'>
      <p>
        {{ objectId && data[objectId] || "No Selection" }}
      </p>
    </div>
  </div>
</template>

<style scoped lang='scss'>
  .container {
    height: 100%;
    width: 100%;
    display: flex;
    flex-flow: row nowrap;
  }

  .nav {
    min-width: 200px;
  }

  .main {
    flex: 4;
    flex-grow: 2;
    min-width: 200px;
  }

  .main, .nav {
    border: solid 1px saddlebrown;
    padding: 1em;
  }

  li {
    list-style: inside;
  }

</style>