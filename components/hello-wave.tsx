import Animated from 'react-native-reanimated';

export function HelloWave() {
  return (
    // Animated emoji with wave-like rotation
    <Animated.Text
      style={{
        fontSize: 28, // Large emoji size
        lineHeight: 32, // Matches font size for vertical alignment
        marginTop: -6, // Slight upward shift for visual balance
        animationName: {
          '50%': { transform: [{ rotate: '25deg' }] },
        },
        animationIterationCount: 4,
        animationDuration: '300ms',
      }}>
      👋
    </Animated.Text>
  );
}
