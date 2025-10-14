import { Keypair } from '@stellar/stellar-sdk';
import fs from 'fs';

function esPublicKeyValida(key) {
  return key.startsWith('G') && key.length === 56;
}

async function crearCuenta(numero) {
  console.log(`\n🔐 Generando cuenta ${numero}...\n`);

  // Generar llaves aleatorias
  const pair = Keypair.random();

  if (!esPublicKeyValida(pair.publicKey())) {
    console.error('❌ Error: Clave pública inválida generada');
    return null;
  }

  console.log('✅ ¡Cuenta creada!\n');
  console.log('📧 PUBLIC KEY (puedes compartir):');
  console.log(pair.publicKey());
  console.log('\n🔑 SECRET KEY (NUNCA COMPARTIR):');
  console.log(pair.secret());

  // Fondear con Friendbot
  console.log('\n💰 Fondeando con Friendbot...');

  try {
    const response = await fetch(
      `https://friendbot.stellar.org/?addr=${pair.publicKey()}`
    );

    const result = await response.json();

    if (result.successful || response.ok) {
      console.log('✅ ¡Cuenta fondeada con 10,000 XLM!\n');
      console.log('🔗 Transaction hash:', result.hash);
    }
  } catch (error) {
    console.error('❌ Error al fondear:', error.message);
  }

  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret()
  };
}

async function crearMultiplesCuentas() {
  console.log('🚀 Creando 5 cuentas en Stellar testnet...');

  const cuentas = [];

  for (let i = 0; i < 5; i++) {
    const cuenta = await crearCuenta(i + 1);
    if (cuenta) {
      cuentas.push(cuenta);
    }
  }

  // Guardar todas las cuentas en un archivo
  fs.writeFileSync('cuentas.json', JSON.stringify(cuentas, null, 2));

  console.log('\n✅ Proceso completado: 5 cuentas creadas');
  console.log('📁 Las cuentas se guardaron en: cuentas.json');
  console.log('\n⚠️  IMPORTANTE: Guarda estas llaves en un lugar seguro\n');
}

crearMultiplesCuentas();