/**
 * TanStack Query hooks for products, stock movements and the dashboard. Every
 * successful change refreshes all three, so each page shows current stock.
 */
import type {
  CountResult,
  CreateProductInput,
  CreateStaffInput,
  RecordCountInput,
  StaffMember,
  Dashboard,
  Movement,
  Product,
  RecordMovementInput,
  UpdateProductInput,
} from "@mojud/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export function useMovements(productId = "") {
  const { client } = useSession();
  return useQuery({
    queryKey: ["movements", productId],
    queryFn: () =>
      client.get<Movement[]>(
        productId
          ? `/stock/movements?productId=${encodeURIComponent(productId)}`
          : "/stock/movements",
      ),
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
