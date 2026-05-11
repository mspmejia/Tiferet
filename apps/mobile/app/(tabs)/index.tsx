import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native'
import { useRouter } from 'expo-router'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { StatCard } from '../../components/StatCard'
import { QuickAction } from '../../components/QuickAction'
import { Colors, FontSize, Spacing, Radius } from '../../lib/constants'

export default function DashboardScreen() {
  const { perfil, signOut } = useAuth()
  const { stats, actividad, loading, refetch } = useDashboard(perfil?.id)
  const router = useRouter()

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'
  const hoy = new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })

  const tipoColor: Record<string, string> = {
    cobro_pendiente: Colors.orange,
    entrega_ok: Colors.success,
    pedido_creado: Colors.blue,
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refetch} tintColor={Colors.blue} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.saludo}>{saludo}, {perfil?.nombre ?? '...'}</Text>
            <Text style={styles.fecha}>{hoy}</Text>
          </View>
          <TouchableOpacity style={styles.avatarBtn} onPress={signOut}>
            <Text style={styles.avatarText}>
              {(perfil?.nombre?.[0] ?? '') + (perfil?.apellido?.[0] ?? '')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard value={stats.pedidosHoy} label="Pedidos hoy" color={Colors.blue} />
        <StatCard value={stats.cobrosPendientes} label="Cobros pend." color={Colors.orange} />
        <StatCard value={stats.entregasOk} label="Entregas OK" color={Colors.success} />
      </View>

      {/* Acciones rápidas */}
      <Text style={styles.sectionLabel}>ACCIONES RÁPIDAS</Text>
      <View style={styles.actionsGrid}>
        <QuickAction
          icon="+"
          label="Nuevo pedido"
          sublabel="Crear orden rápida"
          variant="blue"
          onPress={() => router.push('/(tabs)/pedidos')}
        />
        <QuickAction
          icon="$"
          label="Registrar cobro"
          sublabel="Efectivo o transferencia"
          variant="orange"
          onPress={() => {}}
        />
      </View>
      <View style={[styles.actionsGrid, { marginTop: Spacing.sm }]}>
        <QuickAction
          icon="✓"
          label="Confirmar entrega"
          sublabel={`${stats.entregasPendientes} pendientes`}
          onPress={() => router.push('/(tabs)/docs')}
        />
        <QuickAction
          icon="#"
          label="Ver inventario"
          sublabel="Stock en tiempo real"
          onPress={() => router.push('/(tabs)/inventario')}
        />
      </View>

      {/* Actividad reciente */}
      <Text style={styles.sectionLabel}>ACTIVIDAD RECIENTE</Text>
      {actividad.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Sin actividad hoy todavía</Text>
        </View>
      ) : (
        actividad.map(item => (
          <View key={item.id} style={styles.actItem}>
            <View style={[styles.actDot, { backgroundColor: tipoColor[item.tipo] ?? Colors.blue }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.actTitle}>{item.titulo}</Text>
              <Text style={styles.actDetail}>{item.detalle}</Text>
            </View>
            <Text style={styles.actTime}>{item.hora}</Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: Colors.blue,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  saludo: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.white,
  },
  fecha: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  avatarBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.6,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  actItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  actDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    flexShrink: 0,
  },
  actTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  actDetail: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  actTime: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    flexShrink: 0,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
})
