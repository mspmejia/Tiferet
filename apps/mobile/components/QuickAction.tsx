import { TouchableOpacity, View, Text, StyleSheet } from 'react-native'
import { Colors, FontSize, Radius, Spacing } from '../lib/constants'

interface QuickActionProps {
  icon: string
  label: string
  sublabel?: string
  variant?: 'blue' | 'orange' | 'white'
  onPress: () => void
}

export function QuickAction({
  icon,
  label,
  sublabel,
  variant = 'white',
  onPress,
}: QuickActionProps) {
  const isBlue = variant === 'blue'
  const isOrange = variant === 'orange'
  const bgColor = isBlue ? Colors.blue : isOrange ? Colors.orange : Colors.white
  const textColor = isBlue || isOrange ? Colors.white : Colors.textPrimary
  const subColor = isBlue || isOrange ? 'rgba(255,255,255,0.7)' : Colors.textSecondary
  const iconBg = isBlue || isOrange ? 'rgba(255,255,255,0.2)' : Colors.blueLight

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bgColor }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Text style={[styles.icon, { color: isBlue || isOrange ? Colors.white : Colors.blue }]}>
          {icon}
        </Text>
      </View>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      {sublabel ? (
        <Text style={[styles.sublabel, { color: subColor }]}>{sublabel}</Text>
      ) : null}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
    minHeight: 110,
    justifyContent: 'flex-end',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  icon: {
    fontSize: FontSize.lg,
    fontWeight: '600',
  },
  label: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  sublabel: {
    fontSize: FontSize.xs,
    marginTop: -4,
  },
})
