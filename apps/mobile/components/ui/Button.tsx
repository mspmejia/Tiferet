import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native'
import { Colors, FontSize, Radius, Spacing } from '../../lib/constants'

type ButtonVariant = 'primary' | 'secondary' | 'orange' | 'ghost' | 'danger'

interface ButtonProps {
  label: string
  onPress: () => void
  variant?: ButtonVariant
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  style?: ViewStyle
}

const variantStyles: Record<ButtonVariant, { bg: string; text: string; border?: string }> = {
  primary:   { bg: Colors.blue,   text: Colors.white },
  secondary: { bg: Colors.blueLight, text: Colors.blue, border: Colors.blue },
  orange:    { bg: Colors.orange,  text: Colors.white },
  ghost:     { bg: 'transparent', text: Colors.textSecondary, border: Colors.border },
  danger:    { bg: Colors.danger,  text: Colors.white },
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}: ButtonProps) {
  const vs = variantStyles[variant]
  const isDisabled = disabled || loading

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: vs.bg },
        vs.border ? { borderWidth: 1, borderColor: vs.border } : null,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <Text style={[styles.label, { color: vs.text }]}>{label}</Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  btn: {
    height: 50,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.55,
  },
  label: {
    fontSize: FontSize.base,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
