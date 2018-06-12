<template>
  <div id="app">
    <b-navbar type="dark" variant="primary" toggleable="md">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>

      <b-navbar-brand href="#">Nebulas Smart Contract Lint</b-navbar-brand>

      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav class="ml-auto">
          <b-nav-item :to="{name:'Home'}" exact>Home</b-nav-item>
          <b-nav-item :to="{name:'About'}">About</b-nav-item>
          <b-nav-item href="https://github.com/jnoodle/nebulasLint" target="_blank">Github</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <router-view/>
  </div>
</template>

<script>
  export default {
    name: 'App'
  }
</script>
