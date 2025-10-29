# 📱 Configuración de AdMob

## Paso 1: Crear cuenta AdMob
1. Ve a https://admob.google.com
2. Crea cuenta con Google
3. Acepta términos y condiciones
4. Configura información de pago

## Paso 2: Crear app en AdMob
```
App name: TaskAI Cash
Platform: Web/PWA
Store URL: https://d1evw7tv861bdq.cloudfront.net
```

## Paso 3: Crear unidades de anuncios
### Banner Ad
- Nombre: TaskAI Banner
- Formato: Banner (320x50)
- ID: ca-app-pub-3663587138046068/6773689304

### Interstitial Ad
- Nombre: TaskAI Interstitial  
- Formato: Interstitial
- ID: ca-app-pub-3663587138046068/3414944516

### Rewarded Ad
- Nombre: TaskAI Rewarded
- Formato: Rewarded
- ID: ca-app-pub-3663587138046068/9416164512

## Paso 4: Integrar en Frontend
```javascript
// Agregar a frontend/public/index.html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXX" crossorigin="anonymous"></script>
```

## Paso 5: Actualizar configuración
```bash
# Actualizar backend/src/ads/index.ts con IDs reales
const AD_UNITS = {
  banner: 'ca-app-pub-XXXXXXXX/XXXXXXXXX',
  interstitial: 'ca-app-pub-XXXXXXXX/XXXXXXXXX', 
  rewarded: 'ca-app-pub-XXXXXXXX/XXXXXXXXX'
};
```

## Paso 6: Implementar componente de ads
```jsx
// frontend/src/components/AdComponent.tsx
import { useEffect } from 'react';

const AdBanner = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
         style={{display: 'block'}}
         data-ad-client="ca-pub-XXXXXXXX"
         data-ad-slot="XXXXXXXXX"
         data-ad-format="auto"></ins>
  );
};
```