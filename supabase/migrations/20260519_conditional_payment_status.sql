-- Conditional payment_status: confirmed (with proof) or pending (without proof)
-- Run in Supabase SQL Editor

CREATE OR REPLACE FUNCTION public.create_pentecoste_registration(
  _read_descriptions_confirmation boolean,
  _fullname text,
  _whatsapp_number text,
  _date_of_birth date,
  _instagram_user text DEFAULT NULL,
  _contact_person_charge text DEFAULT NULL,
  _confirm_authorization_underage boolean DEFAULT NULL,
  _parish_church text DEFAULT NULL,
  _participate_moviment text DEFAULT NULL,
  _participate_romanos_event text DEFAULT NULL,
  _bring_share jsonb DEFAULT NULL,
  _bring_share_other text DEFAULT NULL,
  _workshop_group text DEFAULT NULL,
  _arrival_time boolean DEFAULT false,
  _arrival_time_restriction text DEFAULT NULL,
  _expectations_pentecoste text DEFAULT NULL,
  _payment_method text DEFAULT 'pix',
  _payment_proof_url text DEFAULT NULL,
  _payment_proof_filename text DEFAULT NULL,
  _payment_proof_size bigint DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_id uuid;
  _age integer;
  _fn text;
  _wn text;
BEGIN
  IF _read_descriptions_confirmation IS NOT TRUE THEN
    RETURN jsonb_build_object('success', false, 'error', 'READING_CONFIRMATION_REQUIRED');
  END IF;

  IF _fullname IS NULL OR btrim(_fullname) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_DATA', 'detail', 'Nome completo e obrigatorio');
  END IF;

  IF _whatsapp_number IS NULL OR btrim(_whatsapp_number) = '' THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_DATA', 'detail', 'WhatsApp e obrigatorio');
  END IF;

  IF _date_of_birth IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_DATA', 'detail', 'Data de nascimento e obrigatoria');
  END IF;

  _age := EXTRACT(YEAR FROM AGE(_date_of_birth::date));

  IF _age < 14 THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_AGE');
  END IF;

  IF _age < 18 THEN
    IF _contact_person_charge IS NULL OR btrim(_contact_person_charge) = '' THEN
      RETURN jsonb_build_object('success', false, 'error', 'INVALID_UNDERAGE_DATA');
    END IF;
    IF _confirm_authorization_underage IS NOT TRUE THEN
      RETURN jsonb_build_object('success', false, 'error', 'INVALID_UNDERAGE_DATA');
    END IF;
  END IF;

  IF _arrival_time = true AND _arrival_time_restriction IS NOT NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_ARRIVAL_CONFIGURATION');
  END IF;

  IF _arrival_time = false AND (_arrival_time_restriction IS NULL OR btrim(_arrival_time_restriction) = '') THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_ARRIVAL_CONFIGURATION');
  END IF;

  IF _payment_proof_filename IS NOT NULL AND _payment_proof_filename != '' THEN
    IF NOT (_payment_proof_filename ~* '\.(png|jpe?g|pdf)$') THEN
      RETURN jsonb_build_object('success', false, 'error', 'INVALID_FILE_TYPE');
    END IF;
  END IF;

  IF _payment_proof_size IS NOT NULL AND _payment_proof_size > 5242880 THEN
    RETURN jsonb_build_object('success', false, 'error', 'FILE_TOO_LARGE');
  END IF;

  _fn := LOWER(btrim(_fullname));
  _wn := REGEXP_REPLACE(_whatsapp_number, '[^0-9]', '', 'g');

  INSERT INTO public.pentecoste_registrations (
    read_descriptions_confirmation, fullname, fullname_normalized,
    instagram_user, whatsapp_number, whatsapp_number_normalized,
    date_of_birth, contact_person_charge, confirm_authorization_underage,
    parish_church, participate_moviment, participate_romanos_event,
    bring_share, bring_share_other, workshop_group,
    arrival_time, arrival_time_restriction, expectations_pentecoste,
    payment_method, payment_proof_url, payment_proof_filename,
    payment_proof_size, payment_uploaded_at, payment_status
  ) VALUES (
    _read_descriptions_confirmation, btrim(_fullname), _fn,
    _instagram_user, btrim(_whatsapp_number), _wn,
    _date_of_birth, _contact_person_charge, _confirm_authorization_underage,
    _parish_church, _participate_moviment, _participate_romanos_event,
    COALESCE(_bring_share, '[]'::jsonb), _bring_share_other, _workshop_group,
    _arrival_time, _arrival_time_restriction, _expectations_pentecoste,
    COALESCE(_payment_method, 'pix'), _payment_proof_url, _payment_proof_filename,
    _payment_proof_size,
    CASE WHEN _payment_proof_url IS NOT NULL AND _payment_proof_url != '' THEN now() ELSE NULL END,
    CASE WHEN _payment_proof_url IS NOT NULL AND _payment_proof_url != '' THEN 'confirmed' ELSE 'pending' END
  ) RETURNING id INTO _new_id;

  RETURN jsonb_build_object('success', true, 'id', _new_id);

EXCEPTION
  WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'DUPLICATE_REGISTRATION');
  WHEN others THEN
    RETURN jsonb_build_object('success', false, 'error', 'INTERNAL_ERROR', 'detail', SQLERRM);
END;
$$;
