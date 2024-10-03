# MY-VUE-ROUTER
Simple 250LOC single file alternative to vue-router, with many fewer features.

  - Simple flat routing table - no nested.
  - No entry guards, no async, no name views, no ...
  - Using path-to-regexp for param parsing.
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
// Template components:
<route-view></route-view>
<route-path :path='/home'>HOME</route-path>
<route-name :name='contact'>CONTACT</route-path>
...
// Programatic routing:
$router.dispatch({ name: 'contact' });
```
