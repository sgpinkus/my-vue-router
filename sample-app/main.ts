import { createApp } from 'vue'
import { createRouter } from '../src/index';
import './main.scss'
import App from './App.vue';
import Home from './Home.vue';
import About from './About.vue';
import Contact from './Contact.vue';
import Objects from './Objects.vue';
import NotFound from './NotFound.vue';

const app = createApp(App);
app.use(createRouter([
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/about',
    name: 'about',
    component: About,
  },
  {
    path: '/contact',
    component: Contact,
  },
  {
    path: '/objects{/:objectId}',
    component: Objects,
    paramsToProps: true,
  },
  {
    path: '/search',
    name: 'search',
    redirect: 'https://duckduckgo.com'
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => ({}), // Dummy component.
  },
  {
    path: '/*pathMatch',
    name: 'not-found',
    component: NotFound,
    routeProp: true,
  },
], { installGlobalRef: false }));

app.mount('#app');
