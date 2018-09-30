<template>
  <v-app>
    <v-toolbar dark class="primary">
      <v-toolbar-title><router-link to="/" tag="span" style="cursor: pointer">DevMeetup</router-link></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn 
        flat v-for="item in menuItems" :key="item.title"
        router
        :to="item.link">
          <v-icon left>{{item.icon}}</v-icon>
          {{item.title}}
          </v-btn>
        <v-btn 
        v-if="userIsAuthenticated"
        flat
        @click="onLogout">
        <v-icon left dark black--text>exit_to_app</v-icon>
          Logout
          </v-btn>
      </v-toolbar-items>
    </v-toolbar> 

    <main>
     <router-view></router-view>
    </main>
  </v-app>
</template>

<script>
export default {
  data () { 
    return {
    }
  },
  computed: {
    menuItems () {
      let menuItems = [
        {icon: 'face', title: 'Sign up', link: '/signup'},
        {icon: 'lock_open', title: 'Sign in', link: '/signin'}
      ]
      if (this.userIsAuthenticated) {
        console.log('Authenticated ')
        menuItems = [
        {icon: 'supervisor_account', title: 'View Meetups', link: '/meetups'},
        {icon: 'room', title: 'Organize Meetups', link: '/meetup/new'},     
        {icon: 'person', title: 'Profile', link: '/profile'}
        ]
      } else {
          console.log(' !Authenticated ')
      }
      return menuItems
    },
    userIsAuthenticated () {
      return this.$store.getters.user !== null && this.$store.getters.user !== undefined
    }
  },
  methods: {
    onLogout () {
      this.$store.dispatch('logout')
    }
  }

}
</script>
