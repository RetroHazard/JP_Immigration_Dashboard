// Type declaration for react-simple-maps
// The package doesn't have TypeScript definitions, so we declare a module for it

declare module 'react-simple-maps' {
  import type React from 'react';

  export interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
    };
    className?: string;
    children?: React.ReactNode;
    width?: number;
    height?: number;
  }

  export interface ZoomableGroupProps {
    zoom?: number;
    center?: [number, number];
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void;
    children?: React.ReactNode;
  }

  export interface GeographiesProps {
    geography: string | object;
    children: (params: { geographies: unknown[] }) => React.ReactNode;
  }

  export interface GeographyProps {
    geography: unknown;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    onMouseEnter?: (event: React.MouseEvent) => void;
    onMouseLeave?: () => void;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    ref?: React.Ref<unknown>;
  }

  export interface MarkerProps {
    coordinates: [number, number];
    children?: React.ReactNode;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    ref?: React.Ref<unknown>;
  }

  export const ComposableMap: React.FC<ComposableMapProps>;
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;
  export const Geographies: React.FC<GeographiesProps>;
  export const Geography: React.FC<GeographyProps>;
  export const Marker: React.FC<MarkerProps>;
}
