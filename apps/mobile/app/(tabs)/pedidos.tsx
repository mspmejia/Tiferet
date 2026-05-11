import { useState } from 'react'
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, Modal, FlatList, ActivityIndicator,
} from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { usePedidos } from '../../hooks/usePedidos'
import { Button } from '../../components/ui/Button'
import { Colors, FontSize, Spacing, Radius } from '../../lib/constants'
import type { Cliente } from '@tiferet/types'

const FORMAS_PAGO = [
  { key: 'contado', label: 'Contado' },
  { key: 'credito_30', label: 'Crédito 30d' },
  { key: 'credito_60', label: 'Crédito 60d' },
  { key: 'transferencia', label: 'Transferencia' },
] as const

export default function PedidosScreen() {
  const { perfil } = useAuth()
  const {
    form, setCliente, agregarLinea, actualizarCantidad,
    removerLinea, setFormaPago, total, crearPedido, resetForm, guardando,
  } = usePedidos()

  const [busqCliente, setBusqCliente] = useState('')
  const [clientesSug, setClientesSug] = useState<Cliente[]>([])
  const [showClientes, setShowClientes] = useState(false)
  const [busqProd, setBusqProd] = useState('')
  const [prodSug, setProdSug] = useState<any[]>([])
  const [showProds, setShowProds] = useState(false)

  async function buscarClientes(q: string) {
    setBusqCliente(q)
    if (q.length < 2) { setClientesSug([]); return }
    const { data } = await supabase.from('clientes').select('*').ilike('nombre', `%${q}%`).limit(5)
    setClientesSug(data ?? [])
  }

  async function buscarProductos(q: string) {
    setBusqProd(q)
    if (q.length < 2) { setProdSug([]); return }
    const { data } = await supabase
      .from('v_stock_productos')
      .select('*')
      .or(`nombre.ilike.%${q}%,codigo.ilike.%${q}%`)
      .gt('stock_total', 0)
      .limit(5)
    setProdSug(data ?? [])
  }

  function selCliente(c: Cliente) {
    setCliente(c)
    setBusqCliente(c.nombre)
    setClientesSug([])
    setShowClientes(false)
  }

  function selProducto(p: any) {
    agregarLinea({
      productoId: p.id,
      nombreProducto: p.nombre,
      cantidad: 1,
      precioUnitario: p.precio_venta,
    })
    setBusqProd('')
    setProdSug([])
    setShowProds(false)
  }

  async function handleCrear() {
    if (!perfil?.id) return
    const res = await crearPedido(perfil.id)
    if (res.success) {
      Alert.alert('¡Pedido creado!', `Pedido ${res.pedido?.numero} registrado exitosamente`, [
        { text: 'OK', onPress: resetForm }
      ])
    } else {
      Alert.alert('Error', res.error ?? 'No se pudo crear el pedido')
    }
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nuevo pedido</Text>
        <Text style={styles.headerSub}>Creación rápida</Text>
      </View>

      <View style={styles.form}>
        {/* Cliente */}
        <Text style={styles.label}>CLIENTE</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar cliente..."
          placeholderTextColor={Colors.textMuted}
          value={busqCliente}
          onChangeText={buscarClientes}
          onFocus={() => setShowClientes(true)}
        />
        {clientesSug.map(c => (
          <TouchableOpacity key={c.id} style={styles.sug} onPress={() => selCliente(c)}>
            <Text style={styles.sugNombre}>{c.nombre}</Text>
            <Text style={styles.sugSub}>{c.zona} · Crédito Q{c.limite_credito}</Text>
          </TouchableOpacity>
        ))}

        {/* Productos */}
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>PRODUCTOS</Text>
        <TextInput
          style={styles.input}
          placeholder="Buscar producto o código..."
          placeholderTextColor={Colors.textMuted}
          value={busqProd}
          onChangeText={buscarProductos}
        />
        {prodSug.map(p => (
          <TouchableOpacity key={p.id} style={styles.sug} onPress={() => selProducto(p)}>
            <Text style={styles.sugNombre}>{p.nombre}</Text>
            <Text style={styles.sugSub}>Q{p.precio_venta} · Stock: {p.stock_total}</Text>
          </TouchableOpacity>
        ))}

        {/* Líneas del pedido */}
        {form.lineas.length > 0 && (
          <View style={styles.lineasCard}>
            {form.lineas.map((linea, i) => (
              <View key={linea.productoId} style={styles.lineaRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lineaNombre}>{linea.nombreProducto}</Text>
                  <Text style={styles.lineaSub}>Q{linea.precioUnitario} c/u</Text>
                </View>
                <View style={styles.qtyCtrl}>
                  <TouchableOpacity
                    style={styles.qBtn}
                    onPress={() => actualizarCantidad(i, linea.cantidad - 1)}
                  >
                    <Text style={styles.qBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qNum}>{linea.cantidad}</Text>
                  <TouchableOpacity
                    style={[styles.qBtn, { backgroundColor: Colors.blueLight }]}
                    onPress={() => actualizarCantidad(i, linea.cantidad + 1)}
                  >
                    <Text style={[styles.qBtnText, { color: Colors.blue }]}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Forma de pago */}
        <Text style={[styles.label, { marginTop: Spacing.lg }]}>FORMA DE PAGO</Text>
        <View style={styles.fpRow}>
          {FORMAS_PAGO.map(fp => (
            <TouchableOpacity
              key={fp.key}
              style={[styles.fpBtn, form.formaPago === fp.key && styles.fpBtnActive]}
              onPress={() => setFormaPago(fp.key)}
            >
              <Text style={[styles.fpText, form.formaPago === fp.key && styles.fpTextActive]}>
                {fp.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Total */}
        {form.lineas.length > 0 && (
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total del pedido</Text>
            <Text style={styles.totalMonto}>Q{total.toFixed(2)}</Text>
          </View>
        )}

        <Button
          label="Crear pedido"
          variant="orange"
          fullWidth
          loading={guardando}
          disabled={!form.cliente || form.lineas.length === 0}
          onPress={handleCrear}
          style={{ marginTop: Spacing.sm }}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  header: {
    backgroundColor: Colors.blue,
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.white },
  headerSub: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  form: { padding: Spacing.md },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sug: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  sugNombre: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  sugSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  lineasCard: {
    backgroundColor: Colors.white,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  lineaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  lineaNombre: { fontSize: FontSize.md, fontWeight: '500', color: Colors.textPrimary },
  lineaSub: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  qtyCtrl: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qBtnText: { fontSize: FontSize.base, fontWeight: '600', color: Colors.textPrimary },
  qNum: { fontSize: FontSize.base, fontWeight: '600', minWidth: 22, textAlign: 'center', color: Colors.textPrimary },
  fpRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  fpBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 0.5,
    borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  fpBtnActive: { backgroundColor: Colors.blueLight, borderColor: Colors.blue },
  fpText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  fpTextActive: { color: Colors.blue, fontWeight: '600' },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.blueLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  totalLabel: { fontSize: FontSize.md, color: Colors.blue },
  totalMonto: { fontSize: FontSize.xl, fontWeight: '600', color: Colors.blue },
})
