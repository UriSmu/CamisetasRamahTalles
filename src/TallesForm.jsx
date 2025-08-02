import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabaseUrl = 'https://nyfiozihqkrjhqcefqhd.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const opcionesTalle = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

function TallesForm() {
  const [nombres, setNombres] = useState([])
  const [nombreSeleccionado, setNombreSeleccionado] = useState('')
  const [numero, setNumero] = useState('')
  const [apodo, setApodo] = useState('')
  const [talleRemera, setTalleRemera] = useState('')
  const [talleShort, setTalleShort] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [error, setError] = useState('')
  const [gracias, setGracias] = useState(false)

  // 1. Traer nombres sin talles cargados
  useEffect(() => {
    async function fetchNombres() {
      const { data, error } = await supabase
        .from('remeras')
        .select('id, nombre, numero, apodo, talle_remera, talle_short')
      if (!error && data) {
        const sinTalle = data.filter(
          r => !r.talle_remera && !r.talle_short
        )
        setNombres(sinTalle)
      }
    }
    fetchNombres()
  }, [])

  // 2. Mostrar número y apodo al seleccionar nombre
  useEffect(() => {
  if (!nombreSeleccionado) {
    setNumero('')
    setApodo('')
    return
  }
  const persona = nombres.find(n => n.nombre === nombreSeleccionado)
  setNumero(
    persona && typeof persona.numero !== 'undefined' && persona.numero !== null
      ? persona.numero
      : ''
  )
  setApodo(persona?.apodo || '')
}, [nombreSeleccionado, nombres])

  // 4. Subir comprobante a Supabase Storage
  async function handleComprobanteUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const fileName = `${nombreSeleccionado}-${Date.now()}-${file.name}`
    const { data, error } = await supabase.storage
      .from('comprobantes')
      .upload(fileName, file)
    if (error) {
      setError('Error subiendo comprobante')
      return
    }
    const url = supabase.storage.from('comprobantes').getPublicUrl(fileName).data.publicUrl
    setComprobanteUrl(url)
    setComprobante(file)
    setError('')
  }

  // 5. Validar que todo esté completo
  const puedeSubir =
    nombreSeleccionado &&
    talleRemera &&
    talleShort &&
    comprobanteUrl

  // 6. Update en la tabla remeras
  async function handleSubmit(e) {
    e.preventDefault()
    if (!puedeSubir) {
      setError('Completá todos los campos')
      return
    }
    const { error: updateError } = await supabase
      .from('remeras')
      .update({
        talle_remera: talleRemera,
        talle_short: talleShort,
        comprobante: comprobanteUrl,
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
          ¡GRACIAS POR ENVIAR TU TALLE!
        </h2>
      </div>
    )
  }

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
        Formulario Talles Camisetas
      </h1>
      <form onSubmit={handleSubmit}>
        {/* 1. Select de nombres */}
        <select
          value={nombreSeleccionado}
          onChange={e => setNombreSeleccionado(e.target.value)}
        >
          <option value="">Seleccioná tu nombre</option>
          {nombres.map(n => (
            <option key={n.id} value={n.nombre}>{n.nombre}</option>
          ))}
        </select>
        <div style={{ color: 'black', fontSize: '0.95em', marginTop: 2 }}>
          Elegí tu nombre de la lista
        </div>

        {/* 2. Chequeá la info */}
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
              onClick={() => window.open('https://wa.me/5491123895698', '_blank')}
            >
              ¿La info está mal? Avisá por WhatsApp
            </button>
          </div>
        )}

        {/* 3. Talle remera */}
        <select
          value={talleRemera}
          onChange={e => setTalleRemera(e.target.value)}
        >
          <option value="">Talle de remera</option>
          {opcionesTalle.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div style={{ color: 'black', fontSize: '0.95em', marginTop: 2 }}>
          Elegí el talle de tu remera
        </div>

        {/* 4. Talle short */}
        <select
          value={talleShort}
          onChange={e => setTalleShort(e.target.value)}
        >
          <option value="">Talle de short</option>
          {opcionesTalle.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <div style={{ color: 'black', fontSize: '0.95em', marginTop: 2 }}>
          Elegí el talle de tu short
        </div>

        {/* 5. Comprobante */}
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