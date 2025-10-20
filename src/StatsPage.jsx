import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './App.css';

const supabaseUrl = 'https://nyfiozihqkrjhqcefqhd.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cambia esto si el total de personas cambia
const TOTAL_PERSONAS = 57;

function StatsPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === 'Marazul25') {
      setIsAuthenticated(true);
      fetchStats();
    } else {
      setError('Contraseña incorrecta');
    }
  };

  const fetchStats = async () => {
    const { data: remeras, error: errorRemeras } = await supabase
      .from('remeras')
      .select('id, nombre, comprobante, comprobante2, talle_short, talle_remera');

    if (errorRemeras || !remeras) {
      setError('Error al obtener estadísticas');
      return;
    }

    const pagosCuota1 = remeras.filter(r => r.comprobante);
    const pagosCuota2 = remeras.filter(r => r.comprobante2);

    const tallesExtraShort = remeras.filter(
      r => r.talle_short && !['S', 'M', 'L', 'XL'].includes(r.talle_short)
    );
    const tallesExtraRemera = remeras.filter(
      r => r.talle_remera && !['S', 'M', 'L', 'XL'].includes(r.talle_remera)
    );

    const deudores = remeras.filter(
      r => !r.comprobante || !r.comprobante2
    );

    const totalTallesExtraShort = tallesExtraShort.length;
    const totalTallesExtraRemera = tallesExtraRemera.length;
    const totalTallesExtra = totalTallesExtraShort + totalTallesExtraRemera;

    const montoTallesExtraShort = totalTallesExtraShort * 1500;
    const montoTallesExtraRemera = totalTallesExtraRemera * 1500;
    const montoTallesExtra = montoTallesExtraShort + montoTallesExtraRemera;

    const totalRecaudado =
      pagosCuota1.length * 26500 +
      pagosCuota2.length * 4500 +
      montoTallesExtra;
    const totalFaltante = 1771500 - totalRecaudado;

    setStats({
      pagosCuota1: pagosCuota1.length,
      pagosCuota2: pagosCuota2.length,
      tallesExtraShort,
      tallesExtraRemera,
      totalTallesExtraShort,
      totalTallesExtraRemera,
      totalTallesExtra,
      montoTallesExtraShort,
      montoTallesExtraRemera,
      montoTallesExtra,
      deudores,
      totalRecaudado,
      totalFaltante,
    });
  };

  if (!isAuthenticated) {
    return (
      <form onSubmit={handlePasswordSubmit}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese la contraseña"
        />
        <button type="submit">Acceder</button>
        {error && <div>{error}</div>}
      </form>
    );
  }

  if (!stats) {
    return <div>Cargando estadísticas...</div>;
  }

  // Porcentaje para gráficos
  const cuota1Percent = Math.round((stats.pagosCuota1 / TOTAL_PERSONAS) * 100);
  const cuota2Percent = Math.round((stats.pagosCuota2 / TOTAL_PERSONAS) * 100);
  const recaudadoPercent = Math.round((stats.totalRecaudado / 1771500) * 100);

  return (
    <div className="stats-container" style={{ maxWidth: 600, margin: '40px auto', background: 'rgba(255,255,255,0.97)', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 32 }}>
      <h1>Estadísticas de Pagos</h1>
      <div style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 18 }}>
          <h2>Cuota 1 Pagos: {stats.pagosCuota1}/{TOTAL_PERSONAS}</h2>
          <div style={{ background: '#eee', borderRadius: 8, height: 24, width: '100%', position: 'relative', marginBottom: 8 }}>
            <div style={{
              width: `${cuota1Percent}%`,
              background: '#4a90e2',
              height: '100%',
              borderRadius: 8,
              transition: 'width 0.5s'
            }}></div>
            <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', color: '#333', fontWeight: 'bold', lineHeight: '24px' }}>{cuota1Percent}%</span>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <h2>Cuota 2 Pagos: {stats.pagosCuota2}/{TOTAL_PERSONAS}</h2>
          <div style={{ background: '#eee', borderRadius: 8, height: 24, width: '100%', position: 'relative', marginBottom: 8 }}>
            <div style={{
              width: `${cuota2Percent}%`,
              background: '#25d366',
              height: '100%',
              borderRadius: 8,
              transition: 'width 0.5s'
            }}></div>
            <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', color: '#333', fontWeight: 'bold', lineHeight: '24px' }}>{cuota2Percent}%</span>
          </div>
        </div>
        <div style={{ marginBottom: 18 }}>
          <h2>Total Recaudado: ${stats.totalRecaudado.toLocaleString()}</h2>
          <div style={{ background: '#eee', borderRadius: 8, height: 24, width: '100%', position: 'relative', marginBottom: 8 }}>
            <div style={{
              width: `${recaudadoPercent}%`,
              background: '#f5a623',
              height: '100%',
              borderRadius: 8,
              transition: 'width 0.5s'
            }}></div>
            <span style={{ position: 'absolute', left: '50%', top: 0, transform: 'translateX(-50%)', color: '#333', fontWeight: 'bold', lineHeight: '24px' }}>{recaudadoPercent}%</span>
          </div>
          <h2 style={{ color: '#d0021b', marginTop: 8 }}>Total Faltante: ${stats.totalFaltante.toLocaleString()}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginBottom: 32 }}>
  <div style={{ flex: 1, background: '#e3f2fd', borderRadius: 10, padding: 16 }}>
    <h3 style={{ marginBottom: 8 }}>Talles Extra Short</h3>
    <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: 8 }}>
      {stats.tallesExtraShort.length} prendas - ${stats.tallesExtraShort.length * 1500}
    </div>
    <ul>
      {stats.tallesExtraShort.map((talle) => (
        <li key={talle.id}>{talle.talle_short}</li>
      ))}
    </ul>
  </div>
  <div style={{ flex: 1, background: '#fff3e0', borderRadius: 10, padding: 16 }}>
    <h3 style={{ marginBottom: 8 }}>Talles Extra Remera</h3>
    <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: 8 }}>
      {stats.tallesExtraRemera.length} prendas - ${stats.tallesExtraRemera.length * 1500}
    </div>
    <ul>
      {stats.tallesExtraRemera.map((talle) => (
        <li key={talle.id}>{talle.talle_remera}</li>
      ))}
    </ul>
  </div>
</div>
<div style={{ background: '#f9fbe7', borderRadius: 10, padding: 16, marginBottom: 32 }}>
  <h3>
    Total Talles Extra: {stats.totalTallesExtra} prendas - ${stats.totalTallesExtra * 1500}
  </h3>
</div>
      <div style={{ background: '#ffebee', borderRadius: 10, padding: 16 }}>
        <h3>Deudores:</h3>
        <ul>
          {stats.deudores.map((deudor, idx) => (
            <li key={deudor.nombre || idx}>
              {deudor.nombre} - Deuda: {!deudor.comprobante ? 'Cuota 1 ' : ''}{!deudor.comprobante2 ? 'Cuota 2' : ''}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default StatsPage;