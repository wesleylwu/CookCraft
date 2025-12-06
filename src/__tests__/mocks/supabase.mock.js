// mock supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn(() => mockSupabaseClient),
  select: jest.fn(() => mockSupabaseClient),
  insert: jest.fn(() => mockSupabaseClient),
  update: jest.fn(() => mockSupabaseClient),
  delete: jest.fn(() => mockSupabaseClient),
  eq: jest.fn(() => mockSupabaseClient),
  single: jest.fn(() => mockSupabaseClient),
  order: jest.fn(() => mockSupabaseClient),
};

module.exports = {
  createClient: jest.fn(() => mockSupabaseClient),
  mockSupabaseClient,
};
