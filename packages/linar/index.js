import { defineComponent, h } from 'vue'

const icons = {
  home: (strokeWidth) => [
    h('path', {
      d: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round',
      fill: 'none'
    })
  ],
  book: (strokeWidth) => [
    h('path', {
      d: 'M7 4h10a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V6a2 2 0 0 1 2-2Z',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round',
      fill: 'none'
    }),
    h('path', {
      d: 'M9 8h8M9 12h8M9 16h6',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      fill: 'none'
    })
  ],
  user: (strokeWidth) => [
    h('path', {
      d: 'M12 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Z',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      fill: 'none'
    }),
    h('path', {
      d: 'M4.5 20a7.5 7.5 0 0 1 15 0',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      fill: 'none'
    })
  ],
  moon: (strokeWidth) => [
    h('path', {
      d: 'M21 13.2A8.2 8.2 0 0 1 10.8 3a6.9 6.9 0 1 0 10.2 10.2Z',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round',
      fill: 'none'
    })
  ],
  sun: (strokeWidth) => [
    h('path', {
      d: 'M12 18a6 6 0 1 0-6-6 6 6 0 0 0 6 6Z',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      fill: 'none'
    }),
    h('path', {
      d: 'M12 2v2.5M12 19.5V22M4 12H2M22 12h-2M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      fill: 'none'
    })
  ],
  chevronDown: (strokeWidth) => [
    h('path', {
      d: 'M6 9l6 6 6-6',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      fill: 'none'
    })
  ],
  chevronRight: (strokeWidth) => [
    h('path', {
      d: 'M9 6l6 6-6 6',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      fill: 'none'
    })
  ],
  menu: (strokeWidth) => [
    h('path', {
      d: 'M4 7h16M4 12h16M4 17h16',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linecap': 'round',
      fill: 'none'
    })
  ],
  layers: (strokeWidth) => [
    h('path', {
      d: 'M12 3l9 6-9 6-9-6 9-6Z',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round',
      fill: 'none'
    }),
    h('path', {
      d: 'M3 15l9 6 9-6',
      stroke: 'currentColor',
      'stroke-width': strokeWidth,
      'stroke-linejoin': 'round',
      fill: 'none'
    })
  ]
}

export const Icon = defineComponent({
  name: 'Icon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 16 },
    title: { type: String, default: undefined }
  },
  setup(props) {
    return () => {
      const strokeWidth = 1.8
      const render = icons[props.name] || (() => [])

      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: props.size,
          height: props.size,
          fill: 'none',
          'aria-hidden': props.title ? undefined : 'true',
          role: props.title ? 'img' : undefined
        },
        [props.title ? h('title', props.title) : null, ...render(strokeWidth)].filter(Boolean)
      )
    }
  }
})

