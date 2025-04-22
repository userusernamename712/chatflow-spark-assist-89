
interface Customer {
  id: string;
  name: string;
}

interface CustomerResponse {
  data: Customer[];
  next_start_after?: string;
}

const API_URL = "https://papi.bookline.io/customers/ids_names";
const API_KEY = import.meta.env.VITE_PAPI_API_KEY;

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
        headers: {
          'apikey': API_KEY,
        },
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
      nextStartAfter = data[data.length - 1].id;
    }

    return customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};
