import { useState } from 'react'
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native'
import { useClientes } from '../../hooks/useClientes'
import { useAuth } from '../../hooks/useAuth'
import { Badge } from '../../components/ui/Badge'
import { Colors, FontSize, Spacing, Radius } from '../../lib/constants'
import type { Cliente } from '@tiferet/types'

export default function ClientesScreen() {
  const { perfil } = useAuth()
  const { clientes, loading, buscar, filtrarPorDeuda } = useClientes(perfil?.id)
  const [soloDeuda, setSoloDeuda] = useState(false)
  const [query, setQuery] = useState('')

  function handleBuscar(text: string) {
    setQuery(text)
    buscar(text)
  }

  function toggleDeuda() {
    const next = !soloDeuda
    setSoloDeuda(next)
    filtrarPorDeuda(next)
  }

  function getBadge(c: any): { label: string; variant: 'danger' | 'success' | 'info' } {
    if ((c.saldo_pendiente ?? 0) > 0) return { label: 'Cobrar', variant: 'danger' }
    return { label: 'Al día', variant: 'success' }
  }

  function getIniciales(nombre: string) {
    return nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
  }

  const renderItem = ({ item }: { item: any }) => {
    const badge = getBadge(item)
    return (
      <TouchableOpacity style={styles.row} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getIniciales(item.nombre)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.nombre}>{item.nombre}</Text>
          <Text style={styles.sub}>
            {item.zona}
            {item.saldo_pendiente > 0 ? ` · Q${Number(item.saldo_pendiente).toFixed(2)}` : ' · Al día'}
          </Text>
        </View>
        <Badge label={badge.label} variant={badge.variant} />
      </TouchableOpacity>
    )
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TextInput
          style={styles.search}
          placeholder="Buscar cliente, zona..."
          placeholderTextColor="rgba(255,255,255,0.55)"
          value={query}
          onChangeText={handleBuscar}
        />
      </View>

      {/* Filtros */}
      <View style={styles.chips}>
        <TouchableOpacity
          style={[styles.chip, !soloDeuda && styles.chipActive]}
          onPress={() => { setSoloDeuda(false); filtrarPorDeuda(false) }}
        >
          <Text style={[styles.chipText, !soloDeuda && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.chip, soloDeuda && styles.chipActive]}
          onPress={toggleDeuda}
        >
          <Text style={[styles.chipText, soloDeuda && styles.chipTextActive]}>Con deuda</Text>
        </TouchableOpacity>
      </View>

      {/* Lista */}
      {loading ? (
        <ActivityIndicator color={Colors.blue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <Text style={styles.empty}>Sin clientes encontrados</Text>
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
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
  },
  chipActive: {
    backgroundColor: Colors.blueLight,
  },
  chipText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.blue,
    fontWeight: '600',
  },
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.blue,
  },
  nombre: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: 0.5,
    backgroundColor: Colors.borderLight,
    marginLeft: 60,
  },
  empty: {
    textAlign: 'center',
    padding: Spacing.xxl,
    color: Colors.textMuted,
    fontSize: FontSize.sm,
  },
})
