# MY-VUE-ROUTER
Simple alternative to vue-router, with %12 of the code and %7 of the features!

  - Simple flat routing table - no nested.
  - Using path-to-regexp for param parsing.
  - No entry guards, no async, no global $route and $router, no named views, no other stuff.
  - Works transparently with #fragments.

# USAGE

**main.ts**

```
import { createRouter } from './my-vue-router'
import HomePage from '@/pages/Home.vue';
import ContactPage from './pages/Contact.vue';
import NotFoundPage from './pages/NotFound.vue';
import App from './App.vue';

const app = createApp(App);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactPage,
  },
  {
    path: '/*pathMatch',
    name: 'not-found',
    component: NotFoundPage,
    routeProp: true,
  },
];

app.use(createRouter(routes));
```

**xxx.vue**

```
...
<route-view></route-view>
<route-path :path='/home'>HOME</route-path>
<route-name :name='contact'>CONTACT</route-path>
```
