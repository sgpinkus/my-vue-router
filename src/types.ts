import type { Component } from 'vue';

export interface BaseRoute {
    path: string;
    name?: string;
    meta?: Record<string, any>;
}

export interface ComponentRoute extends BaseRoute {
  props?: Record<string, any> | ((r: Route) => Record<string, any>);
  routeProp?: boolean,
  component: Component;
}

export interface RedirectRoute extends BaseRoute {
  redirect: string;
}

export type Route = ComponentRoute | RedirectRoute;