import { View, Text, StyleSheet } from 'react-native'
import { Colors, FontSize, Spacing, Radius } from '../../lib/constants'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  success: { bg: Colors.successLight, text: Colors.success },
  warning: { bg: Colors.warningLight, text: Colors.warning },
  danger:  { bg: Colors.dangerLight,  text: Colors.danger  },
  info:    { bg: Colors.blueLight,    text: Colors.blue    },
  neutral: { bg: Colors.borderLight,  text: Colors.textSecondary },
}

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const vs = variantStyles[variant]
  return (
    <View style={[styles.badge, { backgroundColor: vs.bg }]}>
      <Text style={[styles.label, { color: vs.text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
})
