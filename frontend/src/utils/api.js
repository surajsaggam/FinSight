const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

export async function uploadReceiptImage(file) {
  const formData = new FormData();
  formData.append('receipt', file);

  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/receipt`, {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new Error('Unable to connect to the FinSight server. Please verify the backend is running.');
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error(`Unexpected response from server (HTTP ${res.status}).`);
  }

  if (!res.ok || !json.success) {
    throw new Error(json.error || `Failed to parse receipt (HTTP ${res.status}).`);
  }

  return json.data;
}

export async function analyzeTransactions(transactions) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    });
  } catch {
    throw new Error('Unable to connect to the analysis engine.');
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Invalid response from the analysis engine.');
  }

  if (!res.ok || json.status === 'error') {
    throw new Error(json.error || json.message || 'Failed to analyze transactions.');
  }

  return json;
}

export async function sendChatMessage({ message, transactions, monthlyBudget }) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, transactions, monthlyBudget }),
    });
  } catch {
    throw new Error('Unable to reach FinSight AI assistant. Please check your connection.');
  }

  let json;
  try {
    json = await res.json();
  } catch {
    throw new Error('Invalid response from FinSight AI assistant.');
  }

  if (!res.ok) {
    throw new Error(json.reply || json.error || 'FinSight AI assistant encountered an error.');
  }

  return json.reply;
}

export async function reportClientError(errorPayload) {
  try {
    await fetch(`${API_BASE_URL}/api/log-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorPayload),
    });
  } catch {
    // Fail silently if error logging endpoint is unreachable
  }
}
