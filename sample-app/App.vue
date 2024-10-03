<script setup lang="ts">
</script>

<template>
  <div id='main-container'>
    <header>
      <route-name name='home'>Home</route-name>&nbsp;|&nbsp;
      <route-name name='about'>About</route-name>&nbsp;|&nbsp;
      <route-path path='/contact'>Contact</route-path>&nbsp;|&nbsp;
      <route-path path='/objects'>Objects</route-path>&nbsp;|&nbsp;
      <route-name name='search'>Search</route-name>&nbsp;|&nbsp;
      <route-path path='/no-where'>No Where</route-path>
    </header>
    <main>
      <route-view></route-view>
    </main>
    <footer>&#64;my-vue-router</footer>
  </div>
</template>

<style scoped>
header {
  line-height: 1.5;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
