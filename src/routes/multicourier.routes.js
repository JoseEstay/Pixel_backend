import { Router } from 'express';

const router = Router();
const RAPID_HOST = 'multicourier.p.rapidapi.com';

// 1. Obtener Regiones (Endpoint oficial: /location/state)
router.get('/api/despacho/regiones', async (req, res) => {
  try {
    const response = await fetch(`https://${RAPID_HOST}/location/state`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPID_HOST,
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
      }
    });

    const data = await response.json();
    
    // Mapeamos según la estructura descrita en el tutorial (codeRegion y name)
    const regiones = data.map(r => ({
      codigo: r.codeRegion,
      nombre: r.name
    }));

    return res.json({ success: true, regiones });
  } catch (error) {
    console.error('Error al obtener regiones:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener regiones' });
  }
});

// 2. Obtener Comunas por Región (Endpoint oficial: /location/district/:state)
router.get('/api/despacho/comunas/:regionCode', async (req, res) => {
  const { regionCode } = req.params;

  try {
    const response = await fetch(`https://${RAPID_HOST}/location/district/${regionCode}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': RAPID_HOST,
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
      }
    });

    const data = await response.json();
    const comunasRaw = data.locations || [];
    
    // Mapeamos usando code y name del arreglo locations
    const comunas = comunasRaw.map(c => ({
      codigoComuna: c.code,
      nombreComuna: c.name
    }));

    return res.json({ success: true, comunas });
  } catch (error) {
    console.error('Error al obtener comunas:', error);
    return res.status(500).json({ success: false, error: 'Error al obtener comunas' });
  }
});

// 3. Cotización MultiCourier (Endpoint oficial: POST /pricing)
router.post('/api/despacho/cotizar', async (req, res) => {
  const { origenRegion, origenComuna, destinoRegion, destinoComuna, peso, alto, ancho, largo } = req.body;

  const payloadApi = {
    from: {
      state: origenRegion,
      district: origenComuna
    },
    to: {
      state: destinoRegion,
      district: destinoComuna
    },
    datosProducto: {
      largo: Number(largo),
      ancho: Number(ancho),
      alto: Number(alto),
      pesoFisico: Number(peso)
    }
  };

  try {
    const response = await fetch(`https://${RAPID_HOST}/pricing`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-rapidapi-host': RAPID_HOST,
        'x-rapidapi-key': process.env.X_RAPIDAPI_KEY
      },
      body: JSON.stringify(payloadApi)
    });

    const data = await response.json();
    return res.json({ success: true, opciones: data });
  } catch (error) {
    console.error('Error al cotizar:', error);
    return res.status(500).json({ success: false, error: 'Error al procesar la cotización' });
  }
});

export default router;