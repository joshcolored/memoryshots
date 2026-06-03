declare module '@blossom-carousel/react' {
  import type { ElementType, ForwardRefExoticComponent, HTMLAttributes, ReactNode, RefAttributes } from 'react';

  export interface BlossomCarouselHandle {
    prev: (options?: { align?: 'start' | 'center' | 'end' }) => void;
    next: (options?: { align?: 'start' | 'center' | 'end' }) => void;
    element: HTMLElement | null;
  }

  export interface BlossomCarouselProps extends HTMLAttributes<HTMLElement> {
    children?: ReactNode | Array<ReactNode>;
    as?: ElementType;
    repeat?: boolean;
    load?: 'always' | 'conditional';
  }

  export const BlossomCarousel: ForwardRefExoticComponent<BlossomCarouselProps & RefAttributes<BlossomCarouselHandle>>;
}
