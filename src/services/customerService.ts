
interface Customer {
  id: string;
  name: string;
}

interface CustomerResponse {
  data: Customer[];
  pagination: {
    total: number;
    limit: number;
  };
}

const API_URL = "https://papi.bookline.io/customers/ids_names";
const API_KEY = import.meta.env.VITE_PAPI_API_KEY;

// Helper function to get auth headers for PAPI
const getPapiAuthHeaders = (): HeadersInit => {
  return {
    'apikey': API_KEY,
  };
};

export const fetchCustomers = async (): Promise<Customer[]> => {
  const customers: Customer[] = [];
  const limit = 250;
  let nextStartAfter: string | undefined;

  try {
    while (true) {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (nextStartAfter) {
        params.append('start_after', nextStartAfter);
      }

      const response = await fetch(`${API_URL}?${params}`, {
        headers: getPapiAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const result: CustomerResponse = await response.json();
      const data = result.data || [];

      if (data.length === 0) {
        break;
      }

      customers.push(...data);
      
      // If we've fetched all customers or the number of customers is less than the limit,
      // we're done fetching
      if (data.length < limit) {
        break;
      }
      
      nextStartAfter = data[data.length - 1].id;
    }

    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};
