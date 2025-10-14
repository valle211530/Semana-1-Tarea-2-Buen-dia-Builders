import {
  Keypair,
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
  BASE_FEE,
  Memo
} from '@stellar/stellar-sdk';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const server = new Horizon.Server('https://horizon-testnet.stellar.org');
const networkPassphrase = Networks.TESTNET;

const SECRET_KEY = process.env.SECRET_KEY;

// Destinatarios para pagos múltiples
const destinatarios = [
  { publicKey: "GASTGRVMFUXWUDXSWG6NHCZY4BPT43YAA34RUN2C35ISXM4IV4JSWWVP", memo: "Pago-001" },
  { publicKey: "GCABO7QP7MPOJRG7QLER2GZ2LX77LDPZEBYROKKFKGUA56LXVKP7QSWE", memo: "Pago-002" },
  { publicKey: "GDIJDC2KZB3CT4GNT6R5P33BQUJRIDKGT35U6KYV5V4N6WKCVOBKS6ZD", memo: "Pago-003" }
];

async function enviarPago(destination, amount, memo = '') {
  try {
    console.log(`🚀 Iniciando pago a ${destination.substring(0, 8)}...${destination.substring(destination.length - 4)}\n`);

    // Paso 1: Cargar tu cuenta
    const sourceKeys = Keypair.fromSecret(SECRET_KEY);
    const sourceAccount = await server.loadAccount(sourceKeys.publicKey());

    // Paso 2: Construir transacción
    const transaction = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: networkPassphrase
    })
      .addOperation(Operation.payment({
        destination: destination,
        asset: Asset.native(),
        amount: amount.toString()
      }))
      .addMemo(memo ? Memo.text(memo) : Memo.none())
      .setTimeout(30)
      .build();

    // Paso 3: Firmar
    transaction.sign(sourceKeys);

    // Paso 4: Enviar
    const result = await server.submitTransaction(transaction);

    console.log('🎉 ¡PAGO EXITOSO!\n');
    console.log(`💰 Enviaste: ${amount} XLM`);
    console.log(`📝 Memo: ${memo}`);
    console.log(`🔗 Hash: ${result.hash}\n`);

    return result;

  } catch (error) {
    console.error('❌ ERROR:', error.message);
    throw error;
  }
}

async function enviarPagosMultiples() {
  console.log('🚀 Sistema de pagos múltiples iniciado\n');
  console.log(`📤 Enviando 2 XLM a ${destinatarios.length} cuentas diferentes...\n`);
  console.log('='.repeat(60) + '\n');

  const resultados = [];

  for (let i = 0; i < destinatarios.length; i++) {
    const destinatario = destinatarios[i];

    console.log(`\n--- Transacción ${i + 1}/${destinatarios.length} ---`);

    try {
      const resultado = await enviarPago(destinatario.publicKey, '2', destinatario.memo);

      resultados.push({
        success: true,
        destinatario: destinatario.publicKey,
        memo: destinatario.memo,
        hash: resultado.hash
      });

      console.log('✅ Transacción verificada exitosamente\n');
      console.log('='.repeat(60));

    } catch (error) {
      console.error(`❌ Error en transacción ${i + 1}:`, error.message);

      resultados.push({
        success: false,
        destinatario: destinatario.publicKey,
        memo: destinatario.memo,
        error: error.message
      });

      console.log('⚠️  Continuando con la siguiente transacción...\n');
      console.log('='.repeat(60));
    }
  }

  // Resumen final
  console.log('\n\n📊 RESUMEN DE TRANSACCIONES\n');
  console.log('='.repeat(60));

  const exitosas = resultados.filter(r => r.success).length;
  const fallidas = resultados.filter(r => !r.success).length;

  console.log(`✅ Exitosas: ${exitosas}/${destinatarios.length}`);
  console.log(`❌ Fallidas: ${fallidas}/${destinatarios.length}\n`);

  resultados.forEach((resultado, index) => {
    console.log(`\nTransacción ${index + 1} (${resultado.memo}):`);
    console.log(`  Destino: ${resultado.destinatario}`);
    if (resultado.success) {
      console.log(`  ✅ Estado: EXITOSA`);
      console.log(`  🔗 Hash: ${resultado.hash}`);
    } else {
      console.log(`  ❌ Estado: FALLIDA`);
      console.log(`  ⚠️  Error: ${resultado.error}`);
    }
  });

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ Proceso de pagos múltiples completado\n');
}

enviarPagosMultiples();