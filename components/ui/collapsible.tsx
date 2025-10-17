import { PropsWithChildren, useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Collapsible component
 * - Displays a titled header that toggles visibility of its children
 * - Useful for expandable sections like FAQs, filters, or nested content
 */
export function Collapsible({ children, title }: 
  PropsWithChildren & { title: string }) {
    // Tracks whether the collapsible section is expanded
  const [isOpen, setIsOpen] = useState(false);
   // Determines current theme for dynamic styling
  const theme = useColorScheme() ?? 'light';

  return (
    <ThemedView>
      <TouchableOpacity
        style={styles.heading}
        onPress={() => setIsOpen((value) => !value)}
        activeOpacity={0.8}>
        <IconSymbol
          name="chevron.right"
          size={18}
          weight="medium"
          color={theme === 'light' ? Colors.light.icon : Colors.dark.icon}
          style={{ transform: [{ rotate: isOpen ? '90deg' : '0deg' }] }}
        />

        <ThemedText type="defaultSemiBold">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && <ThemedView style={styles.content}>{children}</ThemedView>}
    </ThemedView>
  );
}

// Layout styles for header and content
const styles = StyleSheet.create({
  heading: {
    flexDirection: 'row',  // Horizontal layout for icon + title
    alignItems: 'center',  // Vertically center items
    gap: 6,                 // Space between icon and text
  },
  content: {
    marginTop: 6, // Space below header
    marginLeft: 24, // Indent nested content
  },
});
