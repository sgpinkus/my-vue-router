import { defineComponent, h } from 'vue';
import { createRouter, type Route } from './index';
import { JSDOM } from 'jsdom';
import { expect, test,describe } from 'vitest'

globalThis.window = (new JSDOM('', { url: 'https://example.org/' })).window;

export const HomePage = defineComponent({
  name: 'HomePage',
  setup(props, { slots }) {
    return () => {
      return h(
        'span',
        'home',
      );
    };
  },
});

export const ContactPage = defineComponent({
  name: 'ContactPage',
  setup(props, { slots }) {
    return () => {
      return h(
        'span',
        'contact',
      );
    };
  },
});

export const NotFoundPage = defineComponent({
  name: 'ContactPage',
  setup(props, { slots }) {
    return () => {
      return h(
        'span',
        'contact',
      );
    };
  },
});

const routes: Route[] = [
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

const router = createRouter(routes);

describe('Router', () => {
  test('routes', () => {
    expect(window.history.state).deep.equals({ path: '/' });
    expect(router.dispatch({ name: 'contact' })).equals(true);
    expect(window.history.state).deep.equals({ name: 'contact', params: {} });
  });
});