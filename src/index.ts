import { computed, defineComponent, h, ref, shallowRef, watch, InjectionKey } from 'vue';
import type { App, PropType } from '@vue/runtime-core';
import { match, compile } from 'path-to-regexp';
import type { Route, ComponentRoute, RedirectRoute } from './types';
export type { Route, ComponentRoute, RedirectRoute } from './types';

export const RouterInjectionKey = Symbol() as InjectionKey<Router>;

type CompiledRoute = Route & {
  _match: ReturnType<typeof match>;
  _compile: ReturnType<typeof compile>;
  _id: number;
}

type RouterOptions = {
  installGlobalRef?: false | string;
  routeProp?: boolean;
  paramsToProps?: boolean;
}

const defaultRouterOptions: RouterOptions = {
  installGlobalRef: '$router',
  routeProp: false,
  paramsToProps: false,
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


export function createRouter(routes: Route[], options: RouterOptions = {}) {
    router = new Router(routes, options);
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
 * Some many routes may share the same path and route match but have different #hash.
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
  currentRouteParams = ref({});
  routes: CompiledRoute[] = [];
  options: RouterOptions = {};

  constructor(routes: Route[], options: RouterOptions = {}) {
    this.options =  { ...defaultRouterOptions, ...options };
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
        } catch(e) {
          console.error(e);
          continue;
        }
      }
    }
    return { route: undefined, path: '' };
  }

  private setPath(path: string, push = true) {
    const { route, params } = this.matchPath(path);
    if (!route) return false;
    if (isAComponentRoute(route)) {
      this.currentRoute.value = route;
      this.currentPath.value = path;
      this.currentRouteParams.value = params;
      push && window.history.pushState({ path }, '', path);
      scrollHash(path);
    } else if (isARedirectRoute(route)) {
      window.location.href = route.redirect;
    }
    return true;
  }

  private setName(name: string, params: Record<string, any> = {}, push = true) {
    const { route, path } = this.matchName(name, params);
    if (!route) return false;
    if (isAComponentRoute(route)) {
      this.currentRoute.value = route;
      this.currentPath.value = path;
      this.currentRouteParams.value = params;
      push && window.history.pushState({ name, params }, '', path);
    } else if (isARedirectRoute(route)) {
      window.location.href = route.redirect;
    }
    return true;
  }

  currentRouteProp() {
    const pick = ['name', 'path', 'meta'];
    const prop = Object.fromEntries(
      Object.entries(this.currentRoute.value)
        .filter(([k]) => pick.includes(k))
    );
    return  { ...prop, params: this.currentRouteParams.value };
  }

  isActiveRoute(route: CompiledRoute) {
    return route._id === this.currentRoute.value._id
  }

  install(app: App) {
    app.component('RoutePath', RoutePath);
    app.component('RouteName', RouteName);
    app.component('RouteView', RouteView);
    app.provide(RouterInjectionKey, this);
    if(this.options.installGlobalRef) app.config.globalProperties[this.options.installGlobalRef] = this;
  }

  historyPopState(event: PopStateEvent) {
    debug('historyPopState', event);
    if(!event || !event.state) return;
    if('name' in event.state) {
      this.setName(event.state.name, event.state.params, false);
    }
    else if ('path' in event.state) {
      this.setPath(event.state.path, false);
    }
  }

  dispatch(target: { name: string, params?: Record<string, any> } | { path: string }) {
    let _dispatched = false;
    const type = 'name' in target ? 'name' : 'path' in target ? 'path' : undefined;
    if(window.history.state && shallowIsEqual(window.history.state, target)) return;
    if('name' in target) {
      _dispatched = this.setName(target.name, target.params);
    } else if('path' in target) {
      _dispatched = this.setPath(target.path);
    }
    debug(`dispatch by ${type} [${_dispatched}]`, target);
  }
}

export const RoutePath = defineComponent({
  name: 'RoutePath',
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
        'route': true,
        'route-active': myRoute ? router!.isActiveRoute(myRoute) : false,
        'route-hyper-active': isCurentPath(props.path),
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
      'route': true,
      'route-active': myRoute ? router!.isActiveRoute(myRoute) : false,
      'route-hyper-active': isCurentPath(path),
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

      if(hasOption('routeProp', currentRoute, router!)) routeProps.route = router?.currentRouteProp();
      if(hasOption('paramsToProps', currentRoute, router!)) routeProps = { ...routeProps, ...router!.currentRouteParams.value };

      const view = currentRoute?.component ? h(currentRoute.component, routeProps) : [];

      debug('View render', (currentRoute as any).__file);
      return h(view);
    };
  }
});


function hasOption(name: 'paramsToProps' | 'routeProp', route: ComponentRoute, router: Router) {
  return route[name] || router.options[name] || false;
}


function debug(...args: any[]) {
  // @ts-ignore
  if(import.meta.env.DEV) console.debug(...args);
}
