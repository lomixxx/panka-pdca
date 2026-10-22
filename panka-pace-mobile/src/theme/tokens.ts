import type { TextStyle, ViewStyle } from 'react-native';

export const palette = {
  canvas: '#F4F2EC',
  surface: '#FFFEFB',
  navy: '#243448',
  blueSoft: '#BFD3E4',
  sage: '#D8E2D4',
  sageStrong: '#78927C',
  peach: '#F5E2D5',
  peachStrong: '#EACBBB',
  ink: '#26313A',
  inkMuted: '#68737A',
  inkFaint: '#9AA2A6',
  line: '#E7E3DB',
  white: '#FFFFFF',
  whiteMuted: '#DCE3E8',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 18, xl: 24, xxl: 32, xxxl: 48 } as const;
export const radius = { sm: 7, md: 13, lg: 20, xl: 28, round: 999 } as const;

export const typography = {
  hero: { fontSize: 27, lineHeight: 36, fontWeight: '700', letterSpacing: -0.5 } satisfies TextStyle,
  title: { fontSize: 22, lineHeight: 30, fontWeight: '700', letterSpacing: -0.3 } satisfies TextStyle,
  heading: { fontSize: 18, lineHeight: 26, fontWeight: '700' } satisfies TextStyle,
  body: { fontSize: 15, lineHeight: 23, fontWeight: '400' } satisfies TextStyle,
  bodyStrong: { fontSize: 15, lineHeight: 23, fontWeight: '700' } satisfies TextStyle,
  caption: { fontSize: 12, lineHeight: 18, fontWeight: '500' } satisfies TextStyle,
  eyebrow: { fontSize: 11, lineHeight: 16, fontWeight: '700', letterSpacing: 1.2 } satisfies TextStyle,
} as const;

export const shadow = {
  card: {
    shadowColor: '#1F2E3A',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 2,
  } satisfies ViewStyle,
} as const;
