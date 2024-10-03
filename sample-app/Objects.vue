<script setup lang="ts">
import { defineProps } from 'vue';

interface Props {
  objectId?: string,
}

const { objectId } = defineProps<Props>()

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
</script>

<template>
  <div class='container'>
    <div class='nav'>
      <ul>
        <li v-for='(k, v) in data' :key='k.id'>
          <route-path :path='`/objects/${v}`'>{{ v }}</route-path>
        </li>
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
    padding: 1em;
  }

  .main, .nav {
    border: solid 1px saddlebrown;
  }

  li {
    list-style: inside;
  }

</style>