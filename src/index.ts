import { computed, defineComponent, h, ref, shallowRef, watch } from 'vue';
import type { App, PropType } from '@vue/runtime-core';
import { match, compile } from 'path-to-regexp';
import type { Route, ComponentRoute, RedirectRoute } from './types';
export type { Route, ComponentRoute, RedirectRoute } from './types';

type CompiledRoute = Route & {
  _match: ReturnType<typeof match>;
  _compile: ReturnType<typeof compile>;
  _id: number;
}

const NullComponent = () => h('div');
const NullRoute: CompiledRoute = {
  name: 'null',
  path: '*',
  component: NullComponent,
  _match: () => false,
  _compile: () => '',
  _id: -1,
};
let router: Router | null = null;


export function createRouter(routes: Route[]) {
    router = new Router(routes);
    return router;
}

function isAComponentRoute(route: Route): route is ComponentRoute {
  return 'component' in route;
}

function isARedirectRoute(route: Route): route is RedirectRoute {
  return 'redirect' in route;
}

function shallowIsEqual(a: Record<any, any>, b: Record<any, any>) {
  if(Object.entries(a).length !== Object.entries(b).length) return false;
  return Object.entries(a).every(([k, v]: any) => b[k] === v);
}

function parseUrl(u: string) {
  return new URL(u, 'http://dummy-base.local');
}

/**
 * Some many route-links may share the same path and route match but have different #hash.
 * Since we're override anchor and adding history items ourselves we have to re-imp #has scroll too.
 * @param path
 */
function scrollHash(path: string) {
  const hash = parseUrl(path).hash.replace(/^#/, '');
  if(hash) {
    const el = document.querySelector(`a[name="${hash}"`) || document.querySelector(`a[id="${hash}"`);
    el && el.scrollIntoView({});
  }
}

function isCurentPath(path: string) {
  const currentPath = window.location.href.replace(window.location.origin, '');
  return currentPath === path;
}

export class Router {
  currentRoute = shallowRef<CompiledRoute>(NullRoute);
  currentPath = ref<string>('');
  currentRouteParams = {};
  routes: CompiledRoute[] = [];

  constructor(routes: Route[]) {
    this.routes = routes.map((v, _id) => ({ ...v, _match: match(v.path), _compile: compile(v.path), _id })); // Slower but do up front to fail fast.
    const path = new URL(window.location.href).pathname; // .replace(/\/+$/, '/'); No.
    this.setPath(path);
    window.addEventListener('popstate', (event) => this.historyPopState(event));
  }

  matchPath(path: string): { route: CompiledRoute | undefined, params: Record<string, any> }  {
    const _url = parseUrl(path);
    for(const route of this.routes) {
      const m = route._match(_url.pathname);
      if(m) {
        return { route, ...m };
      }
    }
    return { route: undefined, params: {} }
  }

  matchName(name: string, params: Record<string, any> = {}): { route: CompiledRoute | undefined, path: string } {
    for(const route of this.routes) {
      if(route.name === name) {
        try {
          const path = route._compile(params);
          if (path) return { route, path }; // This throws if the params are not compatible with route.
        } catch {
          continue;
        }
      }
    }
    return { route: undefined, path: '' };
  }

  private setPath(path: string, push = true) {
    const { route, params } = this.matchPath(path);
    if (!route) return;
    if (isAComponentRoute(route)) {
      this.currentRoute.value = route;
      this.currentPath.value = path;
      this.currentRouteParams = params;
      push && history.pushState({ path }, '', path);
      scrollHash(path);
    } else if (isARedirectRoute(route)) {
      window.location.href = route.redirect;
    }
  }

  private setName(name: string, params: Record<string, any> = {}, push = true) {
    const { route, path } = this.matchName(name, params);
    if (!route) return;
    if (isAComponentRoute(route)) {
      this.currentRoute.value = route;
      this.currentPath.value = path;
      this.currentRouteParams = params;
      push && history.pushState({ name, params }, '', path);
    } else if (isARedirectRoute(route)) {
      window.location.href = route.redirect;
    }
  }

  currentRouteProp() {
    const pick = ['name', 'path', 'meta'];
    const prop = Object.fromEntries(
      Object.entries(this.currentRoute.value)
        .filter(([k]) => pick.includes(k))
    );
    return  { ...prop, params: this.currentRouteParams };
  }

  isActiveRoute(route: CompiledRoute) {
    return route._id === this.currentRoute.value._id
  }

  install(app: App) {
    app.component('RouteLink', RouteLink);
    app.component('RouteName', RouteName);
    app.component('RouteView', RouteView);
    // app.config.globalProperties.$router = this;
  }

  historyPopState(event: PopStateEvent) {
    console.debug('historyPopState', event);
    if(!event || !event.state) return;
    if('name' in event.state) {
      this.setName(event.state.name, event.state.params, false);
    }
    else if ('path' in event.state) {
      this.setPath(event.state.path, false);
    }
  }

  dispatch(target: { name: string, params?: Record<string, any> } | { path: string }) {
    console.debug('dispatch', target);
    if(history.state && shallowIsEqual(history.state, target)) return;
    if('name' in target) {
      this.setName(target.name, target.params);
      return true;
    } else if('path' in target) {
      this.setPath(target.path);
      return true;
    }
  }
}

export const RouteLink = defineComponent({
  name: 'RouteLink',
  props: {
    path: {
      type: String as PropType<string>,
      required: true,
    },
  },
  setup(props, { slots }) {
    const { route: myRoute } = router!.matchPath(props.path);
    let elClass = ref({});

    watch([router?.currentRoute, router?.currentPath], () => {
      elClass.value = {
        'route-link': true,
        'route-link-active': myRoute ? router!.isActiveRoute(myRoute) : false,
        'route-link-hyper-active': isCurentPath(props.path),
      }
    }, { immediate: true });
    return () => {
      return h(
        'a',
        {
          onClick: (e) => { router!.dispatch({ path: props.path }); e.preventDefault(); },
          class: elClass.value,
          href: props.path,
        },
        slots.default && slots.default()
      );
    };
  },
});

export const RouteName = defineComponent({
  name: 'RouteName',
  props: {
    name: {
      type: String as PropType<string>,
      required: true,
    },
    params: {
      type: Object as PropType<Record<string, boolean | number | string>>,
      required: false,
    },
  },
  setup(props, { slots }) {
    const { route: myRoute, path } = router!.matchName(props.name, props.params);
    let elClass = ref({});

    watch([router?.currentRoute, router?.currentPath], () => {
    elClass.value = {
      'route-link': true,
      'route-link-active': myRoute ? router!.isActiveRoute(myRoute) : false,
      'route-link-hyper-active': isCurentPath(path),
    }
  }, { immediate: true });

    return () => {
      return h(
        'a',
        {
          onClick: (e) => { router!.dispatch({ name: props.name, params: props.params }); ; e.preventDefault(); },
          href: path,
          class: elClass.value,
        },
        slots.default && slots.default()
      );
    };
  },
});

export const RouteView = defineComponent({
  name: 'RouteView',
  setup() {
    return () => {
      const currentRoute = router!.currentRoute?.value as ComponentRoute;

      let routeProps: Record<string, any> = {};
      if (typeof currentRoute?.props === 'function') routeProps = currentRoute?.props(currentRoute);
      else if (currentRoute?.props) routeProps = currentRoute?.props;

      if(currentRoute.routeProp) routeProps.route = router?.currentRouteProp();

      const view = currentRoute?.component ? h(currentRoute.component, routeProps) : [];

      console.log('View render', (currentRoute as any).__file);
      return h('div', view);
    };
  }
});
