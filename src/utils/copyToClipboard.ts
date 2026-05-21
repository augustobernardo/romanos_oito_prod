export const fallbackCopy = (text: string): boolean => {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0.01";
  textarea.style.pointerEvents = "none";
  textarea.readOnly = true;
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  if (!text) {
    console.warn("[copyToClipboard] text is empty — clipboard copy aborted.");
    return false;
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.warn("[copyToClipboard] Clipboard API failed, falling back:", err);
      return fallbackCopy(text);
    }
  }

  return fallbackCopy(text);
};
