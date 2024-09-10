import { defineComponent, h, shallowRef } from 'vue';
import type { App, PropType } from '@vue/runtime-core';
import { match, compile } from 'path-to-regexp';
import type { Route, ComponentRoute, RedirectRoute } from './types';
export type { Route, ComponentRoute, RedirectRoute } from './types';

type CompiledRoute = Route & {
  _match: ReturnType<typeof match>;
  _compile: ReturnType<typeof compile>;
}

const NullComponent = () => h('div');
const NullRoute: ComponentRoute = {
  name: 'null',
  path: '*',
  component: NullComponent,
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

export class Router {
  currentRoute = shallowRef<Route>(NullRoute);
  currentRouteParams = {};
  routes: CompiledRoute[] = [];

  constructor(routes: Route[]) {
    this.routes = routes.map(v => ({ ...v, _match: match(v.path), _compile: compile(v.path) })); // Slower but do up front to fail fast.
    const path = new URL(window.location.href).pathname; // .replace(/\/+$/, '/'); No.
    this.setPath(path);
    window.addEventListener('popstate', (event) => this.historyPopState(event));
    // history.scrollRestoration = 'auto';
  }

  matchPath(path: string): { route: Route } & ReturnType<ReturnType<typeof match>> | undefined {
    for(const route of this.routes) {
      const m = route._match(path);
      if(m) {
        return { route, ...m };
      }
    }
  }

  private setPath(path: string, push = true) {
    const m = this.matchPath(path);
    if (!m) return;
    const { route, params } = m;
    if (isAComponentRoute(route)) {
      this.currentRoute.value = route;
      this.currentRouteParams = params;
      push && history.pushState({ path }, '', path);
    } else if (isARedirectRoute(route)) {
      window.location.href = route.redirect;
    }
  }

  matchName(name: string) {
    for(const route of this.routes) {
      if(route.name === name) {
        return route;
      }
    }
  }

  private setName(name: string, params: Record<string, any> = {}, push = true) {
    const route = this.matchName(name);
    if(!route) return;
    if (isAComponentRoute(route)) {
      const path = route._compile(params); // This throws if the params are not compatible with route.
      this.currentRoute.value = route;
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

  install(app: App) {
    app.component('RouteLink', RouteLink);
    app.component('RouteName', RouteName);
    app.component('RouteView', RouteView);
    // app.config.globalProperties.$router = this;
  }

  historyPopState(event: PopStateEvent) {
    console.log(event);
    if(!event || !event.state) return;
    if('name' in event.state) this.setName(event.state.name, event.state.params, false);
    else if ('path' in event.state) this.setPath(event.state.path, false);
  }

  dispatch(target: { name: string, params?: Record<string, any> } | { path: string }) {
    if(history.state && shallowIsEqual(history.state, target)) return;
    if('name' in target) {
      this.setName(target.name, target.params);
    } else if('path' in target) {
      this.setPath(target.path);
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
    return () => {
      return h(
        'a',
        {
          onClick: () => router!.dispatch({ path: props.path }),
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
    return () => {
      return h(
        'a',
        {
          onClick: () => router!.dispatch({ name: props.name, params: props.params }),
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
