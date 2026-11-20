/**
 * TanStack Query hooks for products, stock movements and the dashboard. Every
 * successful change refreshes all three, so each page shows current stock.
 */
import {
  APPROVALS_PAGE_SIZE,
  HISTORY_PAGE_SIZE,
  type Approval,
  type ChangePasswordInput,
  type FlagDamageInput,
  type RequestReversalInput,
  type WorkRecord,
  type CountResult,
  type ImportResult,
  type ImportRow,
  type StockReport,
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
import { API_BASE, ApiError } from "./client";

const STOCK_KEYS = [
  ["products"],
  ["movements"],
  ["dashboard"],
  ["report"],
  ["approvals"],
  ["record"],
] as const;

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

/** The history CSV for the same filters (the server ignores paging). */
export function movementsExportHref(filters: HistoryFilters): string {
  const query = movementsPath(filters).split("?")[1] ?? "";
  const params = new URLSearchParams(query);
  params.delete("limit");
  const rest = params.toString();
  return `${API_BASE}/stock/movements/export.csv${rest ? `?${rest}` : ""}`;
}

export const PRODUCTS_EXPORT_HREF = `${API_BASE}/products/export.csv`;

export function reportPath(from: string, to: string): string {
  return `/reports/stock?${new URLSearchParams({ from, to }).toString()}`;
}

export function reportExportHref(from: string, to: string): string {
  return `${API_BASE}${reportPath(from, to).replace("/reports/stock?", "/reports/stock.csv?")}`;
}

export function useStockReport(from: string, to: string) {
  const { client } = useSession();
  return useQuery({
    queryKey: ["report", from, to],
    queryFn: () => client.get<StockReport>(reportPath(from, to)),
    enabled: from !== "" && to !== "",
  });
}

export function useImportProducts() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (rows: ImportRow[]) =>
      client.post<ImportResult>("/products/import", { rows }),
    onSuccess: invalidate,
  });
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

/**
 * Turns a failed save into a field error, or a form message. A refusal
 * (4xx) carries the server's own words, such as "This was already decided";
 * anything else gets the general "Couldn't save" message.
 */
export function toFailure(error: unknown, fallback: string): FormFailure {
  if (error instanceof ApiError) {
    if (error.field) return { field: error.field, message: error.message };
    if (error.status >= 400 && error.status < 500) {
      return { message: error.message };
    }
  }
  return { message: fallback };
}

export function approvalsPath(
  status: "pending" | "decided",
  offset = 0,
): string {
  const params = new URLSearchParams({
    status,
    limit: String(APPROVALS_PAGE_SIZE),
  });
  if (offset > 0) params.set("offset", String(offset));
  return `/approvals?${params.toString()}`;
}

/** The approvals inbox, one page of APPROVALS_PAGE_SIZE at a time. */
export function useApprovals(status: "pending" | "decided") {
  const { client } = useSession();
  return useInfiniteQuery({
    queryKey: ["approvals", status],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      client.get<Approval[]>(approvalsPath(status, pageParam)),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === APPROVALS_PAGE_SIZE
        ? pages.length * APPROVALS_PAGE_SIZE
        : undefined,
  });
}

export function useFlagDamage() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (body: FlagDamageInput) =>
      client.post<Approval>("/stock/damage-flags", body),
    onSuccess: invalidate,
  });
}

export function useRequestReversal() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (body: RequestReversalInput) =>
      client.post<Approval>("/approvals/reversals", body),
    onSuccess: invalidate,
  });
}

export function useDecideApproval() {
  const { client } = useSession();
  const invalidate = useInvalidateStock();
  return useMutation({
    mutationFn: (input: { id: string; approve: boolean }) =>
      client.post<Approval>(
        `/approvals/${input.id}/${input.approve ? "approve" : "reject"}`,
      ),
    onSuccess: invalidate,
  });
}

export function useWorkRecord(userId: string) {
  const { client } = useSession();
  return useQuery({
    queryKey: ["record", userId],
    queryFn: () =>
      client.get<WorkRecord>(
        userId
          ? `/me/record?userId=${encodeURIComponent(userId)}`
          : "/me/record",
      ),
  });
}
