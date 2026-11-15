/**
 * TanStack Query hooks for products, stock movements and the dashboard. Every
 * successful change refreshes all three, so each page shows current stock.
 */
import {
  HISTORY_PAGE_SIZE,
  type ChangePasswordInput,
  type CountResult,
  type CreateProductInput,
  type CreateStaffInput,
  type RecordCountInput,
  type StaffMember,
  type Dashboard,
  type Movement,
  type PersonName,
  type Product,
  type RecordMovementInput,
  type UpdateProductInput,
} from "@mojud/contracts";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useSession } from "../session/SessionProvider";
import { ApiError } from "./client";

const STOCK_KEYS = [["products"], ["movements"], ["dashboard"]] as const;

function useInvalidateStock() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      STOCK_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    );
}

export function useProducts(search = "") {
  const { client } = useSession();
  return useQuery({
    queryKey: ["products", search],
    queryFn: () =>
      client.get<Product[]>(
        search ? `/products?q=${encodeURIComponent(search)}` : "/products",
      ),
  });
}

export interface HistoryFilters {
  productId?: string;
  reason?: string;
  userId?: string;
  /** ISO date-time, inclusive. */
  from?: string;
  /** ISO date-time, exclusive. */
  to?: string;
}

/** Builds the movements URL with the filters in a fixed order. */
export function movementsPath(filters: HistoryFilters, offset = 0): string {
  const params = new URLSearchParams();
  for (const key of ["productId", "reason", "userId", "from", "to"] as const) {
    const value = filters[key];
    if (value) params.set(key, value);
  }
  params.set("limit", String(HISTORY_PAGE_SIZE));
  if (offset > 0) params.set("offset", String(offset));
  return `/stock/movements?${params.toString()}`;
}

/** Movement history, one page of HISTORY_PAGE_SIZE at a time ("Load more"). */
export function useHistory(filters: HistoryFilters) {
  const { client } = useSession();
  return useInfiniteQuery({
    queryKey: ["movements", filters],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      client.get<Movement[]>(movementsPath(filters, pageParam)),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === HISTORY_PAGE_SIZE
        ? pages.length * HISTORY_PAGE_SIZE
        : undefined,
  });
}

/** Everyone in the business, for the "Person" filter. */
export function usePeople() {
  const { client } = useSession();
  return useQuery({
    queryKey: ["people"],
    queryFn: () => client.get<PersonName[]>("/users/names"),
  });
}

export function useChangePassword() {
  const { client } = useSession();
  return useMutation({
    mutationFn: (body: ChangePasswordInput) =>
      client.post<void>("/auth/password", body),
  });
}

export function useResetStaffPassword() {
  const { client } = useSession();
  return useMutation({
    mutationFn: (input: { id: string; newPassword: string }) =>
      client.post<void>(`/users/${input.id}/password`, {
        newPassword: input.newPassword,
      }),
  });
}

export function useDashboard() {
  const { client } = useSession();
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => client.get<Dashboard>("/dashboard"),
  });
}

export function useSaveProduct() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (input: {
      id?: string;
      body: CreateProductInput | UpdateProductInput;
    }) =>
      input.id
        ? client.patch<Product>(`/products/${input.id}`, input.body)
        : client.post<Product>("/products", input.body),
    onSuccess: invalidate,
  });
}

export function useRecordMovement() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (body: RecordMovementInput) =>
      client.post<Movement>("/stock/movements", body),
    onSuccess: invalidate,
  });
}

export function useRecordCount() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (body: RecordCountInput) =>
      client.post<CountResult>("/stock/counts", body),
    onSuccess: invalidate,
  });
}

const STAFF_KEY = ["staff"] as const;

export function useStaff() {
  const { client } = useSession();
  return useQuery({
    queryKey: STAFF_KEY,
    queryFn: () => client.get<StaffMember[]>("/users"),
  });
}

export function useAddStaff() {
  const { client } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateStaffInput) =>
      client.post<StaffMember>("/users", body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export function useSetStaffActive() {
  const { client } = useSession();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; active: boolean }) =>
      client.patch<StaffMember>(`/users/${input.id}`, { active: input.active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export interface FormFailure {
  field?: string;
  message: string;
}

/** Turns a failed save into a field error, or a form message. */
export function toFailure(error: unknown, fallback: string): FormFailure {
  if (error instanceof ApiError) {
    if (error.field) return { field: error.field, message: error.message };
    if (error.code === "FORBIDDEN") return { message: error.message };
  }
  return { message: fallback };
}
