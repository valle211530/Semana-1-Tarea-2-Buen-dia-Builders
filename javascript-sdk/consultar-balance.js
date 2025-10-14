import { Horizon } from '@stellar/stellar-sdk';

const server = new Horizon.Server('https://horizon-testnet.stellar.org');

// Array de cuentas a monitorear
const publicKeys = [
  'GASTGRVMFUXWUDXSWG6NHCZY4BPT43YAA34RUN2C35ISXM4IV4JSWWVP',
  'GCABO7QP7MPOJRG7QLER2GZ2LX77LDPZEBYROKKFKGUA56LXVKP7QSWE',
  'GDIJDC2KZB3CT4GNT6R5P33BQUJRIDKGT35U6KYV5V4N6WKCVOBKS6ZD'
];

async function consultarBalance(publicKey) {
  try {
    const account = await server.loadAccount(publicKey);

    // Obtener balance de XLM
    const xlmBalance = account.balances.find(b => b.asset_type === 'native');
    const balance = xlmBalance ? parseFloat(xlmBalance.balance).toFixed(2) : '0.00';

    // Contar trustlines activos (todos los balances excepto XLM)
    const trustlines = account.balances.filter(b => b.asset_type !== 'native').length;

    // Obtener sequence number
    const sequence = account.sequenceNumber();

    return {
      publicKey,
      balance,
      trustlines,
      sequence,
      success: true
    };

  } catch (error) {
    return {
      publicKey,
      balance: 'N/A',
      trustlines: 'N/A',
      sequence: 'N/A',
      success: false,
      error: error.response?.status === 404 ? 'Cuenta no encontrada' : error.message
    };
  }
}

async function monitorearCuentas(cuentas) {
  console.log('\n=== MONITOR DE CUENTAS ===\n');

  const resultados = [];

  for (const publicKey of cuentas) {
    const resultado = await consultarBalance(publicKey);
    resultados.push(resultado);

    // Formatear salida
    const shortKey = `${publicKey.substring(0, 5)}...${publicKey.substring(publicKey.length - 3)}`;
    console.log(`Cuenta: ${shortKey}`);

    if (resultado.success) {
      console.log(`  Balance: ${resultado.balance} XLM`);
      console.log(`  Trustlines: ${resultado.trustlines}`);
      console.log(`  Sequence: ${resultado.sequence}`);
    } else {
      console.log(`  ❌ Error: ${resultado.error}`);
    }

    console.log('');
  }

  // Resumen final
  console.log('='.repeat(30));
  const exitosas = resultados.filter(r => r.success).length;
  console.log(`\nCuentas consultadas: ${exitosas}/${cuentas.length}`);

  if (exitosas > 0) {
    const totalBalance = resultados
      .filter(r => r.success)
      .reduce((sum, r) => sum + parseFloat(r.balance), 0);
    console.log(`Balance total: ${totalBalance.toFixed(2)} XLM\n`);
  }

  return resultados;
}

monitorearCuentas(publicKeys);