import { useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useInventario } from '../../hooks/useInventario'
import { Colors, FontSize, Spacing, Radius } from '../../lib/constants'
import type { ProductoConStock } from '@tiferet/types'

const ALERTAS = [
  { key: null, label: 'Todos' },
  { key: 'bajo', label: 'Stock bajo' },
  { key: 'critico', label: 'Crítico' },
  { key: 'sin_stock', label: 'Sin stock' },
]

const alertaColor: Record<string, string> = {
  ok: Colors.success,
  bajo: Colors.warning,
  critico: Colors.orange,
  sin_stock: Colors.danger,
}

const alertaBg: Record<string, string> = {
  ok: Colors.successLight,
  bajo: Colors.warningLight,
  critico: Colors.orangeLight,
  sin_stock: Colors.dangerLight,
}

export default function InventarioScreen() {
  const { productos, loading, buscar, filtroAlerta, setFiltroAlerta } = useInventario()
  const [query, setQuery] = useState('')

  function handleBuscar(text: string) {
    setQuery(text)
    buscar(text)
  }

  function porcentajeStock(p: ProductoConStock) {
    const max = Math.max(p.stock_total, (p as any).stock_minimo * 3, 1)
    return Math.min((p.stock_total / max) * 100, 100)
  }

  const renderItem = ({ item }: { item: ProductoConStock }) => {
    const pct = porcentajeStock(item)
    const color = alertaColor[item.alerta] ?? Colors.blue
    const iniciales = item.codigo.slice(0, 2).toUpperCase()

    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        <View style={[styles.icoWrap, { backgroundColor: alertaBg[item.alerta] ?? Colors.blueLight }]}>
          <Text style={[styles.ico, { color }]}>{iniciales}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.codigo}>{item.codigo}</Text>
          <View style={styles.barWrap}>
            <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
          </View>
        </View>
        <View style={styles.stockWrap}>
          <Text style={[styles.stockNum, { color }]}>{item.stock_total.toLocaleString()}</Text>
          <Text style={styles.stockUnit}>{item.unidad}s</Text>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TextInput
          style={styles.search}
          placeholder="Buscar producto o código..."
          placeholderTextColor="rgba(255,255,255,0.55)"
          value={query}
          onChangeText={handleBuscar}
        />
      </View>

      <View style={styles.chips}>
        {ALERTAS.map(a => (
          <TouchableOpacity
            key={String(a.key)}
            style={[styles.chip, filtroAlerta === a.key && styles.chipActive]}
            onPress={() => setFiltroAlerta(a.key)}
          >
            <Text style={[styles.chipText, filtroAlerta === a.key && styles.chipTextActive]}>
              {a.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={productos}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>Sin productos encontrados</Text>
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
    paddingBottom: 16,
    paddingHorizontal: Spacing.lg,
  },
  search: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: FontSize.md,
    color: Colors.white,
  },
  chips: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  chipActive: { backgroundColor: Colors.blueLight },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  chipTextActive: { color: Colors.blue, fontWeight: '600' },
  list: {
    backgroundColor: Colors.white,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    borderColor: Colors.border,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  icoWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ico: { fontSize: FontSize.sm, fontWeight: '700' },
  nombre: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  codigo: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 1 },
  barWrap: {
    height: 3,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: 2 },
  stockWrap: { alignItems: 'flex-end', flexShrink: 0 },
  stockNum: { fontSize: FontSize.lg, fontWeight: '600' },
  stockUnit: { fontSize: FontSize.xs, color: Colors.textMuted },
  separator: {
    height: 0.5,
    backgroundColor: Colors.borderLight,
    marginLeft: 68,
  },
  empty: {
    textAlign: 'center',
    padding: Spacing.xxl,
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
})
