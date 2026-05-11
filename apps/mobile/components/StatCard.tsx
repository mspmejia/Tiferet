import { View, Text, StyleSheet } from 'react-native'
import { Colors, FontSize, Radius, Spacing } from '../lib/constants'

interface StatCardProps {
  value: number | string
  label: string
  color?: string
}

export function StatCard({ value, label, color = Colors.blue }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  value: {
    fontSize: FontSize.xxl,
    fontWeight: '600',
    lineHeight: 28,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
})
