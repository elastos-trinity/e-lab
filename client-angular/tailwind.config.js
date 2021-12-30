module.exports = {
  prefix: '',
  purge: {
    enabled: process.env.TAILWIND_MODE === 'build',
    content: ['./src/**/*.{html,ts}', './projects/**/*.{html,ts}'],
  },
  darkMode: 'class',
  theme: {
    fontFamily: {
      display: ['Bio Sans', 'Oswald', 'sans-serif'],
      body: ['Bio Sans', 'Poppins', 'sans-serif'],
    },
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
      colors: {
        pink: {
          elab: '#FF66DD',
          450: '#FF66DD'
        },
        orange: {
          elab: '#FF9838',
          450: '#FF9838'
        },
        red: {
          DEFAULT: '#CC0505',
          elab: '#CC0505',
          elabLight: '#FFAAAA'
        },
        grey: {
          DEFAULT: '#7D7D7D'
        },
        green: {
          100: '#AAFFEA',
          DEFAULT: '#05CC9A',
          elab: '#05CC9A',
          elabLight: '#AAFFEA'
        },
        blue: {
          elabLightGradient: 'rgba(16, 30, 66, 0)',
          800: '#101E42',
          900: '#000B26'
        },
        beige: {
          elab: '#FAFAFA'
        }
      },
      color: {
        inherit: 'inherit',
      },
    },
  },
  variants: {},
  plugins: [],
};
