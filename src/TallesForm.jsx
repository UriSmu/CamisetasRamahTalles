import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

const supabaseUrl = 'https://nyfiozihqkrjhqcefqhd.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const opcionesTalle = ['S', 'M', 'L', 'XL']

function TallesForm() {
  const [nombres, setNombres] = useState([])
  const [nombreSeleccionado, setNombreSeleccionado] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [numero, setNumero] = useState('')
  const [apodo, setApodo] = useState('')
  const [talleRemera, setTalleRemera] = useState('')
  const [talleShort, setTalleShort] = useState('')
  const [comprobante, setComprobante] = useState(null)
  const [comprobanteUrl, setComprobanteUrl] = useState('')
  const [error, setError] = useState('')
  const [gracias, setGracias] = useState(false)
  const [imagenGrande, setImagenGrande] = useState(null)

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

  function limpiarNombre(nombre) {
  if (!nombre) return 'sin-nombre'
  return nombre.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')
}

async function handleComprobanteUpload(e) {
  const file = e.target.files[0]
  if (!file) return
  const nombreLimpio = limpiarNombre(nombreSeleccionado)
  const fileName = `${nombreLimpio}-${Date.now()}-${file.name}`
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

  const puedeSubir =
    nombreSeleccionado &&
    talleRemera &&
    talleShort &&
    comprobanteUrl

  async function handleSubmit(e) {
    e.preventDefault()
    if (!puedeSubir) {
      setError('Completá todos los campos')
      return
    }
    // Obtener hora de Argentina (GMT-3)
    const now = new Date();
    // Ajustar manualmente a GMT-3 (hora de Buenos Aires, sin depender del timezone del servidor)
    now.setHours(now.getHours());
    const pad = n => n.toString().padStart(2, '0');
    const hora_pago = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const { error: updateError } = await supabase
      .from('remeras')
      .update({
        talle_remera: talleRemera,
        talle_short: talleShort,
        comprobante: comprobanteUrl,
        hora_pago,
      })
      .eq('nombre', nombreSeleccionado)
    if (updateError) {
      setError('Error al guardar')
      return
    }
    setGracias(true)
  }

  function handleOtroTalle() {
    const mensaje = encodeURIComponent(
      'Hola. No logro encontrar mi talle. Necesito talle ___'
    )
    window.open(`https://wa.me/5491123895698?text=${mensaje}`, '_blank')
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
        Formulario Talles Camisetas
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

        <div
          style={{
            background: '#fff',
            borderRadius: 10,
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            padding: 12,
            margin: '18px 0 8px 0',
            fontSize: '1em'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Para medir tu talle, usá una remera/short que te quede cómodo. Estiralo bien, y medilo como en la imágen.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <img
                src="/assets/tabla-remera.png"
                alt="Tabla de talles remera"
                style={{
                  maxWidth: '100%',
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  cursor: 'zoom-in'
                }}
                onClick={() => setImagenGrande('/assets/tabla-remera.png')}
              />
            </div>
            <div>
              <img
                src="/assets/tabla-short.png"
                alt="Tabla de talles short"
                style={{
                  maxWidth: '100%',
                  marginBottom: 8,
                  borderRadius: 8,
                  border: '1px solid #ddd',
                  cursor: 'zoom-in'
                }}
                onClick={() => setImagenGrande('/assets/tabla-short.png')}
              />
            </div>
          </div>
        </div>

        {imagenGrande && (
          <div
            onClick={() => setImagenGrande(null)}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              cursor: 'zoom-out'
            }}
          >
            <img
              src={imagenGrande}
              alt="Tabla grande"
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                borderRadius: 12,
                boxShadow: '0 4px 32px rgba(0,0,0,0.25)',
                background: '#fff'
              }}
            />
          </div>
        )}

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
        <button
            type="button"
            onClick={handleOtroTalle}
            style={{
              marginTop: 18,
              background: '#25d366',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: '1em',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Necesito otro talle
          </button>

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