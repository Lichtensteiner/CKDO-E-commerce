export interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export async function simulateMobileMoneyPayment(
  provider: 'Airtel Money' | 'Moov Money',
  phoneNumber: string,
  amount: number
): Promise<PaymentResult> {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 2500));

  // In real implementation, this would call the aggregator API via our backend
  console.log(`[Simulation] Initiating ${provider} payment for ${phoneNumber} - Amount: ${amount}`);

  // 90% success rate for simulation
  const success = Math.random() > 0.1;

  if (success) {
    return {
      success: true,
      transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      message: 'Paiement effectué avec succès.',
    };
  } else {
    return {
      success: false,
      transactionId: '',
      message: 'Le paiement a échoué. Veuillez vérifier votre solde ou réessayer.',
    };
  }
}
