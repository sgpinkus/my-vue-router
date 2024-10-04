import { createRouter } from '../src/index';
import Home from './Home.vue';
import About from './About.vue';
import Contact from './Contact.vue';
import Objects from './Objects.vue';
import NotFound from './NotFound.vue';

export default createRouter([
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
    name: 'objects',
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
    name: 'resource-not-found',
    path: '/not-found',
    component: NotFound,
    routeProp: true,
  },
  {
    path: '/*pathMatch',
    name: 'not-found',
    component: NotFound,
    routeProp: true,
  },
], { installGlobalRef: false })