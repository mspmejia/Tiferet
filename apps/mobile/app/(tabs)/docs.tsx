import { useState, useEffect } from 'react'
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Colors, FontSize, Spacing, Radius } from '../../lib/constants'

interface EntregaItem {
  id: string
  estado: string
  fecha_programada: string
  pedidos: {
    numero: string
    total: number
    clientes: { nombre: string; direccion: string }
  }
}

const estadoBadge: Record<string, { label: string; variant: any }> = {
  pendiente:    { label: 'Pendiente',   variant: 'neutral' },
  en_ruta:      { label: 'En ruta',     variant: 'info'    },
  entregado:    { label: 'Entregado',   variant: 'success' },
  no_entregado: { label: 'No entregado',variant: 'danger'  },
  reprogramado: { label: 'Reprogramado',variant: 'warning' },
}

export default function DocsScreen() {
  const { perfil } = useAuth()
  const [entregas, setEntregas] = useState<EntregaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmando, setConfirmando] = useState<string | null>(null)

  useEffect(() => {
    if (perfil?.id) fetchEntregas()
  }, [perfil?.id])

  async function fetchEntregas() {
    setLoading(true)
    const { data } = await supabase
      .from('entregas')
      .select(`
        id, estado, fecha_programada,
        pedidos(numero, total, clientes(nombre, direccion))
      `)
      .eq('repartidor_id', perfil!.id)
      .in('estado', ['pendiente', 'en_ruta', 'entregado'])
      .order('fecha_programada', { ascending: false })
      .limit(20)

    setEntregas((data ?? []) as EntregaItem[])
    setLoading(false)
  }

  async function confirmarEntrega(entregaId: string) {
    Alert.alert(
      'Confirmar entrega',
      '¿Confirmás que el pedido fue entregado exitosamente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setConfirmando(entregaId)
            const { error } = await supabase
              .from('entregas')
              .update({ estado: 'entregado', fecha_entrega: new Date().toISOString() })
              .eq('id', entregaId)

            if (!error) {
              await supabase
                .from('pedidos')
                .update({ estado: 'entregado' })
                .eq('id',
                  entregas.find(e => e.id === entregaId)?.id ?? ''
                )
              fetchEntregas()
            }
            setConfirmando(null)
          }
        }
      ]
    )
  }

  const renderItem = ({ item }: { item: EntregaItem }) => {
    const badge = estadoBadge[item.estado] ?? estadoBadge.pendiente
    const cliente = item.pedidos?.clientes
    const pedido = item.pedidos
    const fecha = new Date(item.fecha_programada).toLocaleDateString('es-GT')

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clienteNombre}>{cliente?.nombre ?? '—'}</Text>
            <Text style={styles.clienteDireccion}>{cliente?.direccion ?? ''}</Text>
          </View>
          <Badge label={badge.label} variant={badge.variant} />
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pedido</Text>
            <Text style={styles.infoVal}>{pedido?.numero ?? '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={[styles.infoVal, { color: Colors.blue, fontWeight: '600' }]}>
              Q{Number(pedido?.total ?? 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha</Text>
            <Text style={styles.infoVal}>{fecha}</Text>
          </View>
        </View>

        {item.estado !== 'entregado' && (
          <Button
            label="Confirmar entrega"
            variant="primary"
            fullWidth
            loading={confirmando === item.id}
            onPress={() => confirmarEntrega(item.id)}
            style={{ marginTop: Spacing.sm }}
          />
        )}
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Órdenes de entrega</Text>
        <Text style={styles.headerSub}>Mis entregas asignadas</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={entregas}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>Sin entregas asignadas</Text>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.blue,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.white },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  clienteNombre: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  clienteDireccion: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  cardBody: {
    borderTopWidth: 0.5,
    borderTopColor: Colors.borderLight,
    paddingTop: Spacing.md,
    gap: 6,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  infoVal: { fontSize: FontSize.sm, color: Colors.textPrimary },
  empty: {
    textAlign: 'center',
    padding: Spacing.xxl,
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
})
