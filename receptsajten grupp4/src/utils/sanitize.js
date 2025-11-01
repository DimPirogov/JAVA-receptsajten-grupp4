import DOMpurify from "dompurify";

export function sanitizeText(input, max = 1000) {
    if (input == null) return "";
    const cleaned = DOMpurify.sanitize(String(input), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    })
        .replace(/\s+/g, " ")
        .trim();
    return cleaned.slice(0, max);   
}

export function sanitizeUrlPart(input, max=200){
    return encodeURIComponent(sanitizeText(input,max));
}