import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabaseUrl = 'https://nyfiozihqkrjhqcefqhd.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

function limpiarNombre(nombre) {
  if (!nombre) return 'sin-nombre'
  return nombre.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
}

function TallesForm() {
  const [nombres, setNombres] = useState([])
  const [nombreSeleccionado, setNombreSeleccionado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [numero, setNumero] = useState('')
  const [apodo, setApodo] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [error, setError] = useState('')
  const [gracias, setGracias] = useState(false)

  useEffect(() => {
    async function fetchNombres() {
      const { data, error } = await supabase
        .from('remeras')
        .select('id, nombre, numero, apodo, comprobante2')
      if (!error && data) {
        // Solo mostrar los que NO tienen comprobante2
        setNombres(data.filter(n => !n.comprobante2))
      }
    }
    fetchNombres()
  }, [])

  useEffect(() => {
    if (!nombreSeleccionado) {
      setNumero('')
      setApodo('')
      return
    }
    const persona = nombres.find(n => n.nombre === nombreSeleccionado)
    setNumero(
      persona && typeof persona?.numero !== 'undefined' && persona?.numero !== null
        ? persona.numero
        : ''
    )
    setApodo(persona?.apodo || '')
  }, [nombreSeleccionado, nombres])

  async function handleComprobanteUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const nombreLimpio = limpiarNombre(nombreSeleccionado)
    const fileName = `${nombreLimpio}-${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('comprobantes2')
      .upload(fileName, file)
    if (error) {
      setError('Error subiendo comprobante')
      return
    }
    const url = supabase.storage.from('comprobantes2').getPublicUrl(fileName).data.publicUrl
    setComprobanteUrl(url)
    setComprobante(file)
    setError('')
  }

  // Solo permitir enviar si el nombre sigue en la lista (no tiene comprobante2)
  const puedeSubir =
    nombreSeleccionado &&
    comprobanteUrl &&
    nombres.some(n => n.nombre === nombreSeleccionado)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!puedeSubir) {
      setError('Completá todos los campos')
      return
    }
    // Obtener hora de Argentina (GMT-3)
    const now = new Date();
    now.setHours(now.getHours());
    const pad = n => n.toString().padStart(2, '0');
    const hora_pago2 = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const { error: updateError } = await supabase
      .from('remeras')
      .update({
        comprobante2: comprobanteUrl,
        hora_pago2,
      })
      .eq('nombre', nombreSeleccionado)
    if (updateError) {
      setError('Error al guardar')
      return
    }
    setGracias(true)
  }

  if (gracias) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <h2
          style={{
            color: 'black',
            background: '#fff',
            padding: '32px 40px',
            borderRadius: '18px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            margin: 0,
            fontSize: '2em'
          }}
        >
          ¡GRACIAS POR ENVIAR TU COMPROBANTE!
        </h2>
      </div>
    )
  }

  const nombresFiltrados = nombres.filter(n =>
    n.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div>
      <h1
        style={{
          background: '#fff',
          color: 'black',
          padding: '18px 0',
          borderRadius: '14px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          margin: '32px auto 0 auto',
          maxWidth: 400
        }}
      >
        Subí tu comprobante de transferencia
      </h1>
      <form onSubmit={handleSubmit}>
        <select
          value={nombreSeleccionado}
          onChange={e => setNombreSeleccionado(e.target.value)}
        >
          <option value="">Seleccioná tu nombre</option>
          {nombresFiltrados.map(n => (
            <option key={n.id} value={n.nombre}>{n.nombre}</option>
          ))}
        </select>
        <div style={{ color: 'black', fontSize: '0.95em', marginTop: 2 }}>
          Elegí tu nombre de la lista
        </div>
        <input
          type="text"
          placeholder="No lo encontrás? Buscalo acá..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ marginBottom: 8, marginTop: 8 }}
        />
        <div style={{ color: 'black', fontSize: '0.95em', marginTop: 2 }}>
          Escribí tu nombre para buscarlo en la lista
        </div>

        {nombreSeleccionado && (
          <div
            style={{
              background: '#fff',
              borderRadius: 10,
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              padding: 12,
              margin: '8px 0',
              fontSize: '1em'
            }}
          >
            <b>Número:</b> {numero} <br />
            <b>Apodo:</b> {apodo}
            <br />
            <button
              type="button"
              style={{
                marginTop: 8,
                background: '#25d366',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 12px',
                fontSize: '0.95em',
                cursor: 'pointer'
              }}
              onClick={() => {
                const mensaje = encodeURIComponent(
                  `Hola. Soy ${nombreSeleccionado}. Mis datos están mal: `
                );
                window.open(`https://wa.me/5491123895698?text=${mensaje}`, '_blank');
              }}
            >
              ¿La info está mal? Avisá por WhatsApp
            </button>
          </div>
        )}

        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleComprobanteUpload}
        />
        <div style={{ color: 'black', fontSize: '0.95em', marginTop: 2 }}>
          Subí el comprobante de transferencia (imagen o PDF)
        </div>
        {comprobanteUrl && (
          <div style={{ color: 'green', fontSize: '0.95em', marginTop: 2 }}>
            Comprobante subido correctamente
          </div>
        )}

        <button
          type="submit"
          disabled={!puedeSubir}
          style={{
            opacity: puedeSubir ? 1 : 0.5,
            cursor: puedeSubir ? 'pointer' : 'not-allowed'
          }}
        >
          Subir
        </button>
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  )
}

export default TallesForm
