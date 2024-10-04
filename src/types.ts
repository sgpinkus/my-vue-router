import type { Component } from 'vue';

export interface BaseRoute {
  path: string;
  name?: string;
  meta?: Record<string, any>;
}

export interface ComponentRoute extends BaseRoute {
  props?: Record<string, any> | ((r: Route) => Record<string, any>); // Add thes props.
  routeProp?: boolean; // Add a prop "route" holding this matched route.
  paramsToProps?: boolean; // Add a prop for every param that has a value.
  component: Component;
}

export interface RedirectRoute extends BaseRoute {
  redirect: string;
}

export type Route = ComponentRoute | RedirectRoute;