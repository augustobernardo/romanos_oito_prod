import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration1 = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260508000000_cd35aae3-1007-4594-a2c7-1d2e04072572.sql",
  ),
  "utf8",
).replace(/\s+/g, " ");

const migration5 = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260508000004_aca8a2e1-fd43-424a-aa86-59e4279fc4e9.sql",
  ),
  "utf8",
).replace(/\s+/g, " ");

const migrationConditionalStatus = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260519_conditional_payment_status.sql",
  ),
  "utf8",
).replace(/\s+/g, " ");

const migration3 = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260508000002_9c414f73-f62e-4c3e-96f7-e97b0591adbe.sql",
  ),
  "utf8",
).replace(/\s+/g, " ");

const migration4 = readFileSync(
  resolve(
    process.cwd(),
    "supabase/migrations/20260508000003_7d2b6699-8de6-417e-bdc6-2b56cf0ae5d5.sql",
  ),
  "utf8",
).replace(/\s+/g, " ");

describe("pentecoste_registrations table", () => {
  it("creates the pentecoste_registrations table with all required columns", () => {
    expect(migration1).toContain(
      "CREATE TABLE public.pentecoste_registrations",
    );
    expect(migration1).toContain("read_descriptions_confirmation boolean NOT NULL");
    expect(migration1).toContain("fullname text NOT NULL");
    expect(migration1).toContain("fullname_normalized");
    expect(migration1).toContain("instagram_user");
    expect(migration1).toContain("whatsapp_number text NOT NULL");
    expect(migration1).toContain("whatsapp_number_normalized");
    expect(migration1).toContain("contact_person_charge");
    expect(migration1).toContain("confirm_authorization_underage");
    expect(migration1).toContain("parish_church");
    expect(migration1).toContain("participate_moviment");
    expect(migration1).toContain("participate_romanos_event");
    expect(migration1).toContain("bring_share jsonb");
    expect(migration1).toContain("bring_share_other");
    expect(migration1).toContain("workshop_group");
    expect(migration1).toContain("arrival_time");
    expect(migration1).toContain("arrival_time_restriction");
    expect(migration1).toContain("expectations_pentecoste");
    expect(migration1).toContain("payment_method");
    expect(migration1).toContain("payment_proof_url");
    expect(migration1).toContain("payment_proof_filename");
    expect(migration1).toContain("payment_proof_size bigint");
    expect(migration1).toContain("payment_uploaded_at");
    expect(migration1).toContain("payment_status");
    expect(migration1).toContain("created_at");
    expect(migration1).toContain("updated_at");
  });

  it("has composite unique index for duplicate prevention", () => {
    expect(migration1).toContain(
      "CREATE UNIQUE INDEX idx_pentecoste_unique_registration",
    );
    expect(migration1).toContain(
      "(fullname_normalized, whatsapp_number_normalized)",
    );
  });

  it("has performance indexes on normalized fields, created_at, and payment_status", () => {
    expect(migration1).toContain(
      "CREATE INDEX idx_pentecoste_whatsapp_normalized",
    );
    expect(migration1).toContain(
      "CREATE INDEX idx_pentecoste_fullname_normalized",
    );
    expect(migration1).toContain("CREATE INDEX idx_pentecoste_created_at");
    expect(migration1).toContain("CREATE INDEX idx_pentecoste_payment_status");
  });

  it("enables RLS on the table", () => {
    expect(migration1).toContain(
      "ALTER TABLE public.pentecoste_registrations ENABLE ROW LEVEL SECURITY",
    );
  });

  it("has admin SELECT policy only (no public INSERT/UPDATE/DELETE)", () => {
    expect(migration1).toContain(
      "CREATE POLICY \"Admins can select pentecoste_registrations\"",
    );
    expect(migration1).toContain("FOR SELECT TO authenticated");
    expect(migration1).toContain("public.has_role(auth.uid(), 'admin')");
    // Must NOT have any INSERT, UPDATE, or DELETE policies for anon/public
    expect(migration1).not.toContain("FOR INSERT");
    expect(migration1).not.toContain("FOR UPDATE");
    expect(migration1).not.toContain("FOR DELETE");
  });
});

describe("normalization trigger", () => {
  it("creates the normalize_pentecoste_registration trigger function", () => {
    expect(migration1).toContain(
      "CREATE OR REPLACE FUNCTION public.normalize_pentecoste_registration()",
    );
    expect(migration1).toContain("SECURITY DEFINER");
    expect(migration1).toContain(
      "NEW.fullname_normalized := LOWER(TRIM(NEW.fullname))",
    );
    expect(migration1).toContain(
      "NEW.whatsapp_number_normalized := REGEXP_REPLACE(NEW.whatsapp_number, '[^0-9]', '', 'g')",
    );
  });

  it("creates the BEFORE INSERT trigger", () => {
    expect(migration1).toContain(
      "CREATE TRIGGER trg_normalize_pentecoste_registration",
    );
    expect(migration1).toContain("BEFORE INSERT ON public.pentecoste_registrations");
    expect(migration1).toContain(
      "EXECUTE FUNCTION public.normalize_pentecoste_registration()",
    );
  });

  it("creates updated_at BEFORE UPDATE trigger", () => {
    expect(migration1).toContain(
      "CREATE OR REPLACE FUNCTION public.update_pentecoste_updated_at()",
    );
    expect(migration1).toContain("NEW.updated_at = now()");
    expect(migration1).toContain(
      "CREATE TRIGGER trg_update_pentecoste_updated_at",
    );
    expect(migration1).toContain("BEFORE UPDATE ON public.pentecoste_registrations");
  });
});

describe("migration: date_of_birth replaces age", () => {
  it("drops age column and adds date_of_birth", () => {
    expect(migration5).toContain("DROP COLUMN IF EXISTS age");
    expect(migration5).toContain("ADD COLUMN date_of_birth date");
  });

  it("calculates age via EXTRACT(YEAR FROM AGE(date_of_birth))", () => {
    expect(migration5).toContain("_age := EXTRACT(YEAR FROM AGE(_date_of_birth::date))");
  });
});

describe("create_pentecoste_registration RPC", () => {
  it("creates the RPC function with SECURITY DEFINER", () => {
    expect(migration5).toContain(
      "CREATE OR REPLACE FUNCTION public.create_pentecoste_registration(",
    );
    expect(migration5).toContain("SECURITY DEFINER");
    expect(migration5).toContain("SET search_path = public");
  });

  it("returns JSONB with success/error structure", () => {
    expect(migration5).toContain("RETURNS jsonb");
    expect(migration5).toContain(
      "jsonb_build_object('success', true, 'id', _new_id)",
    );
  });

  it("validates reading confirmation is required", () => {
    expect(migration5).toContain(
      "RETURN jsonb_build_object('success', false, 'error', 'READING_CONFIRMATION_REQUIRED')",
    );
  });

  it("validates required fields (fullname, whatsapp, date_of_birth)", () => {
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'INVALID_DATA'",
    );
    expect(migration5).toContain("Nome completo e obrigatorio");
    expect(migration5).toContain("WhatsApp e obrigatorio");
    expect(migration5).toContain("Data de nascimento e obrigatoria");
  });

  it("validates age >= 14 from date_of_birth", () => {
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'INVALID_AGE')",
    );
    expect(migration5).toContain("IF _age < 14 THEN");
  });

  it("validates underage requires contact_person_charge and authorization", () => {
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'INVALID_UNDERAGE_DATA')",
    );
    expect(migration5).toContain("IF _age < 18 THEN");
  });

  it("validates arrival_time configuration", () => {
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'INVALID_ARRIVAL_CONFIGURATION')",
    );
  });

  it("validates payment proof file type (png, jpg, pdf only)", () => {
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'INVALID_FILE_TYPE')",
    );
    expect(migration5).toContain("_payment_proof_filename ~* '\\.(png|jpe?g|pdf)$'");
  });

  it("validates payment proof max size (5MB = 5242880 bytes)", () => {
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'FILE_TOO_LARGE')",
    );
    expect(migration5).toContain("_payment_proof_size > 5242880");
  });

  it("normalizes fields for duplicate check", () => {
    expect(migration5).toContain(
      "_fn := LOWER(btrim(_fullname))",
    );
    expect(migration5).toContain(
      "_wn := REGEXP_REPLACE(_whatsapp_number, '[^0-9]', '', 'g')",
    );
  });

  it("catches unique_violation and returns DUPLICATE_REGISTRATION", () => {
    expect(migration5).toContain("EXCEPTION");
    expect(migration5).toContain("WHEN unique_violation THEN");
    expect(migration5).toContain(
      "jsonb_build_object('success', false, 'error', 'DUPLICATE_REGISTRATION')",
    );
  });

  it("sets payment_uploaded_at only when proof URL is provided", () => {
    expect(migration5).toContain(
      "CASE WHEN _payment_proof_url IS NOT NULL AND _payment_proof_url != '' THEN now() ELSE NULL END",
    );
  });

  it("defaults payment_status to 'confirmed' in original migration", () => {
    expect(migration5).toContain("'confirmed'");
  });
});

describe("migration: conditional payment_status", () => {
  it("uses CASE to set confirmed when proof URL is present", () => {
    expect(migrationConditionalStatus).toContain(
      "CASE WHEN _payment_proof_url IS NOT NULL AND _payment_proof_url != '' THEN 'confirmed' ELSE 'pending' END",
    );
  });

  it("sets payment_uploaded_at only when proof URL is provided", () => {
    expect(migrationConditionalStatus).toContain(
      "CASE WHEN _payment_proof_url IS NOT NULL AND _payment_proof_url != '' THEN now() ELSE NULL END",
    );
  });

  it("replaces create_pentecoste_registration with SECURITY DEFINER", () => {
    expect(migrationConditionalStatus).toContain(
      "CREATE OR REPLACE FUNCTION public.create_pentecoste_registration(",
    );
    expect(migrationConditionalStatus).toContain("SECURITY DEFINER");
    expect(migrationConditionalStatus).toContain("SET search_path = public");
  });

  it("keeps duplicate detection via unique_violation", () => {
    expect(migrationConditionalStatus).toContain("DUPLICATE_REGISTRATION");
  });

  it("keeps all validation rules intact", () => {
    expect(migrationConditionalStatus).toContain("READING_CONFIRMATION_REQUIRED");
    expect(migrationConditionalStatus).toContain("INVALID_AGE");
    expect(migrationConditionalStatus).toContain("INVALID_UNDERAGE_DATA");
    expect(migrationConditionalStatus).toContain("INVALID_ARRIVAL_CONFIGURATION");
    expect(migrationConditionalStatus).toContain("INVALID_FILE_TYPE");
    expect(migrationConditionalStatus).toContain("FILE_TOO_LARGE");
  });
});

describe("storage bucket: pentecoste-payment-proofs", () => {
  it("creates a private storage bucket", () => {
    expect(migration3).toContain(
      "VALUES ('pentecoste-payment-proofs', 'pentecoste-payment-proofs', false)",
    );
    expect(migration3).toContain("ON CONFLICT (id) DO NOTHING");
  });

  it("allows anon to upload", () => {
    expect(migration3).toContain(
      "CREATE POLICY \"Anyone can upload to pentecoste-payment-proofs\"",
    );
    expect(migration3).toContain("FOR INSERT");
    expect(migration3).toContain("TO anon, authenticated");
    expect(migration3).toContain("bucket_id = 'pentecoste-payment-proofs'");
  });

  it("allows admins full management", () => {
    expect(migration3).toContain(
      "CREATE POLICY \"Admins can manage pentecoste-payment-proofs\"",
    );
    expect(migration3).toContain("FOR ALL");
    expect(migration3).toContain("public.has_role(auth.uid(), 'admin')");
  });

  it("does NOT have a public SELECT policy", () => {
    expect(migration3).not.toContain("FOR SELECT");
  });
});

describe("trigger function access revocation", () => {
  it("revokes all direct access to the normalization trigger function", () => {
    expect(migration4).toContain(
      "REVOKE ALL ON FUNCTION public.normalize_pentecoste_registration() FROM PUBLIC",
    );
    expect(migration4).toContain(
      "REVOKE ALL ON FUNCTION public.normalize_pentecoste_registration() FROM anon",
    );
    expect(migration4).toContain(
      "REVOKE ALL ON FUNCTION public.normalize_pentecoste_registration() FROM authenticated",
    );
  });
});
