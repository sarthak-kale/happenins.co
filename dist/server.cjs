var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all2) => {
  for (var name in all2)
    __defProp(target, name, { get: all2[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server/config/features.ts
function parseBool(raw) {
  if (raw === void 0 || raw.trim() === "") return void 0;
  const v = raw.trim().toLowerCase();
  if (TRUE.includes(v)) return true;
  if (FALSE.includes(v)) return false;
  return "invalid";
}
function currentEnvName() {
  const v = (process.env.NODE_ENV || "development").toLowerCase();
  return v === "production" || v === "test" ? v : "development";
}
function configured(key, envName) {
  const def = defOf(key);
  const names = [`FEATURE_${key}`, ...def.legacyEnv ? [def.legacyEnv] : []];
  for (const name of names) {
    const parsed = parseBool(process.env[name]);
    if (parsed === "invalid") throw new Error(`Invalid value for ${name}: use true or false.`);
    if (parsed !== void 0) return parsed;
  }
  return def.defaults[envName];
}
function resolveFeatures(envName = currentEnvName()) {
  const cfg = {};
  for (const k of FEATURE_KEYS) cfg[k] = configured(k, envName);
  const effective = {};
  for (const k of FEATURE_KEYS) {
    const needs = defOf(k).requires ?? [];
    effective[k] = cfg[k] && needs.every((r) => cfg[r]);
  }
  return effective;
}
function getFeatures() {
  return cache ??= resolveFeatures();
}
function isFeatureEnabled(key) {
  return getFeatures()[key];
}
function getPublicFeatures() {
  const features = getFeatures();
  const out = {};
  for (const k of FEATURE_KEYS) if (defOf(k).public) out[k] = features[k];
  return out;
}
function validateFeatureFlags(envName = currentEnvName()) {
  const errors = [];
  const warnings = [];
  let features = null;
  try {
    features = resolveFeatures(envName);
  } catch (err) {
    errors.push(err.message);
  }
  if (features && envName === "production") {
    for (const k of FEATURE_KEYS) {
      if (defOf(k).productionLocked && features[k]) errors.push(`FEATURE_${k} cannot be enabled in production.`);
    }
    if (!features.EMAIL_VERIFICATION_REQUIRED) {
      warnings.push("FEATURE_EMAIL_VERIFICATION_REQUIRED is off in production: anyone can create accounts for addresses they do not own.");
    }
    if (!features.PASSWORD_LOGIN && !features.GOOGLE_LOGIN && !features.OTP_LOGIN) {
      errors.push("All sign-in methods are disabled (PASSWORD_LOGIN, OTP_LOGIN, GOOGLE_LOGIN): nobody could log in.");
    }
  }
  return { errors, warnings };
}
var all, devOnly, FEATURE_DEFINITIONS, FEATURE_KEYS, TRUE, FALSE, defOf, cache;
var init_features = __esm({
  "src/server/config/features.ts"() {
    all = (v) => ({ development: v, test: v, production: v });
    devOnly = { development: true, test: true, production: false };
    FEATURE_DEFINITIONS = {
      // Accounts & sign-in
      SELF_REGISTRATION: { description: "Anyone can create an account with email + password", defaults: all(true), public: true },
      EMAIL_VERIFICATION_REQUIRED: { description: "New accounts must enter an emailed code before they exist; unverified legacy accounts cannot log in", defaults: all(true), public: true },
      PASSWORD_LOGIN: { description: "Email + password sign-in", defaults: all(true), public: true },
      OTP_LOGIN: { description: "Sign in with an emailed/SMS one-time code", defaults: all(true), public: true },
      GOOGLE_LOGIN: { description: "Continue with Google", defaults: all(true), public: true },
      PASSWORD_RESET: { description: "Forgot / reset password", defaults: all(true), public: true },
      ORGANIZER_ONBOARDING: { description: "Users can apply to become organizers", defaults: all(true), public: true },
      ACCOUNT_DELETION: { description: "Users can delete (anonymise) their own account", defaults: all(true), public: true },
      // Tickets & money
      PAYMENTS: { description: "Paid tickets through Razorpay (test keys outside production)", defaults: devOnly, public: true, legacyEnv: "PAYMENTS_ENABLED" },
      SPLIT_BOOKING: { description: "Split a booking's cost between friends (needs PAYMENTS)", defaults: all(true), requires: ["PAYMENTS"], public: true },
      WALLET: { description: "Wallet credit and refunds to wallet", defaults: all(true), public: true },
      PROMO_CODES: { description: "Promo codes on bookings and organizer promo management", defaults: all(true), public: true },
      TICKET_TRANSFERS: { description: "Transfer tickets to another person", defaults: all(true), public: true },
      SEATING_PLANS: { description: "Events with a seat map", defaults: all(true), public: true },
      INSTITUTION_ACCESS: { description: "Institute-gated events and college-email verification", defaults: all(true), public: true },
      WAITING_ROOM: { description: "Virtual waiting room for high-demand events", defaults: all(true), public: true },
      // Event day
      STAFF_SCANNERS: { description: "Gate staff PIN scanners", defaults: all(true), public: true },
      EVENT_EXPORT: { description: "Organizer CSV roster export", defaults: all(true), public: true },
      REVIEWS: { description: "Attendee reviews on events", defaults: all(true), public: true },
      WHATSAPP_DELIVERY: { description: "WhatsApp ticket confirmation (simulated until a provider is wired up)", defaults: devOnly, public: true },
      // Developer tooling
      DEV_EMAIL_INBOX: { description: "/api/emails: in-memory inbox and test-mail sender", defaults: devOnly, public: false, productionLocked: true }
    };
    FEATURE_KEYS = Object.keys(FEATURE_DEFINITIONS);
    TRUE = ["true", "1", "on", "yes"];
    FALSE = ["false", "0", "off", "no"];
    defOf = (k) => FEATURE_DEFINITIONS[k];
    cache = null;
  }
});

// src/server/config/env.ts
function validateEnv() {
  const nodeEnv = (process.env.NODE_ENV || "development").toLowerCase();
  const isProduction = nodeEnv === "production";
  const flagCheck = validateFeatureFlags(nodeEnv === "production" || nodeEnv === "test" ? nodeEnv : "development");
  if (flagCheck.errors.length) {
    throw new Error(`Feature flag configuration error: ${flagCheck.errors.join(" ")}`);
  }
  const rawJwt = process.env.JWT_SECRET?.trim();
  const rawQr = process.env.QR_HMAC_SECRET?.trim();
  const isWeakSecret = (v) => knownPlaceholderSecrets.includes(v.toLowerCase()) || v.toLowerCase().startsWith("development_only");
  if (isProduction) {
    for (const [name, val] of [["JWT_SECRET", rawJwt], ["QR_HMAC_SECRET", rawQr]]) {
      if (val && isWeakSecret(val)) {
        throw new Error(`Production configuration error: ${name} cannot use an insecure placeholder value.`);
      }
      if (val && val.length < 32) {
        throw new Error(`Production configuration error: ${name} must be at least 32 characters for cryptographic security.`);
      }
    }
    if (!rawJwt) {
      throw new Error("Production configuration error: JWT_SECRET is required but not configured.");
    }
    if (knownPlaceholderSecrets.includes(rawJwt.toLowerCase())) {
      throw new Error("Production configuration error: JWT_SECRET cannot use an insecure placeholder value.");
    }
    if (rawJwt.length < 16) {
      throw new Error("Production configuration error: JWT_SECRET must be at least 16 characters for cryptographic security.");
    }
    if (!rawQr) {
      throw new Error("Production configuration error: QR_HMAC_SECRET is required but not configured.");
    }
    if (knownPlaceholderSecrets.includes(rawQr.toLowerCase())) {
      throw new Error("Production configuration error: QR_HMAC_SECRET cannot use an insecure placeholder value.");
    }
    if (rawQr.length < 16) {
      throw new Error("Production configuration error: QR_HMAC_SECRET must be at least 16 characters for cryptographic security.");
    }
    const redisExplicitlyDisabled = process.env.REDIS_ENABLED === "false" || process.env.REDIS_ENABLED === "0";
    const redisOn = (process.env.REDIS_ENABLED === "true" || process.env.REDIS_ENABLED === "1") && !redisExplicitlyDisabled;
    if (redisOn && !process.env.REDIS_URL) {
      throw new Error("Production configuration error: REDIS_URL is required when REDIS_ENABLED=true.");
    }
    const paymentsOn = resolveFeatures("production").PAYMENTS;
    if (!paymentsOn && (process.env.RAZORPAY_KEY_ID || "").startsWith("rzp_live_")) {
      throw new Error("Production configuration error: a live Razorpay key is configured while PAYMENTS_ENABLED is not true.");
    }
    if (paymentsOn) {
      const whs = process.env.RAZORPAY_WEBHOOK_SECRET || "";
      if (!whs || whs.includes("placeholder")) {
        throw new Error("Production configuration error: PAYMENTS_ENABLED requires a real RAZORPAY_WEBHOOK_SECRET.");
      }
    }
    const appUrl = process.env.APP_URL || "";
    if (!appUrl.startsWith("https://")) {
      throw new Error("Production configuration error: APP_URL must be an https:// URL (used for CORS/CSRF origin checks).");
    }
  }
  let effectiveJwt = rawJwt;
  if (!effectiveJwt || effectiveJwt.length < 16 || knownPlaceholderSecrets.includes(effectiveJwt.toLowerCase())) {
    effectiveJwt = RUNTIME_GENERATED_JWT_SECRET;
  }
  let effectiveQr = rawQr;
  if (!effectiveQr || effectiveQr.length < 16 || knownPlaceholderSecrets.includes(effectiveQr.toLowerCase())) {
    effectiveQr = RUNTIME_GENERATED_QR_SECRET;
  }
  let effectiveDbUrl = process.env.DATABASE_URL?.trim() || "postgresql://postgres:postgres@localhost:5432/happenins_db";
  if (!effectiveDbUrl.startsWith("postgresql://") && !effectiveDbUrl.startsWith("postgres://")) {
    effectiveDbUrl = "postgresql://postgres:postgres@localhost:5432/happenins_db";
  }
  const envToParse = {
    ...process.env,
    PORT: Number(process.env.PORT) || 3e3,
    DATABASE_URL: effectiveDbUrl,
    JWT_SECRET: effectiveJwt,
    QR_HMAC_SECRET: effectiveQr,
    SMTP_PASS: process.env.SMTP_PASS || process.env.SMTP_SECRET
  };
  const parsed = envSchema.safeParse(envToParse);
  if (!parsed.success) {
    console.error("CRITICAL ENVIRONMENT VALIDATION ERROR: Configuration does not satisfy schema requirements.");
    throw new Error("Invalid or missing environment variables. Server startup aborted.");
  }
  return parsed.data;
}
function getEnv() {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
var import_zod, import_crypto, RUNTIME_GENERATED_JWT_SECRET, RUNTIME_GENERATED_QR_SECRET, knownPlaceholderSecrets, envSchema, cachedEnv;
var init_env = __esm({
  "src/server/config/env.ts"() {
    init_features();
    import_zod = require("zod");
    import_crypto = __toESM(require("crypto"), 1);
    RUNTIME_GENERATED_JWT_SECRET = import_crypto.default.randomBytes(32).toString("hex");
    RUNTIME_GENERATED_QR_SECRET = import_crypto.default.randomBytes(32).toString("hex");
    knownPlaceholderSecrets = [
      "fallback_default_jwt_secret_6eey6",
      "fallback_default_qr_hmac_secret_6eey6",
      "supersecret_session_token_key_here",
      "supersecret_qr_signature_key_here",
      "default_jwt_secret_change_in_production",
      "change_me",
      "12345678",
      "development_only_jwt_secret_do_not_use_in_production_6eey6",
      "development_only_qr_hmac_secret_do_not_use_in_production_6eey6"
    ];
    envSchema = import_zod.z.object({
      NODE_ENV: import_zod.z.enum(["development", "test", "production"]).default("development"),
      PORT: import_zod.z.coerce.number().default(3e3),
      PROCESS_TYPE: import_zod.z.enum(["api", "worker", "combined"]).default("combined"),
      DATABASE_URL: import_zod.z.string().min(1, "DATABASE_URL is required"),
      APP_URL: import_zod.z.string().default("http://localhost:3000"),
      JWT_SECRET: import_zod.z.string().min(1, "JWT_SECRET is required"),
      QR_HMAC_SECRET: import_zod.z.string().min(1, "QR_HMAC_SECRET is required"),
      // Paid tickets / Razorpay flows. Defaults to enabled outside production (test mode), disabled in production.
      PAYMENTS_ENABLED: import_zod.z.string().optional().transform((val) => val === void 0 ? void 0 : val === "true" || val === "1"),
      RAZORPAY_KEY_ID: import_zod.z.string().optional(),
      RAZORPAY_KEY_SECRET: import_zod.z.string().optional(),
      RAZORPAY_WEBHOOK_SECRET: import_zod.z.string().optional(),
      GOOGLE_CLIENT_ID: import_zod.z.string().optional(),
      GOOGLE_CLIENT_SECRET: import_zod.z.string().optional(),
      SMTP_HOST: import_zod.z.string().optional(),
      SMTP_PORT: import_zod.z.coerce.number().optional(),
      SMTP_USER: import_zod.z.string().optional(),
      SMTP_PASS: import_zod.z.string().optional(),
      SMTP_FROM: import_zod.z.string().optional(),
      REDIS_URL: import_zod.z.string().optional(),
      REDIS_ENABLED: import_zod.z.string().optional().transform((val) => val === "true" || val === "1"),
      REDIS_CONNECT_TIMEOUT_MS: import_zod.z.coerce.number().default(1e4),
      REDIS_MAX_RETRIES: import_zod.z.coerce.number().default(5),
      // Database Connection Pooling & Timeouts
      DB_CONNECTION_LIMIT: import_zod.z.coerce.number().default(10),
      DB_POOL_TIMEOUT_SECONDS: import_zod.z.coerce.number().default(10),
      // HTTP Server Timeouts (GCP Cloud Run optimized)
      SERVER_KEEP_ALIVE_TIMEOUT_MS: import_zod.z.coerce.number().default(61e3),
      SERVER_HEADERS_TIMEOUT_MS: import_zod.z.coerce.number().default(65e3),
      SERVER_REQUEST_TIMEOUT_MS: import_zod.z.coerce.number().default(3e4),
      BODY_LIMIT: import_zod.z.string().default("1mb")
    });
    cachedEnv = null;
  }
});

// src/server/utils/context.ts
function runWithContext(context, fn) {
  return asyncLocalStorage.run(context, fn);
}
function getContext() {
  return asyncLocalStorage.getStore();
}
function updateContext(updates) {
  const store = asyncLocalStorage.getStore();
  if (store) {
    Object.assign(store, updates);
  }
}
var import_async_hooks, asyncLocalStorage;
var init_context = __esm({
  "src/server/utils/context.ts"() {
    import_async_hooks = require("async_hooks");
    asyncLocalStorage = new import_async_hooks.AsyncLocalStorage();
  }
});

// src/server/utils/logger.ts
function sanitizeString(text) {
  if (!text || typeof text !== "string") return text;
  return text.replace(/((?:postgres(?:ql)?|redis|mongodb(?:\+srv)?):\/\/[^:\s]+:)([^@\s]+)(@)/gi, "$1[REDACTED]$3").replace(/(Bearer\s+)[A-Za-z0-9._~+/-]+=*/gi, "$1[REDACTED]").replace(/((?:password|pass|smtp_pass|secret)\s*[:=]\s*["']?)([^"',\s]+)(["']?)/gi, "$1[REDACTED]$3");
}
function sanitize(obj, seen = /* @__PURE__ */ new WeakSet()) {
  if (typeof obj === "string") return sanitizeString(obj);
  if (!obj || typeof obj !== "object") return obj;
  if (seen.has(obj)) return "[CIRCULAR]";
  seen.add(obj);
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitize(item, seen));
  }
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => lowerKey.includes(pattern));
    if (isSensitive) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null) {
      sanitized[key] = sanitize(value, seen);
    } else if (typeof value === "string") {
      sanitized[key] = sanitizeString(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
function mapSeverity(level) {
  switch (level) {
    case "DEBUG":
      return "DEBUG";
    case "INFO":
      return "INFO";
    case "WARN":
      return "WARNING";
    case "ERROR":
      return "ERROR";
    default:
      return "DEFAULT";
  }
}
function formatLog(level, message, context) {
  const isProd = process.env.NODE_ENV === "production";
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const currentContext = getContext();
  const mergedContext = {
    service: process.env.SERVICE_NAME || "happenins-api",
    processType: process.env.PROCESS_TYPE || "combined",
    environment: process.env.NODE_ENV || "development",
    requestId: currentContext?.requestId,
    traceId: currentContext?.traceId,
    spanId: currentContext?.spanId,
    userId: currentContext?.userId,
    path: currentContext?.path,
    method: currentContext?.method,
    ...context || {}
  };
  const cleanCtx = sanitize(mergedContext);
  const cleanMessage = sanitizeString(message);
  if (isProd) {
    const gcpTrace = GCP_PROJECT_ID && cleanCtx.traceId ? `projects/${GCP_PROJECT_ID}/traces/${cleanCtx.traceId}` : cleanCtx.traceId;
    const payload = {
      severity: mapSeverity(level),
      timestamp,
      message: cleanMessage,
      serviceContext: {
        service: cleanCtx.service,
        version: process.env.K_REVISION || "1.0.0"
      },
      ...cleanCtx
    };
    if (gcpTrace) {
      payload["logging.googleapis.com/trace"] = gcpTrace;
    }
    if (cleanCtx.spanId) {
      payload["logging.googleapis.com/spanId"] = cleanCtx.spanId;
    }
    return JSON.stringify(payload);
  } else {
    const ctxEntries = Object.entries(cleanCtx).filter(
      ([k]) => !["service", "environment", "processType"].includes(k)
    );
    const ctxString = ctxEntries.length > 0 ? ` ${JSON.stringify(Object.fromEntries(ctxEntries))}` : "";
    return `[${level}] [${timestamp}] ${cleanMessage}${ctxString}`;
  }
}
var SENSITIVE_KEY_PATTERNS, GCP_PROJECT_ID, StructuredLogger, logger;
var init_logger = __esm({
  "src/server/utils/logger.ts"() {
    init_context();
    SENSITIVE_KEY_PATTERNS = [
      "password",
      "passwordhash",
      "token",
      "refreshtoken",
      "jwt",
      "secret",
      "razorpaysignature",
      "razorpaykeysecret",
      "razorpaywebhooksecret",
      "authorization",
      "cookie",
      "set-cookie",
      "qrhash",
      "qrtoken",
      "signature",
      "codeverifier",
      "codechallenge",
      "card",
      "cvv",
      "cvc",
      "smtp_pass",
      "smtppass",
      "apppassword",
      "pass",
      "bankaccountnumber",
      "taxid",
      "privatekey",
      "private_key",
      "accesstoken",
      "id_token",
      "pin",
      "apikey",
      "api_key",
      "credential",
      "secret_key",
      "session_id"
    ];
    GCP_PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCP_PROJECT;
    StructuredLogger = class _StructuredLogger {
      constructor(baseContext = {}) {
        this.baseContext = baseContext;
      }
      child(childContext) {
        return new _StructuredLogger({ ...this.baseContext, ...childContext });
      }
      debug(message, context) {
        if (process.env.LOG_LEVEL === "debug" || process.env.NODE_ENV !== "production") {
          console.debug(formatLog("DEBUG", message, { ...this.baseContext, ...context }));
        }
      }
      info(message, context) {
        console.log(formatLog("INFO", message, { ...this.baseContext, ...context }));
      }
      warn(message, context) {
        console.warn(formatLog("WARN", message, { ...this.baseContext, ...context }));
      }
      error(message, context) {
        console.error(formatLog("ERROR", message, { ...this.baseContext, ...context }));
      }
      http(message, context) {
        console.log(formatLog("INFO", message, { ...this.baseContext, ...context }));
      }
      audit(message, context) {
        console.log(formatLog("INFO", message, { ...this.baseContext, audit: true, ...context }));
      }
    };
    logger = new StructuredLogger();
  }
});

// src/server/config/redis.ts
function normalizeRedisUrl(rawUrl) {
  if (!rawUrl) return "";
  let str = rawUrl.trim();
  if (str.startsWith('"') && str.endsWith('"') || str.startsWith("'") && str.endsWith("'")) {
    str = str.slice(1, -1).trim();
  }
  const hasTlsFlag = str.includes("--tls") || str.includes("-tls");
  const uMatch = str.match(/-u\s+([^\s]+)/);
  if (uMatch) {
    str = uMatch[1].trim();
  } else if (str.startsWith("redis-cli")) {
    const parts = str.split(/\s+/);
    const urlPart = parts.find((p) => p.startsWith("redis://") || p.startsWith("rediss://"));
    if (urlPart) {
      str = urlPart;
    }
  }
  if (!str.startsWith("redis://") && !str.startsWith("rediss://") && str.length > 0) {
    if (hasTlsFlag || str.includes("upstash.io")) {
      str = `rediss://${str}`;
    } else {
      str = `redis://${str}`;
    }
  }
  if ((hasTlsFlag || str.includes("upstash.io")) && str.startsWith("redis://")) {
    str = `rediss://${str.slice("redis://".length)}`;
  }
  return str;
}
function getRedisConfig() {
  const env = getEnv();
  const rawUrl = (process.env.REDIS_URL || env.REDIS_URL || "").trim();
  const normalizedUrl = normalizeRedisUrl(rawUrl);
  const isExplicitlyDisabled = env.REDIS_ENABLED === false || process.env.REDIS_ENABLED === "false" || process.env.REDIS_ENABLED === "0";
  const isTest = process.env.NODE_ENV === "test" || env.NODE_ENV === "test" || typeof process.env.VITEST !== "undefined" || typeof globalThis.__vitest_environment__ !== "undefined";
  const isRemoteUrl = normalizedUrl.length > 0 && !normalizedUrl.includes("localhost") && !normalizedUrl.includes("127.0.0.1");
  const isEnabled = !isExplicitlyDisabled && !isTest && (isRemoteUrl || normalizedUrl.length > 0 && (env.REDIS_ENABLED === true || process.env.REDIS_ENABLED === "true"));
  return {
    url: normalizedUrl || "redis://localhost:6379",
    enabled: isEnabled,
    connectTimeoutMs: env.REDIS_CONNECT_TIMEOUT_MS || 1e4,
    maxRetries: env.REDIS_MAX_RETRIES || 5,
    keyPrefix: "happenins:"
  };
}
var init_redis = __esm({
  "src/server/config/redis.ts"() {
    init_env();
  }
});

// src/server/utils/metrics.ts
function normalizeRoute(path2) {
  if (!path2 || path2 === "/") return "/";
  const cleanPath = path2.split("?")[0];
  return cleanPath.replace(/\/api(?:\/v1)?\/admin\/dead-letter-jobs\/([^/]+)\/([^/]+)\/retry/, "/api/admin/dead-letter-jobs/:queue/:id/retry").replace(/\/api(?:\/v1)?\/admin\/organizers\/([^/]+)\/verify/, "/api/admin/organizers/:id/verify").replace(/\/api(?:\/v1)?\/admin\/events\/([^/]+)\/status/, "/api/admin/events/:id/status").replace(/\/api(?:\/v1)?\/events\/([^/]+)\/promo-codes/, "/api/events/:eventId/promo-codes").replace(/\/api(?:\/v1)?\/promo-codes\/([^/]+)/, "/api/promo-codes/:id").replace(/\/api(?:\/v1)?\/bookings\/([^/]+)\/split-shares\/([^/]+)\/pay/, "/api/bookings/:bookingId/split-shares/:shareId/pay").replace(/\/api(?:\/v1)?\/bookings\/([^/]+)\/promo\/validate/, "/api/bookings/:bookingId/promo/validate").replace(/\/api(?:\/v1)?\/bookings\/([^/]+)\/promo\/apply/, "/api/bookings/:bookingId/promo/apply").replace(/\/api(?:\/v1)?\/bookings\/([^/]+)\/qr-token/, "/api/bookings/:id/qr-token").replace(/\/api(?:\/v1)?\/bookings\/([^/]+)\/transfer/, "/api/bookings/:id/transfer").replace(/\/api(?:\/v1)?\/bookings\/(?!reserve\b|my-bookings\b|active-tests\b)([^/]+)$/, "/api/bookings/:id").replace(/\/api(?:\/v1)?\/transfers\/([^/]+)\/claim/, "/api/transfers/:code/claim").replace(/\/api(?:\/v1)?\/transfers\/([^/]+)\/cancel/, "/api/transfers/:id/cancel").replace(/\/api(?:\/v1)?\/transfers\/([^/]+)$/, "/api/transfers/:code").replace(/\/api(?:\/v1)?\/tickets\/([^/]+)\/qr/, "/api/tickets/:id/qr").replace(/\/api(?:\/v1)?\/tickets\/([^/]+)\/transfer/, "/api/tickets/:id/transfer").replace(/\/api(?:\/v1)?\/tickets\/([^/]+)$/, "/api/tickets/:id").replace(/\/api(?:\/v1)?\/events\/slug\/([^/]+)/, "/api/events/slug/:slug").replace(/\/api(?:\/v1)?\/events\/([^/]+)\/eligibility/, "/api/events/:eventId/eligibility").replace(/\/api(?:\/v1)?\/events\/([^/]+)\/occupied-seats/, "/api/events/:eventId/occupied-seats").replace(/\/api(?:\/v1)?\/events\/([^/]+)\/reviews/, "/api/events/:eventId/reviews").replace(/\/api(?:\/v1)?\/events\/([^/]+)\/lifecycle/, "/api/events/:id/lifecycle").replace(/\/api(?:\/v1)?\/organizer\/events\/([^/]+)\/export/, "/api/organizer/events/:eventId/export").replace(/\/api(?:\/v1)?\/events\/(?!slug\b|categories\b|search\b|featured\b)([^/]+)$/, "/api/events/:id").replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi, ":id").replace(/\b(c[a-z0-9]{24}|cm[a-z0-9]{23})\b/gi, ":id").replace(/\/\d+\b/g, "/:id");
}
var DEFAULT_HISTOGRAM_BUCKETS, MAX_CARDINALITY_PER_METRIC, CIRCULAR_BUFFER_SIZE, MetricsRegistry, metrics;
var init_metrics = __esm({
  "src/server/utils/metrics.ts"() {
    DEFAULT_HISTOGRAM_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1e3, 2500, 5e3, 1e4];
    MAX_CARDINALITY_PER_METRIC = 500;
    CIRCULAR_BUFFER_SIZE = 500;
    MetricsRegistry = class {
      constructor() {
        this.counters = /* @__PURE__ */ new Map();
        this.gauges = /* @__PURE__ */ new Map();
        this.histograms = /* @__PURE__ */ new Map();
        this.metricMetadata = /* @__PURE__ */ new Map();
        this.startTime = Date.now();
        this.activeRequestsCount = 0;
        this.registerDefaults();
      }
      registerDefaults() {
        this.registerMetric("http_requests_total", "Total count of HTTP requests processed", "counter");
        this.registerMetric("http_request_duration_ms", "HTTP request latency in milliseconds", "histogram");
        this.registerMetric("http_active_requests", "Current number of in-flight HTTP requests", "gauge");
        this.registerMetric("db_query_duration_ms", "Database query execution duration in milliseconds", "histogram");
        this.registerMetric("cache_operations_total", "Total cache lookups by operation and hit/miss result", "counter");
        this.registerMetric("jobs_enqueued_total", "Total background jobs enqueued by queue name", "counter");
        this.registerMetric("jobs_processed_total", "Total background jobs processed by queue and status", "counter");
        this.registerMetric("jobs_duration_ms", "Background job execution latency in milliseconds", "histogram");
        this.registerMetric("bookings_total", "Total booking state transitions (reserved, confirmed, expired)", "counter");
        this.registerMetric("payments_total", "Total payments processed by status", "counter");
        this.registerMetric("qr_scans_total", "Total ticket QR check-in scans by result", "counter");
        this.registerMetric("rate_limit_hits_total", "Total requests rejected due to rate limiting", "counter");
        this.registerMetric("audit_logs_total", "Total audit events recorded by action", "counter");
        this.registerMetric("process_uptime_seconds", "Process uptime in seconds", "gauge");
        this.registerMetric("node_memory_heap_used_bytes", "Process heap memory used in bytes", "gauge");
        this.registerMetric("node_memory_rss_bytes", "Process RSS memory in bytes", "gauge");
      }
      registerMetric(name, help, type) {
        this.metricMetadata.set(name, { name, help, type });
      }
      formatLabelString(labels) {
        const entries = Object.entries(labels).filter(([_, v]) => v !== void 0 && v !== null);
        if (entries.length === 0) return "";
        return entries.map(([k, v]) => `${k}="${String(v).replace(/"/g, '\\"')}"`).sort().join(",");
      }
      // --- Counters ---
      incrementCounter(name, labelsOrDimension = "total", value = 1) {
        const labelKey = typeof labelsOrDimension === "string" ? labelsOrDimension : this.formatLabelString(labelsOrDimension);
        if (!this.counters.has(name)) {
          this.counters.set(name, /* @__PURE__ */ new Map());
        }
        const map = this.counters.get(name);
        if (!map.has(labelKey) && map.size >= MAX_CARDINALITY_PER_METRIC) {
          const overflowKey = 'overflow="true"';
          map.set(overflowKey, (map.get(overflowKey) || 0) + value);
          return;
        }
        const current = map.get(labelKey) || 0;
        map.set(labelKey, current + value);
      }
      // --- Gauges ---
      setGauge(name, value, labelsOrDimension = "total") {
        const labelKey = typeof labelsOrDimension === "string" ? labelsOrDimension : this.formatLabelString(labelsOrDimension);
        if (!this.gauges.has(name)) {
          this.gauges.set(name, /* @__PURE__ */ new Map());
        }
        const map = this.gauges.get(name);
        map.set(labelKey, value);
      }
      // --- Active Requests Tracking ---
      recordRequestStart() {
        this.activeRequestsCount += 1;
        this.setGauge("http_active_requests", this.activeRequestsCount);
      }
      recordRequestEnd() {
        this.activeRequestsCount = Math.max(0, this.activeRequestsCount - 1);
        this.setGauge("http_active_requests", this.activeRequestsCount);
      }
      // --- Histograms ---
      observeHistogram(name, valueMs, labelsOrDimension = "total", customBuckets = DEFAULT_HISTOGRAM_BUCKETS) {
        const labelKey = typeof labelsOrDimension === "string" ? labelsOrDimension : this.formatLabelString(labelsOrDimension);
        if (!this.histograms.has(name)) {
          this.histograms.set(name, /* @__PURE__ */ new Map());
        }
        const map = this.histograms.get(name);
        let hist = map.get(labelKey);
        if (!hist) {
          if (map.size >= MAX_CARDINALITY_PER_METRIC) {
            return;
          }
          const initialBuckets = /* @__PURE__ */ new Map();
          for (const b of customBuckets) {
            initialBuckets.set(b, 0);
          }
          hist = {
            count: 0,
            sum: 0,
            min: Infinity,
            max: -Infinity,
            buckets: initialBuckets,
            values: []
          };
          map.set(labelKey, hist);
        }
        hist.count += 1;
        hist.sum += valueMs;
        hist.min = Math.min(hist.min === Infinity ? valueMs : hist.min, valueMs);
        hist.max = Math.max(hist.max === -Infinity ? valueMs : hist.max, valueMs);
        for (const [le, count] of hist.buckets.entries()) {
          if (valueMs <= le) {
            hist.buckets.set(le, count + 1);
          }
        }
        if (hist.values.length < CIRCULAR_BUFFER_SIZE) {
          hist.values.push(valueMs);
        } else {
          const idx = Math.floor(Math.random() * CIRCULAR_BUFFER_SIZE);
          hist.values[idx] = valueMs;
        }
      }
      calculatePercentile(values, p) {
        if (!values || values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.min(Math.floor(p / 100 * sorted.length), sorted.length - 1);
        return Math.round(sorted[index] * 100) / 100;
      }
      // --- Prometheus Text Format (v0.0.4) Serializer ---
      getPrometheusFormat() {
        const lines = [];
        const mem = process.memoryUsage();
        const uptimeSec = Math.floor((Date.now() - this.startTime) / 1e3);
        this.setGauge("process_uptime_seconds", uptimeSec);
        this.setGauge("node_memory_heap_used_bytes", mem.heapUsed);
        this.setGauge("node_memory_rss_bytes", mem.rss);
        for (const [name, map] of this.counters.entries()) {
          const meta = this.metricMetadata.get(name) || { help: `${name} metric`, type: "counter" };
          lines.push(`# HELP ${name} ${meta.help}`);
          lines.push(`# TYPE ${name} counter`);
          for (const [labels, val] of map.entries()) {
            const labelStr = labels ? `{${labels}}` : "";
            lines.push(`${name}${labelStr} ${val}`);
          }
        }
        for (const [name, map] of this.gauges.entries()) {
          const meta = this.metricMetadata.get(name) || { help: `${name} metric`, type: "gauge" };
          lines.push(`# HELP ${name} ${meta.help}`);
          lines.push(`# TYPE ${name} gauge`);
          for (const [labels, val] of map.entries()) {
            const labelStr = labels ? `{${labels}}` : "";
            lines.push(`${name}${labelStr} ${val}`);
          }
        }
        for (const [name, map] of this.histograms.entries()) {
          const meta = this.metricMetadata.get(name) || { help: `${name} metric`, type: "histogram" };
          lines.push(`# HELP ${name} ${meta.help}`);
          lines.push(`# TYPE ${name} histogram`);
          for (const [labels, data] of map.entries()) {
            const baseLabels = labels ? `${labels},` : "";
            for (const [le, count] of data.buckets.entries()) {
              lines.push(`${name}_bucket{${baseLabels}le="${le}"} ${count}`);
            }
            lines.push(`${name}_bucket{${baseLabels}le="+Inf"} ${data.count}`);
            const labelBlock = labels ? `{${labels}}` : "";
            lines.push(`${name}_sum${labelBlock} ${Math.round(data.sum * 100) / 100}`);
            lines.push(`${name}_count${labelBlock} ${data.count}`);
          }
        }
        return lines.join("\n") + "\n";
      }
      // --- JSON Operational Snapshot ---
      getSnapshot() {
        const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1e3);
        const counterObj = {};
        for (const [name, map] of this.counters.entries()) {
          counterObj[name] = Object.fromEntries(map.entries());
        }
        const gaugeObj = {};
        for (const [name, map] of this.gauges.entries()) {
          gaugeObj[name] = Object.fromEntries(map.entries());
        }
        const histogramObj = {};
        for (const [name, map] of this.histograms.entries()) {
          histogramObj[name] = {};
          for (const [labels, data] of map.entries()) {
            histogramObj[name][labels || "total"] = {
              count: data.count,
              sumMs: Math.round(data.sum),
              avgMs: data.count > 0 ? Math.round(data.sum / data.count) : 0,
              minMs: data.min === Infinity ? 0 : Math.round(data.min),
              maxMs: data.max === -Infinity ? 0 : Math.round(data.max),
              p50Ms: this.calculatePercentile(data.values, 50),
              p90Ms: this.calculatePercentile(data.values, 90),
              p95Ms: this.calculatePercentile(data.values, 95),
              p99Ms: this.calculatePercentile(data.values, 99)
            };
          }
        }
        return {
          service: process.env.SERVICE_NAME || "happenins-api",
          processType: process.env.PROCESS_TYPE || "combined",
          environment: process.env.NODE_ENV || "development",
          uptimeSeconds,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          memoryUsage: process.memoryUsage(),
          activeRequests: this.activeRequestsCount,
          counters: counterObj,
          gauges: gaugeObj,
          histograms: histogramObj
        };
      }
      reset() {
        this.counters.clear();
        this.gauges.clear();
        this.histograms.clear();
        this.activeRequestsCount = 0;
        this.startTime = Date.now();
        this.registerDefaults();
      }
    };
    metrics = new MetricsRegistry();
  }
});

// src/server/utils/error-message.ts
function errorMessage(err) {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && typeof err.message === "string") {
    return err.message;
  }
  return String(err);
}
function errorCode(err) {
  if (typeof err === "object" && err !== null) {
    const code = err.code;
    if (typeof code === "string") return code;
  }
  return void 0;
}
var init_error_message = __esm({
  "src/server/utils/error-message.ts"() {
  }
});

// src/server/utils/redis.ts
function maskRedisUrl(url) {
  if (!url) return "N/A";
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = "******";
    }
    return parsed.toString();
  } catch {
    return url.replace(/:\/\/[^@]+@/, "://***:***@");
  }
}
function initRedis() {
  const config = getRedisConfig();
  if (!config.enabled) {
    logger.info("Redis is disabled via configuration. Operating in process-local / PostgreSQL fallback mode.");
    return null;
  }
  if (redisClient) {
    return redisClient;
  }
  if (isConnecting || connectionFailedPermanently) {
    return redisClient;
  }
  try {
    isConnecting = true;
    const maskedUrl = maskRedisUrl(config.url);
    logger.info(`Initializing Redis connection to ${maskedUrl}...`);
    const redisOptions = {
      connectTimeout: config.connectTimeoutMs,
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        if (times > config.maxRetries) {
          logger.warn(`Redis connection failed after ${times} attempts. Switching to safe fallback mode.`);
          connectionFailedPermanently = true;
          return null;
        }
        const delay = Math.min(times * 500, 3e3);
        logger.warn(`Redis connection retry #${times} in ${delay}ms...`);
        return delay;
      },
      lazyConnect: true
    };
    redisClient = new import_ioredis.default(config.url || "redis://localhost:6379", redisOptions);
    redisClient.on("connect", () => {
      isConnected = true;
      connectionFailedPermanently = false;
      logger.info("Redis client connected successfully.");
      metrics.incrementCounter("redis_connections_total", "connected");
    });
    redisClient.on("ready", () => {
      isConnected = true;
      logger.info("Redis client is ready to accept commands.");
    });
    redisClient.on("error", (err) => {
      isConnected = false;
      logger.warn("Redis client encountered a connection error", { message: err.message });
      metrics.incrementCounter("redis_errors_total", "error");
    });
    redisClient.on("close", () => {
      isConnected = false;
      logger.warn("Redis connection closed.");
    });
    redisClient.connect().catch((err) => {
      isConnected = false;
      logger.warn("Initial Redis connection attempt failed. Non-critical features will degrade gracefully.", {
        message: err.message
      });
    });
    return redisClient;
  } catch (err) {
    isConnected = false;
    logger.error("Failed to instantiate Redis client", { message: errorMessage(err) });
    return null;
  } finally {
    isConnecting = false;
  }
}
function getRedisClient() {
  if (!redisClient && !connectionFailedPermanently) {
    return initRedis();
  }
  return redisClient;
}
function isRedisAvailable() {
  return isConnected && redisClient !== null && redisClient.status === "ready";
}
async function waitForRedisReady(timeoutMs = 5e3) {
  const client = getRedisClient();
  if (!client) return false;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (isRedisAvailable()) return true;
    await new Promise((r) => setTimeout(r, 100));
  }
  return isRedisAvailable();
}
async function pingRedis() {
  const client = getRedisClient();
  if (!client || !isConnected) {
    return { status: "error", message: "Redis client is not connected" };
  }
  const start = Date.now();
  try {
    const result = await client.ping();
    const latencyMs = Date.now() - start;
    if (result === "PONG") {
      return { status: "ok", latencyMs };
    }
    return { status: "error", message: `Unexpected ping response: ${result}` };
  } catch (err) {
    return { status: "error", message: errorMessage(err) };
  }
}
async function closeRedis() {
  if (redisClient) {
    logger.info("Closing Redis connection cleanly...");
    try {
      await redisClient.quit();
      logger.info("Redis connection closed cleanly.");
    } catch (err) {
      logger.warn("Forcing Redis disconnect after quit failure", { message: errorMessage(err) });
      redisClient.disconnect();
    } finally {
      redisClient = null;
      isConnected = false;
    }
  }
}
function createCanonicalRequestHash(method, path2, body) {
  const normalizedMethod = method.toUpperCase().trim();
  const normalizedPath = path2.toLowerCase().trim();
  let canonicalBodyStr = "";
  if (body && typeof body === "object") {
    canonicalBodyStr = JSON.stringify(sortObjectKeys(body));
  } else if (body !== void 0 && body !== null) {
    canonicalBodyStr = String(body);
  }
  const payload = `${normalizedMethod}:${normalizedPath}:${canonicalBodyStr}`;
  return import_crypto2.default.createHash("sha256").update(payload).digest("hex");
}
function sortObjectKeys(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sorted = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys(obj[key]);
  }
  return sorted;
}
function createBullRedisConnection(clientName = "bullmq") {
  const config = getRedisConfig();
  if (!config.enabled) {
    return null;
  }
  try {
    const redisOptions = {
      connectTimeout: config.connectTimeoutMs,
      maxRetriesPerRequest: null,
      // Required by BullMQ
      enableReadyCheck: false,
      // Recommended by BullMQ
      lazyConnect: false,
      retryStrategy: (times) => {
        if (times > config.maxRetries) {
          logger.warn(`BullMQ Redis connection (${clientName}) stopped retrying after ${times} attempts.`);
          return null;
        }
        return Math.min(times * 500, 3e3);
      }
    };
    const client = new import_ioredis.default(config.url || "redis://localhost:6379", redisOptions);
    client.on("error", (err) => {
      logger.warn(`BullMQ Redis (${clientName}) connection error:`, { message: err.message });
    });
    return client;
  } catch (err) {
    logger.warn(`Failed to create BullMQ Redis connection (${clientName}):`, { message: errorMessage(err) });
    return null;
  }
}
var import_ioredis, import_crypto2, redisClient, isConnected, isConnecting, connectionFailedPermanently, RedisKeys;
var init_redis2 = __esm({
  "src/server/utils/redis.ts"() {
    import_ioredis = __toESM(require("ioredis"), 1);
    import_crypto2 = __toESM(require("crypto"), 1);
    init_redis();
    init_logger();
    init_metrics();
    init_error_message();
    redisClient = null;
    isConnected = false;
    isConnecting = false;
    connectionFailedPermanently = false;
    RedisKeys = {
      idempotency: (scope, userId, endpoint, key) => {
        const cleanEndpoint = endpoint.replace(/[^a-zA-Z0-9_-]/g, "_");
        return `happenins:idempotency:${scope}:${userId}:${cleanEndpoint}:${key.trim()}`;
      },
      cache: (resource, identifier) => {
        return `happenins:cache:${resource}:${identifier.trim()}`;
      },
      rateLimit: (scope, identifier) => {
        return `happenins:ratelimit:${scope}:${identifier.trim()}`;
      },
      lock: (resource, identifier) => {
        return `happenins:lock:${resource}:${identifier.trim()}`;
      },
      queueWaiting: (eventId) => {
        return `happenins:queue:waiting:${eventId.trim()}`;
      },
      queueActive: (eventId) => {
        return `happenins:queue:active:${eventId.trim()}`;
      },
      inventoryTier: (tierId) => {
        return `happenins:inventory:tier:${tierId.trim()}`;
      },
      seatLock: (eventId, seatLabel) => {
        return `happenins:lock:seat:${eventId.trim()}:${seatLabel.trim().toUpperCase()}`;
      }
    };
  }
});

// src/server/utils/best-effort.ts
var bestEffort;
var init_best_effort = __esm({
  "src/server/utils/best-effort.ts"() {
    init_logger();
    init_metrics();
    bestEffort = (operation) => (err) => {
      logger.warn(`Best-effort step failed: ${operation}`, { message: err instanceof Error ? err.message : String(err) });
      metrics.incrementCounter("best_effort_failures_total", operation);
    };
  }
});

// src/server/config/database.ts
function buildMultiplexedDatabaseUrl(rawUrl, options = {}) {
  try {
    const url = new URL(rawUrl);
    url.searchParams.set("pgbouncer", "true");
    const limit = options.connectionLimit || 5;
    url.searchParams.set("connection_limit", String(limit));
    const poolTimeout = options.poolTimeoutSeconds || 10;
    url.searchParams.set("pool_timeout", String(poolTimeout));
    url.searchParams.set("connect_timeout", "5");
    const statementTimeout = options.statementTimeoutMs || 8e3;
    const existingOptions = url.searchParams.get("options") || "";
    if (!existingOptions.includes("statement_timeout")) {
      const combinedOptions = existingOptions ? `${existingOptions} -c statement_timeout=${statementTimeout}ms` : `-c statement_timeout=${statementTimeout}ms`;
      url.searchParams.set("options", combinedOptions);
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
}
function getDatabaseConfig() {
  const env = getEnv();
  const rawUrl = env.DATABASE_URL;
  const statementTimeoutMs = env.NODE_ENV === "test" ? 3e3 : Number(process.env.DB_STATEMENT_TIMEOUT_MS) || 8e3;
  const maxConnections = env.DB_CONNECTION_LIMIT || 5;
  const poolTimeoutSeconds = env.DB_POOL_TIMEOUT_SECONDS || 10;
  const multiplexedUrl = buildMultiplexedDatabaseUrl(rawUrl, {
    connectionLimit: maxConnections,
    poolTimeoutSeconds,
    statementTimeoutMs,
    forcePgbouncer: true
  });
  return {
    url: rawUrl,
    multiplexedUrl,
    poolMode: "transaction",
    pgbouncer: true,
    maxConnections,
    connectionTimeoutMs: 5e3,
    idleTimeoutMs: 1e4,
    statementTimeoutMs,
    poolTimeoutSeconds
  };
}
var init_database = __esm({
  "src/server/config/database.ts"() {
    init_env();
  }
});

// src/server/utils/db.ts
function getPrisma() {
  if (!prisma) {
    const isDebug = process.env.DEBUG_PRISMA === "true";
    const dbConfig = getDatabaseConfig();
    logger.info("Initializing Prisma Client with PgBouncer Multiplexing...", {
      poolMode: dbConfig.poolMode,
      maxConnectionsPerPod: dbConfig.maxConnections,
      statementTimeoutMs: dbConfig.statementTimeoutMs,
      poolTimeoutSeconds: dbConfig.poolTimeoutSeconds
    });
    const client = new import_client.PrismaClient({
      log: isDebug ? ["query", "error", "warn"] : ["error", "warn"],
      datasources: {
        db: {
          url: dbConfig.multiplexedUrl
        }
      }
    });
    if (typeof client.$use === "function") {
      client.$use(async (params, next) => {
        const start = Date.now();
        const model = params.model || "raw";
        const action = params.action || "query";
        try {
          const result = await next(params);
          const durationMs = Date.now() - start;
          metrics.observeHistogram("db_query_duration_ms", durationMs, { model, action });
          if (durationMs > dbConfig.statementTimeoutMs) {
            metrics.incrementCounter("db_statement_timeouts_total", model);
            logger.warn(`SLOW QUERY ALERT: Query exceeded statement timeout budget (${durationMs}ms > ${dbConfig.statementTimeoutMs}ms)`, {
              model,
              action,
              durationMs
            });
          }
          return result;
        } catch (err) {
          const durationMs = Date.now() - start;
          metrics.observeHistogram("db_query_duration_ms", durationMs, { model, action });
          const isStatementTimeout = errorMessage(err)?.includes("statement timeout") || errorMessage(err)?.includes("canceling statement due to statement timeout") || errorCode(err) === "57014" || durationMs >= dbConfig.statementTimeoutMs;
          if (isStatementTimeout) {
            metrics.incrementCounter("db_statement_timeouts_total", model);
            logger.error(`PgBouncer Statement Timeout Triggered: Query killed after ${durationMs}ms to protect multiplexed connection pool`, {
              model,
              action,
              durationMs,
              code: errorCode(err),
              message: errorMessage(err)
            });
          }
          throw err;
        }
      });
    }
    prisma = client;
  }
  return prisma;
}
async function checkDatabaseHealth() {
  const dbConfig = getDatabaseConfig();
  const client = getPrisma();
  const start = Date.now();
  try {
    await client.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - start;
    metrics.observeHistogram("db_query_duration_ms", latencyMs, { model: "health", action: "ping" });
    return {
      status: "ok",
      latencyMs,
      poolMode: dbConfig.poolMode,
      pgbouncer: dbConfig.pgbouncer,
      maxConnections: dbConfig.maxConnections,
      statementTimeoutMs: dbConfig.statementTimeoutMs
    };
  } catch (err) {
    logger.error("Database health check failed", { message: errorMessage(err) });
    return {
      status: "error",
      message: errorMessage(err) || "Database connection error",
      poolMode: dbConfig.poolMode,
      pgbouncer: dbConfig.pgbouncer,
      maxConnections: dbConfig.maxConnections,
      statementTimeoutMs: dbConfig.statementTimeoutMs
    };
  }
}
async function disconnectPrisma() {
  if (prisma) {
    logger.info("Disconnecting Prisma database client...");
    try {
      await prisma.$disconnect();
      logger.info("Prisma database client disconnected cleanly.");
    } catch (err) {
      logger.error("Error disconnecting Prisma database client:", { message: errorMessage(err) });
    } finally {
      prisma = null;
    }
  }
}
var import_client, prisma;
var init_db = __esm({
  "src/server/utils/db.ts"() {
    import_client = require("@prisma/client");
    init_logger();
    init_metrics();
    init_database();
    init_error_message();
    prisma = null;
  }
});

// src/server/config/security.ts
var security_exports = {};
__export(security_exports, {
  getSecurityConfig: () => getSecurityConfig
});
function getSecurityConfig() {
  const env = getEnv();
  const isProd = env.NODE_ENV === "production";
  const allowedOrigins = [
    env.APP_URL,
    "https://happenins.co.in",
    "https://www.happenins.co.in",
    "https://happenins-final.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.29.240:3000"
  ];
  if (process.env.ADDITIONAL_CORS_ORIGIN) {
    const extras = process.env.ADDITIONAL_CORS_ORIGIN.split(",").map((s) => s.trim()).filter(Boolean);
    allowedOrigins.push(...extras);
  }
  if (process.env.VERCEL_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_URL}`);
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }
  return {
    jwtSecret: env.JWT_SECRET,
    jwtIssuer: "happenins",
    jwtAudience: "happenins-client",
    jwtExpiresIn: "7d",
    refreshTokenExpiresDays: 7,
    qrHmacSecret: env.QR_HMAC_SECRET,
    qrDynamicWindowSec: 30,
    // Production is floored at 12; lower costs are only honoured outside production (fast tests).
    bcryptSaltRounds: isProd ? 12 : Math.min(14, Math.max(4, Number(process.env.BCRYPT_SALT_ROUNDS) || 12)),
    corsAllowedOrigins: Array.from(new Set(allowedOrigins.filter(Boolean))),
    cookieSameSite: "lax",
    cookieSecure: isProd && (env.APP_URL.startsWith("https://") || Boolean(process.env.VERCEL))
  };
}
var init_security = __esm({
  "src/server/config/security.ts"() {
    init_env();
  }
});

// src/server/errors/app-error.ts
var AppError, BadRequestError, UnauthorizedError, ForbiddenError, NotFoundError, ConflictError, RateLimitError, TooManyRequestsError, InternalError;
var init_app_error = __esm({
  "src/server/errors/app-error.ts"() {
    AppError = class extends Error {
      constructor(message, statusCode = 500, errorCode2 = "INTERNAL_ERROR") {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode2;
        Object.setPrototypeOf(this, new.target.prototype);
      }
    };
    BadRequestError = class extends AppError {
      constructor(message) {
        super(message, 400, "BAD_REQUEST");
      }
    };
    UnauthorizedError = class extends AppError {
      constructor(message = "Unauthenticated") {
        super(message, 401, "UNAUTHENTICATED");
      }
    };
    ForbiddenError = class extends AppError {
      constructor(message = "Forbidden") {
        super(message, 403, "FORBIDDEN");
      }
    };
    NotFoundError = class extends AppError {
      constructor(message = "Resource not found") {
        super(message, 404, "NOT_FOUND");
      }
    };
    ConflictError = class extends AppError {
      constructor(message = "Conflict") {
        super(message, 409, "CONFLICT");
      }
    };
    RateLimitError = class extends AppError {
      constructor(message = "Too many requests, please try again later") {
        super(message, 429, "RATE_LIMITED");
      }
    };
    TooManyRequestsError = RateLimitError;
    InternalError = class extends AppError {
      constructor(message = "An unexpected error occurred") {
        super(message, 500, "INTERNAL_ERROR");
      }
    };
  }
});

// src/server/utils/auth-worker-pool.ts
var import_node_worker_threads, import_node_os, import_bcryptjs, WORKER_INLINE_SCRIPT, AuthWorkerPool, authWorkerPool;
var init_auth_worker_pool = __esm({
  "src/server/utils/auth-worker-pool.ts"() {
    import_node_worker_threads = require("node:worker_threads");
    import_node_os = __toESM(require("node:os"), 1);
    import_bcryptjs = __toESM(require("bcryptjs"), 1);
    init_logger();
    init_metrics();
    init_app_error();
    init_best_effort();
    init_error_message();
    WORKER_INLINE_SCRIPT = `
  const { parentPort } = require('node:worker_threads');
  const bcrypt = require('bcryptjs');

  parentPort.on('message', async (task) => {
    try {
      if (task.type === 'hash') {
        const hash = await bcrypt.hash(task.password, task.saltOrRounds || 10);
        parentPort.postMessage({ id: task.id, success: true, result: hash });
      } else if (task.type === 'compare') {
        const match = await bcrypt.compare(task.password, task.hash);
        parentPort.postMessage({ id: task.id, success: true, result: match });
      } else {
        parentPort.postMessage({ id: task.id, success: false, error: 'Unknown task type' });
      }
    } catch (err: unknown) {
      parentPort.postMessage({ id: task.id, success: false, error: err.message || 'Worker processing error' });
    }
  });
`;
    AuthWorkerPool = class _AuthWorkerPool {
      constructor(options = {}) {
        this.workers = [];
        this.taskQueue = [];
        this.totalProcessed = 0;
        this.totalTimeouts = 0;
        this.isDestroyed = false;
        this.useFallback = false;
        const cpuCount = import_node_os.default.cpus()?.length || 4;
        this.maxConcurrency = options.maxConcurrency || Math.min(Math.max(cpuCount, 2), 16);
        this.maxQueueSize = options.maxQueueSize || 1e3;
        this.taskTimeoutMs = options.taskTimeoutMs || 5e3;
        this.initializePool();
      }
      static {
        this.instance = null;
      }
      static getInstance() {
        if (!_AuthWorkerPool.instance) {
          _AuthWorkerPool.instance = new _AuthWorkerPool();
        }
        return _AuthWorkerPool.instance;
      }
      initializePool() {
        try {
          for (let i = 0; i < this.maxConcurrency; i++) {
            this.spawnWorker(i);
          }
          logger.info(`AuthWorkerPool initialized with ${this.workers.length} worker threads (Max Concurrency: ${this.maxConcurrency})`);
        } catch (err) {
          logger.warn("Worker threads failed to initialize. Falling back to non-blocking async bcrypt mode.", {
            error: errorMessage(err)
          });
          this.useFallback = true;
        }
      }
      spawnWorker(index) {
        try {
          const worker = new import_node_worker_threads.Worker(WORKER_INLINE_SCRIPT, { eval: true });
          const state = {
            worker,
            busy: false,
            currentTask: null
          };
          worker.on("message", (response) => {
            const task = state.currentTask;
            if (task && task.id === response.id) {
              if (task.timer) clearTimeout(task.timer);
              const duration = Date.now() - task.queuedAt;
              this.totalProcessed++;
              metrics.observeHistogram("auth_worker_duration_ms", duration, { type: task.type });
              state.busy = false;
              state.currentTask = null;
              if (response.success) {
                task.resolve(response.result);
              } else {
                task.reject(new Error(response.error || "Bcrypt worker error"));
              }
              this.dispatchNext(state);
            }
          });
          worker.on("error", (err) => {
            logger.error(`Auth worker #${index} error:`, { message: err.message });
            if (state.currentTask) {
              if (state.currentTask.timer) clearTimeout(state.currentTask.timer);
              state.currentTask.reject(err);
              state.currentTask = null;
            }
            state.busy = false;
          });
          worker.on("exit", (code) => {
            if (!this.isDestroyed) {
              logger.warn(`Auth worker #${index} exited with code ${code}. Respawning replacement worker...`);
              const existingIdx = this.workers.indexOf(state);
              if (existingIdx !== -1) {
                this.workers.splice(existingIdx, 1);
              }
              this.spawnWorker(index);
            }
          });
          this.workers.push(state);
        } catch (err) {
          logger.warn(`Failed to spawn worker #${index}: ${errorMessage(err)}`);
          this.useFallback = true;
        }
      }
      dispatchNext(workerState) {
        if (this.isDestroyed || workerState.busy || this.taskQueue.length === 0) {
          this.updateMetrics();
          return;
        }
        const task = this.taskQueue.shift();
        workerState.busy = true;
        workerState.currentTask = task;
        task.timer = setTimeout(() => {
          this.totalTimeouts++;
          metrics.incrementCounter("auth_worker_timeouts_total", task.type);
          logger.warn(`Auth worker task ${task.id} (${task.type}) timed out after ${this.taskTimeoutMs}ms`);
          task.reject(new Error(`Password verification task timed out after ${this.taskTimeoutMs}ms`));
          try {
            workerState.worker.terminate();
          } catch (err) {
            bestEffort("auth worker terminate (timeout)")(err);
          }
        }, this.taskTimeoutMs);
        workerState.worker.postMessage({
          id: task.id,
          type: task.type,
          password: task.password,
          saltOrRounds: task.saltOrRounds,
          hash: task.hash
        });
        this.updateMetrics();
      }
      updateMetrics() {
        const active = this.workers.filter((w) => w.busy).length;
        metrics.setGauge("auth_worker_active_threads", active);
        metrics.setGauge("auth_worker_queue_depth", this.taskQueue.length);
      }
      async hashPassword(password, saltOrRounds = 10) {
        if (this.useFallback || this.workers.length === 0) {
          return import_bcryptjs.default.hash(password, saltOrRounds);
        }
        return this.enqueueTask("hash", { password, saltOrRounds });
      }
      async comparePassword(password, hash) {
        if (this.useFallback || this.workers.length === 0) {
          return import_bcryptjs.default.compare(password, hash);
        }
        return this.enqueueTask("compare", { password, hash });
      }
      enqueueTask(type, params) {
        if (this.taskQueue.length >= this.maxQueueSize) {
          logger.warn(`Auth worker pool queue saturated (${this.taskQueue.length}/${this.maxQueueSize}). Rejecting request to prevent CPU/memory exhaustion.`);
          throw new TooManyRequestsError("Authentication service is experiencing extreme traffic. Please use Quick OTP / Google Login or retry momentarily.");
        }
        return new Promise((resolve, reject) => {
          const task = {
            id: `auth_task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            type,
            password: params.password,
            saltOrRounds: params.saltOrRounds,
            hash: params.hash,
            resolve,
            reject,
            queuedAt: Date.now()
          };
          const idleWorker = this.workers.find((w) => !w.busy);
          if (idleWorker) {
            this.taskQueue.push(task);
            this.dispatchNext(idleWorker);
          } else {
            this.taskQueue.push(task);
            this.updateMetrics();
          }
        });
      }
      getStats() {
        const active = this.workers.filter((w) => w.busy).length;
        return {
          poolSize: this.workers.length,
          activeWorkers: active,
          idleWorkers: this.workers.length - active,
          queuedTasks: this.taskQueue.length,
          maxConcurrency: this.maxConcurrency,
          totalProcessed: this.totalProcessed,
          totalTimeouts: this.totalTimeouts,
          isUsingFallback: this.useFallback
        };
      }
      async shutdown() {
        this.isDestroyed = true;
        for (const item of this.taskQueue) {
          if (item.timer) clearTimeout(item.timer);
          item.reject(new Error("AuthWorkerPool is shutting down"));
        }
        this.taskQueue = [];
        await Promise.all(
          this.workers.map(async (w) => {
            try {
              await w.worker.terminate();
            } catch (err) {
              bestEffort("auth worker terminate (shutdown)")(err);
            }
          })
        );
        this.workers = [];
      }
    };
    authWorkerPool = AuthWorkerPool.getInstance();
  }
});

// src/server/utils/crypto.ts
var crypto_exports = {};
__export(crypto_exports, {
  comparePassword: () => comparePassword,
  generateCodeChallenge: () => generateCodeChallenge,
  generateCodeVerifier: () => generateCodeVerifier,
  generateDynamicQRToken: () => generateDynamicQRToken,
  generateQRHash: () => generateQRHash,
  generateSecureToken: () => generateSecureToken,
  generateStaffPin: () => generateStaffPin,
  hashPassword: () => hashPassword,
  hashToken: () => hashToken,
  parseAndVerifyDynamicQRToken: () => parseAndVerifyDynamicQRToken,
  safeCompareStrings: () => safeCompareStrings,
  signAccessToken: () => signAccessToken,
  signStaffToken: () => signStaffToken,
  verifyQRHash: () => verifyQRHash,
  verifyToken: () => verifyToken
});
async function hashPassword(password) {
  return authWorkerPool.hashPassword(password, getSecurityConfig().bcryptSaltRounds);
}
async function comparePassword(password, hash) {
  try {
    return await authWorkerPool.comparePassword(password, hash);
  } catch (err) {
    return false;
  }
}
function signAccessToken(session, sessionId) {
  return import_jsonwebtoken.default.sign(
    {
      id: session.id,
      email: session.email,
      fullName: session.fullName,
      avatarUrl: session.avatarUrl,
      role: session.role,
      sessionId: sessionId || void 0
    },
    getJwtSecret(),
    {
      expiresIn: getSecurityConfig().jwtExpiresIn || "7d",
      issuer: "happenins",
      audience: "happenins-client"
    }
  );
}
function verifyToken(token) {
  try {
    const decoded = import_jsonwebtoken.default.verify(token, getJwtSecret(), {
      issuer: "happenins",
      audience: ["happenins-client", "happenins-staff-scanner"]
    });
    const isStaff = decoded.role === "STAFF_SCANNER";
    if (isStaff !== (decoded.aud === "happenins-staff-scanner")) return null;
    return decoded;
  } catch (err) {
    return null;
  }
}
function hashToken(rawToken) {
  return import_crypto3.default.createHash("sha256").update(rawToken).digest("hex");
}
function generateSecureToken(bytes = 32) {
  return import_crypto3.default.randomBytes(bytes).toString("hex");
}
function generateCodeVerifier() {
  return import_crypto3.default.randomBytes(32).toString("base64url");
}
function generateCodeChallenge(verifier) {
  return import_crypto3.default.createHash("sha256").update(verifier).digest("base64url");
}
function safeCompareStrings(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return import_crypto3.default.timingSafeEqual(bufA, bufB);
}
function generateQRHash(ticketId, email) {
  const message = `${ticketId}:${email}`;
  const fullHash = import_crypto3.default.createHmac("sha256", getQrHmacSecret()).update(message).digest("hex");
  return `HPN-${ticketId}-${fullHash.substring(0, 16).toUpperCase()}`;
}
function verifyQRHash(hash, ticketId, email) {
  if (!hash || typeof hash !== "string") return false;
  const trimmed = hash.trim().toUpperCase();
  const message = `${ticketId}:${email}`;
  const fullHash = import_crypto3.default.createHmac("sha256", getQrHmacSecret()).update(message).digest("hex");
  const primaryLongHash = `HPN-${ticketId}-${fullHash.substring(0, 16)}`.toUpperCase();
  if (safeCompareStrings(trimmed, primaryLongHash)) {
    return true;
  }
  return false;
}
function generateDynamicQRToken(ticketReference, customTimeWindow) {
  const windowMs = 3e4;
  const timeWindow = customTimeWindow || Math.floor(Date.now() / windowMs);
  const sig = import_crypto3.default.createHmac("sha256", getQrHmacSecret()).update(`ROT:${ticketReference}:${timeWindow}`).digest("hex");
  return {
    token: `ROT:${ticketReference}:${timeWindow}:${sig}`,
    timeWindow
  };
}
function parseAndVerifyDynamicQRToken(rawInput) {
  if (!rawInput || typeof rawInput !== "string") {
    return { valid: false, qrHash: "", isDynamic: false, reason: "Empty or invalid QR code input." };
  }
  const input = rawInput.trim();
  if (input.startsWith("ROT:")) {
    const parts = input.split(":");
    if (parts.length !== 4) {
      return { valid: false, qrHash: "", isDynamic: true, reason: "Malformed dynamic QR code token." };
    }
    const [, ticketRef, timeWindowStr, signature] = parts;
    if (!ticketRef || !signature) {
      return { valid: false, qrHash: "", isDynamic: true, reason: "Malformed dynamic QR code token components." };
    }
    const timeWindow = parseInt(timeWindowStr, 10);
    if (isNaN(timeWindow)) {
      return { valid: false, qrHash: "", isDynamic: true, reason: "Invalid time window in QR token." };
    }
    const currentTimeWindow = Math.floor(Date.now() / 3e4);
    if (Math.abs(currentTimeWindow - timeWindow) > 2) {
      return { valid: false, qrHash: "", isDynamic: true, reason: "Anti-screenshot security: Dynamic QR code expired! Please refresh your pass." };
    }
    const expectedSig = import_crypto3.default.createHmac("sha256", getQrHmacSecret()).update(`ROT:${ticketRef}:${timeWindow}`).digest("hex");
    if (!safeCompareStrings(signature.toLowerCase(), expectedSig.toLowerCase())) {
      return { valid: false, qrHash: "", isDynamic: true, reason: "Tampered or counterfeit dynamic QR code detected." };
    }
    return { valid: true, qrHash: ticketRef, isDynamic: true };
  }
  const upper = input.toUpperCase();
  if (upper.startsWith("HPN-")) {
    const body = input.substring(4);
    if (body.length >= 8 && /^[A-Za-z0-9_-]+$/.test(body)) {
      return { valid: true, qrHash: input, isDynamic: false };
    }
  }
  return {
    valid: false,
    qrHash: "",
    isDynamic: false,
    reason: "Public identifiers (ticket numbers, invoices, booking IDs) or unrecognized tokens cannot be used as cryptographic QR verification passes."
  };
}
function generateStaffPin() {
  const pinNum = import_crypto3.default.randomInt(1e5, 1e6);
  return pinNum.toString();
}
function signStaffToken(payload, expiresInSeconds = 12 * 60 * 60) {
  return import_jsonwebtoken.default.sign(
    {
      id: payload.staffScannerId,
      staffScannerId: payload.staffScannerId,
      eventId: payload.eventId,
      staffName: payload.staffName,
      gateName: payload.gateName,
      allowedTiers: payload.allowedTiers,
      allowedTierNames: payload.allowedTierNames || [],
      role: "STAFF_SCANNER"
    },
    getJwtSecret(),
    {
      expiresIn: Math.max(60, Math.floor(expiresInSeconds)),
      issuer: "happenins",
      audience: "happenins-staff-scanner"
    }
  );
}
var import_jsonwebtoken, import_crypto3, getJwtSecret, getQrHmacSecret;
var init_crypto = __esm({
  "src/server/utils/crypto.ts"() {
    import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
    import_crypto3 = __toESM(require("crypto"), 1);
    init_env();
    init_security();
    init_auth_worker_pool();
    getJwtSecret = () => {
      return getEnv().JWT_SECRET;
    };
    getQrHmacSecret = () => {
      return getEnv().QR_HMAC_SECRET;
    };
  }
});

// src/server/services/session-revocation.service.ts
var SessionRevocationService, sessionRevocationService;
var init_session_revocation_service = __esm({
  "src/server/services/session-revocation.service.ts"() {
    init_redis2();
    init_logger();
    init_metrics();
    init_db();
    init_best_effort();
    init_error_message();
    SessionRevocationService = class _SessionRevocationService {
      constructor() {
        // In-memory fallback caches (used if Redis is offline or for local sub-microsecond lookups)
        this.memoryRevokedSessions = /* @__PURE__ */ new Map();
        this.memoryRevokedUsers = /* @__PURE__ */ new Map();
        this.memoryStaffScannerCache = /* @__PURE__ */ new Map();
        // Cleanup timer for in-memory entries
        this.cleanupInterval = null;
        this.cleanupInterval = setInterval(() => this.cleanupExpiredMemoryEntries(), 6e4);
        if (this.cleanupInterval.unref) {
          this.cleanupInterval.unref();
        }
      }
      static {
        this.instance = null;
      }
      static getInstance() {
        if (!_SessionRevocationService.instance) {
          _SessionRevocationService.instance = new _SessionRevocationService();
        }
        return _SessionRevocationService.instance;
      }
      cleanupExpiredMemoryEntries() {
        const now = Date.now();
        for (const [key, entry] of this.memoryRevokedSessions.entries()) {
          if (entry.expiresAt <= now) {
            this.memoryRevokedSessions.delete(key);
          }
        }
        for (const [key, entry] of this.memoryRevokedUsers.entries()) {
          if (entry.expiresAt <= now) {
            this.memoryRevokedUsers.delete(key);
          }
        }
        for (const [key, entry] of this.memoryStaffScannerCache.entries()) {
          if (entry.expiresAt <= now) {
            this.memoryStaffScannerCache.delete(key);
          }
        }
      }
      /**
       * Fast-path check: returns true if the session or entire user account has been revoked.
       * Latency: ~0.05ms (In-Memory) to ~0.3ms (Redis RAM).
       * ZERO queries sent to PostgreSQL.
       */
      async isSessionRevoked(sessionId, userId, tokenIat) {
        const now = Date.now();
        const memSession = this.memoryRevokedSessions.get(sessionId);
        if (memSession && memSession.expiresAt > now) {
          metrics.incrementCounter("jwt_revocation_hits_total", "memory");
          return true;
        }
        if (userId) {
          const memUser = this.memoryRevokedUsers.get(userId);
          if (memUser && memUser.expiresAt > now) {
            if (tokenIat && memUser.revokedAt && tokenIat * 1e3 > memUser.revokedAt) {
            } else {
              metrics.incrementCounter("jwt_revocation_hits_total", "memory");
              return true;
            }
          }
        }
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          try {
            const sessionKey = `happenins:revoked:session:${sessionId}`;
            const userKey = userId ? `happenins:revoked:user:${userId}` : null;
            const keysToCheck = userKey ? [sessionKey, userKey] : [sessionKey];
            const results = await redis.mget(...keysToCheck);
            if (results[0] !== null) {
              this.memoryRevokedSessions.set(sessionId, { expiresAt: now + 3e5 });
              metrics.incrementCounter("jwt_revocation_hits_total", "redis");
              return true;
            }
            if (userKey && results[1] !== null) {
              const redisRevokedAt = Number(results[1]) || now - 1e3;
              if (tokenIat && tokenIat * 1e3 > redisRevokedAt) {
              } else {
                this.memoryRevokedUsers.set(userId, { expiresAt: now + 3e5, revokedAt: redisRevokedAt });
                metrics.incrementCounter("jwt_revocation_hits_total", "redis");
                return true;
              }
            }
          } catch (err) {
            logger.warn("Redis session revocation check degraded to in-memory fallback", { message: errorMessage(err) });
          }
        }
        return false;
      }
      /**
       * Instantly revokes a single session.
       * Sets key in Redis with TTL matching JWT expiration (default 15 mins = 900s).
       */
      async revokeSession(sessionId, userId, ttlSeconds = 900) {
        const expiresAt = Date.now() + ttlSeconds * 1e3;
        this.memoryRevokedSessions.set(sessionId, { expiresAt });
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          try {
            const sessionKey = `happenins:revoked:session:${sessionId}`;
            await redis.set(sessionKey, "REVOKED", "EX", ttlSeconds);
            logger.info(`Session ${sessionId} successfully registered in Redis revocation set (TTL: ${ttlSeconds}s)`);
          } catch (err) {
            logger.warn("Failed to set Redis session revocation key", { message: errorMessage(err) });
          }
        }
        this.syncRevocationToDatabase(sessionId).catch((err) => {
          logger.warn("Async database session revocation sync notice", { message: err?.message });
        });
      }
      /**
       * Instantly revokes all active sessions for a user (e.g., password reset, compromised account).
       */
      async revokeAllUserSessions(userId, ttlSeconds = 900) {
        const now = Date.now();
        const expiresAt = now + ttlSeconds * 1e3;
        this.memoryRevokedUsers.set(userId, { expiresAt, revokedAt: now });
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          try {
            const userKey = `happenins:revoked:user:${userId}`;
            await redis.set(userKey, String(now), "EX", ttlSeconds);
            logger.info(`All sessions for user ${userId} registered in Redis revocation set (TTL: ${ttlSeconds}s)`);
          } catch (err) {
            logger.warn("Failed to set Redis user revocation key", { message: errorMessage(err) });
          }
        }
        getPrisma().session.updateMany({
          where: { userId, revokedAt: null },
          data: { revokedAt: /* @__PURE__ */ new Date(), revokedReason: "USER_REVOCATION_BROADCAST" }
        }).catch((err) => {
          logger.warn("Async database user sessions revocation sync notice", { message: err?.message });
        });
      }
      /**
       * Clears any active revocation for a user when establishing a fresh authorized session.
       */
      clearUserRevocation(userId) {
        this.memoryRevokedUsers.delete(userId);
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          redis.del(`happenins:revoked:user:${userId}`).catch(bestEffort("redis.del clearUserRevocation"));
        }
      }
      async syncRevocationToDatabase(sessionId) {
        try {
          await getPrisma().session.updateMany({
            where: { id: sessionId, revokedAt: null },
            data: { revokedAt: /* @__PURE__ */ new Date(), revokedReason: "LOGOUT" }
          });
        } catch (err) {
          logger.error("Session revocation failed", { sessionId, message: err instanceof Error ? err.message : String(err) });
          metrics.incrementCounter("best_effort_failures_total", "session.revoke");
        }
      }
      // Fast-path cache for staff scanner pins / authorization
      async getStaffScannerCache(staffId) {
        const now = Date.now();
        const mem = this.memoryStaffScannerCache.get(staffId);
        if (mem && mem.expiresAt > now) {
          return mem.data;
        }
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          try {
            const raw = await redis.get(`happenins:staff:${staffId}`);
            if (raw) {
              const parsed = JSON.parse(raw);
              this.memoryStaffScannerCache.set(staffId, { data: parsed, expiresAt: now + 3e4 });
              return parsed;
            }
          } catch (err) {
            bestEffort("redis.get staff scanner cache")(err);
          }
        }
        return null;
      }
      async setStaffScannerCache(staffId, data, ttlSeconds = 60) {
        const expiresAt = Date.now() + ttlSeconds * 1e3;
        this.memoryStaffScannerCache.set(staffId, { data, expiresAt });
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          try {
            await redis.set(`happenins:staff:${staffId}`, JSON.stringify(data), "EX", ttlSeconds);
          } catch (err) {
            bestEffort("redis.set staff scanner cache")(err);
          }
        }
      }
      async invalidateStaffScannerCache(staffId) {
        this.memoryStaffScannerCache.delete(staffId);
        const redis = getRedisClient();
        if (isRedisAvailable() && redis) {
          try {
            await redis.del(`happenins:staff:${staffId}`);
          } catch (err) {
            bestEffort("redis.del staff scanner cache")(err);
          }
        }
      }
    };
    sessionRevocationService = SessionRevocationService.getInstance();
  }
});

// src/server/services/session.service.ts
var session_service_exports = {};
__export(session_service_exports, {
  SessionService: () => SessionService
});
var SessionService;
var init_session_service = __esm({
  "src/server/services/session.service.ts"() {
    init_db();
    init_crypto();
    init_app_error();
    init_session_revocation_service();
    SessionService = class {
      constructor() {
        this.prisma = getPrisma();
      }
      async createSession(userId, ipAddress, userAgent) {
        const user = await this.prisma.user.findUnique({
          where: { id: userId }
        });
        if (!user) {
          throw new UnauthorizedError("User account not found.");
        }
        const rawRefreshToken = generateSecureToken(32);
        const refreshTokenHash = hashToken(rawRefreshToken);
        const familyId = "fam_" + generateSecureToken(16);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
        const session = await this.prisma.session.create({
          data: {
            userId: user.id,
            refreshTokenHash,
            familyId,
            ipAddress: ipAddress || null,
            userAgent: userAgent || null,
            expiresAt
          }
        });
        const userSession = {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          avatarUrl: user.avatarUrl,
          role: user.role
        };
        const accessToken = signAccessToken(userSession, session.id);
        sessionRevocationService.clearUserRevocation(user.id);
        return { rawRefreshToken, accessToken, session, user: userSession };
      }
      async rotateSession(rawRefreshToken, ipAddress, userAgent) {
        const refreshTokenHash = hashToken(rawRefreshToken);
        const existingSession = await this.prisma.session.findUnique({
          where: { refreshTokenHash },
          include: { user: true }
        });
        if (!existingSession) {
          throw new UnauthorizedError("Invalid or expired session token.");
        }
        if (existingSession.revokedAt) {
          const gracePeriodMs = 3e4;
          if (existingSession.revokedReason === "ROTATED" && existingSession.revokedAt && Date.now() - existingSession.revokedAt.getTime() < gracePeriodMs) {
            const latestSession = await this.prisma.session.findFirst({
              where: { familyId: existingSession.familyId, revokedAt: null },
              orderBy: { createdAt: "desc" },
              include: { user: true }
            });
            if (latestSession && latestSession.expiresAt > /* @__PURE__ */ new Date()) {
              const userSession2 = {
                id: latestSession.user.id,
                email: latestSession.user.email,
                fullName: latestSession.user.fullName,
                avatarUrl: latestSession.user.avatarUrl,
                role: latestSession.user.role
              };
              const accessToken2 = signAccessToken(userSession2, latestSession.id);
              return {
                newRawRefreshToken: rawRefreshToken,
                accessToken: accessToken2,
                user: userSession2
              };
            }
          }
          await this.prisma.session.updateMany({
            where: { familyId: existingSession.familyId, revokedAt: null },
            data: {
              revokedAt: /* @__PURE__ */ new Date(),
              revokedReason: "TOKEN_REUSE_DETECTED"
            }
          });
          throw new UnauthorizedError("Security Alert: Session revoked due to token reuse detection.");
        }
        if (existingSession.expiresAt < /* @__PURE__ */ new Date()) {
          await this.prisma.session.update({
            where: { id: existingSession.id },
            data: { revokedAt: /* @__PURE__ */ new Date(), revokedReason: "EXPIRED" }
          });
          throw new UnauthorizedError("Session expired. Please log in again.");
        }
        await this.prisma.session.update({
          where: { id: existingSession.id },
          data: {
            revokedAt: /* @__PURE__ */ new Date(),
            revokedReason: "ROTATED",
            lastUsedAt: /* @__PURE__ */ new Date()
          }
        });
        const newRawRefreshToken = generateSecureToken(32);
        const newRefreshTokenHash = hashToken(newRawRefreshToken);
        const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
        const newSession = await this.prisma.session.create({
          data: {
            userId: existingSession.userId,
            refreshTokenHash: newRefreshTokenHash,
            familyId: existingSession.familyId,
            ipAddress: ipAddress || existingSession.ipAddress,
            userAgent: userAgent || existingSession.userAgent,
            expiresAt: newExpiresAt
          }
        });
        const userSession = {
          id: existingSession.user.id,
          email: existingSession.user.email,
          fullName: existingSession.user.fullName,
          avatarUrl: existingSession.user.avatarUrl,
          role: existingSession.user.role
        };
        const accessToken = signAccessToken(userSession, newSession.id);
        sessionRevocationService.clearUserRevocation(existingSession.userId);
        return {
          newRawRefreshToken,
          accessToken,
          user: userSession
        };
      }
      async revokeSession(rawRefreshToken, reason = "LOGOUT") {
        const refreshTokenHash = hashToken(rawRefreshToken);
        const existing = await this.prisma.session.findUnique({
          where: { refreshTokenHash },
          select: { id: true, userId: true }
        });
        if (existing) {
          await sessionRevocationService.revokeSession(existing.id, existing.userId);
        }
        await this.prisma.session.updateMany({
          where: { refreshTokenHash, revokedAt: null },
          data: {
            revokedAt: /* @__PURE__ */ new Date(),
            revokedReason: reason
          }
        });
      }
      async revokeAllUserSessions(userId, reason = "PASSWORD_RESET") {
        await sessionRevocationService.revokeAllUserSessions(userId);
        await this.prisma.session.updateMany({
          where: { userId, revokedAt: null },
          data: {
            revokedAt: /* @__PURE__ */ new Date(),
            revokedReason: reason
          }
        });
      }
    };
  }
});

// server.ts
var import_config = require("dotenv/config");

// src/server/server.ts
init_features();
var import_express2 = __toESM(require("express"), 1);
init_env();
init_logger();
init_redis2();

// src/server/jobs/workers.ts
var import_bullmq2 = require("bullmq");

// src/server/jobs/types.ts
var ALL_QUEUE_NAMES = [
  "reservation-expiry" /* RESERVATION_EXPIRY */,
  "email" /* EMAIL */,
  "notification" /* NOTIFICATION */,
  "webhook" /* WEBHOOK */,
  "payment-reconciliation" /* PAYMENT_RECONCILIATION */,
  "analytics" /* ANALYTICS */
];
var QUEUE_NAMESPACE_PREFIX = "happenins:queue";
var JobIdGenerators = {
  reservationExpiry: (bookingId) => `reservation-expiry:${bookingId.trim()}`,
  reservationScan: (timestamp) => `reservation-expiry-scan:${timestamp}`,
  email: (messageId) => `email:${messageId.trim()}`,
  notification: (userId, refId) => `notification:${userId.trim()}:${refId.trim()}`,
  webhook: (eventId) => `webhook:${eventId.trim()}`,
  paymentReconciliation: (paymentId) => `payment-recon:${paymentId.trim()}`,
  paymentScan: (timestamp) => `payment-recon-scan:${timestamp}`,
  analytics: (eventId, metricType, dateStr) => `analytics:${eventId.trim()}:${metricType}:${dateStr}`
};

// src/server/jobs/queue.ts
var import_bullmq = require("bullmq");

// src/server/config/queue.ts
function getQueueConfig() {
  return {
    prefix: "happenins:queue",
    defaultMaxAttempts: 5,
    backoffDelayMs: 2e3,
    reservationScanIntervalMs: 15e3,
    paymentReconciliationIntervalMs: 6e4,
    deadLetterLimit: 1e3,
    policies: {
      ["reservation-expiry" /* RESERVATION_EXPIRY */]: {
        concurrency: 2,
        maxAttempts: 3,
        backoffDelayMs: 1e3,
        backoffType: "exponential",
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400 * 7, count: 1e3 }
      },
      ["email" /* EMAIL */]: {
        concurrency: 5,
        maxAttempts: 5,
        backoffDelayMs: 2e3,
        backoffType: "exponential",
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400 * 7, count: 1e3 }
      },
      ["notification" /* NOTIFICATION */]: {
        concurrency: 3,
        maxAttempts: 3,
        backoffDelayMs: 1e3,
        backoffType: "exponential",
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400 * 7, count: 1e3 }
      },
      ["webhook" /* WEBHOOK */]: {
        concurrency: 3,
        maxAttempts: 5,
        backoffDelayMs: 2e3,
        backoffType: "exponential",
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400 * 7, count: 1e3 }
      },
      ["payment-reconciliation" /* PAYMENT_RECONCILIATION */]: {
        concurrency: 2,
        maxAttempts: 3,
        backoffDelayMs: 2e3,
        backoffType: "exponential",
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400 * 7, count: 1e3 }
      },
      ["analytics" /* ANALYTICS */]: {
        concurrency: 2,
        maxAttempts: 2,
        backoffDelayMs: 2e3,
        backoffType: "exponential",
        removeOnComplete: { age: 3600, count: 500 },
        removeOnFail: { age: 86400 * 7, count: 1e3 }
      }
    }
  };
}

// src/server/jobs/queue.ts
init_redis2();
init_logger();
init_metrics();
init_best_effort();
init_error_message();
function sanitizePayload(payload) {
  if (!payload || typeof payload !== "object") return payload;
  if (Array.isArray(payload)) return payload.map(sanitizePayload);
  const sensitiveFields = [
    "password",
    "passwordHash",
    "token",
    "jwt",
    "jwtSecret",
    "secret",
    "hmacSecret",
    "qrSecret",
    "cardNumber",
    "cvv",
    "keySecret"
  ];
  const sanitized = {};
  for (const [key, val] of Object.entries(payload)) {
    if (sensitiveFields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof val === "object" && val !== null) {
      sanitized[key] = sanitizePayload(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}
var DurableJobQueue = class {
  constructor() {
    this.bullQueues = /* @__PURE__ */ new Map();
    this.bullRedisClients = /* @__PURE__ */ new Map();
    this.handlers = /* @__PURE__ */ new Map();
    this.isBullMqActive = false;
    // Development / Test In-Memory Fallback State
    this.inMemoryQueue = [];
    this.inMemoryDLQ = [];
    this.processedKeys = /* @__PURE__ */ new Set();
    this.isProcessingFallback = false;
    this.fallbackTimer = null;
    this.init();
  }
  init() {
    const config = getQueueConfig();
    const redisClient2 = createBullRedisConnection("queue-manager");
    if (redisClient2) {
      try {
        this.bullRedisClients.set("queue-manager", redisClient2);
        for (const queueName of ALL_QUEUE_NAMES) {
          const policy = config.policies[queueName];
          const bullQueue = new import_bullmq.Queue(queueName, {
            connection: redisClient2,
            prefix: QUEUE_NAMESPACE_PREFIX,
            defaultJobOptions: {
              attempts: policy.maxAttempts,
              backoff: {
                type: policy.backoffType,
                delay: policy.backoffDelayMs
              },
              removeOnComplete: policy.removeOnComplete,
              removeOnFail: policy.removeOnFail
            }
          });
          this.bullQueues.set(queueName, bullQueue);
        }
        this.isBullMqActive = true;
        logger.info("BullMQ distributed queues initialized across all domain namespaces.");
      } catch (err) {
        this.isBullMqActive = false;
        logger.warn("Failed to initialize BullMQ queues, operating in process-local dev mode:", {
          error: errorMessage(err)
        });
      }
    } else {
      this.isBullMqActive = false;
      logger.info(
        "Redis disabled or not reachable. Background jobs initialized in process-local sandbox mode."
      );
    }
  }
  registerHandler(name, handler) {
    this.handlers.set(name, handler);
  }
  getHandler(name) {
    return this.handlers.get(name);
  }
  getBullQueue(name) {
    return this.bullQueues.get(name);
  }
  /**
   * Universal Enqueue Method for BullMQ & Safe Fallback
   */
  async enqueueJob(queueName, jobName, data, options) {
    const config = getQueueConfig();
    const policy = config.policies[queueName];
    const rawJobId = options?.jobId || options?.idempotencyKey || `${jobName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const jobId = rawJobId;
    const attempts = options?.attempts || policy.maxAttempts;
    const backoffMs = options?.backoffMs || policy.backoffDelayMs;
    const delayMs = options?.delayMs || 0;
    const sanitizedData = sanitizePayload(data);
    if (this.isBullMqActive) {
      const bullQueue = this.bullQueues.get(queueName);
      if (bullQueue) {
        try {
          const job = await bullQueue.add(jobName, sanitizedData, {
            // BullMQ forbids ':' in custom IDs. Encode only distributed IDs;
            // this stays deterministic without conflating ':' with literal '%3A'.
            jobId: encodeURIComponent(jobId),
            delay: delayMs,
            attempts,
            backoff: {
              type: policy.backoffType,
              delay: backoffMs
            },
            priority: options?.priority,
            removeOnComplete: options?.removeOnComplete ?? policy.removeOnComplete,
            removeOnFail: options?.removeOnFail ?? policy.removeOnFail
          });
          metrics.incrementCounter("jobs_enqueued_total", queueName);
          logger.info(`Job enqueued into distributed BullMQ queue [${queueName}]`, {
            jobId: job.id,
            jobName
          });
          return job.id;
        } catch (err) {
          logger.warn(`BullMQ add failed for [${queueName}], routing to local handler:`, {
            error: errorMessage(err)
          });
        }
      }
    }
    if (options?.idempotencyKey && this.processedKeys.has(options.idempotencyKey)) {
      logger.info(`Job skipped due to local idempotency key match`, {
        queueName,
        idempotencyKey: options.idempotencyKey
      });
      return options.idempotencyKey;
    }
    const inMemoryJob = {
      id: jobId,
      queue: queueName,
      name: jobName,
      data: sanitizedData,
      attempts: 0,
      maxAttempts: attempts,
      scheduledAt: new Date(Date.now() + delayMs),
      status: "PENDING",
      idempotencyKey: options?.idempotencyKey
    };
    this.inMemoryQueue.push(inMemoryJob);
    metrics.incrementCounter("jobs_enqueued_total", queueName);
    logger.info(`Job enqueued into process-local fallback queue [${queueName}]`, {
      jobId,
      jobName
    });
    this.triggerLocalProcessing();
    return jobId;
  }
  // --- Strongly Typed Enqueue Helpers ---
  async enqueueReservationExpiry(data, options) {
    const jobId = data.bookingId ? JobIdGenerators.reservationExpiry(data.bookingId) : JobIdGenerators.reservationScan(Date.now());
    return this.enqueueJob("reservation-expiry" /* RESERVATION_EXPIRY */, "expire_reservation", data, {
      jobId,
      ...options
    });
  }
  async enqueueEmail(data, options) {
    const jobId = JobIdGenerators.email(data.messageId);
    return this.enqueueJob("email" /* EMAIL */, "send_email", data, {
      jobId,
      ...options
    });
  }
  async enqueueNotification(data, options) {
    const refId = data.metadata?.refId || Math.random().toString(36).substring(2, 9);
    const jobId = JobIdGenerators.notification(data.userId, refId);
    return this.enqueueJob("notification" /* NOTIFICATION */, "send_notification", data, {
      jobId,
      ...options
    });
  }
  async enqueueWebhook(data, options) {
    const jobId = JobIdGenerators.webhook(data.eventId);
    return this.enqueueJob("webhook" /* WEBHOOK */, "process_webhook", data, {
      jobId,
      ...options
    });
  }
  async enqueuePaymentReconciliation(data, options) {
    const jobId = data.paymentId ? JobIdGenerators.paymentReconciliation(data.paymentId) : JobIdGenerators.paymentScan(Date.now());
    return this.enqueueJob("payment-reconciliation" /* PAYMENT_RECONCILIATION */, "reconcile_payment", data, {
      jobId,
      ...options
    });
  }
  async enqueueAnalytics(data, options) {
    const dateStr = data.dateStr || (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const jobId = JobIdGenerators.analytics(data.eventId, data.metricType, dateStr);
    return this.enqueueJob("analytics" /* ANALYTICS */, "aggregate_analytics", data, {
      jobId,
      ...options
    });
  }
  /**
   * Backwards-compatible generic enqueue method for legacy callers
   */
  async enqueue(type, payload, options) {
    switch (type) {
      case "RESERVATION_EXPIRY":
        return this.enqueueReservationExpiry(payload, options);
      case "EMAIL_SEND":
        return this.enqueueEmail(
          {
            to: payload.to,
            subject: payload.subject,
            body: payload.body || "",
            html: payload.html,
            messageId: payload.messageId || `eml_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
          },
          options
        );
      case "NOTIFICATION_SEND":
        return this.enqueueNotification(payload, options);
      case "WEBHOOK_RETRY":
        return this.enqueueWebhook(
          {
            eventId: payload.eventId || `wh_${Date.now()}`,
            eventType: payload.event || "webhook_event",
            payload: payload.payload || {},
            receivedAt: (/* @__PURE__ */ new Date()).toISOString()
          },
          options
        );
      case "PAYMENT_RECONCILIATION":
        return this.enqueuePaymentReconciliation(payload, options);
      case "ANALYTICS_AGGREGATION":
        return this.enqueueAnalytics(payload, options);
      default:
        return this.enqueueJob("notification" /* NOTIFICATION */, type, payload, options);
    }
  }
  /**
   * Helper to register generic worker (backward compatibility)
   */
  registerWorker(type, handler) {
    this.registerHandler(type, async (data) => {
      await handler({ id: "job", type, payload: data });
    });
  }
  // --- Process-Local Fallback Loop ---
  startFallbackWorkerLoop(intervalMs = 1e4) {
    if (this.fallbackTimer || this.isBullMqActive) return;
    this.fallbackTimer = setInterval(() => {
      this.triggerLocalProcessing();
    }, intervalMs);
  }
  stopFallbackWorkerLoop() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }
  async triggerLocalProcessing() {
    if (this.isProcessingFallback) return;
    this.isProcessingFallback = true;
    try {
      const now = /* @__PURE__ */ new Date();
      const readyIdx = this.inMemoryQueue.findIndex(
        (j) => j.status === "PENDING" && j.scheduledAt <= now
      );
      if (readyIdx === -1) {
        this.isProcessingFallback = false;
        return;
      }
      const job = this.inMemoryQueue[readyIdx];
      job.status = "PROCESSING";
      job.attempts += 1;
      const handler = this.handlers.get(job.name) || this.handlers.get(job.queue);
      if (!handler) {
        logger.error(`No handler registered for fallback job: ${job.name}`, { jobId: job.id });
        job.status = "FAILED";
        job.lastError = `No handler for ${job.name}`;
        this.recordInMemoryDLQ(job, `No handler registered for ${job.name}`);
        this.inMemoryQueue.splice(readyIdx, 1);
        this.isProcessingFallback = false;
        return;
      }
      const jobStart = Date.now();
      try {
        metrics.incrementCounter("jobs_processed_attempt", job.queue);
        await handler(job.data);
        const durationMs = Date.now() - jobStart;
        metrics.observeHistogram("jobs_duration_ms", durationMs, { queue: job.queue, status: "success" });
        metrics.incrementCounter("jobs_processed_total", { queue: job.queue, status: "success" });
        job.status = "COMPLETED";
        if (job.idempotencyKey) {
          this.processedKeys.add(job.idempotencyKey);
        }
        metrics.incrementCounter("jobs_completed", job.queue);
        metrics.incrementCounter("jobs_completed_total", job.queue);
        logger.info(`Fallback Job completed successfully: ${job.name}`, { jobId: job.id });
        this.inMemoryQueue.splice(readyIdx, 1);
      } catch (err) {
        const durationMs = Date.now() - jobStart;
        metrics.observeHistogram("jobs_duration_ms", durationMs, { queue: job.queue, status: "error" });
        metrics.incrementCounter("jobs_processed_total", { queue: job.queue, status: "error" });
        logger.error(`Fallback Job execution error: ${job.name}`, {
          jobId: job.id,
          attempt: job.attempts,
          error: errorMessage(err)
        });
        if (job.attempts < job.maxAttempts) {
          job.status = "PENDING";
          const backoffMs = Math.pow(2, job.attempts) * 1e3;
          job.scheduledAt = new Date(Date.now() + backoffMs);
          job.lastError = errorMessage(err);
          metrics.incrementCounter("jobs_retry", job.queue);
        } else {
          job.status = "DEAD_LETTER";
          job.lastError = errorMessage(err);
          this.recordInMemoryDLQ(job, errorMessage(err) || "Max attempts exceeded");
          this.inMemoryQueue.splice(readyIdx, 1);
          metrics.incrementCounter("jobs_dead_letter", job.queue);
          metrics.incrementCounter("jobs_failed_total", job.queue);
          logger.error(`Fallback Job moved to DLQ after max attempts: ${job.name}`, {
            jobId: job.id,
            error: errorMessage(err)
          });
        }
      }
    } finally {
      this.isProcessingFallback = false;
    }
  }
  recordInMemoryDLQ(job, reason) {
    const config = getQueueConfig();
    this.inMemoryDLQ.unshift({
      id: job.id,
      queue: job.queue,
      name: job.name,
      data: sanitizePayload(job.data),
      failedReason: reason,
      attemptsMade: job.attempts,
      timestamp: Date.now()
    });
    if (this.inMemoryDLQ.length > config.deadLetterLimit) {
      this.inMemoryDLQ.pop();
    }
  }
  // --- Health, Metrics & DLQ Inspection ---
  async getStats() {
    const queueStatsRecord = {};
    let totalWaiting = 0;
    let totalActive = 0;
    let totalFailed = 0;
    let totalDelayed = 0;
    if (this.isBullMqActive) {
      for (const [queueName, queue] of this.bullQueues.entries()) {
        try {
          const counts = await queue.getJobCounts(
            "waiting",
            "active",
            "completed",
            "failed",
            "delayed",
            "paused"
          );
          const isPaused = await queue.isPaused();
          queueStatsRecord[queueName] = {
            waiting: counts.waiting || 0,
            active: counts.active || 0,
            completed: counts.completed || 0,
            failed: counts.failed || 0,
            delayed: counts.delayed || 0,
            paused: isPaused
          };
          totalWaiting += counts.waiting || 0;
          totalActive += counts.active || 0;
          totalFailed += counts.failed || 0;
          totalDelayed += counts.delayed || 0;
        } catch {
          queueStatsRecord[queueName] = {
            waiting: 0,
            active: 0,
            completed: 0,
            failed: 0,
            delayed: 0,
            paused: false
          };
        }
      }
      return {
        isDistributed: true,
        mode: "bullmq_redis",
        queues: queueStatsRecord,
        totalWaiting,
        totalActive,
        totalFailed,
        totalDelayed
      };
    }
    const pendingCount = this.inMemoryQueue.filter((j) => j.status === "PENDING").length;
    const processingCount = this.inMemoryQueue.filter((j) => j.status === "PROCESSING").length;
    const dlqCount = this.inMemoryDLQ.length;
    for (const q of ALL_QUEUE_NAMES) {
      const qPending = this.inMemoryQueue.filter((j) => j.queue === q && j.status === "PENDING").length;
      const qProcessing = this.inMemoryQueue.filter((j) => j.queue === q && j.status === "PROCESSING").length;
      const qFailed = this.inMemoryDLQ.filter((j) => j.queue === q).length;
      queueStatsRecord[q] = {
        waiting: qPending,
        active: qProcessing,
        completed: 0,
        failed: qFailed,
        delayed: 0,
        paused: false
      };
    }
    return {
      isDistributed: false,
      mode: "in_memory_dev_fallback",
      queues: queueStatsRecord,
      totalWaiting: pendingCount,
      totalActive: processingCount,
      totalFailed: dlqCount,
      totalDelayed: 0
    };
  }
  async getFailedJobs(queueName, limit = 50) {
    if (this.isBullMqActive) {
      const results = [];
      const queuesToInspect = queueName ? [queueName] : ALL_QUEUE_NAMES;
      for (const qName of queuesToInspect) {
        const queue = this.bullQueues.get(qName);
        if (queue) {
          try {
            const failedJobs = await queue.getFailed(0, limit);
            for (const job of failedJobs) {
              results.push({
                id: job.id,
                queue: qName,
                name: job.name,
                data: sanitizePayload(job.data),
                failedReason: job.failedReason,
                stacktrace: job.stacktrace,
                attemptsMade: job.attemptsMade,
                timestamp: job.timestamp,
                processedOn: job.processedOn,
                finishedOn: job.finishedOn
              });
            }
          } catch (err) {
            logger.warn(`Failed to inspect DLQ for [${qName}]:`, { error: errorMessage(err) });
          }
        }
      }
      return results.slice(0, limit);
    }
    if (queueName) {
      return this.inMemoryDLQ.filter((j) => j.queue === queueName).slice(0, limit);
    }
    return this.inMemoryDLQ.slice(0, limit);
  }
  async retryFailedJob(queueName, jobId) {
    if (this.isBullMqActive) {
      const queue = this.bullQueues.get(queueName);
      if (queue) {
        const job = await queue.getJob(jobId);
        if (job && await job.isFailed()) {
          await job.retry();
          logger.info(`Retried failed job ${jobId} on queue ${queueName}`);
          return true;
        }
      }
      return false;
    }
    const dlqIdx = this.inMemoryDLQ.findIndex((j) => j.id === jobId && j.queue === queueName);
    if (dlqIdx !== -1) {
      const failedJob = this.inMemoryDLQ.splice(dlqIdx, 1)[0];
      await this.enqueueJob(queueName, failedJob.name, failedJob.data);
      return true;
    }
    return false;
  }
  async clearFailedJobs(queueName) {
    let clearedCount = 0;
    if (this.isBullMqActive) {
      const queuesToClean = queueName ? [queueName] : ALL_QUEUE_NAMES;
      for (const qName of queuesToClean) {
        const queue = this.bullQueues.get(qName);
        if (queue) {
          try {
            await queue.clean(0, 1e3, "failed");
            clearedCount += 1;
          } catch (err) {
            bestEffort(`queue.clean ${queueName}`)(err);
          }
        }
      }
      return clearedCount;
    }
    if (queueName) {
      const prevLen = this.inMemoryDLQ.length;
      this.inMemoryDLQ = this.inMemoryDLQ.filter((j) => j.queue !== queueName);
      return prevLen - this.inMemoryDLQ.length;
    }
    const count = this.inMemoryDLQ.length;
    this.inMemoryDLQ = [];
    return count;
  }
  /**
   * Gracefully close all BullMQ Queues and internal connections
   */
  async close() {
    logger.info("Closing DurableJobQueue queues and connections...");
    this.stopFallbackWorkerLoop();
    for (const [name, queue] of this.bullQueues.entries()) {
      try {
        await Promise.race([
          queue.close(),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ]);
        logger.info(`Closed BullMQ queue [${name}]`);
      } catch (err) {
        logger.warn(`Error closing BullMQ queue [${name}]:`, { error: errorMessage(err) });
      }
    }
    this.bullQueues.clear();
    for (const [clientName, client] of this.bullRedisClients.entries()) {
      try {
        if (client.status === "ready" || client.status === "connect") {
          await Promise.race([
            client.quit(),
            new Promise((resolve) => setTimeout(resolve, 1500))
          ]);
        } else {
          client.disconnect();
        }
        logger.info(`Closed Redis client for [${clientName}]`);
      } catch (err) {
        client.disconnect();
      }
    }
    this.bullRedisClients.clear();
    this.isBullMqActive = false;
  }
};
var jobQueue = new DurableJobQueue();

// src/server/repositories/booking.repository.ts
init_db();

// src/server/repositories/booking/booking-queries.repository.ts
var BookingQueryRepository = class {
  constructor(db) {
    this.db = db;
  }
  async findById(bookingId) {
    return this.db.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        user: true,
        items: {
          include: { ticketTier: true }
        },
        payments: true,
        attendance: true,
        tickets: {
          include: {
            ticketTier: true,
            ownerUser: true
          }
        },
        promoCode: true,
        splitShares: true,
        transfers: {
          include: {
            senderUser: true,
            claimedByUser: true,
            ticket: true
          }
        }
      }
    });
  }
  async findByIdempotencyKey(idempotencyKey) {
    if (!idempotencyKey) return null;
    return this.db.booking.findUnique({
      where: { idempotencyKey },
      include: {
        event: true,
        user: true,
        items: {
          include: { ticketTier: true }
        },
        payments: true,
        attendance: true,
        tickets: true,
        splitShares: true
      }
    });
  }
  async findByInvoiceNumber(invoiceNumber) {
    return this.db.booking.findUnique({
      where: { invoiceNumber },
      include: {
        event: true,
        user: true,
        items: {
          include: { ticketTier: true }
        },
        payments: true,
        attendance: true,
        tickets: true,
        promoCode: true,
        splitShares: true
      }
    });
  }
  async findByUserId(userId) {
    return this.db.booking.findMany({
      where: { userId },
      include: {
        event: true,
        items: {
          include: { ticketTier: true }
        },
        payments: true,
        attendance: true,
        tickets: {
          include: {
            ticketTier: true,
            ownerUser: true
          }
        },
        promoCode: true,
        splitShares: true,
        transfers: {
          include: {
            senderUser: true,
            claimedByUser: true,
            ticket: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async findByEventId(eventId) {
    return this.db.booking.findMany({
      where: { eventId },
      include: {
        user: true,
        items: {
          include: { ticketTier: true }
        },
        payments: true,
        attendance: true,
        tickets: true,
        promoCode: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async getAllConfirmedBookings() {
    return this.db.booking.findMany({
      where: { status: "CONFIRMED" },
      include: {
        event: true,
        user: true,
        items: {
          include: { ticketTier: true }
        },
        tickets: true,
        attendance: true,
        promoCode: true
      },
      orderBy: { createdAt: "desc" },
      take: 25
    });
  }
};

// src/server/repositories/booking/booking-reservation.repository.ts
init_crypto();
init_app_error();
init_error_message();
var BookingReservationRepository = class {
  constructor(db, queries) {
    this.db = db;
    this.queries = queries;
  }
  /**
   * Safe transactional booking reservation.
   * Decrements capacity (increases reserved) inside a transaction to prevent race conditions.
   * Supports seat holds and idempotency key.
   */
  async createReservation(data) {
    if (data.idempotencyKey) {
      const existing = await this.queries.findByIdempotencyKey(data.idempotencyKey);
      if (existing) {
        return existing;
      }
    }
    try {
      return await this.db.$transaction(async (tx) => {
        const event = await tx.event.findUnique({
          where: { id: data.eventId }
        });
        if (!event) {
          throw new NotFoundError("Event not found.");
        }
        if (event.status !== "PUBLISHED" && event.status !== "LIVE") {
          throw new BadRequestError("Unpublished events cannot accept booking reservations.");
        }
        let totalAmount = 0;
        const bookingItemsData = [];
        const createdTicketsData = [];
        const tierRows = await tx.ticketTier.findMany({
          where: { id: { in: [...new Set(data.items.map((i) => i.ticketTierId))] } }
        });
        const tierById = new Map(tierRows.map((t) => [t.id, t]));
        for (const item of data.items) {
          if (item.quantity <= 0) {
            throw new NotFoundError("Quantity must be greater than zero.");
          }
          const tier = tierById.get(item.ticketTierId);
          if (!tier) {
            throw new NotFoundError("Ticket tier does not exist.");
          }
          if (tier.eventId !== data.eventId) {
            throw new BadRequestError(`Ticket tier '${tier.name}' does not belong to the requested event.`);
          }
          const updateCount = await tx.$executeRaw`
            UPDATE "TicketTier"
            SET "reserved" = "reserved" + ${item.quantity}
            WHERE "id" = ${item.ticketTierId}
              AND ("capacity" - ("sold" + "reserved")) >= ${item.quantity}
          `;
          if (updateCount === 0) {
            throw new ConflictError(`Insufficient tickets remaining for tier: ${tier.name}.`);
          }
          const subtotal = tier.price * item.quantity;
          totalAmount += subtotal;
          const seatLabels = item.seatNumbers ? item.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean) : [];
          if (event.hasSeatingPlan && seatLabels.length > 0) {
            if (seatLabels.length !== item.quantity) {
              throw new ConflictError(`Number of selected seats (${seatLabels.length}) must match ticket quantity (${item.quantity}).`);
            }
            if (new Set(seatLabels).size !== seatLabels.length) {
              throw new ConflictError("The same seat was selected more than once.");
            }
            const now = /* @__PURE__ */ new Date();
            const existingSeats = await tx.eventSeat.findMany({
              where: { eventId: data.eventId, seatLabel: { in: seatLabels } }
            });
            const seatByLabel = new Map(existingSeats.map((seat) => [seat.seatLabel, seat]));
            const claimIds = [];
            const labelsToCreate = [];
            for (const seatLabel of seatLabels) {
              const existingSeat = seatByLabel.get(seatLabel);
              if (!existingSeat) {
                labelsToCreate.push(seatLabel);
                continue;
              }
              if (existingSeat.status === "SOLD") {
                throw new ConflictError(`Seat ${seatLabel} has already been sold.`);
              }
              if (existingSeat.status === "HELD" && existingSeat.heldUntil && existingSeat.heldUntil > now) {
                throw new ConflictError(`Seat ${seatLabel} is currently held by another reservation.`);
              }
              claimIds.push(existingSeat.id);
            }
            const claimedMessage = "A selected seat was just claimed by another customer. Please select different seats.";
            if (claimIds.length > 0) {
              const seatUpdate = await tx.eventSeat.updateMany({
                where: {
                  id: { in: claimIds },
                  OR: [
                    { status: "AVAILABLE" },
                    { status: "HELD", heldUntil: { lte: now } },
                    { status: "HELD", heldUntil: null }
                  ]
                },
                data: {
                  status: "HELD",
                  bookingId: null,
                  // set after the booking is created
                  heldUntil: data.reservedUntil
                }
              });
              if (seatUpdate.count !== claimIds.length) {
                throw new ConflictError(claimedMessage);
              }
            }
            if (labelsToCreate.length > 0) {
              const created = await tx.eventSeat.createMany({
                data: labelsToCreate.map((seatLabel) => ({
                  eventId: data.eventId,
                  seatLabel,
                  status: "HELD",
                  heldUntil: data.reservedUntil
                })),
                skipDuplicates: true
              });
              if (created.count !== labelsToCreate.length) {
                throw new ConflictError(claimedMessage);
              }
            }
          }
          bookingItemsData.push({
            ticketTierId: item.ticketTierId,
            quantity: item.quantity,
            subtotal,
            seatNumbers: item.seatNumbers || null
          });
          for (let i = 0; i < item.quantity; i++) {
            const tktHex = generateSecureToken(4).toUpperCase();
            const seatForTicket = seatLabels[i] || null;
            createdTicketsData.push({
              ticketNumber: `TKT-${tktHex}`,
              ticketTierId: item.ticketTierId,
              ownerUserId: data.userId,
              seatNumber: seatForTicket,
              status: "RESERVED",
              verifiedCollegeEmail: data.verifiedCollegeEmail || null
            });
          }
        }
        const booking = await tx.booking.create({
          data: {
            userId: data.userId,
            eventId: data.eventId,
            verifiedCollegeEmail: data.verifiedCollegeEmail || null,
            invoiceNumber: data.invoiceNumber || `INV-${Date.now().toString(36).toUpperCase()}-${generateSecureToken(3).toUpperCase()}`,
            reservedUntil: data.reservedUntil,
            idempotencyKey: data.idempotencyKey || null,
            totalAmount,
            status: "RESERVED",
            isSplitBooking: data.isSplitBooking ?? false,
            splitTotalShares: data.isSplitBooking ? data.splitShares?.length || 0 : 1,
            items: {
              create: bookingItemsData
            },
            splitShares: data.isSplitBooking && data.splitShares ? {
              create: data.splitShares.map((share) => ({
                friendName: share.friendName,
                email: share.email,
                amount: share.amount,
                isPaid: false
              }))
            } : void 0,
            tickets: {
              create: createdTicketsData
            }
          },
          include: {
            items: {
              include: { ticketTier: true }
            },
            tickets: true,
            splitShares: true
          }
        });
        for (const item of data.items) {
          if (item.seatNumbers) {
            const seatLabels = item.seatNumbers.split(",").map((s) => s.trim()).filter(Boolean);
            if (seatLabels.length > 0) {
              await tx.eventSeat.updateMany({
                where: { eventId: data.eventId, seatLabel: { in: seatLabels } },
                data: { bookingId: booking.id }
              });
            }
          }
        }
        return booking;
      }, {
        // Statements are capped at 3 s by the pooler; a reservation that needs more than 10 s should fail fast
        maxWait: 5e3,
        timeout: 1e4
      });
    } catch (err) {
      if (data.idempotencyKey && (errorCode(err) === "P2002" || errorMessage(err)?.includes("idempotencyKey") || errorMessage(err)?.includes("Unique constraint failed"))) {
        for (let attempt = 0; attempt < 5; attempt++) {
          const existing = await this.queries.findByIdempotencyKey(data.idempotencyKey);
          if (existing) {
            return existing;
          }
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }
      throw err;
    }
  }
};

// src/server/repositories/booking/booking-confirmation.repository.ts
init_crypto();
init_logger();
init_app_error();
var BookingConfirmationRepository = class {
  constructor(db) {
    this.db = db;
  }
  /**
   * Resolves reservation to full checkout atomically.
   */
  async confirmBooking(bookingId, transactionId, method, rzpDetails, options) {
    return this.db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          items: true,
          user: true,
          tickets: true
        }
      });
      if (!booking) {
        throw new NotFoundError("Booking not found.");
      }
      if (booking.status === "CONFIRMED") {
        const unconfirmedTickets = booking.tickets.filter((t) => t.status !== "CONFIRMED" || !t.qrToken);
        if (unconfirmedTickets.length > 0) {
          const userEmail2 = booking.user?.email || "attendee@happenins.com";
          for (const ticket of unconfirmedTickets) {
            const qrHash = ticket.qrToken || generateQRHash(ticket.id, userEmail2);
            await tx.ticket.update({
              where: { id: ticket.id },
              data: {
                status: "CONFIRMED",
                qrToken: qrHash
              }
            });
          }
        }
        return booking;
      }
      if (booking.status === "EXPIRED" || booking.status === "CANCELLED") {
        throw new ConflictError(`Cannot confirm payment for booking in '${booking.status}' status.`);
      }
      const graceMs = options?.allowGracePeriod ? (options.gracePeriodMinutes ?? 15) * 60 * 1e3 : 0;
      const effectiveExpiry = new Date(booking.reservedUntil.getTime() + graceMs);
      if (/* @__PURE__ */ new Date() > effectiveExpiry) {
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: "EXPIRED" }
        });
        throw new ConflictError("Reservation has expired. Payment confirmation rejected.");
      }
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CONFIRMED",
          razorpayOrderId: rzpDetails?.razorpayOrderId || booking.razorpayOrderId,
          razorpayPaymentId: rzpDetails?.razorpayPaymentId || transactionId
        }
      });
      for (const item of booking.items) {
        await tx.ticketTier.update({
          where: { id: item.ticketTierId },
          data: {
            reserved: { decrement: item.quantity },
            sold: { increment: item.quantity }
          }
        });
      }
      await tx.eventSeat.updateMany({
        where: { bookingId },
        data: {
          status: "SOLD",
          heldUntil: null
        }
      });
      const userEmail = booking.user?.email || "attendee@happenins.com";
      let primaryQrHash = "";
      for (const ticket of booking.tickets) {
        const qrHash = generateQRHash(ticket.id, userEmail);
        if (!primaryQrHash) primaryQrHash = qrHash;
        await tx.ticket.update({
          where: { id: ticket.id },
          data: {
            status: "CONFIRMED",
            qrToken: qrHash
          }
        });
      }
      if (!primaryQrHash) {
        primaryQrHash = generateQRHash(bookingId, userEmail);
      }
      await tx.attendance.upsert({
        where: { bookingId },
        create: {
          bookingId,
          qrHash: primaryQrHash
        },
        update: {
          qrHash: primaryQrHash
        }
      });
      await tx.payment.upsert({
        where: { transactionId },
        create: {
          bookingId,
          transactionId,
          razorpayOrderId: rzpDetails?.razorpayOrderId || booking.razorpayOrderId,
          razorpayPaymentId: rzpDetails?.razorpayPaymentId || transactionId,
          razorpaySignature: rzpDetails?.razorpaySignature,
          provider: rzpDetails?.razorpayPaymentId ? "RAZORPAY" : "LOCAL",
          amount: booking.totalAmount,
          currency: "INR",
          status: "CAPTURED",
          method,
          reconciledAt: /* @__PURE__ */ new Date()
        },
        update: {
          status: "CAPTURED",
          reconciledAt: /* @__PURE__ */ new Date(),
          razorpayOrderId: rzpDetails?.razorpayOrderId || void 0,
          razorpayPaymentId: rzpDetails?.razorpayPaymentId || void 0,
          razorpaySignature: rzpDetails?.razorpaySignature || void 0
        }
      });
      return updatedBooking;
    });
  }
  /**
   * Atomically and idempotently expires a specific booking and releases capacities & seats.
   * Uses conditional update (status === "RESERVED" AND reservedUntil < now) to prevent double-decrements.
   */
  async releaseExpiredBooking(bookingId) {
    return this.db.$transaction(async (tx) => {
      const updated = await tx.booking.updateMany({
        where: {
          id: bookingId,
          status: "RESERVED",
          reservedUntil: { lt: /* @__PURE__ */ new Date() }
        },
        data: { status: "EXPIRED" }
      });
      if (updated.count === 0) {
        return false;
      }
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true }
      });
      if (!booking) return false;
      await tx.ticket.updateMany({
        where: { bookingId: booking.id },
        data: { status: "CANCELLED" }
      });
      await tx.eventSeat.updateMany({
        where: { bookingId: booking.id, status: "HELD" },
        data: {
          status: "AVAILABLE",
          bookingId: null,
          heldUntil: null
        }
      });
      for (const item of booking.items) {
        await tx.ticketTier.update({
          where: { id: item.ticketTierId },
          data: {
            reserved: { decrement: item.quantity }
          }
        });
      }
      return true;
    });
  }
  /**
   * Sweeps expired reservations and releases capacities & seats idempotently.
   * Safe across multiple concurrent workers.
   */
  async releaseExpiredReservations() {
    const expiredReservations = await this.db.booking.findMany({
      where: {
        status: "RESERVED",
        reservedUntil: { lt: /* @__PURE__ */ new Date() }
      },
      select: { id: true },
      take: 100
      // Batch limit to prevent transaction bottlenecks
    });
    if (expiredReservations.length === 0) return 0;
    let releasedCount = 0;
    for (const b of expiredReservations) {
      try {
        const released = await this.releaseExpiredBooking(b.id);
        if (released) releasedCount++;
      } catch (err) {
        logger.error("Failed to release expired booking", { bookingId: b.id, message: err instanceof Error ? err.message : String(err) });
      }
    }
    return releasedCount;
  }
};

// src/server/repositories/booking/booking-transfer.repository.ts
init_app_error();
var BookingTransferRepository = class {
  constructor(db) {
    this.db = db;
  }
  async applyPromoCode(bookingId, promoCodeId, discountAmount) {
    return this.db.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId }
      });
      if (!booking) throw new NotFoundError("Booking not found");
      const originalTotal = booking.totalAmount + booking.discountAmount;
      const newTotal = Math.max(0, originalTotal - discountAmount);
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } }
      });
      return tx.booking.update({
        where: { id: bookingId },
        data: {
          promoCodeId,
          discountAmount,
          totalAmount: newTotal
        },
        include: {
          event: true,
          items: {
            include: { ticketTier: true }
          },
          payments: true,
          tickets: true,
          attendance: true
        }
      });
    });
  }
  // TICKET TRANSFER METHODS
  async createTransfer(data) {
    return this.db.ticketTransfer.create({
      data: {
        bookingId: data.bookingId,
        ticketId: data.ticketId || null,
        senderUserId: data.senderUserId,
        recipientEmail: data.recipientEmail.toLowerCase().trim(),
        recipientName: data.recipientName?.trim(),
        transferCode: data.transferCode,
        note: data.note?.trim(),
        expiresAt: data.expiresAt,
        status: "PENDING"
      },
      include: {
        booking: {
          include: {
            event: true,
            items: { include: { ticketTier: true } }
          }
        },
        ticket: true,
        senderUser: true
      }
    });
  }
  async findTransferByCode(transferCode) {
    return this.db.ticketTransfer.findUnique({
      where: { transferCode },
      include: {
        booking: {
          include: {
            event: {
              include: { accessPolicy: true }
            },
            items: { include: { ticketTier: true } },
            tickets: true
          }
        },
        ticket: {
          include: {
            ticketTier: true
          }
        },
        senderUser: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });
  }
  async findTransfersByUserId(userId) {
    return this.db.ticketTransfer.findMany({
      where: {
        OR: [{ senderUserId: userId }, { claimedByUserId: userId }]
      },
      include: {
        booking: {
          include: {
            event: true,
            items: { include: { ticketTier: true } }
          }
        },
        ticket: true,
        senderUser: true,
        claimedByUser: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async cancelTransfer(transferId, senderUserId) {
    const transfer = await this.db.ticketTransfer.findUnique({
      where: { id: transferId }
    });
    if (!transfer) throw new NotFoundError("Ticket transfer record not found.");
    if (transfer.senderUserId !== senderUserId) throw new ForbiddenError("Unauthorized to cancel this transfer.");
    if (transfer.status !== "PENDING") throw new ConflictError(`Cannot cancel transfer in '${transfer.status}' status.`);
    return this.db.ticketTransfer.update({
      where: { id: transferId },
      data: { status: "CANCELLED" }
    });
  }
  async claimTransfer(transferCode, recipientUserId, recipientEmail, newQrHash) {
    return this.db.$transaction(async (tx) => {
      const transfer = await tx.ticketTransfer.findUnique({
        where: { transferCode },
        include: {
          booking: {
            include: { event: { include: { accessPolicy: true } } }
          },
          ticket: true
        }
      });
      if (!transfer) throw new NotFoundError("Transfer record not found.");
      if (transfer.status !== "PENDING") throw new ConflictError(`Transfer is no longer pending (Current: ${transfer.status}).`);
      if (/* @__PURE__ */ new Date() > transfer.expiresAt) {
        await tx.ticketTransfer.update({ where: { id: transfer.id }, data: { status: "EXPIRED" } });
        throw new ConflictError("This ticket transfer link has expired.");
      }
      if (transfer.senderUserId === recipientUserId) {
        throw new BadRequestError("You cannot claim a ticket transfer sent by yourself.");
      }
      const claimed = await tx.ticketTransfer.updateMany({
        where: { id: transfer.id, status: "PENDING" },
        data: {
          status: "CLAIMED",
          claimedByUserId: recipientUserId,
          claimedAt: /* @__PURE__ */ new Date()
        }
      });
      if (claimed.count !== 1) {
        throw new ConflictError("Transfer is no longer pending (it was just claimed or cancelled).");
      }
      const updatedTransfer = await tx.ticketTransfer.findUniqueOrThrow({ where: { id: transfer.id } });
      if (transfer.ticketId) {
        await tx.ticket.update({
          where: { id: transfer.ticketId },
          data: {
            ownerUserId: recipientUserId,
            qrToken: newQrHash,
            status: "CONFIRMED"
          }
        });
      } else {
        await tx.ticket.updateMany({
          where: { bookingId: transfer.bookingId },
          data: {
            ownerUserId: recipientUserId,
            qrToken: newQrHash,
            status: "CONFIRMED"
          }
        });
        await tx.booking.update({
          where: { id: transfer.bookingId },
          data: { userId: recipientUserId }
        });
      }
      return updatedTransfer;
    });
  }
};

// src/server/repositories/booking.repository.ts
var BookingRepository = class {
  constructor() {
    this.prisma = getPrisma();
    this.queries = new BookingQueryRepository(this.prisma);
    this.reservations = new BookingReservationRepository(this.prisma, this.queries);
    this.confirmations = new BookingConfirmationRepository(this.prisma);
    this.transfers = new BookingTransferRepository(this.prisma);
  }
  findById(bookingId) {
    return this.queries.findById(bookingId);
  }
  findByIdempotencyKey(idempotencyKey) {
    return this.queries.findByIdempotencyKey(idempotencyKey);
  }
  findByInvoiceNumber(invoiceNumber) {
    return this.queries.findByInvoiceNumber(invoiceNumber);
  }
  findByUserId(userId) {
    return this.queries.findByUserId(userId);
  }
  findByEventId(eventId) {
    return this.queries.findByEventId(eventId);
  }
  getAllConfirmedBookings() {
    return this.queries.getAllConfirmedBookings();
  }
  createReservation(data) {
    return this.reservations.createReservation(data);
  }
  confirmBooking(...args) {
    return this.confirmations.confirmBooking(...args);
  }
  releaseExpiredBooking(bookingId) {
    return this.confirmations.releaseExpiredBooking(bookingId);
  }
  releaseExpiredReservations() {
    return this.confirmations.releaseExpiredReservations();
  }
  applyPromoCode(bookingId, promoCodeId, discountAmount) {
    return this.transfers.applyPromoCode(bookingId, promoCodeId, discountAmount);
  }
  createTransfer(data) {
    return this.transfers.createTransfer(data);
  }
  findTransferByCode(transferCode) {
    return this.transfers.findTransferByCode(transferCode);
  }
  findTransfersByUserId(userId) {
    return this.transfers.findTransfersByUserId(userId);
  }
  cancelTransfer(transferId, senderUserId) {
    return this.transfers.cancelTransfer(transferId, senderUserId);
  }
  claimTransfer(transferCode, recipientUserId, recipientEmail, newQrHash) {
    return this.transfers.claimTransfer(transferCode, recipientUserId, recipientEmail, newQrHash);
  }
};

// src/server/utils/emailService.ts
var import_nodemailer2 = __toESM(require("nodemailer"), 1);
init_logger();

// src/server/utils/multiSmtpRouter.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
init_logger();
init_error_message();
var accounts = {
  STAGE_1: {
    name: "Venture Vault Stage 1",
    user: (process.env.SMTP_STAGE1_USER || "happenins.in@gmail.com").trim(),
    pass: (process.env.SMTP_STAGE1_PASS || "cbki derz zzxy vrxs").replace(/\s+/g, "").trim(),
    from: (process.env.SMTP_STAGE1_FROM || '"Venture Vault Round 1" <happenins.in@gmail.com>').trim()
  },
  STAGE_2: {
    name: "Venture Vault Stage 2",
    user: (process.env.SMTP_STAGE2_USER || "happenins.co@gmail.com").trim(),
    pass: (process.env.SMTP_STAGE2_PASS || "ardk sjmr enzc jpth").replace(/\s+/g, "").trim(),
    from: (process.env.SMTP_STAGE2_FROM || '"Venture Vault Round 2" <happenins.co@gmail.com>').trim()
  },
  STAGE_3: {
    name: "Venture Vault Stage 3",
    user: (process.env.SMTP_STAGE3_USER || "happenins.events@gmail.com").trim(),
    pass: (process.env.SMTP_STAGE3_PASS || "ktxs uxet fhqo fmjw").replace(/\s+/g, "").trim(),
    from: (process.env.SMTP_STAGE3_FROM || '"Venture Vault Round 3" <happenins.events@gmail.com>').trim()
  },
  AUTH: {
    name: "Happenins Auth / Primary",
    user: (process.env.SMTP_USER || "happenins.co.in@gmail.com").trim(),
    pass: (process.env.SMTP_PASS || "urib grwo pndt mtme").replace(/\s+/g, "").trim(),
    from: (process.env.SMTP_FROM || '"Happenins Events" <happenins.co.in@gmail.com>').trim()
  }
};
function createTransporter(account) {
  return import_nodemailer.default.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: account.user,
      pass: account.pass
    },
    connectionTimeout: 15e3,
    greetingTimeout: 15e3,
    socketTimeout: 2e4
  });
}
function getTransporter(accountKey) {
  const acc = accounts[accountKey] || accounts.AUTH;
  if (!acc.transport) {
    acc.transport = createTransporter(acc);
  }
  return { transporter: acc.transport, account: acc };
}
async function sendVentureMail(options) {
  const primaryKey = options.stage === 1 ? "STAGE_1" : options.stage === 2 ? "STAGE_2" : options.stage === 3 ? "STAGE_3" : "AUTH";
  const fallbackOrder = [primaryKey, "STAGE_1", "STAGE_3", "AUTH"].filter((v, i, a) => a.indexOf(v) === i);
  let lastError = "";
  for (const key of fallbackOrder) {
    try {
      const { transporter, account } = getTransporter(key);
      const info = await transporter.sendMail({
        from: account.from,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.subject
      });
      logger.info(`[MULTI-SMTP] Dispatched to ${options.to} via ${account.name} (${account.user}) [MsgId: ${info.messageId}]`);
      return {
        success: true,
        messageId: info.messageId,
        sentVia: account.user
      };
    } catch (err) {
      lastError = errorMessage(err);
      logger.warn(`[MULTI-SMTP] Account ${key} failed to send to ${options.to}: ${lastError}. Attempting fallback...`);
    }
  }
  logger.error(`[MULTI-SMTP ERROR] All fallback transporters failed for ${options.to}: ${lastError}`);
  return {
    success: false,
    error: lastError,
    sentVia: "FAILED"
  };
}

// src/lib/formatters.ts
var formatRupees = (amount, isCents = true) => {
  if (amount === 0) return "FREE";
  const val = isCents ? amount / 100 : amount;
  return `\u20B9${val.toLocaleString("en-IN", {
    minimumFractionDigits: val % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  })}`;
};
var getISTDateString = (dateInput = /* @__PURE__ */ new Date()) => {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(d);
  } catch {
    return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  }
};
var formatDateIST = (dateInput, options) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const defaultOptions = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };
  const mergedOptions = {
    timeZone: "Asia/Kolkata",
    ...options ? options : defaultOptions
  };
  mergedOptions.timeZone = "Asia/Kolkata";
  const formatted = d.toLocaleString("en-IN", mergedOptions).replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  const hasTime = mergedOptions.hour || mergedOptions.minute || mergedOptions.timeStyle;
  if (hasTime && !formatted.includes("IST")) {
    return `${formatted} IST`;
  }
  return formatted;
};
var formatTimeIST = (dateInput, includeSeconds = false, includeSuffix = true) => {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  const opts = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };
  if (includeSeconds) {
    opts.second = "2-digit";
  }
  const timeStr = d.toLocaleTimeString("en-IN", opts).replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  return includeSuffix ? `${timeStr} IST` : timeStr;
};
var formatCSVDateTimeIST = (dateInput) => {
  if (!dateInput) return "N/A";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "N/A";
  const dtStr = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(d).replace(/\b(am|pm)\b/i, (m) => m.toUpperCase());
  return `${dtStr} IST`;
};

// src/server/config/email.ts
function getEmailConfig() {
  const user = (process.env.SMTP_USER || "").trim();
  const host = (process.env.SMTP_HOST || (user.toLowerCase().includes("@gmail.com") ? "smtp.gmail.com" : "")).trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const rawPass = (process.env.SMTP_PASS || (user ? process.env.SMTP_SECRET : "") || "").trim();
  const pass = rawPass.replace(/\s+/g, "").trim();
  const rawFrom = (process.env.SMTP_FROM || user || "").trim();
  const fromAddress = rawFrom ? rawFrom.includes("<") ? rawFrom : `"Happenins Events" <${rawFrom}>` : "";
  const isConfigured = !!(host && user && pass);
  return {
    host,
    port,
    user,
    pass,
    from: fromAddress,
    isConfigured
  };
}

// src/server/utils/emailService.ts
init_error_message();
var memoryEmails = [];
var getEmailsForUser = (emailAddress) => {
  if (!emailAddress) return [];
  return memoryEmails.filter(
    (e) => e.to.toLowerCase().trim() === emailAddress.toLowerCase().trim()
  );
};
var escapeHtml = (v) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
var toSafeHtmlLine = (line) => escapeHtml(line).replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}" style="color: #7c3aed;">${url}</a>`);
var buildDeliverableHtml = (subject, bodyText, customHtml) => {
  if (customHtml) return customHtml;
  const formattedLines = bodyText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0).map((line) => `<p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.6; color: #334155;">${toSafeHtmlLine(line)}</p>`).join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <tr>
            <td style="background-color: #09091b; padding: 28px 32px; text-align: left;">
              <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                Happenins <span style="color: #a855f7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">\u2022 Verified Ticket Registry</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px; text-align: left;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a; letter-spacing: -0.3px;">${escapeHtml(subject)}</h2>
              ${formattedLines}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f1f5f9; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; line-height: 1.5; text-align: left;">
              <p style="margin: 0 0 6px 0; font-weight: 600; color: #475569;">Authentic Transactional Communication</p>
              <p style="margin: 0;">This email was sent from an automated system to confirm your account activity or ticket status.</p>
              <p style="margin: 8px 0 0 0; color: #94a3b8;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Happenins Marketplace. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};
async function deliverTransactionalEmail(data) {
  const isTest = process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  const isProd = process.env.NODE_ENV === "production";
  if (data.messageId && memoryEmails.some((e) => e.id === data.messageId)) {
    logger.info("Skipping duplicate email delivery attempt:", { messageId: data.messageId, to: data.to });
    return;
  }
  const istSentAt = formatDateIST(/* @__PURE__ */ new Date(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  memoryEmails.unshift({
    id: data.messageId,
    to: data.to,
    subject: isProd ? "[redacted]" : data.subject,
    body: isProd ? "" : data.body,
    sentAt: istSentAt
  });
  if (memoryEmails.length > 150) {
    memoryEmails.length = 150;
  }
  if (isTest) {
    return;
  }
  const finalHtml = buildDeliverableHtml(data.subject, data.body, data.html);
  try {
    const res = await sendVentureMail({
      stage: "AUTH",
      to: data.to,
      subject: data.subject,
      html: finalHtml,
      text: data.body
    });
    if (res.success) {
      logger.info(`[TRANSACTIONAL EMAIL] Successfully delivered to ${data.to} via ${res.sentVia} [MsgId: ${data.messageId}]`);
    } else {
      logger.error(`[TRANSACTIONAL EMAIL ERROR] Delivery failed for ${data.to}: ${res.error}`);
      throw new Error(`SMTP_DELIVERY_FAILED: ${res.error}`);
    }
  } catch (err) {
    const sanitizedError = (errorMessage(err) || "").replace(/pass(?:word)?\s*[:=]\s*[^\s]+/gi, "password=[REDACTED]");
    logger.error(`SMTP delivery failed for ${data.to}:`, { messageId: data.messageId, error: sanitizedError });
    throw new Error(`SMTP_DELIVERY_FAILED: ${sanitizedError}`);
  }
}
async function enqueueTransactionalEmail(to, subject, body, htmlContent, customMessageId) {
  const messageId = customMessageId || `eml_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const emailData = {
    to,
    subject,
    body,
    html: htmlContent,
    messageId
  };
  await deliverTransactionalEmail(emailData);
  return messageId;
}
var sendSimulatedEmail = (to, subject, body, htmlContent) => {
  const id = "eml_" + Math.random().toString(36).substring(2, 11);
  const emailData = {
    to,
    subject,
    body,
    html: htmlContent,
    messageId: id
  };
  const deliveryPromise = deliverTransactionalEmail(emailData).catch((err) => {
    logger.warn("Failed to deliver transactional email:", { error: err.message, messageId: id });
  });
  const record = {
    id,
    to,
    subject,
    body,
    sentAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  return Object.assign(deliveryPromise.then(() => record), record);
};

// src/server/jobs/workers.ts
init_redis2();

// src/server/services/inventory-fast-path.service.ts
init_redis2();
init_db();
init_logger();
init_metrics();
init_best_effort();
init_app_error();
init_error_message();
var LUA_ATOMIC_INVENTORY_HOLD = `
-- KEYS[1]: Inventory tier stock key (e.g. happenins:inventory:tier:{ticketTierId})
-- KEYS[2]: Seat hold lock key (optional, e.g. happenins:lock:seat:{eventId}:{seatLabel} or empty string)
-- ARGV[1]: Requested quantity
-- ARGV[2]: Lock owner identifier (e.g. userId or bookingRef)
-- ARGV[3]: Hold TTL in seconds (e.g. 600)

local stockRaw = redis.call('get', KEYS[1])
if not stockRaw then
  return -2 -- Cache miss: stock needs initial sync from database
end

local currentStock = tonumber(stockRaw)
local requestedQty = tonumber(ARGV[1])

if currentStock < requestedQty then
  return -1 -- SOLD OUT: Return immediately without touching SQL
end

-- Check seat lock if provided
if KEYS[2] and KEYS[2] ~= '' then
  local seatHeld = redis.call('exists', KEYS[2])
  if seatHeld == 1 then
    return -3 -- SEAT HELD: Seat already reserved by another user
  end
end

-- Atomic decrement and seat lock
redis.call('decrby', KEYS[1], requestedQty)

if KEYS[2] and KEYS[2] ~= '' then
  redis.call('set', KEYS[2], ARGV[2], 'EX', tonumber(ARGV[3]))
end

return 1 -- SUCCESS
`;
var LUA_MULTI_ITEM_INVENTORY_HOLD = `
-- KEYS:
--   KEYS[1..N]: Tier stock keys
--   KEYS[N+1..N+M]: Seat lock keys
-- ARGV:
--   ARGV[1]: Number of tier keys (N)
--   ARGV[2]: Number of seat keys (M)
--   ARGV[3..2+N]: Quantities for each tier
--   ARGV[3+N]: Lock owner (userId)
--   ARGV[4+N]: TTL in seconds (default 600)

local numTiers = tonumber(ARGV[1])
local numSeats = tonumber(ARGV[2])
local owner = ARGV[3 + numTiers]
local ttl = tonumber(ARGV[4 + numTiers] or 600)

-- Phase 1: Validate all tier stocks
for i = 1, numTiers do
  local tierKey = KEYS[i]
  local qty = tonumber(ARGV[2 + i])
  local stockRaw = redis.call('get', tierKey)
  
  if not stockRaw then
    return -2 -- Cache miss on tier
  end
  
  local currentStock = tonumber(stockRaw)
  if currentStock < qty then
    return -1 -- SOLD OUT: Insufficient tickets remaining
  end
end

-- Phase 2: Validate all seat locks
for s = 1, numSeats do
  local seatKey = KEYS[numTiers + s]
  if redis.call('exists', seatKey) == 1 then
    return -3 -- SEAT HELD
  end
end

-- Phase 3: Atomically commit all holds
for i = 1, numTiers do
  local tierKey = KEYS[i]
  local qty = tonumber(ARGV[2 + i])
  redis.call('decrby', tierKey, qty)
end

for s = 1, numSeats do
  local seatKey = KEYS[numTiers + s]
  redis.call('set', seatKey, owner, 'EX', ttl)
end

return 1 -- SUCCESS
`;
var LUA_RELEASE_INVENTORY_HOLD = `
-- KEYS:
--   KEYS[1..N]: Tier stock keys
--   KEYS[N+1..N+M]: Seat lock keys
-- ARGV:
--   ARGV[1]: Number of tier keys (N)
--   ARGV[2]: Number of seat keys (M)
--   ARGV[3..2+N]: Quantities to refund back to each tier

local numTiers = tonumber(ARGV[1])
local numSeats = tonumber(ARGV[2])

for i = 1, numTiers do
  local tierKey = KEYS[i]
  local qty = tonumber(ARGV[2 + i])
  redis.call('incrby', tierKey, qty)
end

for s = 1, numSeats do
  local seatKey = KEYS[numTiers + s]
  redis.call('del', seatKey)
end

return 1
`;
var FastPathInventoryService = class {
  constructor() {
    this.prisma = getPrisma();
    // In-memory fallback stores when Redis is not available
    this.inMemoryStock = /* @__PURE__ */ new Map();
    this.inMemorySeatHolds = /* @__PURE__ */ new Map();
  }
  /**
   * Warms up / syncs stock for a specific ticket tier from the database into Redis.
   */
  /**
   * Loads a tier's remaining stock from the database into Redis.
   * By default this only INITIALISES a missing counter (SET NX). Under a cold-cache stampede many requests warm
   * the same tier at once; an unconditional SET would overwrite decrements made by requests that already won.
   * Pass { overwrite: true } for an explicit administrative re-sync.
   */
  async syncTierStock(tierId, options = {}) {
    const tier = await this.prisma.ticketTier.findUnique({
      where: { id: tierId },
      select: { id: true, capacity: true, sold: true, reserved: true }
    });
    if (!tier) {
      throw new NotFoundError(`Ticket tier not found: ${tierId}`);
    }
    const availableStock = Math.max(0, tier.capacity - (tier.sold + tier.reserved));
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      const key = RedisKeys.inventoryTier(tierId);
      if (options.overwrite) {
        await redis.set(key, availableStock.toString(), "EX", 86400);
      } else {
        await redis.set(key, availableStock.toString(), "EX", 86400, "NX");
      }
    } else if (options.overwrite || !this.inMemoryStock.has(tierId)) {
      this.inMemoryStock.set(tierId, availableStock);
    }
    return availableStock;
  }
  /**
   * Pre-warms all tiers of an event in Redis RAM for instantaneous checkout response.
   */
  async syncEventTiers(eventId) {
    const tiers = await this.prisma.ticketTier.findMany({
      where: { eventId },
      select: { id: true, capacity: true, sold: true, reserved: true }
    });
    const stockMap = {};
    for (const tier of tiers) {
      const available = Math.max(0, tier.capacity - (tier.sold + tier.reserved));
      stockMap[tier.id] = available;
      const redis = getRedisClient();
      if (redis && isRedisAvailable()) {
        await redis.set(RedisKeys.inventoryTier(tier.id), available.toString(), "EX", 86400);
      } else {
        this.inMemoryStock.set(tier.id, available);
      }
    }
    return stockMap;
  }
  /**
   * Fast-Path Atomic Inventory & Seat Hold via Redis Lua Scripts.
   * Executed BEFORE touching PostgreSQL.
   * Latency: ~0.3ms to 1.5ms.
   */
  async atomicHold(params) {
    const start = performance.now();
    const ttl = params.ttlSeconds || 600;
    const redis = getRedisClient();
    const seatKeys = [];
    for (const item of params.items) {
      if (item.seatNumbers) {
        const labels = item.seatNumbers.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
        for (const label of labels) {
          seatKeys.push(RedisKeys.seatLock(params.eventId, label));
        }
      }
    }
    const tierKeys = params.items.map((i) => RedisKeys.inventoryTier(i.ticketTierId));
    const quantities = params.items.map((i) => i.quantity);
    if (redis && isRedisAvailable()) {
      try {
        const runLua = async () => {
          if (params.items.length === 1 && seatKeys.length <= 1) {
            const res = await redis.eval(
              LUA_ATOMIC_INVENTORY_HOLD,
              2,
              tierKeys[0],
              seatKeys[0] || "",
              quantities[0],
              params.userId,
              ttl
            );
            return Number(res);
          } else {
            const allKeys = [...tierKeys, ...seatKeys];
            const allArgs = [
              tierKeys.length.toString(),
              seatKeys.length.toString(),
              ...quantities.map(String),
              params.userId,
              ttl.toString()
            ];
            const res = await redis.eval(
              LUA_MULTI_ITEM_INVENTORY_HOLD,
              allKeys.length,
              ...allKeys,
              ...allArgs
            );
            return Number(res);
          }
        };
        let result = await runLua();
        if (result === -2) {
          logger.info("[FAST-PATH REDIS] Tier cache miss, syncing tier stock from database...");
          for (const item of params.items) {
            await this.syncTierStock(item.ticketTierId);
          }
          result = await runLua();
        }
        const latencyMs = Number((performance.now() - start).toFixed(2));
        if (result === -1) {
          metrics.incrementCounter("inventory_fast_path_rejections_total", { reason: "sold_out" });
          logger.warn(`[FAST-PATH FAST REJECTION] Tier sold out in ${latencyMs}ms without hitting DB.`);
          return {
            success: false,
            code: "SOLD_OUT",
            message: "Insufficient tickets remaining. Tickets for this tier are currently sold out.",
            fastPathLatencyMs: latencyMs
          };
        }
        if (result === -3) {
          metrics.incrementCounter("inventory_fast_path_rejections_total", { reason: "seat_held" });
          logger.warn(`[FAST-PATH FAST REJECTION] Seat hold collision in ${latencyMs}ms without hitting DB.`);
          return {
            success: false,
            code: "SEAT_HELD",
            message: "One or more selected seats are currently held by another reservation. Please select different seats.",
            fastPathLatencyMs: latencyMs
          };
        }
        if (result === 1) {
          metrics.incrementCounter("inventory_fast_path_holds_total", { status: "held" });
          return {
            success: true,
            code: "SUCCESS",
            fastPathLatencyMs: latencyMs
          };
        }
        return {
          success: false,
          code: "ERROR",
          message: "Inventory hold failed unexpectedly.",
          fastPathLatencyMs: latencyMs
        };
      } catch (err) {
        logger.warn("[FAST-PATH REDIS ERROR] Falling back to in-memory/database validation:", {
          message: errorMessage(err)
        });
      }
    }
    return this.atomicHoldInMemory(params, seatKeys, start);
  }
  async atomicHoldInMemory(params, seatKeys, start) {
    const now = Date.now();
    const ttl = params.ttlSeconds || 600;
    for (const [key, hold] of this.inMemorySeatHolds.entries()) {
      if (hold.expiresAt <= now) {
        this.inMemorySeatHolds.delete(key);
      }
    }
    for (const item of params.items) {
      if (!this.inMemoryStock.has(item.ticketTierId)) {
        await this.syncTierStock(item.ticketTierId);
      }
    }
    for (const item of params.items) {
      const current = this.inMemoryStock.get(item.ticketTierId) || 0;
      if (current < item.quantity) {
        const latencyMs2 = Number((performance.now() - start).toFixed(2));
        return {
          success: false,
          code: "SOLD_OUT",
          message: "Insufficient tickets remaining. Tickets for this tier are currently sold out.",
          fastPathLatencyMs: latencyMs2
        };
      }
    }
    for (const seatKey of seatKeys) {
      const existing = this.inMemorySeatHolds.get(seatKey);
      if (existing && existing.expiresAt > now) {
        const latencyMs2 = Number((performance.now() - start).toFixed(2));
        return {
          success: false,
          code: "SEAT_HELD",
          message: "One or more selected seats are currently held by another reservation.",
          fastPathLatencyMs: latencyMs2
        };
      }
    }
    for (const item of params.items) {
      const current = this.inMemoryStock.get(item.ticketTierId) || 0;
      this.inMemoryStock.set(item.ticketTierId, Math.max(0, current - item.quantity));
    }
    for (const seatKey of seatKeys) {
      this.inMemorySeatHolds.set(seatKey, {
        owner: params.userId,
        expiresAt: now + ttl * 1e3
      });
    }
    const latencyMs = Number((performance.now() - start).toFixed(2));
    return {
      success: true,
      code: "SUCCESS",
      fastPathLatencyMs: latencyMs
    };
  }
  /**
   * Rollback / release inventory hold when reservation fails, cancels, or expires.
   */
  async releaseHold(params) {
    const redis = getRedisClient();
    const seatKeys = [];
    for (const item of params.items) {
      if (item.seatNumbers) {
        const labels = item.seatNumbers.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
        for (const label of labels) {
          seatKeys.push(RedisKeys.seatLock(params.eventId, label));
        }
      }
    }
    const tierKeys = params.items.map((i) => RedisKeys.inventoryTier(i.ticketTierId));
    const quantities = params.items.map((i) => i.quantity);
    if (redis && isRedisAvailable()) {
      try {
        const allKeys = [...tierKeys, ...seatKeys];
        const allArgs = [
          tierKeys.length.toString(),
          seatKeys.length.toString(),
          ...quantities.map(String)
        ];
        await redis.eval(
          LUA_RELEASE_INVENTORY_HOLD,
          allKeys.length,
          ...allKeys,
          ...allArgs
        );
        return;
      } catch (err) {
        logger.warn("[FAST-PATH RELEASE ERROR] Redis eval failed, falling back to manual increment:", {
          message: errorMessage(err)
        });
      }
    }
    for (const item of params.items) {
      const current = this.inMemoryStock.get(item.ticketTierId) ?? 0;
      this.inMemoryStock.set(item.ticketTierId, current + item.quantity);
    }
    for (const seatKey of seatKeys) {
      this.inMemorySeatHolds.delete(seatKey);
    }
  }
  /**
   * Finalizes seat hold upon successful payment / confirmation.
   */
  async finalizeHold(params) {
    const redis = getRedisClient();
    for (const item of params.items) {
      if (item.seatNumbers) {
        const labels = item.seatNumbers.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
        for (const label of labels) {
          const seatKey = RedisKeys.seatLock(params.eventId, label);
          if (redis && isRedisAvailable()) {
            await redis.del(seatKey).catch(bestEffort("redis.del"));
          } else {
            this.inMemorySeatHolds.delete(seatKey);
          }
        }
      }
    }
  }
  /**
   * Gets current in-memory / Redis stock without querying SQL.
   */
  async getQuickStock(tierId) {
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      const val = await redis.get(RedisKeys.inventoryTier(tierId));
      if (val !== null) return parseInt(val, 10);
    }
    if (this.inMemoryStock.has(tierId)) {
      return this.inMemoryStock.get(tierId);
    }
    return null;
  }
};
var fastPathInventoryService = new FastPathInventoryService();

// src/server/services/queue.service.ts
var import_crypto6 = __toESM(require("crypto"), 1);
init_redis2();
init_logger();
init_metrics();
init_error_message();
var QueueService = class {
  constructor() {
    this.admissionTtlSeconds = 600;
    // 10 minutes
    this.estimatedCheckoutTimeSeconds = 40;
    // In-memory fallback structures when Redis is offline or disabled
    this.inMemoryWaiting = /* @__PURE__ */ new Map();
    this.inMemoryActive = /* @__PURE__ */ new Map();
    this.maxActiveSessions = parseInt(process.env.QUEUE_MAX_ACTIVE_SESSIONS || "500", 10);
    this.hmacSecret = process.env.QUEUE_HMAC_SECRET || process.env.JWT_SECRET || "happenins-queue-ingress-secret-2026";
  }
  /**
   * Set custom active session limit (e.g. for load testing or per-event tuning)
   */
  setMaxActiveSessions(count) {
    this.maxActiveSessions = Math.max(1, count);
  }
  getMaxActiveSessions() {
    return this.maxActiveSessions;
  }
  /**
   * Generates a tamper-proof HMAC-SHA256 signed Admission Token
   */
  generateAdmissionToken(userId, eventId, ttlSeconds = 600) {
    const now = Date.now();
    const expiresAtMs = now + ttlSeconds * 1e3;
    const payload = {
      userId,
      eventId,
      admittedAt: now,
      expiresAt: expiresAtMs,
      nonce: import_crypto6.default.randomBytes(8).toString("hex")
    };
    const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = import_crypto6.default.createHmac("sha256", this.hmacSecret).update(payloadB64).digest("base64url");
    return {
      token: `${payloadB64}.${signature}`,
      expiresAt: new Date(expiresAtMs).toISOString()
    };
  }
  /**
   * Verifies an HMAC-signed Admission Token
   */
  verifyAdmissionToken(token, userId, eventId) {
    if (!token || typeof token !== "string") {
      return { valid: false, reason: "Missing admission token" };
    }
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false, reason: "Malformed admission token format" };
    }
    const [payloadB64, receivedSig] = parts;
    const expectedSig = import_crypto6.default.createHmac("sha256", this.hmacSecret).update(payloadB64).digest("base64url");
    const sigA = Buffer.from(receivedSig);
    const sigB = Buffer.from(expectedSig);
    if (sigA.length !== sigB.length || !import_crypto6.default.timingSafeEqual(sigA, sigB)) {
      return { valid: false, reason: "Invalid admission token signature" };
    }
    try {
      const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
      if (payload.userId !== userId) {
        return { valid: false, reason: "Admission token does not match authenticated user" };
      }
      if (payload.eventId !== eventId) {
        return { valid: false, reason: "Admission token was issued for a different event" };
      }
      if (Date.now() > payload.expiresAt) {
        return { valid: false, reason: "Admission token has expired (10-minute checkout window elapsed)" };
      }
      return { valid: true, payload };
    } catch {
      return { valid: false, reason: "Invalid admission token payload encoding" };
    }
  }
  /**
   * User requests entry to event checkout.
   * If active sessions < threshold and no queue backlog, immediately admits with fast pass!
   * Otherwise, queues user in sorted set.
   */
  async requestEntry(userId, eventId) {
    const redis = getRedisClient();
    const now = Date.now();
    if (redis && isRedisAvailable()) {
      try {
        const activeKey = RedisKeys.queueActive(eventId);
        const waitingKey = RedisKeys.queueWaiting(eventId);
        await redis.zremrangebyscore(activeKey, "-inf", now);
        const activeScore = await redis.zscore(activeKey, userId);
        if (activeScore && Number(activeScore) > now) {
          const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, Math.ceil((Number(activeScore) - now) / 1e3));
          return {
            status: "ADMITTED",
            admissionToken: token,
            expiresAt,
            queuePosition: 0,
            activeSessions: await redis.zcard(activeKey),
            maxCapacity: this.maxActiveSessions
          };
        }
        const activeCount = await redis.zcard(activeKey);
        const waitingCount = await redis.zcard(waitingKey);
        if (activeCount < this.maxActiveSessions && waitingCount === 0) {
          const expiresAtMs = now + this.admissionTtlSeconds * 1e3;
          await redis.zadd(activeKey, expiresAtMs, userId);
          const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, this.admissionTtlSeconds);
          metrics.incrementCounter("queue_admissions_total", { type: "fast_pass" });
          return {
            status: "ADMITTED",
            admissionToken: token,
            expiresAt,
            queuePosition: 0,
            activeSessions: activeCount + 1,
            maxCapacity: this.maxActiveSessions
          };
        }
        const existingScore = await redis.zscore(waitingKey, userId);
        const arrivalScore = existingScore ? Number(existingScore) : now;
        if (!existingScore) {
          await redis.zadd(waitingKey, arrivalScore, userId);
          metrics.incrementCounter("queue_entries_total", { status: "queued" });
        }
        const rank = await redis.zrank(waitingKey, userId);
        const position = (rank !== null ? rank : waitingCount) + 1;
        const totalWaiting = await redis.zcard(waitingKey);
        const estimatedWait = Math.max(
          5,
          Math.ceil(position / Math.max(1, this.maxActiveSessions) * this.estimatedCheckoutTimeSeconds)
        );
        return {
          status: "QUEUED",
          queuePosition: position,
          totalInQueue: totalWaiting,
          estimatedWaitSeconds: estimatedWait,
          activeSessions: activeCount,
          maxCapacity: this.maxActiveSessions
        };
      } catch (err) {
        logger.warn("[QUEUE REDIS ERROR] Falling back to in-memory queue manager:", { message: errorMessage(err) });
      }
    }
    return this.requestEntryInMemory(userId, eventId, now);
  }
  /**
   * Polled every 5 seconds by the frontend while in the Virtual Waiting Room.
   * Checks for promotion into active checkout.
   */
  async getQueueStatus(userId, eventId) {
    const redis = getRedisClient();
    const now = Date.now();
    if (redis && isRedisAvailable()) {
      try {
        const activeKey = RedisKeys.queueActive(eventId);
        const waitingKey = RedisKeys.queueWaiting(eventId);
        await redis.zremrangebyscore(activeKey, "-inf", now);
        const activeScore = await redis.zscore(activeKey, userId);
        if (activeScore && Number(activeScore) > now) {
          const remainingSecs = Math.max(10, Math.ceil((Number(activeScore) - now) / 1e3));
          const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, remainingSecs);
          return {
            status: "ADMITTED",
            admissionToken: token,
            expiresAt,
            queuePosition: 0,
            activeSessions: await redis.zcard(activeKey),
            maxCapacity: this.maxActiveSessions
          };
        }
        const rank = await redis.zrank(waitingKey, userId);
        if (rank === null) {
          return this.requestEntry(userId, eventId);
        }
        const activeCount = await redis.zcard(activeKey);
        const availableSlots = Math.max(0, this.maxActiveSessions - activeCount);
        if (availableSlots > 0 && rank < availableSlots) {
          await redis.zrem(waitingKey, userId);
          const expiresAtMs = now + this.admissionTtlSeconds * 1e3;
          await redis.zadd(activeKey, expiresAtMs, userId);
          const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, this.admissionTtlSeconds);
          metrics.incrementCounter("queue_admissions_total", { type: "promoted" });
          logger.info(`[QUEUE PROMOTION] User ${userId} admitted from queue for event ${eventId}. Active checkouts: ${activeCount + 1}/${this.maxActiveSessions}`);
          return {
            status: "ADMITTED",
            admissionToken: token,
            expiresAt,
            queuePosition: 0,
            activeSessions: activeCount + 1,
            maxCapacity: this.maxActiveSessions
          };
        }
        const position = rank + 1;
        const totalWaiting = await redis.zcard(waitingKey);
        const estimatedWait = Math.max(
          5,
          Math.ceil(position / Math.max(1, this.maxActiveSessions) * this.estimatedCheckoutTimeSeconds)
        );
        return {
          status: "QUEUED",
          queuePosition: position,
          totalInQueue: totalWaiting,
          estimatedWaitSeconds: estimatedWait,
          activeSessions: activeCount,
          maxCapacity: this.maxActiveSessions
        };
      } catch (err) {
        logger.warn("[QUEUE STATUS REDIS ERROR] Falling back to in-memory status check:", { message: errorMessage(err) });
      }
    }
    return this.getQueueStatusInMemory(userId, eventId, now);
  }
  /**
   * Releases an admitted or queued session (called on booking completion, cancellation, or checkout exit).
   */
  async releaseAdmission(userId, eventId) {
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      try {
        await redis.zrem(RedisKeys.queueActive(eventId), userId);
        await redis.zrem(RedisKeys.queueWaiting(eventId), userId);
        return;
      } catch (err) {
        logger.warn("[QUEUE RELEASE REDIS ERROR]:", { message: errorMessage(err) });
      }
    }
    const activeMap = this.inMemoryActive.get(eventId);
    if (activeMap) activeMap.delete(userId);
    const waitList = this.inMemoryWaiting.get(eventId);
    if (waitList) {
      this.inMemoryWaiting.set(eventId, waitList.filter((item) => item.userId !== userId));
    }
  }
  /**
   * Checks if user has valid admission or qualifies for automatic fast-pass admission under low load.
   */
  async checkOrAdmit(userId, eventId, token) {
    if (token) {
      const verify = this.verifyAdmissionToken(token, userId, eventId);
      if (verify.valid) {
        return { admitted: true, admissionToken: token };
      }
    }
    const redis = getRedisClient();
    const now = Date.now();
    if (redis && isRedisAvailable()) {
      try {
        const activeKey = RedisKeys.queueActive(eventId);
        const activeScore = await redis.zscore(activeKey, userId);
        if (activeScore && Number(activeScore) > now) {
          const { token: genToken } = this.generateAdmissionToken(userId, eventId, Math.ceil((Number(activeScore) - now) / 1e3));
          return { admitted: true, admissionToken: genToken };
        }
        const activeCount = await redis.zcard(activeKey);
        const waitingCount = await redis.zcard(RedisKeys.queueWaiting(eventId));
        if (activeCount < this.maxActiveSessions && waitingCount === 0) {
          const expiresAtMs = now + this.admissionTtlSeconds * 1e3;
          await redis.zadd(activeKey, expiresAtMs, userId);
          const { token: genToken } = this.generateAdmissionToken(userId, eventId, this.admissionTtlSeconds);
          return { admitted: true, admissionToken: genToken };
        }
      } catch (err) {
        logger.warn("[QUEUE CHECK ERROR]:", { message: errorMessage(err) });
      }
    } else {
      const activeMap = this.inMemoryActive.get(eventId);
      const userActive = activeMap?.get(userId);
      if (userActive && userActive.expiresAt > now) {
        const { token: genToken } = this.generateAdmissionToken(userId, eventId, Math.ceil((userActive.expiresAt - now) / 1e3));
        return { admitted: true, admissionToken: genToken };
      }
      const currentActiveCount = activeMap ? activeMap.size : 0;
      const waitList = this.inMemoryWaiting.get(eventId) || [];
      if (currentActiveCount < this.maxActiveSessions && waitList.length === 0) {
        if (!this.inMemoryActive.has(eventId)) this.inMemoryActive.set(eventId, /* @__PURE__ */ new Map());
        this.inMemoryActive.get(eventId).set(userId, { admittedAt: now, expiresAt: now + this.admissionTtlSeconds * 1e3 });
        const { token: genToken } = this.generateAdmissionToken(userId, eventId, this.admissionTtlSeconds);
        return { admitted: true, admissionToken: genToken };
      }
    }
    return { admitted: false, reason: "Virtual Waiting Room admission token required for high-demand checkout." };
  }
  // --- In-Memory Fallbacks ---
  requestEntryInMemory(userId, eventId, now) {
    if (!this.inMemoryActive.has(eventId)) this.inMemoryActive.set(eventId, /* @__PURE__ */ new Map());
    if (!this.inMemoryWaiting.has(eventId)) this.inMemoryWaiting.set(eventId, []);
    const activeMap = this.inMemoryActive.get(eventId);
    const waitList = this.inMemoryWaiting.get(eventId);
    for (const [uid, session] of activeMap.entries()) {
      if (session.expiresAt <= now) activeMap.delete(uid);
    }
    const userActive = activeMap.get(userId);
    if (userActive && userActive.expiresAt > now) {
      const remaining = Math.ceil((userActive.expiresAt - now) / 1e3);
      const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, remaining);
      return {
        status: "ADMITTED",
        admissionToken: token,
        expiresAt,
        queuePosition: 0,
        activeSessions: activeMap.size,
        maxCapacity: this.maxActiveSessions
      };
    }
    if (activeMap.size < this.maxActiveSessions && waitList.length === 0) {
      activeMap.set(userId, { admittedAt: now, expiresAt: now + this.admissionTtlSeconds * 1e3 });
      const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, this.admissionTtlSeconds);
      return {
        status: "ADMITTED",
        admissionToken: token,
        expiresAt,
        queuePosition: 0,
        activeSessions: activeMap.size,
        maxCapacity: this.maxActiveSessions
      };
    }
    let idx = waitList.findIndex((item) => item.userId === userId);
    if (idx === -1) {
      waitList.push({ userId, score: now, lastHeartbeat: now });
      idx = waitList.length - 1;
    } else {
      waitList[idx].lastHeartbeat = now;
    }
    const position = idx + 1;
    const estimatedWait = Math.max(5, Math.ceil(position / Math.max(1, this.maxActiveSessions) * this.estimatedCheckoutTimeSeconds));
    return {
      status: "QUEUED",
      queuePosition: position,
      totalInQueue: waitList.length,
      estimatedWaitSeconds: estimatedWait,
      activeSessions: activeMap.size,
      maxCapacity: this.maxActiveSessions
    };
  }
  getQueueStatusInMemory(userId, eventId, now) {
    if (!this.inMemoryActive.has(eventId)) this.inMemoryActive.set(eventId, /* @__PURE__ */ new Map());
    if (!this.inMemoryWaiting.has(eventId)) this.inMemoryWaiting.set(eventId, []);
    const activeMap = this.inMemoryActive.get(eventId);
    const waitList = this.inMemoryWaiting.get(eventId);
    for (const [uid, session] of activeMap.entries()) {
      if (session.expiresAt <= now) activeMap.delete(uid);
    }
    const userActive = activeMap.get(userId);
    if (userActive && userActive.expiresAt > now) {
      const remaining = Math.ceil((userActive.expiresAt - now) / 1e3);
      const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, remaining);
      return {
        status: "ADMITTED",
        admissionToken: token,
        expiresAt,
        queuePosition: 0,
        activeSessions: activeMap.size,
        maxCapacity: this.maxActiveSessions
      };
    }
    const idx = waitList.findIndex((item) => item.userId === userId);
    if (idx === -1) {
      return this.requestEntryInMemory(userId, eventId, now);
    }
    const available = Math.max(0, this.maxActiveSessions - activeMap.size);
    if (available > 0 && idx < available) {
      waitList.splice(idx, 1);
      activeMap.set(userId, { admittedAt: now, expiresAt: now + this.admissionTtlSeconds * 1e3 });
      const { token, expiresAt } = this.generateAdmissionToken(userId, eventId, this.admissionTtlSeconds);
      return {
        status: "ADMITTED",
        admissionToken: token,
        expiresAt,
        queuePosition: 0,
        activeSessions: activeMap.size,
        maxCapacity: this.maxActiveSessions
      };
    }
    waitList[idx].lastHeartbeat = now;
    const position = idx + 1;
    const estimatedWait = Math.max(5, Math.ceil(position / Math.max(1, this.maxActiveSessions) * this.estimatedCheckoutTimeSeconds));
    return {
      status: "QUEUED",
      queuePosition: position,
      totalInQueue: waitList.length,
      estimatedWaitSeconds: estimatedWait,
      activeSessions: activeMap.size,
      maxCapacity: this.maxActiveSessions
    };
  }
};
var queueService = new QueueService();

// src/server/jobs/workers.ts
init_logger();
init_metrics();
init_db();
init_best_effort();
init_error_message();
var bookingRepo = new BookingRepository();
var activeWorkers = /* @__PURE__ */ new Map();
var workerRedisClients = /* @__PURE__ */ new Map();
var schedulerIntervals = [];
var isWorkersRunning = false;
var jobProcessors = {
  async processReservationExpiry(data) {
    logger.info("Executing reservation expiry job...", {
      bookingId: data.bookingId,
      scanAll: data.scanAll
    });
    const prisma2 = getPrisma();
    let bookingToRelease = null;
    if (data.bookingId) {
      bookingToRelease = await prisma2.booking.findUnique({
        where: { id: data.bookingId },
        include: { items: true }
      });
    }
    let releasedCount = 0;
    if (data.bookingId) {
      const released = await bookingRepo.releaseExpiredBooking(data.bookingId);
      releasedCount = released ? 1 : 0;
    } else {
      releasedCount = await bookingRepo.releaseExpiredReservations();
    }
    if (bookingToRelease && bookingToRelease.status === "RESERVED") {
      await fastPathInventoryService.releaseHold({
        eventId: bookingToRelease.eventId,
        items: bookingToRelease.items.map((i) => ({
          ticketTierId: i.ticketTierId,
          quantity: i.quantity,
          seatNumbers: i.seatNumbers || void 0
        }))
      }).catch(bestEffort("fastPathInventoryService.releaseHold"));
      await queueService.releaseAdmission(bookingToRelease.userId, bookingToRelease.eventId).catch(bestEffort("queueService.releaseAdmission"));
    }
    metrics.incrementCounter("reservations_expired_total", "bg_job", releasedCount);
    logger.info(`Reservation expiry completed. Released count: ${releasedCount}`);
  },
  async processEmail(data) {
    logger.info("Executing transactional email worker...", {
      to: data.to,
      subject: data.subject,
      messageId: data.messageId
    });
    await deliverTransactionalEmail(data);
    metrics.incrementCounter("email_sent_bg_job", "success");
  },
  async processNotification(data) {
    logger.info("Executing notification delivery...", {
      userId: data.userId,
      title: data.title
    });
    metrics.incrementCounter("notifications_dispatched", "success");
  },
  async processWebhook(data) {
    logger.info("Processing verified webhook job...", {
      eventId: data.eventId,
      eventType: data.eventType
    });
    const prisma2 = getPrisma();
    const payload = data.payload;
    if (data.eventType === "payment.captured" || data.eventType === "order.paid") {
      const paymentEntity = payload.payment?.entity || payload;
      const rzpPaymentId = paymentEntity.id || payload.razorpay_payment_id;
      const rzpOrderId = paymentEntity.order_id || payload.razorpay_order_id;
      const bookingId = paymentEntity.notes?.bookingId || payload.bookingId;
      if (bookingId && rzpPaymentId) {
        const booking = await prisma2.booking.findUnique({
          where: { id: bookingId }
        });
        if (!booking) {
          logger.warn("Webhook references nonexistent booking, skipping payment creation:", { bookingId });
          return;
        }
        if (booking.status === "EXPIRED" || booking.status === "CANCELLED") {
          logger.error(`Webhook received payment for already ${booking.status} booking: ${bookingId}`, {
            bookingId,
            rzpPaymentId,
            status: booking.status
          });
          await prisma2.payment.upsert({
            where: { transactionId: rzpPaymentId },
            create: {
              bookingId,
              transactionId: rzpPaymentId,
              razorpayOrderId: rzpOrderId || void 0,
              razorpayPaymentId: rzpPaymentId,
              amount: paymentEntity.amount ? Math.round(paymentEntity.amount / 100) : booking.totalAmount || 0,
              status: "CAPTURED",
              method: paymentEntity.method || "razorpay_webhook",
              reconciledAt: /* @__PURE__ */ new Date()
            },
            update: {
              status: "CAPTURED",
              reconciledAt: /* @__PURE__ */ new Date()
            }
          });
          return;
        }
        await bookingRepo.confirmBooking(
          bookingId,
          rzpPaymentId,
          paymentEntity.method || "razorpay_webhook",
          {
            razorpayOrderId: rzpOrderId,
            razorpayPaymentId: rzpPaymentId
          },
          {
            allowGracePeriod: true,
            gracePeriodMinutes: 15
          }
        );
        logger.info(`Webhook successfully confirmed booking ${bookingId} for transaction ${rzpPaymentId}`);
      }
    }
    metrics.incrementCounter("webhooks_dispatched", "success");
  },
  async processPaymentReconciliation(data) {
    logger.info("Executing payment reconciliation scan...", {
      paymentId: data.paymentId,
      bookingId: data.bookingId
    });
    const prisma2 = getPrisma();
    const minutesOld = data.olderThanMinutes || 10;
    const cutoffTime = new Date(Date.now() - minutesOld * 60 * 1e3);
    if (data.paymentId) {
      const payment = await prisma2.payment.findUnique({
        where: { id: data.paymentId },
        include: { booking: true }
      });
      if (payment && payment.status === "PENDING") {
        if (payment.booking?.status === "EXPIRED") {
          await prisma2.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", reconciledAt: /* @__PURE__ */ new Date() }
          });
          metrics.incrementCounter("payments_reconciled", "failed_expired");
        } else if (payment.booking?.status === "CONFIRMED") {
          await prisma2.payment.update({
            where: { id: payment.id },
            data: { status: "CAPTURED", reconciledAt: /* @__PURE__ */ new Date() }
          });
          metrics.incrementCounter("payments_reconciled", "confirmed");
        }
      }
      return;
    }
    const pendingPayments = await prisma2.payment.findMany({
      where: {
        status: "PENDING",
        createdAt: { lte: cutoffTime },
        reconciledAt: null
      },
      include: { booking: true },
      take: 50
    });
    for (const payment of pendingPayments) {
      try {
        if (payment.booking && payment.booking.status === "EXPIRED") {
          await prisma2.payment.update({
            where: { id: payment.id },
            data: { status: "FAILED", reconciledAt: /* @__PURE__ */ new Date() }
          });
          metrics.incrementCounter("payments_reconciled", "failed_expired");
        } else {
          await prisma2.payment.update({
            where: { id: payment.id },
            data: { reconciledAt: /* @__PURE__ */ new Date() }
          });
          metrics.incrementCounter("payments_reconciled", "checked");
        }
      } catch (err) {
        logger.error("Failed to reconcile payment record", {
          paymentId: payment.id,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    }
  },
  async processAnalytics(data) {
    logger.info("Executing analytics aggregation...", {
      eventId: data.eventId,
      metricType: data.metricType
    });
    metrics.incrementCounter("analytics_aggregated", data.metricType.toLowerCase());
  }
};
function registerLocalFallbackHandlers() {
  jobQueue.registerHandler("expire_reservation", jobProcessors.processReservationExpiry);
  jobQueue.registerHandler("reservation-expiry" /* RESERVATION_EXPIRY */, jobProcessors.processReservationExpiry);
  jobQueue.registerHandler("RESERVATION_EXPIRY", jobProcessors.processReservationExpiry);
  jobQueue.registerHandler("send_email", jobProcessors.processEmail);
  jobQueue.registerHandler("email" /* EMAIL */, jobProcessors.processEmail);
  jobQueue.registerHandler("EMAIL_SEND", jobProcessors.processEmail);
  jobQueue.registerHandler("send_notification", jobProcessors.processNotification);
  jobQueue.registerHandler("notification" /* NOTIFICATION */, jobProcessors.processNotification);
  jobQueue.registerHandler("NOTIFICATION_SEND", jobProcessors.processNotification);
  jobQueue.registerHandler("process_webhook", jobProcessors.processWebhook);
  jobQueue.registerHandler("webhook" /* WEBHOOK */, jobProcessors.processWebhook);
  jobQueue.registerHandler("WEBHOOK_RETRY", jobProcessors.processWebhook);
  jobQueue.registerHandler("reconcile_payment", jobProcessors.processPaymentReconciliation);
  jobQueue.registerHandler("payment-reconciliation" /* PAYMENT_RECONCILIATION */, jobProcessors.processPaymentReconciliation);
  jobQueue.registerHandler("PAYMENT_RECONCILIATION", jobProcessors.processPaymentReconciliation);
  jobQueue.registerHandler("aggregate_analytics", jobProcessors.processAnalytics);
  jobQueue.registerHandler("analytics" /* ANALYTICS */, jobProcessors.processAnalytics);
  jobQueue.registerHandler("ANALYTICS_AGGREGATION", jobProcessors.processAnalytics);
}
registerLocalFallbackHandlers();
function startJobWorkers() {
  if (isWorkersRunning) {
    return;
  }
  isWorkersRunning = true;
  registerLocalFallbackHandlers();
  const config = getQueueConfig();
  for (const queueName of ALL_QUEUE_NAMES) {
    const redisClient2 = createBullRedisConnection(`worker-${queueName}`);
    if (redisClient2) {
      workerRedisClients.set(queueName, redisClient2);
      const policy = config.policies[queueName];
      const worker = new import_bullmq2.Worker(
        queueName,
        async (job) => {
          const jobStart = Date.now();
          logger.info(`BullMQ Worker started processing job: [${queueName}:${job.name}]`, {
            jobId: job.id,
            attemptsMade: job.attemptsMade
          });
          try {
            switch (queueName) {
              case "reservation-expiry" /* RESERVATION_EXPIRY */:
                await jobProcessors.processReservationExpiry(job.data);
                break;
              case "email" /* EMAIL */:
                await jobProcessors.processEmail(job.data);
                break;
              case "notification" /* NOTIFICATION */:
                await jobProcessors.processNotification(job.data);
                break;
              case "webhook" /* WEBHOOK */:
                await jobProcessors.processWebhook(job.data);
                break;
              case "payment-reconciliation" /* PAYMENT_RECONCILIATION */:
                await jobProcessors.processPaymentReconciliation(job.data);
                break;
              case "analytics" /* ANALYTICS */:
                await jobProcessors.processAnalytics(job.data);
                break;
              default:
                logger.warn(`No handler for queue: ${queueName}`);
            }
            const durationMs = Date.now() - jobStart;
            metrics.observeHistogram("jobs_duration_ms", durationMs, { queue: queueName, status: "success" });
            metrics.incrementCounter("jobs_processed_total", { queue: queueName, status: "success" });
          } catch (err) {
            const durationMs = Date.now() - jobStart;
            metrics.observeHistogram("jobs_duration_ms", durationMs, { queue: queueName, status: "error" });
            metrics.incrementCounter("jobs_processed_total", { queue: queueName, status: "error" });
            throw err;
          }
        },
        {
          connection: redisClient2,
          prefix: QUEUE_NAMESPACE_PREFIX,
          concurrency: policy.concurrency
        }
      );
      worker.on("completed", (job) => {
        metrics.incrementCounter("jobs_completed_total", queueName);
        logger.info(`BullMQ Job completed: [${queueName}:${job.name}]`, { jobId: job.id });
      });
      worker.on("failed", (job, err) => {
        metrics.incrementCounter("jobs_failed_total", queueName);
        logger.error(`BullMQ Job failed: [${queueName}:${job?.name}]`, {
          jobId: job?.id,
          attemptsMade: job?.attemptsMade,
          error: err.message
        });
      });
      worker.on("error", (err) => {
        logger.warn(`BullMQ Worker error [${queueName}]:`, { error: err.message });
      });
      activeWorkers.set(queueName, worker);
    }
  }
  startDistributedSchedulers(config);
  jobQueue.startFallbackWorkerLoop(1e4);
}
function startDistributedSchedulers(config) {
  const reservationInterval = setInterval(async () => {
    try {
      const redis = getRedisClient();
      let acquiredLock = true;
      if (redis && isRedisAvailable()) {
        const lockKey = "happenins:lock:cron:reservation_sweep";
        const lockVal = `${Date.now()}_${Math.random()}`;
        const res = await redis.set(lockKey, lockVal, "PX", 1e4, "NX");
        acquiredLock = res === "OK";
      }
      if (acquiredLock) {
        await jobQueue.enqueueReservationExpiry(
          { scanAll: true, triggerSource: "cron_sweep" },
          { idempotencyKey: `res_sweep_${Math.floor(Date.now() / 15e3)}` }
        );
      }
    } catch (err) {
      logger.warn("Error in reservation sweeper interval:", { error: errorMessage(err) });
    }
  }, config.reservationScanIntervalMs);
  const paymentInterval = setInterval(async () => {
    try {
      const redis = getRedisClient();
      let acquiredLock = true;
      if (redis && isRedisAvailable()) {
        const lockKey = "happenins:lock:cron:payment_recon_sweep";
        const lockVal = `${Date.now()}_${Math.random()}`;
        const res = await redis.set(lockKey, lockVal, "PX", 45e3, "NX");
        acquiredLock = res === "OK";
      }
      if (acquiredLock) {
        await jobQueue.enqueuePaymentReconciliation(
          { scanStale: true, olderThanMinutes: 10 },
          { idempotencyKey: `pay_sweep_${Math.floor(Date.now() / 6e4)}` }
        );
      }
    } catch (err) {
      logger.warn("Error in payment reconciliation sweeper interval:", { error: errorMessage(err) });
    }
  }, config.paymentReconciliationIntervalMs);
  schedulerIntervals.push(reservationInterval, paymentInterval);
}
function registerJobWorkers() {
  startJobWorkers();
}
async function stopJobWorkers() {
  logger.info("Stopping all background job workers and schedulers...");
  for (const interval of schedulerIntervals) {
    clearInterval(interval);
  }
  schedulerIntervals = [];
  for (const [name, worker] of activeWorkers.entries()) {
    try {
      await Promise.race([
        worker.close(),
        new Promise((resolve) => setTimeout(resolve, 3e3))
      ]);
      logger.info(`Stopped BullMQ worker [${name}]`);
    } catch (err) {
      logger.warn(`Error stopping BullMQ worker [${name}]:`, { error: errorMessage(err) });
    }
  }
  activeWorkers.clear();
  for (const [name, client] of workerRedisClients.entries()) {
    try {
      if (client.status === "ready" || client.status === "connect") {
        await Promise.race([
          client.quit(),
          new Promise((resolve) => setTimeout(resolve, 1500))
        ]);
      } else {
        client.disconnect();
      }
    } catch {
      client.disconnect();
    }
  }
  workerRedisClients.clear();
  await jobQueue.close();
  isWorkersRunning = false;
  logger.info("All background job workers shut down cleanly.");
}

// src/server/server.ts
init_db();

// src/server/middleware/feature-gate.middleware.ts
init_features();
var FEATURE_ROUTES = [
  ["SELF_REGISTRATION", "POST", "/auth/register"],
  ["SELF_REGISTRATION", "POST", "/auth/register/verify"],
  ["PASSWORD_LOGIN", "POST", "/auth/login"],
  ["OTP_LOGIN", "POST", "/auth/otp/send"],
  ["OTP_LOGIN", "POST", "/auth/otp/verify"],
  ["GOOGLE_LOGIN", "GET", "/auth/google/url"],
  ["GOOGLE_LOGIN", "POST", "/auth/google/callback"],
  ["PASSWORD_RESET", "POST", "/auth/forgot-password"],
  ["PASSWORD_RESET", "POST", "/auth/reset-password"],
  ["ORGANIZER_ONBOARDING", "POST", "/auth/onboard"],
  ["ACCOUNT_DELETION", "DELETE", "/auth/profile"],
  ["PAYMENTS", "POST", "/webhooks/razorpay"],
  ["SPLIT_BOOKING", "POST", "/bookings/:bookingId/split-shares/:shareId/pay"],
  ["WALLET", "GET", "/wallet"],
  ["WALLET", "POST", "/bookings/:bookingId/wallet/apply"],
  ["WALLET", "POST", "/bookings/:bookingId/wallet/remove"],
  ["PROMO_CODES", "POST", "/bookings/:bookingId/promo/validate"],
  ["PROMO_CODES", "POST", "/bookings/:bookingId/promo/apply"],
  ["PROMO_CODES", void 0, "/events/:eventId/promo-codes"],
  ["PROMO_CODES", "DELETE", "/promo-codes/:id"],
  ["TICKET_TRANSFERS", "POST", "/tickets/:id/transfer"],
  ["TICKET_TRANSFERS", "POST", "/bookings/:id/transfer"],
  ["TICKET_TRANSFERS", void 0, "/transfers/my-transfers"],
  ["TICKET_TRANSFERS", void 0, "/transfers/:code"],
  ["TICKET_TRANSFERS", void 0, "/transfers/:code/claim"],
  ["TICKET_TRANSFERS", void 0, "/transfers/:id/cancel"],
  ["SEATING_PLANS", "GET", "/events/:eventId/occupied-seats"],
  ["INSTITUTION_ACCESS", void 0, "/institutions"],
  ["INSTITUTION_ACCESS", void 0, "/institutions/check-domain"],
  ["INSTITUTION_ACCESS", void 0, "/institutions/otp/send"],
  ["INSTITUTION_ACCESS", void 0, "/institutions/otp/verify"],
  ["INSTITUTION_ACCESS", void 0, "/institutions/otp/status"],
  ["WAITING_ROOM", void 0, "/queue/enter"],
  ["WAITING_ROOM", void 0, "/queue/leave"],
  ["WAITING_ROOM", void 0, "/queue/status"],
  ["STAFF_SCANNERS", void 0, "/staff-scanners/login"],
  ["STAFF_SCANNERS", void 0, "/staff-scanners/scan"],
  ["STAFF_SCANNERS", void 0, "/organizer/events/:eventId/staff-scanners"],
  ["STAFF_SCANNERS", void 0, "/organizer/staff-scanners/:id"],
  ["EVENT_EXPORT", "GET", "/organizer/events/:eventId/export"],
  ["REVIEWS", void 0, "/events/:eventId/reviews"],
  ["REVIEWS", "GET", "/events/:eventId/review-eligibility"],
  ["WHATSAPP_DELIVERY", "GET", "/bookings/:id/whatsapp"],
  ["WHATSAPP_DELIVERY", "POST", "/bookings/:id/send-whatsapp"],
  ["DEV_EMAIL_INBOX", void 0, "/emails"],
  ["DEV_EMAIL_INBOX", void 0, "/emails/test"]
];
var compiled = FEATURE_ROUTES.map(([feature, method, pattern]) => ({
  feature,
  method,
  regex: new RegExp(`^${pattern.replace(/:[A-Za-z]+/g, "[^/]+")}/?$`)
}));
function featureForRoute(method, path2) {
  return compiled.find((r) => (!r.method || r.method === method.toUpperCase()) && r.regex.test(path2))?.feature;
}
function featureGate(req, res, next) {
  const feature = featureForRoute(req.method, req.path);
  if (feature && !isFeatureEnabled(feature)) {
    return res.status(404).json({ error: "Not found", code: "FEATURE_DISABLED", feature });
  }
  next();
}

// src/server/app.ts
init_features();
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_crypto29 = __toESM(require("crypto"), 1);
var import_cookie_parser = __toESM(require("cookie-parser"), 1);
var import_compression = __toESM(require("compression"), 1);
var import_helmet = __toESM(require("helmet"), 1);
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var import_rate_limit_redis = require("rate-limit-redis");
init_env();
init_security();
init_redis();
init_logger();
init_metrics();
init_redis2();

// src/server/middleware/tracing.middleware.ts
var import_crypto7 = __toESM(require("crypto"), 1);
init_context();
function tracingMiddleware(req, res, next) {
  const incomingReqId = req.headers["x-request-id"];
  const requestId = incomingReqId && incomingReqId.trim().length > 0 ? incomingReqId.trim() : import_crypto7.default.randomUUID();
  let traceId;
  let spanId;
  const gcpTraceHeader = req.headers["x-cloud-trace-context"];
  const w3cTraceHeader = req.headers["traceparent"];
  if (gcpTraceHeader) {
    const match = gcpTraceHeader.match(/^([a-f0-9]+)(?:\/([a-f0-9]+))?(?:;o=([01]))?/i);
    if (match) {
      traceId = match[1];
      spanId = match[2];
    }
  } else if (w3cTraceHeader) {
    const match = w3cTraceHeader.match(/^00-([a-f0-9]{32})-([a-f0-9]{16})-([a-f0-9]{2})$/i);
    if (match) {
      traceId = match[1];
      spanId = match[2];
    }
  }
  if (!traceId) {
    traceId = import_crypto7.default.randomBytes(16).toString("hex");
  }
  req.id = requestId;
  req.traceId = traceId;
  req.spanId = spanId;
  res.setHeader("X-Request-Id", requestId);
  if (traceId) {
    res.setHeader("X-Trace-Id", traceId);
  }
  const context = {
    requestId,
    traceId,
    spanId,
    ipAddress: req.ip || (req.socket ? req.socket.remoteAddress : void 0),
    userAgent: req.headers["user-agent"],
    path: req.path,
    method: req.method,
    startTime: Date.now()
  };
  runWithContext(context, () => {
    next();
  });
}

// src/server/middleware/access-log.middleware.ts
init_metrics();
init_logger();
init_context();
function accessLogMiddleware(req, res, next) {
  const isHealthProbe = req.path === "/health" || req.path === "/ready";
  const start = Date.now();
  metrics.recordRequestStart();
  const originalEnd = res.end;
  let bytesSent = 0;
  const originalWrite = res.write;
  const chunkLength = (chunk) => Buffer.isBuffer(chunk) ? chunk.length : typeof chunk === "string" ? Buffer.byteLength(chunk) : 0;
  res.write = function(chunk, ...args) {
    bytesSent += chunkLength(chunk);
    return originalWrite.apply(res, [chunk, ...args]);
  };
  res.end = function(chunk, ...args) {
    bytesSent += chunkLength(chunk);
    return originalEnd.apply(res, [chunk, ...args]);
  };
  res.on("finish", () => {
    metrics.recordRequestEnd();
    const durationMs = Date.now() - start;
    const statusCode = res.statusCode;
    const method = req.method;
    const normalized = normalizeRoute(req.path);
    if (req.user) {
      updateContext({
        userId: req.user.id,
        userRole: req.user.role
      });
    }
    const metricLabels = {
      method,
      route: normalized,
      status_code: String(statusCode)
    };
    metrics.incrementCounter("http_requests_total", metricLabels);
    metrics.observeHistogram("http_request_duration_ms", durationMs, metricLabels);
    if (statusCode === 429) {
      metrics.incrementCounter("rate_limit_hits_total", { route: normalized, method });
    }
    if (!isHealthProbe || statusCode >= 400) {
      const userAgent = req.headers["user-agent"] || "unknown";
      const remoteIp = req.ip || (req.socket ? req.socket.remoteAddress : "unknown");
      const requestId = req.id;
      const traceId = req.traceId;
      const logPayload = {
        requestId,
        traceId,
        method,
        path: req.path,
        normalizedRoute: normalized,
        statusCode,
        durationMs,
        bytesSent,
        userId: req.user?.id,
        httpRequest: {
          requestMethod: method,
          requestUrl: req.originalUrl || req.url,
          status: statusCode,
          userAgent,
          remoteIp,
          latency: `${(durationMs / 1e3).toFixed(6)}s`,
          responseSize: bytesSent
        }
      };
      const msg = `HTTP ${method} ${req.originalUrl || req.path} ${statusCode} in ${durationMs}ms [${bytesSent}B]`;
      if (statusCode >= 500) {
        logger.error(msg, logPayload);
      } else if (statusCode >= 400) {
        logger.warn(msg, logPayload);
      } else {
        logger.http(msg, logPayload);
      }
    }
  });
  next();
}

// src/server/middleware/idempotency.middleware.ts
init_logger();
init_metrics();
init_best_effort();
init_redis2();
init_error_message();
var localMemoryStore = /* @__PURE__ */ new Map();
var MAX_LOCAL_RECORDS = 5e3;
var PROCESSING_LOCK_TTL_SEC = 60;
var COMPLETED_RECORD_TTL_SEC = 24 * 60 * 60;
async function idempotencyMiddleware(req, res, next) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return next();
  }
  const rawKey = req.headers["idempotency-key"] || req.headers["x-idempotency-key"];
  if (!rawKey || typeof rawKey !== "string" || rawKey.trim().length === 0) {
    return next();
  }
  const idempotencyKey = rawKey.trim();
  const userId = req.user?.id || "anon";
  const endpoint = req.path;
  const requestHash = createCanonicalRequestHash(req.method, req.path, req.body);
  const redisKey = RedisKeys.idempotency("api", userId, endpoint, idempotencyKey);
  const redis = getRedisClient();
  const redisActive = isRedisAvailable() && redis !== null;
  try {
    let existingRecord = null;
    if (redisActive && redis) {
      const rawData = await redis.get(redisKey);
      if (rawData) {
        try {
          existingRecord = JSON.parse(rawData);
        } catch {
          existingRecord = null;
        }
      }
    } else {
      const local = localMemoryStore.get(redisKey);
      if (local && Date.now() - local.createdAt < COMPLETED_RECORD_TTL_SEC * 1e3) {
        existingRecord = local;
      }
    }
    if (existingRecord) {
      if (existingRecord.requestHash !== requestHash) {
        logger.warn("Idempotency key payload mismatch detected", {
          idempotencyKey,
          userId,
          endpoint
        });
        metrics.incrementCounter("idempotency_conflicts", endpoint);
        return res.status(409).json({
          status: "error",
          code: "IDEMPOTENCY_PAYLOAD_MISMATCH",
          message: "The provided Idempotency-Key was previously used with a different request payload."
        });
      }
      if (existingRecord.status === "PROCESSING") {
        const isExpired = Date.now() - existingRecord.createdAt > PROCESSING_LOCK_TTL_SEC * 1e3;
        if (!isExpired) {
          logger.info("Concurrent duplicate request detected while operation is still processing", {
            idempotencyKey,
            endpoint
          });
          metrics.incrementCounter("idempotency_concurrent_blocked", endpoint);
          return res.status(409).json({
            status: "error",
            code: "IDEMPOTENCY_IN_PROGRESS",
            message: "A request with this Idempotency-Key is currently being processed. Please retry shortly."
          });
        }
      }
      if (existingRecord.status === "COMPLETED" && existingRecord.statusCode && existingRecord.body !== void 0) {
        logger.info("Idempotent replay served from store", {
          idempotencyKey,
          endpoint,
          statusCode: existingRecord.statusCode
        });
        metrics.incrementCounter("idempotency_hits", endpoint);
        res.setHeader("X-Idempotency-Hit", "true");
        return res.status(existingRecord.statusCode).json(existingRecord.body);
      }
    }
    const initialRecord = {
      key: idempotencyKey,
      scope: "api",
      userId,
      endpoint,
      requestHash,
      status: "PROCESSING",
      createdAt: Date.now()
    };
    if (redisActive && redis) {
      const acquired = await redis.set(
        redisKey,
        JSON.stringify(initialRecord),
        "EX",
        PROCESSING_LOCK_TTL_SEC,
        "NX"
      );
      if (!acquired) {
        logger.info("Lost atomic race for idempotency key lease", { idempotencyKey, endpoint });
        metrics.incrementCounter("idempotency_concurrent_blocked", endpoint);
        return res.status(409).json({
          status: "error",
          code: "IDEMPOTENCY_IN_PROGRESS",
          message: "A request with this Idempotency-Key is currently processing."
        });
      }
    } else {
      if (localMemoryStore.size >= MAX_LOCAL_RECORDS) {
        const firstKey = localMemoryStore.keys().next().value;
        if (firstKey) localMemoryStore.delete(firstKey);
      }
      localMemoryStore.set(redisKey, initialRecord);
    }
    const originalJson = res.json.bind(res);
    res.json = function(body) {
      const statusCode = res.statusCode;
      if (statusCode >= 200 && statusCode < 500 && statusCode !== 429) {
        const completedRecord = {
          ...initialRecord,
          status: "COMPLETED",
          statusCode,
          body,
          completedAt: Date.now()
        };
        if (redisActive && redis) {
          redis.set(redisKey, JSON.stringify(completedRecord), "EX", COMPLETED_RECORD_TTL_SEC).catch((err) => {
            logger.warn("Failed to persist completed idempotency record to Redis", {
              message: err.message
            });
          });
        } else {
          localMemoryStore.set(redisKey, completedRecord);
        }
      } else {
        if (redisActive && redis) {
          redis.del(redisKey).catch(bestEffort("redis.del"));
        } else {
          localMemoryStore.delete(redisKey);
        }
      }
      return originalJson(body);
    };
    next();
  } catch (err) {
    logger.error("Error executing idempotency middleware", {
      idempotencyKey,
      endpoint,
      message: errorMessage(err)
    });
    next();
  }
}

// src/server/middleware/error.middleware.ts
init_app_error();
init_logger();
init_metrics();
var import_zod2 = require("zod");
function errorHandler(err, req, res, next) {
  const requestId = req.id;
  const traceId = req.traceId;
  const normalized = normalizeRoute(req.path);
  if (err instanceof AppError) {
    logger.warn(`[Operational Error] ${err.errorCode}: ${err.message}`, {
      requestId,
      traceId,
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      path: req.path,
      normalizedRoute: normalized,
      method: req.method
    });
    return res.status(err.statusCode).json({
      error: {
        code: err.errorCode,
        message: err.message,
        requestId
      }
    });
  }
  if (err instanceof import_zod2.ZodError) {
    const issues = err.issues || [];
    const formattedMessage = issues.map((e) => e.message).join("; ") || "Validation failed";
    logger.warn(`[Validation Error]: ${formattedMessage}`, {
      requestId,
      traceId,
      path: req.path,
      normalizedRoute: normalized,
      method: req.method,
      issues
    });
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: formattedMessage,
        requestId
      }
    });
  }
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: {
        code: "UNAUTHENTICATED",
        message: "Invalid or expired authentication token.",
        requestId
      }
    });
  }
  if (err.code && typeof err.code === "string" && err.code.startsWith("P")) {
    logger.error(`[Prisma Database Error] Code ${err.code}: ${err.message}`, {
      requestId,
      traceId,
      code: err.code,
      path: req.path,
      normalizedRoute: normalized,
      method: req.method,
      stack: process.env.NODE_ENV !== "production" ? err.stack : void 0
    });
    let message = "A database constraint error occurred.";
    let statusCode = 400;
    let errorCode2 = "DATABASE_ERROR";
    if (err.code === "P2002") {
      message = "A record with this unique value already exists.";
      statusCode = 409;
      errorCode2 = "CONFLICT";
    } else if (err.code === "P2025") {
      message = "The requested database record was not found.";
      statusCode = 404;
      errorCode2 = "NOT_FOUND";
    }
    return res.status(statusCode).json({
      error: {
        code: errorCode2,
        message,
        requestId
      }
    });
  }
  logger.error(`[Unhandled Internal Error] ${err?.message || "Unknown error"}`, {
    requestId,
    traceId,
    stack: err?.stack,
    path: req.path,
    normalizedRoute: normalized,
    method: req.method,
    "@type": "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent",
    context: {
      httpRequest: {
        method: req.method,
        url: req.originalUrl || req.path,
        userAgent: req.headers["user-agent"],
        responseStatusCode: 500,
        remoteIp: req.ip
      }
    }
  });
  const isProduction = process.env.NODE_ENV === "production";
  const safeMessage = isProduction ? "An internal server error occurred." : err?.message || "An unexpected error occurred.";
  return res.status(err.statusCode || 500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: safeMessage,
      requestId
    }
  });
}

// src/server/controllers/auth.controller.ts
init_features();

// src/server/services/auth.service.ts
init_features();

// src/server/repositories/user.repository.ts
init_db();
var UserRepository = class {
  constructor() {
    this.prisma = getPrisma();
  }
  async findByEmail(email) {
    if (!email) return null;
    return this.prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() }
    });
  }
  async findById(id) {
    return this.prisma.user.findUnique({
      where: { id }
    });
  }
  /**
   * Called when the mailbox owner proves ownership (Google, email OTP). A password on an account whose
   * email was never verified may have been set by someone else (pre-registration takeover), so it is dropped.
   * Returns true if the account was unverified and has been claimed.
   */
  async claimUnverifiedAccount(userId) {
    const res = await this.prisma.user.updateMany({
      where: { id: userId, isEmailVerified: false },
      data: { passwordHash: null, isEmailVerified: true, emailVerifiedAt: /* @__PURE__ */ new Date() }
    });
    return res.count > 0;
  }
  async setVerifiedWithPassword(userId, passwordHash, fullName) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash, fullName, isEmailVerified: true, emailVerifiedAt: /* @__PURE__ */ new Date() }
    });
  }
  async createUser(data) {
    return this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email.toLowerCase(),
        fullName: data.fullName,
        passwordHash: data.passwordHash || null,
        avatarUrl: data.avatarUrl || null,
        role: data.role || "USER",
        isEmailVerified: data.isEmailVerified ?? false,
        emailVerifiedAt: data.emailVerifiedAt || null
      }
    });
  }
  async promoteToOrganizer(userId, companyName, website, extra) {
    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { role: "ORGANIZER" }
      });
      return tx.organizerProfile.create({
        data: {
          userId,
          companyName,
          website: website || null,
          entityType: extra?.entityType || null,
          phone: extra?.phone || null,
          businessAddress: extra?.businessAddress || null,
          taxId: extra?.taxId || null,
          representativeTitle: extra?.representativeTitle || null,
          bankName: extra?.bankName || null,
          bankAccountName: extra?.bankAccountName || null,
          bankAccountNumber: extra?.bankAccountNumber || null,
          acceptedTermsAt: extra?.acceptedTermsAt || /* @__PURE__ */ new Date(),
          acceptedLiability: extra?.acceptedLiability ?? true,
          acceptedPrivacy: extra?.acceptedPrivacy ?? true,
          isVerified: true
          // Auto-verify in development for seamless flow
        }
      });
    });
  }
  async findOrganizerProfileByUserId(userId) {
    return this.prisma.organizerProfile.findUnique({
      where: { userId }
    });
  }
  async getOrganizerWithUser(organizerId) {
    return this.prisma.organizerProfile.findUnique({
      where: { id: organizerId },
      include: { user: true }
    });
  }
  async updatePassword(userId, passwordHash) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });
  }
  async updateFullName(userId, fullName) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { fullName }
    });
  }
  async updateAvatarUrl(userId, avatarUrl) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl }
    });
  }
  /**
   * Account deletion = anonymisation. The User row stays so bookings, tickets, attendance and
   * audit history keep their foreign keys; every piece of personal data is removed or replaced.
   */
  async anonymiseUser(userId) {
    await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId }, select: { email: true } });
      if (!user) return;
      const bookingIds = (await tx.booking.findMany({ where: { userId }, select: { id: true } })).map((b) => b.id);
      await tx.session.deleteMany({ where: { userId } });
      await tx.passwordResetToken.deleteMany({ where: { userId } });
      await tx.institutionEmailOtp.deleteMany({ where: { userId } });
      await tx.review.deleteMany({ where: { userId } });
      await tx.walletTransaction.deleteMany({ where: { wallet: { userId } } });
      await tx.wallet.deleteMany({ where: { userId } });
      await tx.booking.updateMany({ where: { userId }, data: { verifiedCollegeEmail: null } });
      await tx.ticket.updateMany({ where: { bookingId: { in: bookingIds } }, data: { verifiedCollegeEmail: null } });
      await tx.bookingSplitShare.updateMany({
        where: { OR: [{ bookingId: { in: bookingIds } }, { email: user.email }] },
        data: { friendName: "Deleted user", email: `deleted-${userId}@deleted.invalid` }
      });
      await tx.ticketTransfer.updateMany({
        where: { OR: [{ senderUserId: userId }, { claimedByUserId: userId }] },
        data: { recipientEmail: `deleted-${userId}@deleted.invalid`, recipientName: null, note: null }
      });
      await tx.ticketTransfer.updateMany({
        where: { senderUserId: userId, status: "PENDING" },
        data: { status: "CANCELLED" }
      });
      await tx.auditLog.updateMany({ where: { userId }, data: { ipAddress: null } });
      await tx.attendanceLog.updateMany({ where: { scannerUserId: userId }, data: { ipAddress: null } });
      await tx.organizerProfile.updateMany({
        where: { userId },
        data: {
          companyName: "Deleted organizer",
          logoUrl: null,
          website: null,
          phone: null,
          businessAddress: null,
          taxId: null,
          representativeTitle: null,
          bankName: null,
          bankAccountName: null,
          bankAccountNumber: null
        }
      });
      await tx.user.update({
        where: { id: userId },
        data: {
          email: `deleted-${userId}@deleted.invalid`,
          fullName: "Deleted user",
          avatarUrl: null,
          passwordHash: null,
          isEmailVerified: false,
          emailVerifiedAt: null
        }
      });
    });
  }
  /** True when the user organises an event that has not ended and is not a draft/cancelled one. */
  async hasActiveOrganizedEvents(userId) {
    const count = await this.prisma.event.count({
      where: {
        organizer: { userId },
        status: { in: ["UNDER_REVIEW", "PUBLISHED", "LIVE"] },
        endsAt: { gt: /* @__PURE__ */ new Date() }
      }
    });
    return count > 0;
  }
};

// src/server/services/auth.service.ts
init_crypto();
init_session_service();

// src/server/services/oauth.service.ts
init_db();
init_crypto();
init_app_error();
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var import_crypto10 = __toESM(require("crypto"), 1);
init_error_message();
var cachedJwks = null;
async function getGoogleJwks() {
  const now = Date.now();
  if (cachedJwks && cachedJwks.expiresAt > now) {
    return cachedJwks.keys;
  }
  try {
    const res = await fetch("https://www.googleapis.com/oauth2/v3/certs");
    if (!res.ok) throw new BadRequestError("Failed to fetch Google JWKs");
    const data = await res.json();
    cachedJwks = {
      keys: data.keys,
      expiresAt: now + 3600 * 1e3
    };
    return data.keys;
  } catch (err) {
    if (cachedJwks) return cachedJwks.keys;
    throw new InternalError(`Unable to retrieve Google OAuth public certificates: ${errorMessage(err)}`);
  }
}
var OAuthService = class {
  constructor() {
    this.prisma = getPrisma();
  }
  validateRedirectUri(redirectUri) {
    if (!redirectUri) {
      throw new BadRequestError("redirectUri is required.");
    }
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const envAllowed = process.env.ALLOWED_REDIRECT_URIS ? process.env.ALLOWED_REDIRECT_URIS.split(",").map((s) => s.trim()) : [];
    let allowedOriginsAndPaths = [
      "http://localhost:3000/auth/callback",
      "http://127.0.0.1:3000/auth/callback",
      "http://0.0.0.0:3000/auth/callback",
      `${appUrl.replace(/\/$/, "")}/auth/callback`,
      ...envAllowed
    ];
    try {
      const parsedRedirect = new URL(redirectUri);
      const isAllowed = allowedOriginsAndPaths.some((allowed) => {
        try {
          const parsedAllowed = new URL(allowed);
          return parsedRedirect.origin === parsedAllowed.origin && parsedRedirect.pathname === parsedAllowed.pathname;
        } catch {
          return false;
        }
      });
      if (!isAllowed) {
        throw new BadRequestError(`Invalid or untrusted redirectUri: '${redirectUri}'. Must match configured callback URL.`);
      }
    } catch (err) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError("Malformed redirectUri URL.");
    }
  }
  async generateAuthUrl(redirectUri) {
    this.validateRedirectUri(redirectUri);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID" || clientId.trim() === "") {
      throw new BadRequestError("Google OAuth Client ID is not configured on the server.");
    }
    const rawState = generateSecureToken(32);
    const stateHash = hashToken(rawState);
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    await this.prisma.oAuthState.create({
      data: {
        stateHash,
        codeVerifier,
        redirectUri,
        expiresAt
      }
    });
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", clientId);
    googleAuthUrl.searchParams.set("redirect_uri", redirectUri);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "openid email profile");
    googleAuthUrl.searchParams.set("state", rawState);
    googleAuthUrl.searchParams.set("code_challenge", codeChallenge);
    googleAuthUrl.searchParams.set("code_challenge_method", "S256");
    googleAuthUrl.searchParams.set("prompt", "select_account");
    return {
      url: googleAuthUrl.toString(),
      state: rawState
    };
  }
  async verifyCodeAndExchange(code, state, redirectUri) {
    if (!code || !state) {
      throw new BadRequestError("Authorization code and state parameters are required.");
    }
    const stateHash = hashToken(state);
    const oauthState = await this.prisma.oAuthState.findUnique({
      where: { stateHash }
    });
    if (!oauthState) {
      throw new UnauthorizedError("Invalid or unrecognized OAuth state parameter.");
    }
    if (oauthState.usedAt) {
      throw new UnauthorizedError("OAuth state parameter has already been consumed.");
    }
    if (oauthState.expiresAt < /* @__PURE__ */ new Date()) {
      throw new UnauthorizedError("OAuth state parameter has expired.");
    }
    if (oauthState.redirectUri !== redirectUri) {
      throw new UnauthorizedError("OAuth redirect URI mismatch.");
    }
    await this.prisma.oAuthState.update({
      where: { id: oauthState.id },
      data: { usedAt: /* @__PURE__ */ new Date() }
    });
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new InternalError("Google OAuth client credentials are not configured on the server.");
    }
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: oauthState.codeVerifier
      })
    });
    if (!tokenResponse.ok) {
      throw new UnauthorizedError("Failed to exchange authorization code with Google.");
    }
    const tokenData = await tokenResponse.json();
    const idToken = tokenData.id_token;
    if (!idToken) {
      throw new UnauthorizedError("Google token response did not include a valid ID token.");
    }
    const unverifiedHeader = import_jsonwebtoken2.default.decode(idToken, { complete: true });
    if (!unverifiedHeader || !unverifiedHeader.header?.kid) {
      throw new UnauthorizedError("Invalid Google ID token header structure.");
    }
    const jwks = await getGoogleJwks();
    const targetJwk = jwks.find((key) => key.kid === unverifiedHeader.header.kid);
    if (!targetJwk) {
      throw new UnauthorizedError("Google ID token signed with unknown public key ID.");
    }
    const publicKey = import_crypto10.default.createPublicKey({
      key: targetJwk,
      format: "jwk"
    }).export({ type: "spki", format: "pem" });
    let decoded;
    try {
      decoded = import_jsonwebtoken2.default.verify(idToken, publicKey, {
        algorithms: ["RS256"],
        audience: clientId,
        issuer: ["https://accounts.google.com", "accounts.google.com"]
      });
    } catch (verifyErr) {
      throw new UnauthorizedError(`Google ID Token signature verification failed: ${errorMessage(verifyErr)}`);
    }
    if (decoded.email_verified !== true) {
      throw new UnauthorizedError("Unverified email addresses from Google accounts cannot be used for authentication.");
    }
    const email = decoded.email?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedError("No email address contained in verified Google ID token.");
    }
    const fullName = decoded.name || decoded.given_name || email.split("@")[0];
    const avatarUrl = decoded.picture || void 0;
    return { email, fullName, avatarUrl };
  }
};

// src/server/services/registration-verification.service.ts
var import_crypto11 = __toESM(require("crypto"), 1);
init_env();
init_redis2();
init_crypto();
init_session_service();
init_app_error();
init_best_effort();
var TTL_SECONDS = 15 * 60;
var RESEND_COOLDOWN_MS = 30 * 1e3;
var MAX_ATTEMPTS = 5;
var RegistrationVerificationService = class {
  constructor() {
    this.userRepo = new UserRepository();
    this.sessionService = new SessionService();
    this.memory = /* @__PURE__ */ new Map();
  }
  key(email) {
    return `happenins:reg:pending:${email}`;
  }
  hashCode(email, code) {
    return import_crypto11.default.createHmac("sha256", getEnv().JWT_SECRET).update(`${email}:${code.trim()}`).digest("hex");
  }
  async load(email) {
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      const raw = await redis.get(this.key(email)).catch(() => null);
      if (raw) return JSON.parse(raw);
    }
    const mem = this.memory.get(this.key(email));
    return mem && mem.expiresAt > Date.now() ? mem : null;
  }
  async save(p) {
    const ttl = Math.max(1, Math.floor((p.expiresAt - Date.now()) / 1e3));
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      await redis.set(this.key(p.email), JSON.stringify(p), "EX", ttl);
      return;
    }
    this.memory.set(this.key(p.email), p);
  }
  async remove(email) {
    this.memory.delete(this.key(email));
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) await redis.del(this.key(email)).catch(bestEffort("redis.del pending registration"));
  }
  /** Response is identical whether or not the address already has an account (no enumeration). */
  async start(data) {
    const email = data.email.trim().toLowerCase();
    if (!data.password || data.password.trim().length < 8) {
      throw new BadRequestError("Password must be at least 8 characters in length.");
    }
    const base = { requiresVerification: true, email, expiresInSeconds: TTL_SECONDS };
    const existing = await this.userRepo.findByEmail(email);
    if (existing && existing.isEmailVerified) {
      await sendSimulatedEmail(
        email,
        "Happenins sign-up attempt",
        `Hi ${existing.fullName},

Someone tried to create a Happenins account with this email address, but you already have one.

If it was you, simply sign in (or use "Forgot password").
If not, you can safely ignore this message.`
      );
      return base;
    }
    const current = await this.load(email);
    if (current && Date.now() - current.createdAt < RESEND_COOLDOWN_MS) {
      return base;
    }
    const code = import_crypto11.default.randomInt(1e5, 1e6).toString();
    const now = Date.now();
    await this.save({
      email,
      fullName: data.fullName.trim(),
      passwordHash: await hashPassword(data.password.trim()),
      codeHash: this.hashCode(email, code),
      attempts: 0,
      createdAt: now,
      expiresAt: now + TTL_SECONDS * 1e3
    });
    await sendSimulatedEmail(
      email,
      `Your Happenins verification code: ${code}`,
      `Hi ${data.fullName.trim()},

Your Happenins email verification code is:

  >>>  ${code}  <<<

It is valid for 15 minutes. If you did not sign up, ignore this email - no account has been created.

Warm regards,
The Happenins Team`
    );
    return { ...base, otpPreview: process.env.NODE_ENV !== "production" ? code : void 0 };
  }
  async complete(emailRaw, code, ipAddress, userAgent) {
    const email = emailRaw.trim().toLowerCase();
    const pending = await this.load(email);
    const invalid = new BadRequestError("Invalid or expired verification code. Please sign up again to get a new code.");
    if (!pending || pending.expiresAt < Date.now()) throw invalid;
    if (pending.attempts >= MAX_ATTEMPTS) {
      await this.remove(email);
      throw new BadRequestError("Too many incorrect attempts. Please sign up again to get a new code.");
    }
    if (!safeCompareStrings(this.hashCode(email, code), pending.codeHash)) {
      pending.attempts += 1;
      await this.save(pending);
      throw invalid;
    }
    await this.remove(email);
    let user = await this.userRepo.findByEmail(email);
    if (user) {
      await this.userRepo.setVerifiedWithPassword(user.id, pending.passwordHash, pending.fullName);
      await this.sessionService.revokeAllUserSessions(user.id, "EMAIL_VERIFIED");
    } else {
      user = await this.userRepo.createUser({
        id: "usr_" + generateSecureToken(8),
        email,
        fullName: pending.fullName,
        passwordHash: pending.passwordHash,
        role: "USER",
        // public registration always yields a plain USER
        isEmailVerified: true,
        emailVerifiedAt: /* @__PURE__ */ new Date()
      });
    }
    const { rawRefreshToken, accessToken, user: sessionUser } = await this.sessionService.createSession(user.id, ipAddress, userAgent);
    return { user: sessionUser, accessToken, rawRefreshToken };
  }
  /**
   * Used only when FEATURE_EMAIL_VERIFICATION_REQUIRED is off (typically local development): the account and
   * session are created immediately and the address stays unverified. Unlike start(), this reveals whether an
   * address is already registered. Google / email-code sign-in still claims unverified accounts safely.
   */
  async registerUnverified(data, ipAddress, userAgent) {
    const email = data.email.trim().toLowerCase();
    if (!data.password || data.password.trim().length < 8) {
      throw new BadRequestError("Password must be at least 8 characters in length.");
    }
    if (await this.userRepo.findByEmail(email)) {
      throw new ConflictError("An account with this email address already exists. Try signing in.");
    }
    const user = await this.userRepo.createUser({
      id: "usr_" + generateSecureToken(8),
      email,
      fullName: data.fullName.trim(),
      passwordHash: await hashPassword(data.password.trim()),
      role: "USER",
      isEmailVerified: false
    });
    const { rawRefreshToken, accessToken, user: sessionUser } = await this.sessionService.createSession(user.id, ipAddress, userAgent);
    return { user: sessionUser, accessToken, rawRefreshToken };
  }
};

// src/server/services/auth.service.ts
init_app_error();
init_db();
var import_crypto14 = __toESM(require("crypto"), 1);
var RESET_TTL_MS = 15 * 60 * 1e3;
var MAX_RESET_OTP_ATTEMPTS = 5;
var AuthService = class {
  constructor() {
    this.userRepo = new UserRepository();
    this.sessionService = new SessionService();
    this.oauthService = new OAuthService();
    this.registrationService = new RegistrationVerificationService();
    this.prisma = getPrisma();
  }
  /** Step 1 of sign-up: stores a pending registration and emails a code. No account or session yet. */
  async register(data) {
    return this.registrationService.start(data);
  }
  /** Sign-up without the emailed code (FEATURE_EMAIL_VERIFICATION_REQUIRED=false): account + session at once. */
  async registerWithoutVerification(data, ipAddress, userAgent) {
    return this.registrationService.registerUnverified(data, ipAddress, userAgent);
  }
  /** Step 2 of sign-up: proves mailbox ownership, creates the verified account and starts a session. */
  async verifyRegistration(email, code, ipAddress, userAgent) {
    return this.registrationService.complete(email, code, ipAddress, userAgent);
  }
  async login(data, ipAddress, userAgent) {
    const cleanEmail = data.email.trim().toLowerCase();
    let user = await this.userRepo.findByEmail(cleanEmail);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email address or password. If you signed up with Google, use "Continue with Google".');
    }
    if (!data.password) {
      throw new BadRequestError("Password is required.");
    }
    const passMatches = await comparePassword(data.password, user.passwordHash);
    if (!passMatches) {
      throw new UnauthorizedError('Invalid email address or password. If you signed up with Google, use "Continue with Google".');
    }
    if (!user.isEmailVerified && isFeatureEnabled("EMAIL_VERIFICATION_REQUIRED")) {
      throw new ForbiddenError("Please verify your email address. Use 'Forgot password' or 'Login with email code' to verify it, then sign in.");
    }
    const { rawRefreshToken, accessToken, user: sessionUser } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent
    );
    return { user: sessionUser, accessToken, rawRefreshToken };
  }
  async googleOAuthLogin(code, state, redirectUri, ipAddress, userAgent) {
    const googleProfile = await this.oauthService.verifyCodeAndExchange(code, state, redirectUri);
    let user = await this.userRepo.findByEmail(googleProfile.email);
    if (!user) {
      const userId = "usr_" + generateSecureToken(8);
      user = await this.userRepo.createUser({
        id: userId,
        email: googleProfile.email,
        fullName: googleProfile.fullName,
        avatarUrl: googleProfile.avatarUrl,
        role: "USER",
        isEmailVerified: true,
        emailVerifiedAt: /* @__PURE__ */ new Date()
      });
    } else if (!user.isEmailVerified) {
      if (await this.userRepo.claimUnverifiedAccount(user.id)) {
        await this.sessionService.revokeAllUserSessions(user.id, "OAUTH_EMAIL_VERIFIED");
      }
      user = await this.userRepo.findById(user.id);
    }
    if (googleProfile.fullName && user.fullName !== googleProfile.fullName) {
      user = await this.userRepo.updateFullName(user.id, googleProfile.fullName);
    }
    const { rawRefreshToken, accessToken, user: sessionUser } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent
    );
    return { user: sessionUser, accessToken, rawRefreshToken };
  }
  async refreshSession(rawRefreshToken, ipAddress, userAgent) {
    const { newRawRefreshToken, accessToken, user } = await this.sessionService.rotateSession(
      rawRefreshToken,
      ipAddress,
      userAgent
    );
    return { user, accessToken, newRawRefreshToken };
  }
  async logout(rawRefreshToken) {
    if (rawRefreshToken) {
      await this.sessionService.revokeSession(rawRefreshToken, "USER_LOGOUT");
    }
  }
  async promoteUserToOrganizer(userId, data) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }
    await this.userRepo.promoteToOrganizer(userId, data.companyName, data.website, data);
    const sessionUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      role: "ORGANIZER"
    };
    return { user: sessionUser };
  }
  async getOrganizerProfile(userId) {
    return this.userRepo.findOrganizerProfileByUserId(userId);
  }
  async forgotPassword(email) {
    const cleanEmail = email.trim().toLowerCase();
    const user = await this.userRepo.findByEmail(cleanEmail);
    if (!user) {
      return { success: true };
    }
    const rawToken = generateSecureToken(32);
    const otp = import_crypto14.default.randomInt(1e5, 1e6).toString();
    const tokenHash = hashToken(rawToken);
    const otpHash = hashToken(`${cleanEmail}:${otp}`);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);
    await this.prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: /* @__PURE__ */ new Date() }
    });
    await this.prisma.passwordResetToken.createMany({
      data: [
        { userId: user.id, tokenHash, expiresAt },
        { userId: user.id, tokenHash: otpHash, expiresAt }
      ]
    });
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const resetLink = `${appUrl}/?view=reset-password&token=${rawToken}&otp=${otp}&email=${encodeURIComponent(user.email)}`;
    await sendSimulatedEmail(
      user.email,
      `Happenins Password Reset Code: ${otp} \u{1F511}`,
      `Hi ${user.fullName},

We received a request to reset your Happenins password.

========================================
YOUR 6-DIGIT PASSWORD RESET OTP CODE:
  >>>  ${otp}  <<<
========================================

Step 1: Enter your 6-digit OTP code on the reset password screen.
Step 2: Generate or enter your new secure password.
Step 3: Save and continue to login.

Direct Reset Link:
${resetLink}

This code and link are valid for 15 minutes.
If you did not request this, you can safely ignore this email.

Warm regards,
The Happenins Security Team`
    );
    return {
      success: true
    };
  }
  async resetPassword(params) {
    const { token, otp, email, newPassword } = params;
    if (!newPassword || newPassword.trim().length < 8) {
      throw new BadRequestError("New password must be at least 8 characters in length.");
    }
    let resetRecord = null;
    if (token && token.trim()) {
      const tokenHash = hashToken(token.trim());
      resetRecord = await this.prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true }
      });
    } else if (otp && email) {
      const cleanEmail = email.trim().toLowerCase();
      const user = await this.userRepo.findByEmail(cleanEmail);
      const active = user ? await this.prisma.passwordResetToken.findMany({
        where: { userId: user.id, usedAt: null, expiresAt: { gt: /* @__PURE__ */ new Date() } }
      }) : [];
      if (user && active.some((r) => r.attempts >= MAX_RESET_OTP_ATTEMPTS)) {
        throw new BadRequestError("Too many incorrect attempts. Please request a fresh OTP code.");
      }
      const otpHash = hashToken(`${cleanEmail}:${otp.trim()}`);
      resetRecord = await this.prisma.passwordResetToken.findUnique({
        where: { tokenHash: otpHash },
        include: { user: true }
      });
      if (resetRecord && user && resetRecord.userId !== user.id) resetRecord = null;
      if (!resetRecord && user && active.length > 0) {
        await this.prisma.passwordResetToken.updateMany({
          where: { id: { in: active.map((r) => r.id) } },
          data: { attempts: { increment: 1 } }
        });
      }
    }
    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < /* @__PURE__ */ new Date()) {
      throw new BadRequestError("Invalid, used, or expired OTP code or reset token. Please request a fresh OTP code.");
    }
    const newHash = await hashPassword(newPassword.trim());
    await this.userRepo.updatePassword(resetRecord.userId, newHash);
    await this.prisma.user.update({
      where: { id: resetRecord.userId },
      data: { isEmailVerified: true, emailVerifiedAt: resetRecord.user.emailVerifiedAt ?? /* @__PURE__ */ new Date() }
    });
    await this.prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: /* @__PURE__ */ new Date() }
    });
    await this.sessionService.revokeAllUserSessions(resetRecord.userId, "PASSWORD_RESET");
    await sendSimulatedEmail(
      resetRecord.user.email,
      "Happenins Password Reset Completed \u{1F512}",
      `Hi ${resetRecord.user.fullName},

Your Happenins password was successfully reset. All active user sessions have been terminated for security.

Please log in with your new password.

Warm regards,
The Happenins Security Team`
    );
  }
  async updateProfile(userId, data) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User does not exist.");
    }
    const updatedUser = await this.userRepo.updateFullName(userId, data.fullName);
    const sessionUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role
    };
    return { user: sessionUser };
  }
  async changePassword(userId, data) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User account not found.");
    }
    if (user.passwordHash) {
      if (!data.oldPassword) {
        throw new BadRequestError("Current password is required.");
      }
      const matches = await comparePassword(data.oldPassword, user.passwordHash);
      if (!matches) {
        throw new BadRequestError("Incorrect current password.");
      }
    }
    if (!data.newPassword || data.newPassword.trim().length < 8) {
      throw new BadRequestError("New password must be at least 8 characters in length.");
    }
    const newHash = await hashPassword(data.newPassword.trim());
    await this.userRepo.updatePassword(userId, newHash);
    await this.sessionService.revokeAllUserSessions(userId, "PASSWORD_CHANGED");
    await sendSimulatedEmail(
      user.email,
      "Happenins Password Updated Successfully \u{1F512}",
      `Hi ${user.fullName},

This is a security alert to confirm that your Happenins account password has been changed.

If you performed this action, please log in again with your new credentials.

Warm regards,
The Happenins Security Team`
    );
  }
  async updateAvatar(userId, avatarUrl) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User does not exist.");
    }
    const updatedUser = await this.userRepo.updateAvatarUrl(userId, avatarUrl);
    const sessionUser = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role
    };
    return { user: sessionUser };
  }
  /**
   * Any role change (promotion or demotion) must end existing sessions: the role is embedded in
   * access tokens, so without revocation a demoted user keeps old privileges until the token expires.
   */
  async changeUserRole(userId, role) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundError("User does not exist.");
    await this.prisma.user.update({ where: { id: userId }, data: { role } });
    await this.sessionService.revokeAllUserSessions(userId, "ROLE_CHANGED");
  }
  async deleteAccount(userId) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User does not exist.");
    }
    if (await this.userRepo.hasActiveOrganizedEvents(userId)) {
      throw new ConflictError("Cancel or complete your upcoming events before deleting this account.");
    }
    await this.sessionService.revokeAllUserSessions(userId, "ACCOUNT_DELETED");
    await this.userRepo.anonymiseUser(userId);
    await sendSimulatedEmail(
      user.email,
      "Happenins Account Permanently Deleted \u{1F464}\u274C",
      `Hi ${user.fullName},

This is a confirmation that your Happenins account has been deleted.

Warm regards,
The Happenins Security Team`
    );
  }
};

// src/server/services/otp-auth.service.ts
var import_crypto15 = __toESM(require("crypto"), 1);
init_redis2();
init_env();
init_logger();
init_metrics();
init_db();
init_session_service();
init_crypto();
init_app_error();
init_best_effort();
init_error_message();
var OtpAuthService = class _OtpAuthService {
  constructor() {
    this.userRepo = new UserRepository();
    this.sessionService = new SessionService();
    this.prisma = getPrisma();
    // In-memory fallback stores when Redis is not available
    this.memoryOtpStore = /* @__PURE__ */ new Map();
    this.memoryRateLimitStore = /* @__PURE__ */ new Map();
  }
  static {
    this.instance = null;
  }
  static getInstance() {
    if (!_OtpAuthService.instance) {
      _OtpAuthService.instance = new _OtpAuthService();
    }
    return _OtpAuthService.instance;
  }
  /**
   * Normalizes identifier to prevent whitespace / case mismatches.
   */
  normalizeIdentifier(rawIdentifier, explicitType) {
    const trimmed = rawIdentifier.trim();
    if (explicitType === "phone" || !explicitType && this.isPhoneNumber(trimmed)) {
      const hasPlus = trimmed.startsWith("+");
      const digitsOnly = trimmed.replace(/\D/g, "");
      const normalized = hasPlus ? `+${digitsOnly}` : digitsOnly.length === 10 ? `+91${digitsOnly}` : `+${digitsOnly}`;
      return { identifier: normalized, type: "phone" };
    }
    return { identifier: trimmed.toLowerCase(), type: "email" };
  }
  isPhoneNumber(str) {
    const digitsOnly = str.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 15 && (str.startsWith("+") || /^\d+$/.test(str.replace(/[\s-()]/g, "")));
  }
  hashOtp(otp) {
    const salt = getEnv().JWT_SECRET;
    return import_crypto15.default.createHmac("sha256", salt).update(otp.trim()).digest("hex");
  }
  /**
   * Request / Send 6-digit numeric OTP for fast drop authentication.
   * Shift cryptographic load completely away from server CPU.
   */
  async sendOtp(rawIdentifier, explicitType) {
    const { identifier, type } = this.normalizeIdentifier(rawIdentifier, explicitType);
    await this.checkRateLimit(identifier);
    const numericOtp = import_crypto15.default.randomInt(1e5, 1e6).toString();
    const otpHash = this.hashOtp(numericOtp);
    const ttlSeconds = 300;
    const expiresAt = Date.now() + ttlSeconds * 1e3;
    const data = {
      otpHash,
      type,
      identifier,
      attempts: 0,
      createdAt: Date.now(),
      expiresAt
    };
    const redis = getRedisClient();
    const redisKey = `happenins:otp:auth:${type}:${identifier}`;
    if (isRedisAvailable() && redis) {
      try {
        await redis.set(redisKey, JSON.stringify(data), "EX", ttlSeconds);
      } catch (err) {
        logger.warn("Redis OTP save failed, falling back to memory store", { message: errorMessage(err) });
        this.memoryOtpStore.set(redisKey, data);
      }
    } else {
      this.memoryOtpStore.set(redisKey, data);
    }
    metrics.incrementCounter("auth_otp_sent_total", type);
    const maskedTarget = this.maskIdentifier(identifier, type);
    if (type === "email") {
      try {
        await this.dispatchEmailOtp(identifier, numericOtp);
      } catch (err) {
        logger.error("Failed to dispatch email OTP:", { error: errorMessage(err), email: identifier });
      }
    } else {
      this.dispatchSmsOtp(identifier, numericOtp).catch((err) => {
        logger.error("Failed to dispatch SMS OTP:", { error: errorMessage(err), phone: identifier });
      });
    }
    const isDevOrTest = process.env.NODE_ENV !== "production";
    return {
      status: "success",
      message: `A 6-digit fast-login OTP has been dispatched to ${maskedTarget}`,
      type,
      maskedTarget,
      expiresInSeconds: ttlSeconds,
      otpPreview: isDevOrTest ? numericOtp : void 0
    };
  }
  /**
   * Verify OTP and complete fast login (sub-millisecond CPU load).
   */
  async verifyOtp(rawIdentifier, otpCode, explicitType, fullName, ipAddress, userAgent) {
    const { identifier, type } = this.normalizeIdentifier(rawIdentifier, explicitType);
    const redisKey = `happenins:otp:auth:${type}:${identifier}`;
    let stored = null;
    const redis = getRedisClient();
    if (isRedisAvailable() && redis) {
      try {
        const raw = await redis.get(redisKey);
        if (raw) stored = JSON.parse(raw);
      } catch (err) {
        bestEffort("redis.get otp")(err);
      }
    }
    if (!stored) {
      stored = this.memoryOtpStore.get(redisKey) || null;
    }
    if (!stored || stored.expiresAt < Date.now()) {
      metrics.incrementCounter("auth_otp_failed_total", "expired_or_not_found");
      throw new ConflictError("The verification OTP has expired or was not requested. Please request a new code.");
    }
    if (stored.attempts >= 5) {
      await this.deleteOtp(redisKey);
      metrics.incrementCounter("auth_otp_failed_total", "max_attempts_exceeded");
      throw new BadRequestError("Too many incorrect verification attempts. This OTP has been invalidated for your security.");
    }
    const incomingHash = this.hashOtp(otpCode);
    const isMatch = safeCompareStrings(incomingHash, stored.otpHash);
    if (!isMatch) {
      stored.attempts++;
      if (isRedisAvailable() && redis) {
        const remainingTtl = Math.max(1, Math.floor((stored.expiresAt - Date.now()) / 1e3));
        await redis.set(redisKey, JSON.stringify(stored), "EX", remainingTtl).catch(bestEffort("redis.set"));
      } else {
        this.memoryOtpStore.set(redisKey, stored);
      }
      metrics.incrementCounter("auth_otp_failed_total", "incorrect_code");
      throw new BadRequestError(`Invalid verification code. ${5 - stored.attempts} attempts remaining.`);
    }
    await this.deleteOtp(redisKey);
    metrics.incrementCounter("auth_otp_verified_total", type);
    let user = null;
    let isNewUser = false;
    if (type === "email") {
      user = await this.userRepo.findByEmail(identifier);
      if (!user) {
        isNewUser = true;
        const userId = "usr_" + generateSecureToken(8);
        const derivedName = fullName?.trim() || this.deriveNameFromEmail(identifier);
        user = await this.userRepo.createUser({
          id: userId,
          email: identifier,
          fullName: derivedName,
          role: "USER",
          isEmailVerified: true
        });
        logger.info(`Auto-provisioned new fast-drop user via Email OTP: ${identifier} (${userId})`);
      } else if (!user.isEmailVerified) {
        if (await this.userRepo.claimUnverifiedAccount(user.id)) {
          await this.sessionService.revokeAllUserSessions(user.id, "OTP_EMAIL_VERIFIED");
        }
      }
    } else {
      const phoneEmail = `phone_${identifier.replace(/\D/g, "")}@mobile.happenins.internal`;
      user = await this.userRepo.findByEmail(phoneEmail);
      if (!user) {
        isNewUser = true;
        const userId = "usr_" + generateSecureToken(8);
        const derivedName = fullName?.trim() || `Fan ${identifier.slice(-4)}`;
        user = await this.userRepo.createUser({
          id: userId,
          email: phoneEmail,
          fullName: derivedName,
          role: "USER",
          isEmailVerified: true
        });
        logger.info(`Auto-provisioned new fast-drop user via Phone OTP: ${identifier} (${userId})`);
      }
    }
    const { rawRefreshToken, accessToken, user: sessionUser } = await this.sessionService.createSession(
      user.id,
      ipAddress,
      userAgent
    );
    return {
      user: sessionUser,
      accessToken,
      rawRefreshToken,
      isNewUser
    };
  }
  async deleteOtp(redisKey) {
    this.memoryOtpStore.delete(redisKey);
    const redis = getRedisClient();
    if (isRedisAvailable() && redis) {
      await redis.del(redisKey);
    }
  }
  async checkRateLimit(identifier) {
    const rateLimitKey = `happenins:otp:ratelimit:${identifier}`;
    const windowSeconds = 600;
    const maxRequests = 3;
    const redis = getRedisClient();
    if (isRedisAvailable() && redis) {
      try {
        const count = await redis.incr(rateLimitKey);
        if (count === 1) {
          await redis.expire(rateLimitKey, windowSeconds);
        }
        if (count > maxRequests) {
          const ttl = await redis.ttl(rateLimitKey);
          throw new TooManyRequestsError(`Too many OTP requests. Please wait ${Math.max(1, Math.ceil(ttl / 60))} minute(s) before requesting again.`);
        }
        return;
      } catch (err) {
        if (err instanceof TooManyRequestsError) throw err;
      }
    }
    const now = Date.now();
    const entry = this.memoryRateLimitStore.get(rateLimitKey);
    if (entry && entry.resetAt > now) {
      if (entry.count >= maxRequests) {
        const remainingMinutes = Math.max(1, Math.ceil((entry.resetAt - now) / 6e4));
        throw new TooManyRequestsError(`Too many OTP requests. Please wait ${remainingMinutes} minute(s) before requesting again.`);
      }
      entry.count++;
    } else {
      this.memoryRateLimitStore.set(rateLimitKey, { count: 1, resetAt: now + windowSeconds * 1e3 });
    }
  }
  maskIdentifier(identifier, type) {
    if (type === "email") {
      const [name, domain] = identifier.split("@");
      if (!domain) return identifier;
      const maskedName = name.length <= 2 ? `${name}*` : `${name.slice(0, 2)}***${name.slice(-1)}`;
      return `${maskedName}@${domain}`;
    } else {
      if (identifier.length <= 4) return identifier;
      return `${identifier.slice(0, 3)}*****${identifier.slice(-4)}`;
    }
  }
  deriveNameFromEmail(email) {
    const namePart = email.split("@")[0].replace(/[._-]/g, " ");
    return namePart.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }
  async dispatchEmailOtp(email, otp) {
    const messageId = `otp_${Date.now()}_${import_crypto15.default.randomBytes(4).toString("hex")}`;
    const subject = `Your Happenins Fast-Login Code: ${otp}`;
    const body = `Hi there,

Your 6-digit login verification code for Happenins is:

\u{1F449}  ${otp}  \u{1F448}

This single-use code is valid for 5 minutes.
If you did not request this verification code, please ignore this email.

Warm regards,
The Happenins Platform Team`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; color: #f8fafc;">
        <div style="background: linear-gradient(135deg, #18182f 0%, #0d1117 100%); padding: 32px 24px; text-align: center; border-bottom: 1px solid #1e293b;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">HAPPEN<span style="color: #f43f5e;">INS</span></h1>
          <p style="margin: 6px 0 0; color: #94a3b8; font-size: 13px;">Secure Login Code</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
          <p style="margin: 0 0 20px; font-size: 15px; color: #cbd5e1;">Use this one-time verification code to sign in to your Happenins account:</p>
          <div style="display: inline-block; background: #1e1e38; border: 2px dashed #f43f5e; border-radius: 12px; padding: 16px 36px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ffffff; margin: 12px 0 24px;">
            ${otp}
          </div>
          <p style="margin: 0; font-size: 13px; color: #94a3b8;">This code will expire in <strong>5 minutes</strong>. Never share this code with anyone.</p>
        </div>
        <div style="background: #080b12; padding: 20px; text-align: center; border-top: 1px solid #1e293b; font-size: 12px; color: #64748b;">
          <p style="margin: 0;">\xA9 ${(/* @__PURE__ */ new Date()).getFullYear()} Happenins Platform. If you didn't request this code, you can safely ignore this email.</p>
        </div>
      </div>
    `;
    await enqueueTransactionalEmail(email, subject, body, html, messageId);
  }
  async dispatchSmsOtp(phone, otp) {
    if (process.env.NODE_ENV === "production") {
      logger.info("SMS OTP dispatch simulated", { toLast4: phone.slice(-4) });
      return;
    }
    logger.info(`[FAST-DROP SMS DISPATCH SIMULATOR] To: ${phone} | Body: "[Happenins] Your fast-drop login code is ${otp}. Valid for 5 minutes. Do not share this code."`);
  }
};
var otpAuthService = OtpAuthService.getInstance();

// src/server/controllers/auth.controller.ts
var import_zod4 = require("zod");
init_security();
init_logger();
init_app_error();

// src/server/utils/http-error.ts
var import_zod3 = require("zod");
init_app_error();
init_logger();
init_error_message();
var INTERNAL_MESSAGE_PATTERN = /prisma|invocation|ECONN|ETIMEDOUT|ENOTFOUND|EAI_AGAIN|socket hang up|razorpay|smtp|redis|relation ".*" does not exist|\bat .+\(.+:\d+:\d+\)/i;
function publicErrorMessage(error, fallback) {
  if (error instanceof AppError) return error.message || fallback;
  const err = error ?? {};
  const message = typeof err.message === "string" ? err.message : "";
  const looksInternal = !message || message.length > 300 || typeof err.code === "string" && /^P\d{4}$/.test(err.code) || /prisma|razorpay/i.test(typeof err.name === "string" ? err.name : "") || err.error && typeof err.error === "object" || // Razorpay SDK error shape
  err.errno !== void 0 || err.syscall !== void 0 || INTERNAL_MESSAGE_PATTERN.test(message);
  if (looksInternal) {
    logger.error("Suppressed internal error from API response", { message: message.slice(0, 500), name: err.name, code: err.code });
    return fallback;
  }
  return message;
}
function respondWithError(res, err, fallback, defaultStatus = 400) {
  if (err instanceof import_zod3.ZodError) {
    res.status(400).json({ error: err.issues[0]?.message || "Invalid request" });
    return;
  }
  const status = err instanceof AppError ? err.statusCode : defaultStatus;
  res.status(status).json({ error: publicErrorMessage(err, fallback) });
}

// src/server/controllers/auth.controller.ts
var registerSchema = import_zod4.z.object({
  email: import_zod4.z.string().email("Invalid email format").trim().toLowerCase(),
  fullName: import_zod4.z.string().min(2, "Name must be at least 2 characters").trim(),
  password: import_zod4.z.string().min(8, "Password must be at least 8 characters").trim()
});
var verifyRegistrationSchema = import_zod4.z.object({
  email: import_zod4.z.string().email("Invalid email format").trim().toLowerCase(),
  code: import_zod4.z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your email")
});
var loginSchema = import_zod4.z.object({
  email: import_zod4.z.string().email("Invalid email format").trim().toLowerCase(),
  password: import_zod4.z.string().min(1, "Password is required")
});
var sendOtpSchema = import_zod4.z.object({
  identifier: import_zod4.z.string().min(3, "Identifier must be a valid email or phone number").trim(),
  type: import_zod4.z.enum(["email", "phone"]).optional()
});
var verifyOtpSchema = import_zod4.z.object({
  identifier: import_zod4.z.string().min(3, "Identifier is required").trim(),
  otp: import_zod4.z.string().min(4, "OTP must be at least 4 digits").max(8).trim(),
  type: import_zod4.z.enum(["email", "phone"]).optional(),
  fullName: import_zod4.z.string().optional()
});
var onboardSchema = import_zod4.z.object({
  companyName: import_zod4.z.string().min(2, "Company name must be at least 2 characters"),
  website: import_zod4.z.string().optional(),
  entityType: import_zod4.z.string().optional(),
  phone: import_zod4.z.string().optional(),
  businessAddress: import_zod4.z.string().optional(),
  taxId: import_zod4.z.string().optional(),
  representativeTitle: import_zod4.z.string().optional(),
  bankName: import_zod4.z.string().optional(),
  bankAccountName: import_zod4.z.string().optional(),
  bankAccountNumber: import_zod4.z.string().optional(),
  acceptedTerms: import_zod4.z.boolean().optional(),
  acceptedLiability: import_zod4.z.boolean().optional(),
  acceptedPrivacy: import_zod4.z.boolean().optional()
});
var updateProfileSchema = import_zod4.z.object({
  fullName: import_zod4.z.string().min(2, "Name must be at least 2 characters").trim()
});
var changePasswordSchema = import_zod4.z.object({
  oldPassword: import_zod4.z.string().optional(),
  newPassword: import_zod4.z.string().min(8, "New password must be at least 8 characters")
});
var resetPasswordSchema = import_zod4.z.object({
  token: import_zod4.z.string().optional(),
  otp: import_zod4.z.string().optional(),
  email: import_zod4.z.string().email().optional(),
  newPassword: import_zod4.z.string().min(8, "New password must be at least 8 characters")
});
var AVATAR_ALLOWED_HOSTS = ["images.unsplash.com", "lh3.googleusercontent.com", ...(process.env.AVATAR_ALLOWED_HOSTS || "").split(",").map((h) => h.trim()).filter(Boolean)];
var avatarUrlSchema = import_zod4.z.string().max(500).refine((v) => {
  if (/^gradient:[a-z]+-to-[a-z]+$/.test(v)) return true;
  try {
    const u = new URL(v);
    return u.protocol === "https:" && !u.username && !u.password && AVATAR_ALLOWED_HOSTS.includes(u.hostname);
  } catch {
    return false;
  }
}, "Avatar must be a built-in gradient or an https image from an approved host.");
var updateAvatarSchema = import_zod4.z.object({
  avatarUrl: avatarUrlSchema
});
var AuthController = class {
  constructor() {
    this.authService = new AuthService();
    this.oauthService = new OAuthService();
    this.register = async (req, res) => {
      try {
        const body = registerSchema.parse(req.body);
        if (!isFeatureEnabled("EMAIL_VERIFICATION_REQUIRED")) {
          const created = await this.authService.registerWithoutVerification(body, req.ip, req.get("User-Agent"));
          this.setAuthCookies(res, created.rawRefreshToken, created.accessToken);
          return res.status(201).json({ requiresVerification: false, user: created.user, accessToken: created.accessToken });
        }
        const result = await this.authService.register(body);
        res.status(202).json(result);
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to register", 400);
        }
      }
    };
    this.verifyRegistration = async (req, res) => {
      try {
        const body = verifyRegistrationSchema.parse(req.body);
        const result = await this.authService.verifyRegistration(body.email, body.code, req.ip, req.get("User-Agent"));
        this.setAuthCookies(res, result.rawRefreshToken, result.accessToken);
        try {
          await sendSimulatedEmail(
            result.user.email,
            "Welcome to Happenins! \u{1F39F}\uFE0F",
            `Hi ${result.user.fullName},

We are thrilled to welcome you to Happenins!

Your email is verified and your account is active. You can now browse events and get verified tickets.`
          );
        } catch (emlErr) {
          logger.warn("Non-blocking welcome email failure", { message: emlErr.message });
        }
        res.status(201).json({ user: result.user, accessToken: result.accessToken });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Verification failed", 400);
        }
      }
    };
    this.login = async (req, res) => {
      try {
        const body = loginSchema.parse(req.body);
        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const result = await this.authService.login(body, ip, userAgent);
        this.setAuthCookies(res, result.rawRefreshToken, result.accessToken);
        res.status(200).json({ user: result.user, accessToken: result.accessToken });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Invalid credentials", 400);
        }
      }
    };
    this.sendOtp = async (req, res) => {
      try {
        const body = sendOtpSchema.parse(req.body);
        const result = await otpAuthService.sendOtp(body.identifier, body.type);
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to send verification code", 400);
        }
      }
    };
    this.verifyOtp = async (req, res) => {
      try {
        const body = verifyOtpSchema.parse(req.body);
        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const result = await otpAuthService.verifyOtp(
          body.identifier,
          body.otp,
          body.type,
          body.fullName,
          ip,
          userAgent
        );
        this.setAuthCookies(res, result.rawRefreshToken, result.accessToken);
        res.status(200).json({
          user: result.user,
          accessToken: result.accessToken,
          isNewUser: result.isNewUser,
          message: result.isNewUser ? "Welcome to Happenins! Account created successfully." : "Login successful"
        });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Invalid or expired verification code", 400);
        }
      }
    };
    this.refresh = async (req, res) => {
      try {
        const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!rawRefreshToken) {
          throw new UnauthorizedError("Refresh token missing from request.");
        }
        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const result = await this.authService.refreshSession(rawRefreshToken, ip, userAgent);
        this.setAuthCookies(res, result.newRawRefreshToken, result.accessToken);
        res.status(200).json({ user: result.user, accessToken: result.accessToken });
      } catch (err) {
        this.clearAuthCookies(res);
        respondWithError(res, err, "Session renewal failed.", 401);
      }
    };
    this.logout = async (req, res) => {
      try {
        const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (rawRefreshToken) {
          await this.authService.logout(rawRefreshToken);
        }
      } catch (err) {
      } finally {
        this.clearAuthCookies(res);
        res.status(200).json({ message: "Logout successful" });
      }
    };
    this.getCurrentUser = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(200).json({ user: null });
        }
        res.status(200).json({ user: req.user });
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.getGoogleUrl = async (req, res) => {
      try {
        const redirectUri = req.query.redirectUri;
        if (!redirectUri) {
          return res.status(400).json({ error: "redirectUri query parameter is required" });
        }
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId || clientId === "YOUR_GOOGLE_CLIENT_ID" || clientId.trim() === "") {
          throw new BadRequestError("Google OAuth Client ID is not configured on the server. Please provide GOOGLE_CLIENT_ID.");
        }
        const authData = await this.oauthService.generateAuthUrl(redirectUri);
        res.status(200).json({ url: authData.url, state: authData.state });
      } catch (err) {
        respondWithError(res, err, "Failed to generate Google auth URL", 500);
      }
    };
    this.googleCallback = async (req, res) => {
      try {
        const { code, state, redirectUri } = import_zod4.z.object({
          code: import_zod4.z.string().min(1, "Authorization code is required"),
          state: import_zod4.z.string().min(1, "State parameter is required for Google PKCE OAuth verification"),
          redirectUri: import_zod4.z.string().min(1, "redirectUri is required")
        }).parse(req.body);
        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const result = await this.authService.googleOAuthLogin(code, state, redirectUri, ip, userAgent);
        this.setAuthCookies(res, result.rawRefreshToken, result.accessToken);
        res.status(200).json({ user: result.user, accessToken: result.accessToken });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Google Authentication failed", 400);
        }
      }
    };
    this.onboardOrganizer = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = onboardSchema.parse(req.body);
        const result = await this.authService.promoteUserToOrganizer(req.user.id, {
          companyName: body.companyName,
          website: body.website || void 0,
          entityType: body.entityType,
          phone: body.phone,
          businessAddress: body.businessAddress,
          taxId: body.taxId,
          representativeTitle: body.representativeTitle,
          bankName: body.bankName,
          bankAccountName: body.bankAccountName,
          bankAccountNumber: body.bankAccountNumber,
          acceptedTermsAt: /* @__PURE__ */ new Date(),
          acceptedLiability: body.acceptedLiability ?? true,
          acceptedPrivacy: body.acceptedPrivacy ?? true
        });
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Onboarding failed", 400);
        }
      }
    };
    this.getOrganizerProfile = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const profile = await this.authService.getOrganizerProfile(req.user.id);
        res.status(200).json({ profile });
      } catch (err) {
        respondWithError(res, err, "Failed to fetch organizer profile", 500);
      }
    };
    this.forgotPassword = async (req, res) => {
      try {
        const { email } = import_zod4.z.object({ email: import_zod4.z.string().email().trim().toLowerCase() }).parse(req.body);
        const result = await this.authService.forgotPassword(email);
        res.status(200).json({
          message: "If an account matches this email, a 6-digit OTP code and password reset link have been sent."
        });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to process password recovery request", 400);
        }
      }
    };
    this.resetPassword = async (req, res) => {
      try {
        const { token, otp, email, newPassword } = resetPasswordSchema.parse(req.body);
        if (!token && !(otp && email)) {
          return res.status(400).json({ error: "Please provide your email with the 6-digit OTP, or the secure reset link token." });
        }
        await this.authService.resetPassword({ token, otp, email, newPassword });
        res.status(200).json({
          status: "success",
          message: "Password reset completed successfully. Please log in with your new password."
        });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Password reset failed", 400);
        }
      }
    };
    this.updateProfile = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = updateProfileSchema.parse(req.body);
        const result = await this.authService.updateProfile(req.user.id, body);
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Profile update failed", 400);
        }
      }
    };
    this.changePassword = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = changePasswordSchema.parse(req.body);
        await this.authService.changePassword(req.user.id, body);
        res.status(200).json({ status: "success", message: "Password updated successfully." });
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Password change failed", 400);
        }
      }
    };
    this.updateAvatar = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = updateAvatarSchema.parse(req.body);
        const result = await this.authService.updateAvatar(req.user.id, body.avatarUrl);
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod4.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Avatar update failed", 400);
        }
      }
    };
    this.deleteAccount = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        await this.authService.deleteAccount(req.user.id);
        this.clearAuthCookies(res);
        res.status(200).json({ status: "success", message: "Account deleted successfully." });
      } catch (err) {
        respondWithError(res, err, "Account deletion failed", 400);
      }
    };
  }
  setAuthCookies(res, rawRefreshToken, accessToken) {
    const { cookieSameSite: sameSite, cookieSecure: secure } = getSecurityConfig();
    res.cookie("refreshToken", rawRefreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
  }
  clearAuthCookies(res) {
    res.clearCookie("refreshToken", { path: "/" });
    res.clearCookie("token", { path: "/" });
  }
};

// src/server/config/payment.ts
init_env();
init_features();
init_app_error();
function arePaymentsEnabled() {
  getEnv();
  return isFeatureEnabled("PAYMENTS");
}
function assertPaymentsEnabled() {
  if (!arePaymentsEnabled()) {
    throw new ForbiddenError("Paid tickets are not enabled on this deployment. Only free tickets are available.");
  }
}
function assertTiersAllowed(tiers) {
  if (!arePaymentsEnabled() && (tiers || []).some((t) => (t.price ?? 0) > 0)) {
    throw new ForbiddenError("Paid ticket tiers are not enabled on this deployment. Set every tier price to 0.");
  }
}

// src/server/config/feature-guards.ts
init_app_error();
init_features();
function assertFeatureEnabled(key, message) {
  if (!isFeatureEnabled(key)) {
    throw new ForbiddenError(message ?? `${FEATURE_DEFINITIONS[key].description} is not enabled on this deployment.`);
  }
}
function assertEventFeaturesAllowed(data) {
  if (data.hasSeatingPlan) assertFeatureEnabled("SEATING_PLANS", "Seating plans are not enabled on this deployment.");
  const policy = data.accessPolicy?.policyType;
  if (policy && policy !== "PUBLIC") assertFeatureEnabled("INSTITUTION_ACCESS", "Institute-restricted events are not enabled on this deployment.");
}

// src/server/repositories/event.repository.ts
init_db();
var EventRepository = class {
  constructor() {
    this.prisma = getPrisma();
  }
  async findMany(filters = {}) {
    const { category, city, search, status = "PUBLISHED", limit = 12, page = 1, includePassed = false } = filters;
    const skip = (page - 1) * limit;
    const where = {
      status
    };
    if (!includePassed && (status === "PUBLISHED" || !status)) {
      where.endsAt = { gte: /* @__PURE__ */ new Date() };
    }
    if (category && category !== "All") {
      where.category = { equals: category };
    }
    if (city && city !== "All") {
      where.city = { equals: city };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { venue: { contains: search } }
      ];
    }
    const [events, total] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        include: {
          organizer: {
            include: { user: true }
          },
          ticketTiers: true,
          accessPolicy: true
        },
        orderBy: [{ startsAt: "asc" }],
        take: limit,
        skip
      }),
      this.prisma.event.count({ where })
    ]);
    return { events, total };
  }
  async findBySlug(slug) {
    return this.prisma.event.findUnique({
      where: { slug },
      include: {
        organizer: {
          include: { user: true }
        },
        ticketTiers: true,
        accessPolicy: true
      }
    });
  }
  async findById(id) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          include: { user: true }
        },
        ticketTiers: true,
        accessPolicy: true
      }
    });
  }
  async createEvent(data) {
    return this.prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          organizerId: data.organizerId,
          title: data.title,
          slug: data.slug,
          description: data.description,
          category: data.category,
          locationType: data.locationType,
          venue: data.venue || null,
          city: data.city || null,
          startsAt: data.startsAt,
          endsAt: data.endsAt,
          bannerUrl: data.bannerUrl || null,
          status: data.status || "DRAFT",
          hasSeatingPlan: data.hasSeatingPlan ?? false,
          seatingRows: data.seatingRows ?? 10,
          seatingCols: data.seatingCols ?? 10
        }
      });
      const tiers = await Promise.all(
        data.ticketTiers.map(
          (tier) => tx.ticketTier.create({
            data: {
              eventId: event.id,
              name: tier.name,
              description: tier.description || null,
              price: tier.price,
              capacity: tier.capacity
            }
          })
        )
      );
      let policy = null;
      if (data.accessPolicy) {
        policy = await tx.eventAccessPolicy.create({
          data: {
            eventId: event.id,
            policyType: data.accessPolicy.policyType || "PUBLIC",
            allowedDomains: JSON.stringify(data.accessPolicy.allowedDomains || []),
            requireVerifiedEmail: data.accessPolicy.requireVerifiedEmail ?? true,
            allowFreeTickets: data.accessPolicy.allowFreeTickets ?? false,
            customRestrictionMessage: data.accessPolicy.customRestrictionMessage || null
          }
        });
      }
      return { ...event, ticketTiers: tiers, accessPolicy: policy };
    });
  }
  async updateStatus(eventId, status) {
    return this.prisma.event.update({
      where: { id: eventId },
      data: { status }
    });
  }
  async updateEvent(eventId, data) {
    return this.prisma.$transaction(async (tx) => {
      const updateData = {};
      if (data.title !== void 0) updateData.title = data.title;
      if (data.description !== void 0) updateData.description = data.description;
      if (data.category !== void 0) updateData.category = data.category;
      if (data.locationType !== void 0) updateData.locationType = data.locationType;
      if (data.venue !== void 0) updateData.venue = data.venue;
      if (data.city !== void 0) updateData.city = data.city;
      if (data.startsAt !== void 0) updateData.startsAt = data.startsAt;
      if (data.endsAt !== void 0) updateData.endsAt = data.endsAt;
      if (data.bannerUrl !== void 0) updateData.bannerUrl = data.bannerUrl;
      if (data.status !== void 0) updateData.status = data.status;
      if (data.hasSeatingPlan !== void 0) updateData.hasSeatingPlan = data.hasSeatingPlan;
      if (data.seatingRows !== void 0) updateData.seatingRows = data.seatingRows;
      if (data.seatingCols !== void 0) updateData.seatingCols = data.seatingCols;
      await tx.event.update({
        where: { id: eventId },
        data: updateData
      });
      if (data.ticketTiers && data.ticketTiers.length > 0) {
        const providedIds = data.ticketTiers.map((t) => t.id).filter(Boolean);
        await tx.ticketTier.deleteMany({
          where: {
            eventId,
            sold: 0,
            reserved: 0,
            id: { notIn: providedIds }
          }
        });
        for (const tier of data.ticketTiers) {
          if (tier.id) {
            const existing = await tx.ticketTier.findUnique({ where: { id: tier.id } });
            if (existing) {
              await tx.ticketTier.update({
                where: { id: tier.id },
                data: {
                  name: tier.name,
                  description: tier.description || null,
                  price: tier.price,
                  capacity: tier.capacity
                }
              });
              continue;
            }
          }
          await tx.ticketTier.create({
            data: {
              eventId,
              name: tier.name,
              description: tier.description || null,
              price: tier.price,
              capacity: tier.capacity
            }
          });
        }
      }
      if (data.accessPolicy) {
        await tx.eventAccessPolicy.upsert({
          where: { eventId },
          create: {
            eventId,
            policyType: data.accessPolicy.policyType || "PUBLIC",
            allowedDomains: JSON.stringify(data.accessPolicy.allowedDomains || []),
            requireVerifiedEmail: data.accessPolicy.requireVerifiedEmail ?? true,
            allowFreeTickets: data.accessPolicy.allowFreeTickets ?? false,
            customRestrictionMessage: data.accessPolicy.customRestrictionMessage || null
          },
          update: {
            policyType: data.accessPolicy.policyType,
            allowedDomains: JSON.stringify(data.accessPolicy.allowedDomains || []),
            requireVerifiedEmail: data.accessPolicy.requireVerifiedEmail ?? true,
            allowFreeTickets: data.accessPolicy.allowFreeTickets ?? false,
            customRestrictionMessage: data.accessPolicy.customRestrictionMessage || null
          }
        });
      }
      return tx.event.findUnique({
        where: { id: eventId },
        include: {
          organizer: { include: { user: true } },
          ticketTiers: true,
          accessPolicy: true
        }
      });
    });
  }
  async getOrganizerEvents(organizerId) {
    return this.prisma.event.findMany({
      where: { organizerId },
      include: {
        ticketTiers: true,
        accessPolicy: true
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async incrementTicketSales(tierId, quantity, transactionContext) {
    const tx = transactionContext || this.prisma;
    return tx.ticketTier.update({
      where: { id: tierId },
      data: {
        sold: { increment: quantity },
        reserved: { decrement: quantity }
      }
    });
  }
  async deleteEvent(eventId) {
    await this.prisma.$transaction(async (tx) => {
      const bookings = await tx.booking.findMany({
        where: { eventId },
        select: { id: true }
      });
      const bookingIds = bookings.map((b) => b.id);
      if (bookingIds.length > 0) {
        await tx.attendance.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        await tx.ticketTransfer.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        await tx.ticket.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        await tx.bookingSplitShare.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        await tx.payment.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        await tx.bookingItem.deleteMany({
          where: { bookingId: { in: bookingIds } }
        });
        await tx.booking.deleteMany({
          where: { id: { in: bookingIds } }
        });
      }
      await tx.eventSeat.deleteMany({
        where: { eventId }
      });
      await tx.promoCode.deleteMany({
        where: { eventId }
      });
      await tx.review.deleteMany({
        where: { eventId }
      });
      await tx.ticketTier.deleteMany({
        where: { eventId }
      });
      await tx.eventAccessPolicy.deleteMany({
        where: { eventId }
      });
      await tx.event.delete({
        where: { id: eventId }
      });
    });
  }
};

// src/server/utils/cache.ts
init_logger();
init_metrics();
init_redis2();
init_best_effort();
init_error_message();
var DistributedCacheManager = class {
  constructor() {
    this.localStore = /* @__PURE__ */ new Map();
    this.inFlightFetches = /* @__PURE__ */ new Map();
    this.maxLocalEntries = 2e3;
  }
  /**
   * Retrieves a cached item from Redis (or local memory fallback)
   */
  async get(key) {
    const scope = key.split(":")[0] || "global";
    const redis = getRedisClient();
    const redisActive = isRedisAvailable() && redis !== null;
    if (redisActive && redis) {
      try {
        const fullKey = RedisKeys.cache("data", key);
        const data = await redis.get(fullKey);
        if (data) {
          metrics.incrementCounter("cache_hits", scope);
          metrics.incrementCounter("cache_operations_total", { operation: "get", result: "hit", scope });
          return JSON.parse(data);
        }
      } catch (err) {
        logger.warn("Redis cache read failed - falling back to local store", {
          key,
          message: errorMessage(err)
        });
      }
    }
    const localEntry = this.localStore.get(key);
    if (localEntry) {
      if (Date.now() <= localEntry.expiresAt) {
        metrics.incrementCounter("cache_hits", scope);
        metrics.incrementCounter("cache_operations_total", { operation: "get", result: "hit", scope });
        return localEntry.value;
      }
      this.localStore.delete(key);
    }
    metrics.incrementCounter("cache_misses", scope);
    metrics.incrementCounter("cache_operations_total", { operation: "get", result: "miss", scope });
    return null;
  }
  /**
   * Stores an item in Redis with TTL (and local memory fallback)
   */
  async set(key, value, ttlSeconds = 60) {
    const scope = key.split(":")[0] || "global";
    const redis = getRedisClient();
    const redisActive = isRedisAvailable() && redis !== null;
    if (redisActive && redis) {
      try {
        const fullKey = RedisKeys.cache("data", key);
        await redis.set(fullKey, JSON.stringify(value), "EX", ttlSeconds);
      } catch (err) {
        logger.warn("Redis cache write failed - writing to local fallback", {
          key,
          message: errorMessage(err)
        });
      }
    }
    if (this.localStore.size >= this.maxLocalEntries) {
      const firstKey = this.localStore.keys().next().value;
      if (firstKey) this.localStore.delete(firstKey);
    }
    this.localStore.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1e3
    });
    metrics.incrementCounter("cache_operations_total", { operation: "set", result: "success", scope });
  }
  /**
   * Cache Stampede Protection:
   * Coordinates concurrent requests on cache miss so only ONE instance
   * rebuilds the cache from PostgreSQL while others await the result.
   */
  async getOrSet(key, fetchFn, ttlSeconds = 60) {
    const existing = await this.get(key);
    if (existing !== null && existing !== void 0) {
      return existing;
    }
    if (this.inFlightFetches.has(key)) {
      return this.inFlightFetches.get(key);
    }
    const redis = getRedisClient();
    const redisActive = isRedisAvailable() && redis !== null;
    const executeAndCache = async () => {
      try {
        const freshData = await fetchFn();
        await this.set(key, freshData, ttlSeconds);
        return freshData;
      } finally {
        this.inFlightFetches.delete(key);
      }
    };
    if (!redisActive || !redis) {
      const fetchPromise = executeAndCache();
      this.inFlightFetches.set(key, fetchPromise);
      return fetchPromise;
    }
    const lockKey = RedisKeys.lock("cache_rebuild", key);
    const lockAcquired = await redis.set(lockKey, "locked", "EX", 5, "NX");
    if (lockAcquired) {
      const fetchPromise = (async () => {
        try {
          return await executeAndCache();
        } finally {
          await redis.del(lockKey).catch(bestEffort("redis.del"));
        }
      })();
      this.inFlightFetches.set(key, fetchPromise);
      return fetchPromise;
    }
    for (let attempt = 0; attempt < 3; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 60));
      const retryCached = await this.get(key);
      if (retryCached !== null && retryCached !== void 0) {
        return retryCached;
      }
    }
    const fallbackPromise = executeAndCache();
    this.inFlightFetches.set(key, fallbackPromise);
    return fallbackPromise;
  }
  /**
   * Invalidates all cache keys matching a pattern globally across Redis and local memory
   */
  async invalidate(pattern) {
    const redis = getRedisClient();
    const redisActive = isRedisAvailable() && redis !== null;
    if (redisActive && redis) {
      try {
        const searchPattern = `happenins:cache:data:*${pattern}*`;
        let cursor = "0";
        let removed = 0;
        do {
          const [next, keys] = await redis.scan(cursor, "MATCH", searchPattern, "COUNT", 200);
          cursor = next;
          if (keys.length > 0) {
            await redis.del(...keys);
            removed += keys.length;
          }
        } while (cursor !== "0");
        if (removed > 0) {
          logger.info(`Redis cache invalidated ${removed} keys matching pattern: ${pattern}`);
        }
      } catch (err) {
        logger.warn("Failed to invalidate Redis cache pattern", { pattern, message: errorMessage(err) });
      }
    }
    let localCount = 0;
    for (const key of this.localStore.keys()) {
      if (key.includes(pattern)) {
        this.localStore.delete(key);
        localCount++;
      }
    }
    if (localCount > 0) {
      logger.info(`Local cache invalidated ${localCount} keys matching pattern: ${pattern}`);
    }
  }
  /**
   * Clears all cache entries
   */
  async clear() {
    this.localStore.clear();
    const redis = getRedisClient();
    if (isRedisAvailable() && redis) {
      try {
        const keys = await redis.keys("happenins:cache:data:*");
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (err) {
        logger.warn("Failed to clear Redis cache", { message: errorMessage(err) });
      }
    }
  }
};
var appCache = new DistributedCacheManager();

// src/server/services/event.service.ts
init_app_error();
var EventService = class {
  constructor() {
    this.eventRepo = new EventRepository();
    this.userRepo = new UserRepository();
  }
  mapEventToDTO(event) {
    let accessPolicyDTO = null;
    if (event.accessPolicy) {
      let allowedDomains = [];
      try {
        allowedDomains = JSON.parse(event.accessPolicy.allowedDomains || "[]");
      } catch {
        allowedDomains = [];
      }
      accessPolicyDTO = {
        id: event.accessPolicy.id,
        eventId: event.accessPolicy.eventId,
        policyType: event.accessPolicy.policyType,
        allowedDomains,
        requireVerifiedEmail: event.accessPolicy.requireVerifiedEmail ?? true,
        allowFreeTickets: event.accessPolicy.allowFreeTickets ?? false,
        customRestrictionMessage: event.accessPolicy.customRestrictionMessage || null,
        createdAt: event.accessPolicy.createdAt ? event.accessPolicy.createdAt.toISOString() : void 0,
        updatedAt: event.accessPolicy.updatedAt ? event.accessPolicy.updatedAt.toISOString() : void 0
      };
    }
    return {
      id: event.id,
      organizerId: event.organizerId,
      organizerName: event.organizer?.user?.fullName || "Verified Organizer",
      title: event.title,
      slug: event.slug,
      description: event.description,
      category: event.category,
      bannerUrl: event.bannerUrl,
      locationType: event.locationType,
      venue: event.venue,
      city: event.city,
      status: event.status,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      createdAt: event.createdAt.toISOString(),
      hasSeatingPlan: event.hasSeatingPlan,
      seatingRows: event.seatingRows,
      seatingCols: event.seatingCols,
      accessPolicy: accessPolicyDTO,
      ticketTiers: event.ticketTiers.map((tier) => ({
        id: tier.id,
        eventId: tier.eventId,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        capacity: tier.capacity,
        reserved: tier.reserved,
        sold: tier.sold
      }))
    };
  }
  async createEvent(userId, data) {
    assertTiersAllowed(data.ticketTiers);
    assertEventFeaturesAllowed(data);
    const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
    if (!orgProfile) {
      throw new BadRequestError("Only onboarded organizers can create events.");
    }
    let baseSlug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "event";
    let slug = baseSlug;
    let index = 1;
    while (await this.eventRepo.findBySlug(slug)) {
      slug = `${baseSlug}-${index}`;
      index++;
    }
    const created = await this.eventRepo.createEvent({
      organizerId: orgProfile.id,
      title: data.title,
      slug,
      description: data.description,
      category: data.category,
      locationType: data.locationType,
      venue: data.venue,
      city: data.city,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      bannerUrl: data.bannerUrl,
      status: "DRAFT",
      hasSeatingPlan: data.hasSeatingPlan,
      seatingRows: data.seatingRows,
      seatingCols: data.seatingCols,
      ticketTiers: data.ticketTiers,
      accessPolicy: data.accessPolicy
    });
    const refreshed = await this.eventRepo.findById(created.id);
    await appCache.invalidate("events");
    return this.mapEventToDTO(refreshed);
  }
  async getEvents(filters = {}) {
    const isPublicQuery = !filters.status || filters.status === "PUBLISHED";
    if (isPublicQuery) {
      const cacheKey = `events:list:${JSON.stringify(filters)}`;
      return appCache.getOrSet(
        cacheKey,
        async () => {
          const { events: events2, total: total2 } = await this.eventRepo.findMany(filters);
          return {
            events: events2.map((ev) => this.mapEventToDTO(ev)),
            total: total2
          };
        },
        60
      );
    }
    const { events, total } = await this.eventRepo.findMany(filters);
    return {
      events: events.map((ev) => this.mapEventToDTO(ev)),
      total
    };
  }
  async getEventBySlug(slugOrId) {
    const cacheKey = `events:slug:${slugOrId}`;
    return appCache.getOrSet(
      cacheKey,
      async () => {
        let event = await this.eventRepo.findBySlug(slugOrId);
        if (!event) {
          event = await this.eventRepo.findById(slugOrId);
        }
        if (!event) {
          throw new NotFoundError("Event not found.");
        }
        return this.mapEventToDTO(event);
      },
      60
    );
  }
  async getOrganizerEvents(userId) {
    const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
    if (!orgProfile) {
      throw new NotFoundError("Organizer profile not found.");
    }
    const list = await this.eventRepo.getOrganizerEvents(orgProfile.id);
    return list.map((ev) => this.mapEventToDTO(ev));
  }
  async transitionLifecycle(userId, eventId, action) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Event not found.");
    const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
    const user = await this.userRepo.findById(userId);
    const isOwner = orgProfile && orgProfile.id === event.organizerId;
    const isAdmin = user && user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Not authorized to change event lifecycle status.");
    }
    let nextStatus = event.status;
    if (action === "submit") {
      if (event.status !== "DRAFT") {
        throw new BadRequestError("Only draft events can be submitted for review.");
      }
      nextStatus = "UNDER_REVIEW";
    } else if (action === "publish") {
      if (event.status !== "DRAFT" && event.status !== "UNDER_REVIEW") {
        throw new BadRequestError("Only draft or review events can be published.");
      }
      nextStatus = "PUBLISHED";
    } else if (action === "cancel") {
      if (event.status === "COMPLETED" || event.status === "ARCHIVED" || event.status === "CANCELLED") {
        throw new BadRequestError("Finished event cannot be cancelled.");
      }
      nextStatus = "CANCELLED";
    }
    await this.eventRepo.updateStatus(eventId, nextStatus);
    await appCache.invalidate("events");
    const refreshed = await this.eventRepo.findById(eventId);
    return this.mapEventToDTO(refreshed);
  }
  async updateEvent(userId, eventId, data) {
    assertTiersAllowed(data.ticketTiers);
    assertEventFeaturesAllowed(data);
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Event not found.");
    const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
    const user = await this.userRepo.findById(userId);
    const isOwner = orgProfile && orgProfile.id === event.organizerId;
    const isAdmin = user && user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Not authorized to edit this event.");
    }
    const updated = await this.eventRepo.updateEvent(eventId, {
      title: data.title,
      description: data.description,
      category: data.category,
      locationType: data.locationType,
      venue: data.venue,
      city: data.city,
      startsAt: data.startsAt ? new Date(data.startsAt) : void 0,
      endsAt: data.endsAt ? new Date(data.endsAt) : void 0,
      bannerUrl: data.bannerUrl,
      hasSeatingPlan: data.hasSeatingPlan,
      seatingRows: data.seatingRows,
      seatingCols: data.seatingCols,
      ticketTiers: data.ticketTiers,
      accessPolicy: data.accessPolicy
    });
    await appCache.invalidate("events");
    await appCache.invalidate(eventId);
    return this.mapEventToDTO(updated);
  }
  async deleteEvent(userId, eventId) {
    const event = await this.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
    const user = await this.userRepo.findById(userId);
    const isOwner = orgProfile && orgProfile.id === event.organizerId;
    const isAdmin = user && user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Forbidden: Not authorized to delete this event.");
    }
    await this.eventRepo.deleteEvent(eventId);
    await appCache.invalidate("events");
    await appCache.invalidate(eventId);
  }
};

// src/server/repositories/institution.repository.ts
init_db();
init_logger();
var InstitutionRepository = class {
  constructor() {
    this.prisma = getPrisma();
  }
  async findMany(search, type) {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { primaryDomain: { contains: search } },
        { slug: { contains: search } }
      ];
    }
    if (type && type !== "ALL") {
      where.type = type;
    }
    return this.prisma.institution.findMany({
      where,
      include: {
        domains: true
      },
      orderBy: { name: "asc" }
    });
  }
  async findById(id) {
    return this.prisma.institution.findUnique({
      where: { id },
      include: { domains: true }
    });
  }
  async findBySlug(slug) {
    return this.prisma.institution.findUnique({
      where: { slug },
      include: { domains: true }
    });
  }
  async findInstitutionByDomain(domain) {
    const cleanDomain = domain.trim().toLowerCase();
    const primaryMatch = await this.prisma.institution.findUnique({
      where: { primaryDomain: cleanDomain },
      include: { domains: true }
    });
    if (primaryMatch) return primaryMatch;
    const domainMatch = await this.prisma.institutionDomain.findUnique({
      where: { domain: cleanDomain },
      include: { institution: { include: { domains: true } } }
    });
    return domainMatch ? domainMatch.institution : null;
  }
  async createInstitution(data) {
    const cleanPrimaryDomain = data.primaryDomain.trim().toLowerCase();
    return this.prisma.$transaction(async (tx) => {
      const inst = await tx.institution.create({
        data: {
          name: data.name,
          slug: data.slug,
          type: data.type || "COLLEGE",
          logoUrl: data.logoUrl || null,
          primaryDomain: cleanPrimaryDomain,
          isVerified: true
        }
      });
      await tx.institutionDomain.create({
        data: {
          institutionId: inst.id,
          domain: cleanPrimaryDomain,
          isVerified: true
        }
      });
      if (data.additionalDomains && data.additionalDomains.length > 0) {
        for (const dom of data.additionalDomains) {
          const cleanDom = dom.trim().toLowerCase();
          if (cleanDom && cleanDom !== cleanPrimaryDomain) {
            await tx.institutionDomain.upsert({
              where: { domain: cleanDom },
              create: {
                institutionId: inst.id,
                domain: cleanDom,
                isVerified: true
              },
              update: {}
            });
          }
        }
      }
      return tx.institution.findUnique({
        where: { id: inst.id },
        include: { domains: true }
      });
    });
  }
  async seedDefaultInstitutions() {
    const count = await this.prisma.institution.count();
    if (count > 0) return;
    logger.info("Seeding default institutions...");
    const defaults = [
      {
        name: "Ramdeobaba University (RBU Nagpur)",
        slug: "ramdeobaba-university",
        type: "UNIVERSITY",
        logoUrl: "https://images.unsplash.com/photo-1562774053-701939374585?w=200&auto=format&fit=crop&q=80",
        primaryDomain: "rbunagpur.in",
        additionalDomains: ["student.rbunagpur.in", "rknec.edu"]
      },
      {
        name: "Indian Institute of Technology Bombay (IIT Bombay)",
        slug: "iit-bombay",
        type: "UNIVERSITY",
        logoUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=200&auto=format&fit=crop&q=80",
        primaryDomain: "iitb.ac.in",
        additionalDomains: ["student.iitb.ac.in"]
      },
      {
        name: "Visvesvaraya National Institute of Technology (VNIT Nagpur)",
        slug: "vnit-nagpur",
        type: "COLLEGE",
        logoUrl: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80",
        primaryDomain: "vnit.ac.in",
        additionalDomains: ["student.vnit.ac.in"]
      },
      {
        name: "St. Vincent Pallotti College of Engineering & Technology",
        slug: "st-vincent-pallotti",
        type: "COLLEGE",
        logoUrl: "https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=200&auto=format&fit=crop&q=80",
        primaryDomain: "stpallotti.ac.in",
        additionalDomains: ["student.stpallotti.ac.in"]
      },
      {
        name: "Harvard University",
        slug: "harvard-university",
        type: "UNIVERSITY",
        logoUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&auto=format&fit=crop&q=80",
        primaryDomain: "harvard.edu",
        additionalDomains: ["student.harvard.edu"]
      },
      {
        name: "Google Inc.",
        slug: "google",
        type: "COMPANY",
        logoUrl: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=200&auto=format&fit=crop&q=80",
        primaryDomain: "google.com",
        additionalDomains: []
      }
    ];
    for (const item of defaults) {
      await this.createInstitution(item);
    }
    logger.info("Default institutions seeded.");
  }
};

// src/server/utils/domain-policy.ts
function normalizeDomain(input) {
  if (!input) return "";
  let clean = input.trim().toLowerCase();
  if (clean.startsWith("@")) {
    clean = clean.substring(1).trim();
  }
  return clean;
}
function extractEmailDomain(email) {
  if (!email || !email.includes("@")) return "";
  const parts = email.trim().toLowerCase().split("@");
  return normalizeDomain(parts[parts.length - 1]);
}
function isValidDomainFormat(domain) {
  const norm = normalizeDomain(domain);
  if (!norm || norm.length < 3 || !norm.includes(".")) return false;
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  return domainRegex.test(norm);
}
function isDomainAllowed(userEmail, allowedDomainsRaw) {
  const userDomain = extractEmailDomain(userEmail);
  if (!userDomain || !isValidDomainFormat(userDomain)) {
    return false;
  }
  let allowedDomainsList = [];
  if (typeof allowedDomainsRaw === "string") {
    try {
      const parsed = JSON.parse(allowedDomainsRaw);
      if (Array.isArray(parsed)) {
        allowedDomainsList = parsed;
      } else {
        allowedDomainsList = [allowedDomainsRaw];
      }
    } catch {
      allowedDomainsList = allowedDomainsRaw.split(",").map((s) => s.trim());
    }
  } else if (Array.isArray(allowedDomainsRaw)) {
    allowedDomainsList = allowedDomainsRaw;
  }
  if (allowedDomainsList.length === 0) {
    return true;
  }
  for (const rawAllowed of allowedDomainsList) {
    const allowedDomain = normalizeDomain(rawAllowed);
    if (!allowedDomain || !isValidDomainFormat(allowedDomain)) continue;
    if (userDomain === allowedDomain) {
      return true;
    }
    if (userDomain.endsWith("." + allowedDomain)) {
      return true;
    }
  }
  return false;
}
function checkInstitutionEligibility(user, policy) {
  if (!policy || policy.policyType === "PUBLIC") {
    return { allowed: true };
  }
  if (policy.policyType === "INSTITUTION_ONLY") {
    const isVerified = Boolean(user.isEmailVerified || user.emailVerifiedAt);
    const requireVerified = policy.requireVerifiedEmail !== false;
    if (requireVerified && !isVerified) {
      return {
        allowed: false,
        reason: "You must have a verified institutional email address to access or reserve tickets for this event. Please verify your email first."
      };
    }
    const domainOk = isDomainAllowed(user.email, policy.allowedDomains || "[]");
    if (!domainOk) {
      const msg = policy.customRestrictionMessage || "Your email domain is not authorized for this institution-restricted event.";
      return {
        allowed: false,
        reason: msg
      };
    }
    return { allowed: true };
  }
  if (policy.policyType === "INVITE_ONLY") {
    return {
      allowed: false,
      reason: policy.customRestrictionMessage || "This event is strictly invite-only."
    };
  }
  return { allowed: true };
}

// src/server/services/institution.service.ts
var InstitutionService = class {
  constructor() {
    this.repo = new InstitutionRepository();
  }
  mapToDTO(inst) {
    return {
      id: inst.id,
      name: inst.name,
      slug: inst.slug,
      type: inst.type,
      logoUrl: inst.logoUrl,
      primaryDomain: inst.primaryDomain,
      isVerified: inst.isVerified,
      domains: inst.domains?.map((d) => ({
        id: d.id,
        institutionId: d.institutionId,
        domain: d.domain,
        isVerified: d.isVerified,
        createdAt: d.createdAt.toISOString()
      })) || [],
      createdAt: inst.createdAt.toISOString(),
      updatedAt: inst.updatedAt.toISOString()
    };
  }
  async getInstitutions(search, type) {
    const list = await this.repo.findMany(search, type);
    return list.map((i) => this.mapToDTO(i));
  }
  async getInstitutionByDomain(domain) {
    const inst = await this.repo.findInstitutionByDomain(domain);
    return inst ? this.mapToDTO(inst) : null;
  }
  async createInstitution(data) {
    const primary = data.primaryDomain.trim().toLowerCase();
    let baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
    if (!baseSlug) baseSlug = "institution";
    let slug = baseSlug;
    let idx = 1;
    while (await this.repo.findBySlug(slug)) {
      slug = `${baseSlug}-${idx}`;
      idx++;
    }
    const created = await this.repo.createInstitution({
      name: data.name,
      slug,
      type: data.type || "COLLEGE",
      logoUrl: data.logoUrl,
      primaryDomain: primary,
      additionalDomains: data.additionalDomains
    });
    return this.mapToDTO(created);
  }
  async seedDefaults() {
    await this.repo.seedDefaultInstitutions();
  }
  /**
   * Evaluates if a user with a given email address satisfies an event's access policy.
   * Authoritative backend validation.
   */
  async evaluateEligibility(userEmail, accessPolicy) {
    if (!accessPolicy || accessPolicy.policyType === "PUBLIC") {
      return {
        eligible: true,
        userEmail: userEmail || null,
        userDomain: userEmail ? userEmail.split("@")[1]?.toLowerCase() || null : null,
        policyType: "PUBLIC",
        allowedDomains: [],
        requireVerifiedEmail: false,
        reason: null
      };
    }
    if (!userEmail) {
      return {
        eligible: false,
        userEmail: null,
        userDomain: null,
        policyType: accessPolicy.policyType,
        allowedDomains: accessPolicy.allowedDomains || [],
        requireVerifiedEmail: accessPolicy.requireVerifiedEmail ?? true,
        reason: "Authentication required to verify institution email eligibility."
      };
    }
    const userDomain = userEmail.split("@")[1]?.toLowerCase().trim();
    if (!userDomain) {
      return {
        eligible: false,
        userEmail,
        userDomain: null,
        policyType: accessPolicy.policyType,
        allowedDomains: accessPolicy.allowedDomains || [],
        requireVerifiedEmail: accessPolicy.requireVerifiedEmail ?? true,
        reason: "Invalid email format."
      };
    }
    const allowed = (accessPolicy.allowedDomains || []).map((d) => d.toLowerCase().trim());
    const isDomainMatched = isDomainAllowed(userEmail, allowed);
    const matchedInst = await this.getInstitutionByDomain(userDomain);
    if (isDomainMatched) {
      return {
        eligible: true,
        userEmail,
        userDomain,
        policyType: accessPolicy.policyType,
        allowedDomains: accessPolicy.allowedDomains || [],
        requireVerifiedEmail: accessPolicy.requireVerifiedEmail ?? true,
        matchedInstitution: matchedInst ? {
          id: matchedInst.id,
          name: matchedInst.name,
          logoUrl: matchedInst.logoUrl,
          primaryDomain: matchedInst.primaryDomain
        } : null,
        reason: null
      };
    }
    const allowedListStr = allowed.map((d) => `@${d}`).join(", ");
    const customMsg = accessPolicy.customRestrictionMessage;
    const reasonMessage = customMsg ? customMsg : `Restricted Access: This event is exclusively reserved for members with verified emails ending in: ${allowedListStr}. Your email address (${userEmail}) is not eligible.`;
    return {
      eligible: false,
      userEmail,
      userDomain,
      policyType: accessPolicy.policyType,
      allowedDomains: accessPolicy.allowedDomains || [],
      requireVerifiedEmail: accessPolicy.requireVerifiedEmail ?? true,
      matchedInstitution: matchedInst ? {
        id: matchedInst.id,
        name: matchedInst.name,
        logoUrl: matchedInst.logoUrl,
        primaryDomain: matchedInst.primaryDomain
      } : null,
      reason: reasonMessage
    };
  }
};

// src/server/controllers/event.controller.ts
var import_zod5 = require("zod");
var import_client2 = require("@prisma/client");
init_db();
var ticketTierSchema = import_zod5.z.object({
  name: import_zod5.z.string().min(1, "Tier name is required"),
  description: import_zod5.z.string().optional(),
  price: import_zod5.z.number().int().min(0, "Price must be positive (in cents)"),
  capacity: import_zod5.z.number().int().min(1, "Capacity must be at least 1")
});
var accessPolicySchema = import_zod5.z.object({
  policyType: import_zod5.z.enum(["PUBLIC", "INSTITUTION_ONLY", "INVITE_ONLY"]).default("PUBLIC"),
  allowedDomains: import_zod5.z.array(import_zod5.z.string()).default([]),
  requireVerifiedEmail: import_zod5.z.boolean().default(true),
  allowFreeTickets: import_zod5.z.boolean().default(false),
  customRestrictionMessage: import_zod5.z.string().optional()
}).optional();
var createEventSchema = import_zod5.z.object({
  title: import_zod5.z.string().min(3, "Title must be at least 3 characters"),
  description: import_zod5.z.string().min(10, "Description must be at least 10 characters"),
  category: import_zod5.z.string().min(1, "Category is required"),
  locationType: import_zod5.z.enum(["VENUE", "ONLINE"]),
  venue: import_zod5.z.string().optional(),
  city: import_zod5.z.string().optional(),
  startsAt: import_zod5.z.string().min(1, "StartsAt must be a valid date"),
  endsAt: import_zod5.z.string().min(1, "EndsAt must be a valid date"),
  bannerUrl: import_zod5.z.string().optional(),
  ticketTiers: import_zod5.z.array(ticketTierSchema).min(1, "At least 1 ticket tier is required"),
  hasSeatingPlan: import_zod5.z.boolean().optional(),
  seatingRows: import_zod5.z.number().int().min(1).max(20).optional(),
  seatingCols: import_zod5.z.number().int().min(1).max(20).optional(),
  accessPolicy: accessPolicySchema
});
var updateEventSchema = import_zod5.z.object({
  title: import_zod5.z.string().min(3, "Title must be at least 3 characters").optional(),
  description: import_zod5.z.string().min(10, "Description must be at least 10 characters").optional(),
  category: import_zod5.z.string().min(1, "Category is required").optional(),
  locationType: import_zod5.z.enum(["VENUE", "ONLINE"]).optional(),
  venue: import_zod5.z.string().optional(),
  city: import_zod5.z.string().optional(),
  startsAt: import_zod5.z.string().optional(),
  endsAt: import_zod5.z.string().optional(),
  bannerUrl: import_zod5.z.string().optional(),
  ticketTiers: import_zod5.z.array(
    import_zod5.z.object({
      id: import_zod5.z.string().optional(),
      name: import_zod5.z.string().min(1, "Tier name is required"),
      description: import_zod5.z.string().optional(),
      price: import_zod5.z.number().int().min(0),
      capacity: import_zod5.z.number().int().min(1)
    })
  ).optional(),
  hasSeatingPlan: import_zod5.z.boolean().optional(),
  seatingRows: import_zod5.z.number().int().min(1).max(20).optional(),
  seatingCols: import_zod5.z.number().int().min(1).max(20).optional(),
  accessPolicy: accessPolicySchema
});
var lifecycleSchema = import_zod5.z.object({
  action: import_zod5.z.enum(["submit", "publish", "cancel"])
});
var EventController = class {
  constructor() {
    this.eventService = new EventService();
    this.institutionService = new InstitutionService();
    this.getEvents = async (req, res) => {
      try {
        const parsedLimit = req.query.limit ? parseInt(req.query.limit) : 10;
        const parsedPage = req.query.page ? parseInt(req.query.page) : 1;
        if (req.query.status !== void 0 && !Object.values(import_client2.EventStatus).includes(req.query.status)) {
          return res.status(400).json({ error: "Unknown status filter." });
        }
        const filters = {
          category: req.query.category,
          city: req.query.city,
          search: req.query.search,
          status: "PUBLISHED",
          limit: Math.min(100, Math.max(1, isNaN(parsedLimit) ? 10 : parsedLimit)),
          page: Math.max(1, isNaN(parsedPage) ? 1 : parsedPage)
        };
        const result = await this.eventService.getEvents(filters);
        if (filters.status === "PUBLISHED") {
          res.setHeader("Cache-Control", "public, max-age=10, stale-while-revalidate=30");
        }
        res.status(200).json(result);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.getEventBySlug = async (req, res) => {
      try {
        const slug = req.params.slug;
        const event = await this.eventService.getEventBySlug(slug);
        res.status(200).json(event);
      } catch (err) {
        respondWithError(res, err, "Event not found", 404);
      }
    };
    this.checkEligibility = async (req, res) => {
      try {
        const eventId = req.params.eventId || req.params.id;
        const event = await this.eventService.getEventBySlug(eventId).catch(() => null);
        if (!event) {
          return res.status(404).json({ error: "Event not found" });
        }
        const userEmail = req.user ? req.user.email : null;
        const eligibility = await this.institutionService.evaluateEligibility(
          userEmail,
          event.accessPolicy
        );
        res.status(200).json(eligibility);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.createEvent = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = createEventSchema.parse(req.body);
        const event = await this.eventService.createEvent(req.user.id, {
          title: body.title,
          description: body.description,
          category: body.category,
          locationType: body.locationType,
          venue: body.venue,
          city: body.city,
          startsAt: body.startsAt,
          endsAt: body.endsAt,
          bannerUrl: body.bannerUrl || void 0,
          ticketTiers: body.ticketTiers,
          hasSeatingPlan: body.hasSeatingPlan,
          seatingRows: body.seatingRows,
          seatingCols: body.seatingCols,
          accessPolicy: body.accessPolicy
        });
        res.status(201).json(event);
      } catch (err) {
        if (err instanceof import_zod5.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to create event", 400);
        }
      }
    };
    this.getOrganizerEvents = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const list = await this.eventService.getOrganizerEvents(req.user.id);
        res.status(200).json(list);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.updateEvent = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.id;
        const body = updateEventSchema.parse(req.body);
        const updated = await this.eventService.updateEvent(req.user.id, eventId, body);
        res.status(200).json(updated);
      } catch (err) {
        if (err instanceof import_zod5.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to update event", 400);
        }
      }
    };
    this.changeLifecycle = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { action } = lifecycleSchema.parse(req.body);
        const eventId = req.params.id;
        const updated = await this.eventService.transitionLifecycle(req.user.id, eventId, action);
        res.status(200).json(updated);
      } catch (err) {
        if (err instanceof import_zod5.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Request failed. Please try again.", 400);
        }
      }
    };
    this.getOccupiedSeats = async (req, res) => {
      try {
        const eventId = req.params.eventId;
        const prisma2 = getPrisma();
        const bookings = await prisma2.booking.findMany({
          where: {
            eventId,
            status: { in: ["RESERVED", "PENDING", "CONFIRMED"] }
          },
          include: {
            items: true
          }
        });
        const occupied = [];
        for (const b of bookings) {
          for (const item of b.items) {
            if (item.seatNumbers) {
              const seats = item.seatNumbers.split(",").map((s) => s.trim());
              occupied.push(...seats);
            }
          }
        }
        res.status(200).json(Array.from(new Set(occupied)));
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.getReviews = async (req, res) => {
      try {
        const eventId = req.params.eventId;
        const prisma2 = getPrisma();
        const parsedLimit = req.query.limit ? parseInt(req.query.limit) : 50;
        const parsedPage = req.query.page ? parseInt(req.query.page) : 1;
        const limit = Math.min(100, Math.max(1, isNaN(parsedLimit) ? 50 : parsedLimit));
        const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
        const reviews = await prisma2.review.findMany({
          where: { eventId },
          include: {
            user: true
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: (page - 1) * limit
        });
        const mapped = reviews.map((r) => ({
          id: r.id,
          eventId: r.eventId,
          userId: r.userId,
          userName: r.user.fullName,
          userAvatarUrl: r.user.avatarUrl,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt.toISOString()
        }));
        res.status(200).json(mapped);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.getReviewEligibility = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(200).json({
            eligible: false,
            hasReviewed: false,
            reason: "Sign in to verify check-in status for reviews."
          });
        }
        const eventId = req.params.eventId;
        const prisma2 = getPrisma();
        const existing = await prisma2.review.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId: req.user.id
            }
          }
        });
        if (existing) {
          return res.status(200).json({
            eligible: false,
            hasReviewed: true,
            reason: "You have already shared a review for this event."
          });
        }
        const scannedBooking = await prisma2.booking.findFirst({
          where: {
            eventId,
            userId: req.user.id,
            status: "CONFIRMED",
            attendance: {
              scannedAt: { not: null }
            }
          }
        });
        if (scannedBooking) {
          return res.status(200).json({
            eligible: true,
            hasReviewed: false
          });
        }
        return res.status(200).json({
          eligible: false,
          hasReviewed: false,
          reason: "Only verified attendees who successfully checked in via the Security Gate Scanner are eligible to leave a review."
        });
      } catch (err) {
        res.status(200).json({
          eligible: false,
          hasReviewed: false,
          reason: "Could not verify review eligibility."
        });
      }
    };
    this.createReview = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.eventId;
        const { rating, comment } = import_zod5.z.object({
          rating: import_zod5.z.number().int().min(1).max(5),
          comment: import_zod5.z.string().min(3, "Review must be at least 3 characters")
        }).parse(req.body);
        const prisma2 = getPrisma();
        const scannedBooking = await prisma2.booking.findFirst({
          where: {
            eventId,
            userId: req.user.id,
            status: "CONFIRMED",
            attendance: {
              scannedAt: { not: null }
            }
          }
        });
        if (!scannedBooking) {
          return res.status(403).json({
            error: "Only verified attendees who successfully checked in via the Security Gate Scanner are unlocked to leave a rating and review."
          });
        }
        const existing = await prisma2.review.findUnique({
          where: {
            eventId_userId: {
              eventId,
              userId: req.user.id
            }
          }
        });
        if (existing) {
          return res.status(400).json({ error: "You have already left a review for this event." });
        }
        const created = await prisma2.review.create({
          data: {
            eventId,
            userId: req.user.id,
            rating,
            comment
          },
          include: { user: true }
        });
        res.status(201).json({
          id: created.id,
          eventId: created.eventId,
          userId: created.userId,
          userName: created.user.fullName,
          userAvatarUrl: created.user.avatarUrl,
          rating: created.rating,
          comment: created.comment,
          createdAt: created.createdAt.toISOString()
        });
      } catch (err) {
        if (err instanceof import_zod5.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Request failed. Please try again.", 400);
        }
      }
    };
    this.deleteEvent = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.id || req.params.eventId;
        await this.eventService.deleteEvent(req.user.id, eventId);
        res.status(200).json({ success: true, message: "Event successfully deleted." });
      } catch (err) {
        respondWithError(res, err, "Failed to delete event.", 400);
      }
    };
  }
};

// src/server/repositories/promo.repository.ts
init_db();
var PromoCodeRepository = class {
  constructor() {
    this.prisma = getPrisma();
  }
  async findById(id) {
    return this.prisma.promoCode.findUnique({
      where: { id },
      include: { event: true }
    });
  }
  async findByCode(code) {
    return this.prisma.promoCode.findFirst({
      where: { code: code.toUpperCase() },
      include: { event: true }
    });
  }
  async createPromoCode(data) {
    return this.prisma.promoCode.create({
      data: {
        code: data.code.toUpperCase(),
        eventId: data.eventId,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxUses: data.maxUses ?? null,
        expiresAt: data.expiresAt ?? null
      }
    });
  }
  async findByEventId(eventId) {
    return this.prisma.promoCode.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" }
    });
  }
  async deletePromoCode(id) {
    return this.prisma.promoCode.delete({
      where: { id }
    });
  }
};

// src/server/repositories/ticket.repository.ts
init_db();
var TicketRepository = class {
  constructor(prismaClient) {
    this.prisma = prismaClient || getPrisma();
  }
  async findById(ticketId) {
    return this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        booking: {
          include: {
            event: true,
            user: true
          }
        },
        ticketTier: true,
        ownerUser: true,
        scannedByUser: true,
        transfers: {
          include: {
            senderUser: true,
            claimedByUser: true
          }
        }
      }
    });
  }
  async findByTicketNumber(ticketNumber) {
    return this.prisma.ticket.findUnique({
      where: { ticketNumber },
      include: {
        booking: {
          include: {
            event: true,
            user: true
          }
        },
        ticketTier: true,
        ownerUser: true
      }
    });
  }
  async findByQrToken(qrToken) {
    const trimmed = qrToken.trim();
    const upper = trimmed.toUpperCase();
    return this.prisma.ticket.findFirst({
      where: {
        OR: [
          { qrToken: trimmed },
          { qrToken: upper },
          { ticketNumber: trimmed },
          { ticketNumber: upper },
          { booking: { attendance: { qrHash: trimmed } } },
          { booking: { attendance: { qrHash: upper } } }
        ]
      },
      include: {
        booking: {
          include: {
            event: true,
            user: true,
            attendance: true
          }
        },
        ticketTier: true,
        ownerUser: true
      }
    });
  }
  async findByUserId(userId) {
    return this.prisma.ticket.findMany({
      where: { ownerUserId: userId },
      include: {
        booking: {
          include: {
            event: true
          }
        },
        ticketTier: true,
        ownerUser: true,
        transfers: {
          include: {
            senderUser: true,
            claimedByUser: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async findByBookingId(bookingId) {
    return this.prisma.ticket.findMany({
      where: { bookingId },
      include: {
        ticketTier: true,
        ownerUser: true
      },
      orderBy: { createdAt: "asc" }
    });
  }
  async findByEventId(eventId) {
    return this.prisma.ticket.findMany({
      where: {
        booking: {
          eventId
        }
      },
      include: {
        ticketTier: true,
        ownerUser: true,
        booking: {
          include: {
            user: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  async logAttendanceAttempt(data) {
    return this.prisma.attendanceLog.create({
      data: {
        ticketId: data.ticketId || null,
        ticketNumber: data.ticketNumber || null,
        eventId: data.eventId,
        scannerUserId: data.scannerUserId,
        scanOutcome: data.scanOutcome,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null
      }
    });
  }
};

// src/server/services/ticket.service.ts
init_crypto();
init_app_error();
init_db();

// src/server/services/institution-otp.service.ts
init_db();
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_crypto17 = __toESM(require("crypto"), 1);
init_logger();
init_app_error();
init_error_message();
var InstitutionOtpService = class {
  constructor() {
    this.prisma = getPrisma();
    this.institutionRepo = new InstitutionRepository();
  }
  /**
   * Request an OTP sent to an official college email address for an institution-restricted event.
   */
  async sendOtp(userId, eventId, collegeEmail) {
    const normalizedEmail = (collegeEmail || "").toLowerCase().trim();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      throw new BadRequestError("Please provide a valid college email address.");
    }
    const emailDomain = normalizedEmail.split("@")[1]?.trim();
    if (!emailDomain) {
      throw new BadRequestError("Invalid email domain.");
    }
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { accessPolicy: true }
    });
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    if (!event.accessPolicy || event.accessPolicy.policyType === "PUBLIC") {
      throw new BadRequestError("This event is open to the public and does not require institutional email verification.");
    }
    let allowedDomains = [];
    try {
      allowedDomains = JSON.parse(event.accessPolicy.allowedDomains || "[]");
    } catch {
      allowedDomains = [];
    }
    if (allowedDomains.length === 0) {
      throw new BadRequestError("No allowed institutional domains have been configured by the organizer for this event.");
    }
    const isMatched = isDomainAllowed(normalizedEmail, allowedDomains);
    if (!isMatched) {
      const allowedListStr = allowedDomains.map((d) => `@${d}`).join(", ");
      throw new ForbiddenError(
        `Email domain @${emailDomain} is not authorized for this event. Allowed college domains: ${allowedListStr}`
      );
    }
    const matchedInst = await this.institutionRepo.findInstitutionByDomain(emailDomain);
    const institutionName = matchedInst?.name || `Institution (${emailDomain})`;
    const recentRequests = await this.prisma.institutionEmailOtp.count({
      where: {
        userId,
        eventId,
        createdAt: { gte: new Date(Date.now() - 10 * 60 * 1e3) }
      }
    });
    if (recentRequests >= 5) {
      throw new TooManyRequestsError("Too many OTP requests. Please wait a few minutes before trying again.");
    }
    const otp = import_crypto17.default.randomInt(1e5, 1e6).toString();
    const otpHash = await import_bcryptjs2.default.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1e3);
    const latest = await this.prisma.institutionEmailOtp.findFirst({
      where: { userId, eventId, isVerified: false },
      orderBy: { createdAt: "desc" }
    });
    if (latest && Date.now() - latest.createdAt.getTime() < 30 * 1e3) {
      throw new TooManyRequestsError("A code was just sent. Please wait 30 seconds before requesting another.");
    }
    await this.prisma.institutionEmailOtp.deleteMany({
      where: {
        userId,
        eventId,
        isVerified: false
      }
    });
    await this.prisma.institutionEmailOtp.create({
      data: {
        userId,
        eventId,
        collegeEmail: normalizedEmail,
        otpHash,
        expiresAt,
        isVerified: false,
        attempts: 0
      }
    });
    const emailSubject = `\u{1F393} ${otp} is your verification code for ${event.title}`;
    const emailBody = `Hello,

Your One-Time Password (OTP) to unlock institutional ticket passes for "${event.title}" is:

${otp}

This OTP is valid for 10 minutes.

Institutional Verification Details:
- College Email: ${normalizedEmail}
- Institution: ${institutionName}
- Event: ${event.title}

IMPORTANT SECURITY NOTICE:
This code verifies that you are an official student or faculty member of ${institutionName}. Your gate pass and digital attendance ticket will be permanently bound to this verified college email ID to prevent unauthorized pass transfers.

If you did not initiate this booking, please ignore this message.`;
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 540px; margin: 0 auto; background: #0b0f19; color: #f1f5f9; padding: 32px; border-radius: 16px; border: 1px solid #1e293b;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="display: inline-block; background: #7c3aed; color: #ffffff; font-size: 11px; font-weight: 800; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; text-transform: uppercase;">
            \u{1F393} Official Institution Gate Pass Verification
          </span>
          <h2 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 16px 0 6px 0;">Verify College Email Identity</h2>
          <p style="font-size: 13px; color: #94a3b8; margin: 0;">Access restricted event: <strong style="color: #e2e8f0;">${event.title}</strong></p>
        </div>

        <div style="background: #111827; border: 1px solid #374151; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
          <p style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 10px 0; font-weight: 700;">Your 6-Digit College Access OTP</p>
          <div style="font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #a78bfa; font-family: monospace; background: #1e1b4b; padding: 12px 20px; border-radius: 8px; display: inline-block; border: 1px solid #6366f1;">
            ${otp}
          </div>
          <p style="font-size: 11px; color: #cbd5e1; margin: 12px 0 0 0;">Valid for 10 minutes \u2022 Single-use only</p>
        </div>

        <div style="background: #1e293b; border-radius: 8px; padding: 14px 18px; font-size: 12px; line-height: 1.5; color: #cbd5e1; margin-bottom: 20px;">
          <div style="margin-bottom: 6px;"><strong style="color: #ffffff;">Authorized Institution:</strong> ${institutionName}</div>
          <div style="margin-bottom: 6px;"><strong style="color: #ffffff;">Target College Email:</strong> ${normalizedEmail}</div>
          <div><strong style="color: #ffffff;">Event:</strong> ${event.title} (${event.venue || event.city || "Official Venue"})</div>
        </div>

        <div style="border-top: 1px solid #1e293b; padding-top: 16px; font-size: 11px; color: #64748b; line-height: 1.4;">
          <strong style="color: #94a3b8;">Strict Anti-Fraud Guarantee:</strong> Institutional event passes are strictly non-transferable. Your attendee gate pass will be bound to <span style="color: #a78bfa;">${normalizedEmail}</span>.
        </div>
      </div>
    `;
    try {
      await enqueueTransactionalEmail(normalizedEmail, emailSubject, emailBody, htmlContent);
    } catch (err) {
      logger.warn("Failed to queue institutional OTP email:", { error: errorMessage(err), email: normalizedEmail });
    }
    const isDevOrTest = process.env.NODE_ENV !== "production";
    return {
      success: true,
      message: `OTP sent successfully to ${normalizedEmail}. Please check your college inbox.`,
      collegeEmail: normalizedEmail,
      expiresAt: expiresAt.toISOString(),
      institutionName,
      debugOtp: isDevOrTest ? otp : void 0
    };
  }
  /**
   * Verify the 6-digit OTP sent to the college email.
   */
  async verifyOtp(userId, eventId, collegeEmail, otp) {
    const normalizedEmail = (collegeEmail || "").toLowerCase().trim();
    const cleanOtp = (otp || "").trim();
    if (!normalizedEmail) {
      throw new BadRequestError("College email address is required.");
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      throw new BadRequestError("Please enter the complete 6-digit OTP.");
    }
    const record = await this.prisma.institutionEmailOtp.findFirst({
      where: {
        userId,
        eventId,
        collegeEmail: normalizedEmail
      },
      orderBy: { createdAt: "desc" }
    });
    if (!record) {
      throw new ConflictError("No active OTP request found for this college email. Please click 'Send OTP' first.");
    }
    if (/* @__PURE__ */ new Date() > record.expiresAt) {
      throw new TooManyRequestsError("This OTP has expired. Please request a new OTP.");
    }
    if (record.attempts >= 5) {
      throw new TooManyRequestsError("Too many invalid attempts. Please request a fresh OTP.");
    }
    const isMatch = await import_bcryptjs2.default.compare(cleanOtp, record.otpHash);
    if (!isMatch) {
      await this.prisma.institutionEmailOtp.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } }
      });
      const remaining = 4 - record.attempts;
      throw new BadRequestError(
        remaining > 0 ? `Invalid OTP. Please check your college inbox (${remaining} attempts left).` : "Invalid OTP. You have exhausted all attempts; please request a new OTP."
      );
    }
    const verificationToken = `inst_vtok_${import_crypto17.default.randomBytes(24).toString("hex")}`;
    await this.prisma.institutionEmailOtp.update({
      where: { id: record.id },
      data: {
        isVerified: true,
        verifiedAt: /* @__PURE__ */ new Date(),
        verificationToken
      }
    });
    logger.info("Successfully verified college email OTP for institutional event", {
      userId,
      eventId,
      collegeEmail: normalizedEmail
    });
    return {
      success: true,
      verificationToken,
      verifiedCollegeEmail: normalizedEmail,
      message: "College email verified successfully! Institutional ticket pass is now unlocked."
    };
  }
  /**
   * Check if user already has an active verified college email for the given event.
   */
  async getVerificationStatus(userId, eventId) {
    const record = await this.prisma.institutionEmailOtp.findFirst({
      where: {
        userId,
        eventId,
        isVerified: true,
        verifiedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1e3) }
      },
      orderBy: { verifiedAt: "desc" }
    });
    if (!record || !record.collegeEmail) {
      return { isVerified: false, verifiedCollegeEmail: null, institutionName: null };
    }
    const domain = record.collegeEmail.split("@")[1];
    const inst = domain ? await this.institutionRepo.findInstitutionByDomain(domain) : null;
    return {
      isVerified: true,
      verifiedCollegeEmail: record.collegeEmail,
      institutionName: inst?.name || `College (${domain})`,
      verifiedAt: record.verifiedAt?.toISOString() || null
    };
  }
  /**
   * Authoritative validator called by BookingService during ticket reservation.
   */
  async validateVerificationForBooking(userId, eventId, providedEmail, verificationToken) {
    if (verificationToken) {
      const byToken = await this.prisma.institutionEmailOtp.findUnique({
        where: { verificationToken }
      });
      if (byToken && byToken.isVerified && byToken.userId === userId && byToken.eventId === eventId) {
        return byToken.collegeEmail;
      }
    }
    const activeRecord = await this.prisma.institutionEmailOtp.findFirst({
      where: {
        userId,
        eventId,
        isVerified: true,
        ...providedEmail ? { collegeEmail: providedEmail.toLowerCase().trim() } : {},
        verifiedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1e3) }
      },
      orderBy: { verifiedAt: "desc" }
    });
    if (!activeRecord) {
      throw new BadRequestError(
        "Institutional email OTP verification is required to book tickets for this event. Please verify your official college email ID via OTP."
      );
    }
    return activeRecord.collegeEmail;
  }
  /**
   * For events restricted to institution domains, the user must hold a fresh OTP-verified college email
   * for that event. Used for both booking and ticket-transfer claims so the gate cannot be bypassed by transfer.
   * Returns the verified college email, or undefined when the event has no domain restriction.
   */
  async assertVerifiedForEvent(userId, event) {
    const policy = event.accessPolicy;
    if (!policy || policy.policyType === "PUBLIC") return void 0;
    let domains = [];
    try {
      domains = JSON.parse(policy.allowedDomains || "[]");
    } catch {
      domains = [];
    }
    if (domains.length === 0) return void 0;
    return this.validateVerificationForBooking(userId, event.id);
  }
};

// src/server/services/ticket.service.ts
init_error_message();
var TicketService = class {
  constructor() {
    this.ticketRepo = new TicketRepository();
    this.bookingRepo = new BookingRepository();
    this.userRepo = new UserRepository();
    this.prisma = getPrisma();
  }
  mapTicketToDTO(ticket) {
    return {
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      bookingId: ticket.bookingId,
      eventId: ticket.booking?.eventId || "",
      eventTitle: ticket.booking?.event?.title || "Special Performance",
      eventVenue: ticket.booking?.event?.venue || null,
      eventStartsAt: ticket.booking?.event?.startsAt ? ticket.booking.event.startsAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      eventEndsAt: ticket.booking?.event?.endsAt ? ticket.booking.event.endsAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      tierId: ticket.ticketTierId,
      tierName: ticket.ticketTier?.name || "General Admission",
      price: ticket.ticketTier?.price || 0,
      ownerUserId: ticket.ownerUserId,
      ownerName: ticket.ownerUser?.fullName || "Attendee",
      ownerEmail: ticket.ownerUser?.email || "",
      seatNumber: ticket.seatNumber || null,
      status: ticket.status,
      qrToken: ticket.qrToken || null,
      scannedAt: ticket.scannedAt ? ticket.scannedAt.toISOString() : null,
      scannedByUserId: ticket.scannedByUserId || null,
      verifiedCollegeEmail: ticket.verifiedCollegeEmail || null,
      createdAt: ticket.createdAt.toISOString()
    };
  }
  async getUserTickets(userId) {
    const tickets = await this.ticketRepo.findByUserId(userId);
    return tickets.map((t) => this.mapTicketToDTO(t));
  }
  async getTicketDetails(ticketId, userId) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found.");
    }
    const user = await this.userRepo.findById(userId);
    const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
    const isOwner = ticket.ownerUserId === userId;
    const isOrganizer = orgProfile && ticket.booking?.event?.organizerId === orgProfile.id;
    const isAdmin = user?.role === "ADMIN";
    if (!isOwner && !isOrganizer && !isAdmin) {
      throw new ForbiddenError("You are not authorized to view this ticket.");
    }
    return this.mapTicketToDTO(ticket);
  }
  async refreshDynamicQR(ticketId, userId) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found.");
    }
    if (ticket.ownerUserId !== userId) {
      throw new ForbiddenError("You can only generate QR codes for tickets you own.");
    }
    if (ticket.status !== "CONFIRMED") {
      throw new BadRequestError(`Cannot generate QR code for ticket in '${ticket.status}' status.`);
    }
    const baseRef = ticket.qrToken || ticket.ticketNumber;
    const dynamic = generateDynamicQRToken(baseRef);
    const nextWindowTime = (dynamic.timeWindow + 1) * 3e4;
    return {
      token: dynamic.token,
      expiresAt: new Date(nextWindowTime).toISOString()
    };
  }
  /**
   * Atomic check-in with event-scoped permissions and audit logging.
   */
  async scanCheckInTicket(scannerUserId, rawQRInput, ipAddress, userAgent) {
    const dynamicResult = parseAndVerifyDynamicQRToken(rawQRInput);
    if (!dynamicResult.valid) {
      await this.ticketRepo.logAttendanceAttempt({
        eventId: "unknown",
        scannerUserId,
        scanOutcome: "INVALID_QR",
        ipAddress,
        userAgent
      });
      throw new BadRequestError(dynamicResult.reason || "Invalid or counterfeit QR code signature.");
    }
    const ticketRef = dynamicResult.qrHash;
    const ticket = await this.ticketRepo.findByQrToken(ticketRef);
    if (!ticket) {
      await this.ticketRepo.logAttendanceAttempt({
        eventId: "unknown",
        scannerUserId,
        scanOutcome: "INVALID_QR",
        ipAddress,
        userAgent
      });
      throw new NotFoundError("Invalid ticket. Ticket record not found.");
    }
    const eventId = ticket.booking?.eventId;
    if (!eventId) {
      throw new BadRequestError("Ticket is not associated with a valid event.");
    }
    const scannerUser = await this.userRepo.findById(scannerUserId);
    if (!scannerUser) {
      throw new UnauthorizedError("Scanner user profile not located.");
    }
    if (scannerUser.role !== "ADMIN") {
      const orgProfile = await this.userRepo.findOrganizerProfileByUserId(scannerUserId);
      if (!orgProfile || ticket.booking?.event?.organizerId !== orgProfile.id) {
        await this.ticketRepo.logAttendanceAttempt({
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          eventId,
          scannerUserId,
          scanOutcome: "UNAUTHORIZED",
          ipAddress,
          userAgent
        });
        throw new UnauthorizedError("Organizer A cannot scan or manage tickets for Organizer B's event.");
      }
    }
    const event = ticket.booking?.event;
    if (event && event.startsAt) {
      const now = /* @__PURE__ */ new Date();
      const eventStart = new Date(event.startsAt);
      const dayStart = new Date(eventStart);
      dayStart.setHours(0, 0, 0, 0);
      const fourHoursBefore = new Date(eventStart.getTime() - 4 * 60 * 60 * 1e3);
      const openTime = fourHoursBefore < dayStart ? fourHoursBefore : dayStart;
      const eventEnd = event.endsAt ? new Date(event.endsAt) : new Date(eventStart.getTime() + 12 * 60 * 60 * 1e3);
      const dayEnd = new Date(eventEnd);
      dayEnd.setHours(23, 59, 59, 999);
      const closeTime = new Date(eventEnd.getTime() + 6 * 60 * 60 * 1e3);
      const maxClose = closeTime > dayEnd ? closeTime : dayEnd;
      if (now < openTime) {
        await this.ticketRepo.logAttendanceAttempt({
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          eventId,
          scannerUserId,
          scanOutcome: "EXPIRED_EVENT",
          ipAddress,
          userAgent
        });
        throw new BadRequestError("Gate check-in is not active yet for this event.");
      }
      if (now > maxClose) {
        await this.ticketRepo.logAttendanceAttempt({
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          eventId,
          scannerUserId,
          scanOutcome: "EXPIRED_EVENT",
          ipAddress,
          userAgent
        });
        throw new BadRequestError("Gate check-in for this event has closed.");
      }
    }
    if (ticket.status !== "CONFIRMED") {
      await this.ticketRepo.logAttendanceAttempt({
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventId,
        scannerUserId,
        scanOutcome: `INELIGIBLE_STATUS_${ticket.status}`,
        ipAddress,
        userAgent
      });
      throw new BadRequestError(`Cannot admit ticket in '${ticket.status}' status. Ticket is not valid for admission.`);
    }
    const updateResult = await this.prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        scannedAt: null,
        status: "CONFIRMED"
      },
      data: {
        scannedAt: /* @__PURE__ */ new Date(),
        scannedByUserId: scannerUserId
      }
    });
    if (updateResult.count === 0) {
      await this.ticketRepo.logAttendanceAttempt({
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventId,
        scannerUserId,
        scanOutcome: "ALREADY_CHECKED_IN",
        ipAddress,
        userAgent
      });
      const existing = await this.ticketRepo.findById(ticket.id);
      const scanTimeStr = existing?.scannedAt ? formatTimeIST(existing.scannedAt) : "earlier";
      throw new ConflictError(`TICKET ALREADY SCANNED! Checked in at ${scanTimeStr}.`);
    }
    await this.ticketRepo.logAttendanceAttempt({
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
      eventId,
      scannerUserId,
      scanOutcome: "SUCCESS",
      ipAddress,
      userAgent
    });
    const updated = await this.ticketRepo.findById(ticket.id);
    return {
      ticket: this.mapTicketToDTO(updated),
      message: `Admission confirmed for ${updated?.ownerUser?.fullName || "Attendee"} (${updated?.ticketTier?.name}).`
    };
  }
  // TICKET TRANSFERS
  async createTicketTransfer(senderUserId, ticketId, recipientEmail, recipientName, note) {
    const ticket = await this.ticketRepo.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError("Ticket not found.");
    }
    if (ticket.ownerUserId !== senderUserId) {
      throw new ForbiddenError("You can only transfer tickets that you own.");
    }
    if (ticket.status !== "CONFIRMED") {
      throw new BadRequestError(`Cannot transfer a ticket in '${ticket.status}' status.`);
    }
    if (ticket.scannedAt) {
      throw new ConflictError("Cannot transfer a ticket that has already been checked in.");
    }
    const cleanEmail = recipientEmail.toLowerCase().trim();
    if (ticket.ownerUser?.email.toLowerCase().trim() === cleanEmail) {
      throw new BadRequestError("You cannot transfer a ticket to yourself.");
    }
    const randomHex = generateSecureToken(3).toUpperCase();
    const transferCode = `TRF-${randomHex}`;
    const eventStartsAt = ticket.booking?.event?.startsAt ? new Date(ticket.booking.event.startsAt) : null;
    const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    const expiresAt = eventStartsAt && eventStartsAt < defaultExpiry ? eventStartsAt : defaultExpiry;
    const transfer = await this.bookingRepo.createTransfer({
      bookingId: ticket.bookingId,
      ticketId: ticket.id,
      senderUserId,
      recipientEmail: cleanEmail,
      recipientName,
      transferCode,
      note,
      expiresAt
    });
    const senderName = ticket.ownerUser?.fullName || "A friend";
    const claimUrl = `${process.env.APP_URL || "http://localhost:3000"}/claim-ticket/${transferCode}`;
    await sendSimulatedEmail(
      cleanEmail,
      `\u{1F39F}\uFE0F ${senderName} sent you a ticket to ${ticket.booking?.event?.title}!`,
      `Hi ${recipientName || "there"},

${senderName} has transferred a ticket to you for "${ticket.booking?.event?.title}".

Tier: ${ticket.ticketTier?.name || "Standard"}
Personal Note: "${note || "Enjoy the event!"}"

Click here to claim your ticket and generate your secure QR pass:
${claimUrl}

Claim Code: ${transferCode}
Expires: ${formatDateIST(expiresAt)}

Team Happenins`
    );
    return {
      id: transfer.id,
      bookingId: transfer.bookingId,
      ticketId: transfer.ticketId,
      eventTitle: ticket.booking?.event?.title || "Special Event",
      senderName,
      senderEmail: ticket.ownerUser?.email || "",
      recipientEmail: cleanEmail,
      recipientName: recipientName || null,
      transferCode,
      status: transfer.status,
      expiresAt: expiresAt.toISOString(),
      createdAt: transfer.createdAt.toISOString()
    };
  }
  async getPublicTransferDetails(transferCode) {
    const transfer = await this.bookingRepo.findTransferByCode(transferCode);
    if (!transfer) {
      throw new NotFoundError("Transfer link not found or invalid.");
    }
    return {
      transferCode: transfer.transferCode,
      eventTitle: transfer.booking?.event?.title || "Happenin Event",
      eventStartsAt: transfer.booking?.event?.startsAt ? transfer.booking.event.startsAt.toISOString() : "",
      tierName: transfer.ticket?.ticketTier?.name || "Standard Ticket",
      senderName: transfer.senderUser?.fullName || "A friend",
      expiresAt: transfer.expiresAt.toISOString(),
      status: transfer.status
    };
  }
  async claimTicketTransfer(transferCode, recipientUserId) {
    const recipientUser = await this.userRepo.findById(recipientUserId);
    if (!recipientUser) {
      throw new NotFoundError("Recipient user profile not located.");
    }
    const transfer = await this.bookingRepo.findTransferByCode(transferCode);
    if (!transfer) {
      throw new NotFoundError("Transfer record not found.");
    }
    const event = transfer.booking?.event;
    if (event && event.accessPolicy) {
      const eligibility = checkInstitutionEligibility(
        {
          email: recipientUser.email,
          isEmailVerified: recipientUser.isEmailVerified,
          emailVerifiedAt: recipientUser.emailVerifiedAt
        },
        {
          policyType: event.accessPolicy.policyType,
          allowedDomains: event.accessPolicy.allowedDomains,
          requireVerifiedEmail: event.accessPolicy.requireVerifiedEmail,
          customRestrictionMessage: event.accessPolicy.customRestrictionMessage
        }
      );
      if (!eligibility.allowed) {
        throw new BadRequestError(eligibility.reason || "You are not eligible to claim this ticket for an institution-restricted event.");
      }
      try {
        await new InstitutionOtpService().assertVerifiedForEvent(recipientUserId, event);
      } catch (err) {
        throw new BadRequestError(errorMessage(err) || "Verify your official college email for this event before claiming the ticket.");
      }
    }
    const newTicketId = transfer.ticketId || (transfer.booking?.tickets?.[0]?.id ?? transfer.bookingId);
    const newQrHash = generateQRHash(newTicketId, recipientUser.email);
    await this.bookingRepo.claimTransfer(transferCode, recipientUserId, recipientUser.email, newQrHash);
    const updatedTicket = await this.ticketRepo.findById(newTicketId);
    if (!updatedTicket) {
      throw new NotFoundError("Claimed ticket could not be loaded.");
    }
    return this.mapTicketToDTO(updatedTicket);
  }
};

// src/server/services/wallet.service.ts
init_db();

// src/server/services/whatsapp.service.ts
init_logger();
var WhatsAppService = class {
  static {
    // Configured Business Sender WhatsApp Contact Number
    this.SENDER_NUMBER = "8767164611";
  }
  static {
    this.SENDER_NUMBER_FORMATTED = "+91 8767164611";
  }
  static {
    this.SENDER_NUMBER_INTERNATIONAL = "918767164611";
  }
  /**
   * Generates a richly formatted WhatsApp ticket confirmation message.
   */
  static formatTicketConfirmation(booking, user, customAppUrl) {
    const appUrl = customAppUrl || process.env.APP_URL || "https://happenins.com";
    const userName = user?.fullName || booking.user?.fullName || "Valued Guest";
    const eventTitle = booking.event?.title || booking.eventTitle || "Special Event";
    const venue = booking.event?.venue || booking.eventVenue || "Venue Specified on Pass";
    const city = booking.event?.city ? `, ${booking.event.city}` : "";
    const invoiceNumber = booking.invoiceNumber || "INV-0000";
    let dateStr = "Date on Pass";
    if (booking.event?.startsAt || booking.eventStartsAt) {
      const rawDate = booking.event?.startsAt || booking.eventStartsAt;
      dateStr = formatDateIST(rawDate, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
    }
    const itemsList = (booking.items || []).map((item) => {
      const name = item.tierName || item.ticketTier?.name || "Standard";
      const qty = item.quantity || 1;
      const seatStr = item.seatNumbers ? ` (Seats: ${item.seatNumbers})` : "";
      return `  \u2022 ${name} \xD7 ${qty}${seatStr}`;
    }).join("\n") || "  \u2022 1 \xD7 Standard Pass";
    const totalPaid = formatRupees(booking.totalAmount);
    const walletDeducted = booking.walletAmountApplied && booking.walletAmountApplied > 0 ? `
\u{1F4B0} *Wallet Applied:* ${formatRupees(booking.walletAmountApplied)}` : "";
    const discountStr = booking.discountAmount && booking.discountAmount > 0 ? `
\u{1F3F7}\uFE0F *Coupon Savings:* ${formatRupees(booking.discountAmount)}` : "";
    const passUrl = `${appUrl}/tickets?bookingId=${booking.id || ""}`;
    return `\u{1F39F}\uFE0F *HAPPENINS DIGITAL TICKET PASS* \u{1F39F}\uFE0F
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Hello *${userName}*! \u{1F44B}
Your booking for *${eventTitle}* is *CONFIRMED & VERIFIED* \u2705

\u{1F4CB} *BOOKING SUMMARY:*
\u2022 *Invoice:* \`${invoiceNumber}\`
\u2022 *Event:* ${eventTitle}
\u2022 *Date & Time:* \u{1F5D3}\uFE0F ${dateStr}
\u2022 *Location:* \u{1F4CD} ${venue}${city}

\u{1F3AB} *TICKETS & SEATS:*
${itemsList}

\u{1F4B3} *PAYMENT SUMMARY:*
\u2022 *Total Paid:* ${totalPaid}${walletDeducted}${discountStr}
\u2022 *Status:* Confirmed & Secured \u{1F512}

\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
\u{1F4F2} *ACCESS YOUR LIVE DYNAMIC QR PASS:*
Show this rotating QR code at the venue gate for instant check-in:
\u{1F449} ${passUrl}

\u{1F4AC} *Need Assistance or Updates?*
Reach out to official Happenins WhatsApp support at *+91 ${this.SENDER_NUMBER}*.

_Thank you for choosing Happenins. Enjoy the experience!_ \u2728`;
  }
  /**
   * Generates a cancellation & Happenins Wallet refund WhatsApp notification.
   */
  static formatCancellationNotification(booking, refundAmount, cancellationFee, walletBalanceAfter, customAppUrl) {
    const appUrl = customAppUrl || process.env.APP_URL || "https://happenins.com";
    const userName = booking.user?.fullName || "Valued Guest";
    const eventTitle = booking.event?.title || booking.eventTitle || "Event";
    const invoiceNumber = booking.invoiceNumber || "INV-0000";
    return `\u26A0\uFE0F *HAPPENINS TICKET CANCELLATION & WALLET REFUND* \u26A0\uFE0F
\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501\u2501
Hello *${userName}*,
Your booking \`${invoiceNumber}\` for *${eventTitle}* has been successfully cancelled.

\u{1F4B0} *CANCELLATION & REFUND BREAKDOWN:*
\u2022 *Original Booking Total:* ${formatRupees(booking.totalAmount)}
\u2022 *Cancellation Charges Deducted:* ${formatRupees(cancellationFee)}
\u2022 *Net Refund Credited:* *${formatRupees(refundAmount)}* \u{1FA99}

\u{1F45B} *HAPPENINS WALLET UPDATE:*
The refund has been credited directly to your *Happenins Wallet*.
\u2022 *New Wallet Balance:* *${formatRupees(walletBalanceAfter)}*

\u{1F4A1} *How to use:* Your Happenins Wallet balance will automatically be available to deduct on your next ticket booking during checkout!

\u{1F449} Check your wallet & transaction ledger:
${appUrl}/settings

\u{1F4AC} Official WhatsApp Support: *+91 ${this.SENDER_NUMBER}*
_Team Happenins_`;
  }
  /**
   * Generates a direct WhatsApp web / app link with prefilled message.
   */
  static getDirectWhatsAppLink(phoneNumber, message) {
    const phone = phoneNumber ? phoneNumber.replace(/[^0-9]/g, "") : this.SENDER_NUMBER_INTERNATIONAL;
    const encodedMessage = encodeURIComponent(message || "Hello Happenins Support, I need assistance with my ticket.");
    return `https://wa.me/${phone}?text=${encodedMessage}`;
  }
  /**
   * Dispatches or simulates WhatsApp message dispatch.
   */
  static async dispatchWhatsAppNotification(targetPhone, message, type, metadata) {
    const cleanedPhone = targetPhone ? targetPhone.replace(/[^0-9]/g, "") : this.SENDER_NUMBER_INTERNATIONAL;
    const directUrl = this.getDirectWhatsAppLink(cleanedPhone, message);
    const payload = {
      toPhoneNumber: cleanedPhone,
      senderNumber: this.SENDER_NUMBER_INTERNATIONAL,
      message,
      directUrl,
      type,
      metadata,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    logger.info("WhatsApp message dispatched (simulated)", { toLast4: cleanedPhone.slice(-4), length: message.length });
    return payload;
  }
};

// src/server/services/wallet.service.ts
init_app_error();
var WalletService = class {
  constructor() {
    this.prisma = getPrisma();
  }
  /**
   * Retrieves or creates the user's Happenins Wallet.
   */
  async getOrCreateWallet(userId) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50
        }
      }
    });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0
        },
        include: {
          transactions: true
        }
      });
    }
    return wallet;
  }
  /**
   * Get wallet balance for a user.
   */
  async getWalletBalance(userId) {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet.balance;
  }
  /**
   * Evaluates the cancellation policy and calculates fees and refund for a booking.
   */
  async evaluateCancellationPolicy(bookingId, userId) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: true,
        items: true,
        attendance: true
      }
    });
    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }
    if (booking.userId !== userId) {
      throw new ForbiddenError("Unauthorized to access this booking.");
    }
    if (booking.status === "CANCELLED") {
      throw new ConflictError("Booking is already cancelled.");
    }
    if (booking.status === "EXPIRED") {
      throw new ConflictError("Booking has expired.");
    }
    if (booking.status !== "CONFIRMED") {
      throw new ConflictError(`Only confirmed bookings can be evaluated for cancellation. Current status: ${booking.status}`);
    }
    if (booking.attendance?.scannedAt) {
      return {
        canCancel: false,
        tier: "NON_REFUNDABLE",
        feePercentage: 100,
        refundPercentage: 0,
        originalAmount: booking.totalAmount,
        cancellationFee: booking.totalAmount,
        refundAmount: 0,
        hoursUntilEvent: 0,
        policySummary: "Tickets already scanned at the venue cannot be cancelled.",
        reason: "Ticket already checked in."
      };
    }
    const startsAt = booking.event.startsAt ? new Date(booking.event.startsAt) : /* @__PURE__ */ new Date();
    const now = /* @__PURE__ */ new Date();
    const diffMs = startsAt.getTime() - now.getTime();
    const hoursUntilEvent = Math.max(0, diffMs / (1e3 * 60 * 60));
    if (booking.totalAmount === 0) {
      return {
        canCancel: true,
        tier: "FREE_TICKET",
        feePercentage: 0,
        refundPercentage: 100,
        originalAmount: 0,
        cancellationFee: 0,
        refundAmount: 0,
        hoursUntilEvent: Math.round(hoursUntilEvent * 10) / 10,
        policySummary: "Free registration cancelled with no charges."
      };
    }
    if (diffMs <= 0) {
      return {
        canCancel: false,
        tier: "NON_REFUNDABLE",
        feePercentage: 100,
        refundPercentage: 0,
        originalAmount: booking.totalAmount,
        cancellationFee: booking.totalAmount,
        refundAmount: 0,
        hoursUntilEvent: 0,
        policySummary: "Event has already started or ended. Tickets are non-refundable.",
        reason: "Event has already commenced."
      };
    }
    if (hoursUntilEvent > 48) {
      const fee = Math.round(booking.totalAmount * 0.1);
      const refund = booking.totalAmount - fee;
      return {
        canCancel: true,
        tier: "STANDARD_TIER",
        feePercentage: 10,
        refundPercentage: 90,
        originalAmount: booking.totalAmount,
        cancellationFee: fee,
        refundAmount: refund,
        hoursUntilEvent: Math.round(hoursUntilEvent * 10) / 10,
        policySummary: "More than 48 hrs before event: 90% refunded to Happenins Wallet (10% processing fee deducted)."
      };
    } else if (hoursUntilEvent >= 24) {
      const fee = Math.round(booking.totalAmount * 0.25);
      const refund = booking.totalAmount - fee;
      return {
        canCancel: true,
        tier: "MID_TIER",
        feePercentage: 25,
        refundPercentage: 75,
        originalAmount: booking.totalAmount,
        cancellationFee: fee,
        refundAmount: refund,
        hoursUntilEvent: Math.round(hoursUntilEvent * 10) / 10,
        policySummary: "24-48 hrs before event: 75% refunded to Happenins Wallet (25% cancellation charge deducted)."
      };
    } else if (hoursUntilEvent >= 4) {
      const fee = Math.round(booking.totalAmount * 0.5);
      const refund = booking.totalAmount - fee;
      return {
        canCancel: true,
        tier: "LAST_MINUTE_TIER",
        feePercentage: 50,
        refundPercentage: 50,
        originalAmount: booking.totalAmount,
        cancellationFee: fee,
        refundAmount: refund,
        hoursUntilEvent: Math.round(hoursUntilEvent * 10) / 10,
        policySummary: "4-24 hrs before event: 50% refunded to Happenins Wallet (50% late cancellation fee deducted)."
      };
    } else {
      return {
        canCancel: false,
        tier: "NON_REFUNDABLE",
        feePercentage: 100,
        refundPercentage: 0,
        originalAmount: booking.totalAmount,
        cancellationFee: booking.totalAmount,
        refundAmount: 0,
        hoursUntilEvent: Math.round(hoursUntilEvent * 10) / 10,
        policySummary: "Cancellations within 4 hours of event start are non-refundable according to Happenins Cancellation Policy.",
        reason: "Less than 4 hours remaining until event starts."
      };
    }
  }
  /**
   * Executes transactional booking cancellation and credits refund amount to Happenins Wallet.
   */
  async cancelBookingAndRefundToWallet(userId, bookingId, reason) {
    const assessment = await this.evaluateCancellationPolicy(bookingId, userId);
    if (!assessment.canCancel) {
      throw new BadRequestError(assessment.reason || assessment.policySummary || "This booking cannot be cancelled.");
    }
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: {
          items: true,
          event: true,
          user: true
        }
      });
      if (!booking) {
        throw new NotFoundError("Booking record not found.");
      }
      if (booking.status !== "CONFIRMED") {
        throw new BadRequestError("Booking is no longer in confirmed state.");
      }
      const updatedBooking = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
          cancelledAt: /* @__PURE__ */ new Date(),
          cancellationFee: assessment.cancellationFee,
          refundAmount: assessment.refundAmount,
          cancelledReason: reason || assessment.policySummary
        }
      });
      await tx.ticket.updateMany({
        where: { bookingId },
        data: { status: "CANCELLED" }
      });
      await tx.eventSeat.updateMany({
        where: { bookingId },
        data: {
          status: "AVAILABLE",
          bookingId: null,
          heldUntil: null
        }
      });
      for (const item of booking.items) {
        await tx.ticketTier.update({
          where: { id: item.ticketTierId },
          data: {
            sold: { decrement: item.quantity }
          }
        });
      }
      let wallet = await tx.wallet.findUnique({
        where: { userId }
      });
      if (!wallet) {
        wallet = await tx.wallet.create({
          data: {
            userId,
            balance: 0
          }
        });
      }
      let newBalance = wallet.balance;
      if (assessment.refundAmount > 0) {
        newBalance = wallet.balance + assessment.refundAmount;
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: newBalance
          }
        });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet.id,
            type: "CREDIT",
            reason: "TICKET_CANCELLATION",
            amount: assessment.refundAmount,
            balanceAfter: newBalance,
            description: `Refund for cancelled booking #${booking.invoiceNumber} (${booking.event.title}). Deducted fee: \u20B9${(assessment.cancellationFee / 100).toFixed(2)}`,
            bookingId: booking.id,
            referenceId: booking.invoiceNumber
          }
        });
      }
      const customAppUrl = process.env.APP_URL || "https://happenins.com";
      const whatsappMsg = WhatsAppService.formatCancellationNotification(
        booking,
        assessment.refundAmount,
        assessment.cancellationFee,
        newBalance,
        customAppUrl
      );
      const targetPhone = booking.user?.phone || WhatsAppService.SENDER_NUMBER;
      await WhatsAppService.dispatchWhatsAppNotification(
        targetPhone,
        whatsappMsg,
        "BOOKING_CANCELLATION",
        { bookingId: booking.id, invoiceNumber: booking.invoiceNumber, refundAmount: assessment.refundAmount }
      );
      return {
        booking: updatedBooking,
        cancellationAssessment: assessment,
        walletBalance: newBalance,
        whatsappMessage: whatsappMsg
      };
    });
  }
  /**
   * Applies Happenins Wallet balance during ticket booking/checkout.
   * Debits the wallet and records a transaction.
   */
  async applyWalletDebit(userId, amountToDebit, bookingId, invoiceNumber, eventTitle) {
    if (amountToDebit <= 0) return 0;
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { userId }
      });
      if (!wallet) {
        throw new NotFoundError("Happenins Wallet not found for user.");
      }
      if (wallet.balance < amountToDebit) {
        throw new BadRequestError(`Insufficient Happenins Wallet balance. Available: \u20B9${(wallet.balance / 100).toFixed(2)}, Requested: \u20B9${(amountToDebit / 100).toFixed(2)}`);
      }
      const newBalance = wallet.balance - amountToDebit;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: newBalance
        }
      });
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "DEBIT",
          reason: "TICKET_PURCHASE",
          amount: amountToDebit,
          balanceAfter: newBalance,
          description: `Applied Happenins Wallet balance for booking #${invoiceNumber} (${eventTitle})`,
          bookingId,
          referenceId: invoiceNumber
        }
      });
      return newBalance;
    });
  }
};

// src/server/services/booking.service.ts
init_db();

// src/server/services/booking/booking-mapper.ts
init_crypto();
function mapBookingToDTO(booking) {
  const activePayment = booking.payments?.[0];
  const paymentsDTO = booking.payments?.map((pay) => ({
    id: pay.id,
    transactionId: pay.transactionId,
    amount: pay.amount,
    method: pay.method,
    createdAt: pay.createdAt.toISOString()
  })) || [];
  const itemsDTO = booking.items?.map((item) => ({
    id: item.id,
    ticketTierId: item.ticketTierId,
    tierName: item.ticketTier?.name || "Standard Ticket",
    price: item.ticketTier?.price || 0,
    quantity: item.quantity,
    subtotal: item.subtotal,
    seatNumbers: item.seatNumbers || null
  })) || [];
  const transfersDTO = booking.transfers?.map((t) => ({
    id: t.id,
    bookingId: t.bookingId,
    eventTitle: booking.event?.title || "Special Performance",
    senderName: t.senderUser?.fullName || "Ticket Sender",
    senderEmail: t.senderUser?.email || "",
    recipientEmail: t.recipientEmail,
    recipientName: t.recipientName || null,
    transferCode: t.transferCode,
    status: t.status,
    claimedByUserId: t.claimedByUserId || null,
    claimedAt: t.claimedAt ? t.claimedAt.toISOString() : null,
    note: t.note || null,
    expiresAt: t.expiresAt.toISOString(),
    createdAt: t.createdAt.toISOString()
  })) || [];
  return {
    id: booking.id,
    userId: booking.userId,
    eventId: booking.eventId,
    eventTitle: booking.event?.title || "Special Performance",
    eventSlug: booking.event?.slug || "event",
    status: booking.status,
    invoiceNumber: booking.invoiceNumber,
    reservedUntil: booking.reservedUntil.toISOString(),
    totalAmount: booking.totalAmount,
    discountAmount: booking.discountAmount || 0,
    promoCodeId: booking.promoCodeId || null,
    promoCode: booking.promoCode?.code || null,
    eventStartsAt: booking.event?.startsAt ? booking.event.startsAt.toISOString() : null,
    eventEndsAt: booking.event?.endsAt ? booking.event.endsAt.toISOString() : null,
    eventVenue: booking.event?.venue || null,
    createdAt: booking.createdAt.toISOString(),
    items: itemsDTO,
    payments: paymentsDTO,
    qrHash: booking.attendance?.qrHash || booking.tickets?.[0]?.qrToken || (booking.status === "CONFIRMED" ? generateQRHash(booking.id, booking.user?.email || "attendee@happenins.com") : void 0),
    scannedAt: booking.attendance?.scannedAt ? booking.attendance.scannedAt.toISOString() : null,
    isSplitBooking: booking.isSplitBooking,
    splitTotalShares: booking.splitTotalShares,
    splitShares: booking.splitShares?.map((share) => ({
      id: share.id,
      bookingId: share.bookingId,
      friendName: share.friendName,
      email: share.email,
      amount: share.amount,
      isPaid: share.isPaid,
      paymentId: share.paymentId,
      paidAt: share.paidAt ? share.paidAt.toISOString() : null,
      createdAt: share.createdAt.toISOString()
    })) || [],
    transfers: transfersDTO,
    walletAmountApplied: booking.walletAmountApplied || 0,
    cancellationFee: booking.cancellationFee || 0,
    refundAmount: booking.refundAmount || 0,
    cancelledAt: booking.cancelledAt ? booking.cancelledAt.toISOString() : null,
    cancelledReason: booking.cancelledReason || null,
    razorpayOrderId: booking.razorpayOrderId || void 0,
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || void 0,
    verifiedCollegeEmail: booking.verifiedCollegeEmail || null
  };
}

// src/server/services/booking/booking-reservation.ts
var import_razorpay = __toESM(require("razorpay"), 1);
init_best_effort();
init_logger();

// src/server/utils/with-timeout.ts
function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// src/server/services/booking/booking-reservation.ts
init_app_error();
init_error_message();
var BookingReservation = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  async reserveTickets(userId, eventId, items, splitData) {
    const event = await this.ctx.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    if (event.status !== "PUBLISHED") {
      throw new BadRequestError("Unpublished events cannot accept booking reservations.");
    }
    if (splitData?.isSplitBooking) {
      assertFeatureEnabled("SPLIT_BOOKING", "Split payments are not enabled on this deployment.");
    }
    if (!arePaymentsEnabled()) {
      const tierById = new Map((event.ticketTiers || []).map((t) => [t.id, t]));
      if (items.some((it) => (tierById.get(it.ticketTierId)?.price ?? 0) > 0)) {
        assertPaymentsEnabled();
      }
    }
    const user = await this.ctx.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User record not found.");
    }
    let verifiedCollegeEmail = void 0;
    if (event.accessPolicy && event.accessPolicy.policyType !== "PUBLIC") {
      let allowedDomains = [];
      try {
        allowedDomains = JSON.parse(event.accessPolicy.allowedDomains || "[]");
      } catch {
        allowedDomains = [];
      }
      if (allowedDomains.length > 0) {
        verifiedCollegeEmail = await this.ctx.institutionOtpService.validateVerificationForBooking(
          userId,
          eventId,
          splitData?.collegeEmail,
          splitData?.verificationToken
        );
      }
    }
    const dateSegment = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10).replace(/[^0-9]/g, "");
    const randomSegment = Math.random().toString(36).substr(2, 6).toUpperCase();
    const invoiceNumber = `INV-${dateSegment}-${randomSegment}`;
    const reservedUntil = new Date(Date.now() + 10 * 60 * 1e3);
    const holdResult = await fastPathInventoryService.atomicHold({
      eventId,
      userId,
      items,
      ttlSeconds: 600
    });
    if (!holdResult.success) {
      throw new ConflictError(holdResult.message || "Insufficient tickets remaining for tier.");
    }
    let booking;
    try {
      booking = await this.ctx.bookingRepo.createReservation({
        userId,
        eventId,
        invoiceNumber,
        reservedUntil,
        idempotencyKey: splitData?.idempotencyKey,
        verifiedCollegeEmail,
        items,
        isSplitBooking: splitData?.isSplitBooking,
        splitShares: splitData?.splitShares
      });
    } catch (err) {
      await fastPathInventoryService.releaseHold({
        eventId,
        items
      }).catch(bestEffort("fastPathInventoryService.releaseHold"));
      throw err;
    }
    if (booking.totalAmount === 0) {
      return this.ctx.confirmPayment(booking.id, `FREE-INSTITUTION-${booking.id.slice(0, 8)}`, "FREE_TICKET");
    }
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && booking.totalAmount > 0) {
      try {
        const razorpay = new import_razorpay.default({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const rzpOrder = await withTimeout(razorpay.orders.create({
          amount: booking.totalAmount,
          // amount in paise
          currency: "INR",
          receipt: booking.id
        }), 5e3, "Razorpay order creation");
        await this.ctx.prisma.booking.update({
          where: { id: booking.id },
          data: { razorpayOrderId: rzpOrder.id }
        });
      } catch (err) {
        logger.error("Razorpay order creation failed; checkout order skipped", { bookingId: booking.id, message: errorMessage(err) });
      }
    }
    const refreshed = await this.ctx.bookingRepo.findById(booking.id);
    return this.ctx.mapBookingToDTO(refreshed);
  }
};

// src/server/services/booking/booking-confirmation.ts
init_db();
init_crypto();
init_best_effort();
init_logger();
init_app_error();
init_error_message();
var BookingConfirmation = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  async confirmPayment(bookingId, transactionId, method, rzpDetails) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking does not exist.");
    }
    if (booking.totalAmount > 0) assertPaymentsEnabled();
    const confirmed = await this.ctx.bookingRepo.confirmBooking(booking.id, transactionId, method, rzpDetails);
    await fastPathInventoryService.finalizeHold({
      eventId: booking.eventId,
      items: (booking.items || []).map((it) => ({
        ticketTierId: it.ticketTierId,
        quantity: it.quantity,
        seatNumbers: it.seatNumbers || void 0
      }))
    }).catch(bestEffort("fastPathInventoryService.finalizeHold"));
    await queueService.releaseAdmission(booking.userId, booking.eventId).catch(bestEffort("queueService.releaseAdmission"));
    if (booking.walletAmountApplied && booking.walletAmountApplied > 0) {
      try {
        await this.ctx.walletService.applyWalletDebit(
          booking.userId,
          booking.walletAmountApplied,
          booking.id,
          booking.invoiceNumber,
          booking.event?.title || "Special Performance"
        );
      } catch (err) {
        logger.error("Wallet debit failed", { message: errorMessage(err) });
      }
    }
    const userEmail = booking.user?.email || "attendee@happenins.com";
    const signedHash = generateQRHash(booking.id, userEmail);
    const userName = booking.user?.fullName || "Attendee";
    const eventTitle = booking.event?.title || "Happenin Event";
    const invoiceNum = booking.invoiceNumber;
    const totalCents = booking.items.reduce((sum, item) => sum + item.ticketTier.price * item.quantity, 0);
    const totalPaidRupees = `\u20B9${(totalCents / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    const istTimeStr = formatDateIST(/* @__PURE__ */ new Date(), { dateStyle: "full", timeStyle: "medium" });
    await sendSimulatedEmail(
      userEmail,
      `Your Ticket Confirmation for ${eventTitle}! \u{1F3AB}`,
      `Hi ${userName},

Thank you for your purchase! Your tickets for "${eventTitle}" have been successfully confirmed.

Order Details:
- Invoice Reference: ${invoiceNum}
- Total Transaction: ${totalPaidRupees}
- Confirmation Time: ${istTimeStr}

Your Gate Pass: Access your scanned QR code directly inside the Happenins web application under the 'My Tickets' dashboard.
- Gateway Security Hash: ${signedHash}

We look forward to seeing you at the experience!

Best wishes,
The Happenins Concierge Team`
    );
    try {
      const customAppUrl = process.env.APP_URL || "https://happenins.com";
      const targetPhone = booking.user?.phone || WhatsAppService.SENDER_NUMBER;
      const whatsappMsg = WhatsAppService.formatTicketConfirmation(booking, booking.user, customAppUrl);
      await WhatsAppService.dispatchWhatsAppNotification(
        targetPhone,
        whatsappMsg,
        "TICKET_CONFIRMATION",
        { bookingId: booking.id, invoiceNumber: booking.invoiceNumber, totalAmount: booking.totalAmount }
      );
    } catch (err) {
      logger.error("WhatsApp confirmation failed", { message: errorMessage(err) });
    }
    const refreshed = await this.ctx.bookingRepo.findById(booking.id);
    return this.ctx.mapBookingToDTO(refreshed);
  }
  async releaseExpiredLocks() {
    return this.ctx.bookingRepo.releaseExpiredReservations();
  }
  async confirmSplitSharePayment(bookingId, shareId, transactionId, method) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking does not exist.");
    }
    const prisma2 = getPrisma();
    const share = await prisma2.bookingSplitShare.findUnique({
      where: { id: shareId }
    });
    if (!share) {
      throw new NotFoundError("Split share record not found.");
    }
    if (share.isPaid) {
      const refreshed = await this.ctx.bookingRepo.findById(bookingId);
      return this.ctx.mapBookingToDTO(refreshed);
    }
    await prisma2.bookingSplitShare.update({
      where: { id: shareId },
      data: {
        isPaid: true,
        paymentId: transactionId,
        paidAt: /* @__PURE__ */ new Date()
      }
    });
    const refreshedBooking = await this.ctx.bookingRepo.findById(bookingId);
    const allPaid = refreshedBooking.splitShares.every((s) => s.isPaid);
    if (allPaid) {
      await this.ctx.confirmPayment(bookingId, `SPLIT-PAY-${bookingId}`, method);
    }
    const finalBooking = await this.ctx.bookingRepo.findById(bookingId);
    return this.ctx.mapBookingToDTO(finalBooking);
  }
};

// src/server/services/booking/booking-queries.ts
var import_razorpay2 = __toESM(require("razorpay"), 1);
init_logger();
init_app_error();
init_error_message();
var BookingQueries = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  /**
   * Event.organizerId references OrganizerProfile.id, not User.id, so ownership must be
   * resolved through the user's organizer profile.
   */
  async isEventOrganizer(userId, event) {
    if (!event?.organizerId) return false;
    const profile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
    return !!profile && profile.id === event.organizerId;
  }
  async getBookingDetails(bookingId, userId) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking records not found.");
    }
    if (booking.userId !== userId && !await this.isEventOrganizer(userId, booking.event)) {
      throw new ForbiddenError("Access forbidden.");
    }
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && booking.status === "RESERVED" && booking.totalAmount > 0) {
      if (!booking.razorpayOrderId) {
        try {
          const razorpay = new import_razorpay2.default({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
          });
          const rzpOrder = await withTimeout(razorpay.orders.create({
            amount: booking.totalAmount,
            // amount in paise
            currency: "INR",
            receipt: booking.id
          }), 5e3, "Razorpay order creation");
          await this.ctx.prisma.booking.update({
            where: { id: booking.id },
            data: { razorpayOrderId: rzpOrder.id }
          });
          booking.razorpayOrderId = rzpOrder.id;
        } catch (err) {
          logger.error("Razorpay order creation failed; checkout order skipped", { bookingId: booking.id, message: errorMessage(err) });
        }
      }
    }
    const dto = this.ctx.mapBookingToDTO(booking);
    if (booking.razorpayOrderId) {
      dto.razorpayOrderId = booking.razorpayOrderId;
      dto.razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    }
    return dto;
  }
  async getUserBookings(userId) {
    const bookings = await this.ctx.bookingRepo.findByUserId(userId);
    return bookings.map((b) => this.ctx.mapBookingToDTO(b));
  }
  async getActiveTestBookings() {
    const bookings = await this.ctx.bookingRepo.getAllConfirmedBookings();
    return bookings.map((b) => this.ctx.mapBookingToDTO(b));
  }
  async scanQRCheckIn(scannerUserId, rawQRInput) {
    const scanResult = await this.ctx.ticketService.scanCheckInTicket(scannerUserId, rawQRInput);
    const booking = await this.ctx.bookingRepo.findById(scanResult.ticket.bookingId);
    if (!booking) throw new NotFoundError("Booking not found.");
    return this.ctx.mapBookingToDTO(booking);
  }
  /**
   * Generates a structural organizer CSV stream with strict organizer ownership checks and CSV sanitization.
   */
  async generateOrganizerRosterCSV(eventId, userId) {
    const event = await this.ctx.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event records not located.");
    }
    const user = await this.ctx.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User record not located.");
    }
    if (user.role !== "ADMIN") {
      const orgProfile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
      if (!orgProfile || event.organizerId !== orgProfile.id) {
        throw new ForbiddenError("Access forbidden: You do not own this event roster.");
      }
    }
    const bookings = await this.ctx.bookingRepo.findByEventId(eventId);
    const lines = ["Attendee Name,Email Address,Invoice Number,Booking Status,Ticket Tier,Quantity,Total Price (INR),Checked In,Checked In Time (IST)"];
    const sanitizeCsvCell = (val) => {
      if (!val) return '""';
      const str = String(val);
      const safeStr = /^[=\+\-@\t\r]/.test(str) ? `'${str}` : str;
      return `"${safeStr.replace(/"/g, '""')}"`;
    };
    for (const b of bookings) {
      const confirmedOnly = b.status === "CONFIRMED" || b.status === "RESERVED";
      if (!confirmedOnly) continue;
      const userName = sanitizeCsvCell(b.user?.fullName || "Attendee");
      const userMail = sanitizeCsvCell(b.user?.email || "");
      const invoice = sanitizeCsvCell(b.invoiceNumber || "");
      const status = sanitizeCsvCell(b.status || "");
      const isCheckedIn = b.attendance?.scannedAt ? "YES" : "NO";
      const checkInTimeIST = b.attendance?.scannedAt ? formatCSVDateTimeIST(b.attendance.scannedAt) : "N/A";
      for (const item of b.items) {
        const tierName = sanitizeCsvCell(item.ticketTier?.name || "Standard");
        const qty = item.quantity;
        const totalPaid = (item.subtotal / 100).toFixed(2);
        lines.push(`${userName},${userMail},${invoice},${status},${tierName},${qty},${totalPaid},${isCheckedIn},"${checkInTimeIST}"`);
      }
    }
    return lines.join("\n");
  }
  async getWhatsAppConfirmationMessage(bookingId, userId, targetPhone) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }
    if (booking.userId !== userId && !await this.isEventOrganizer(userId, booking.event)) {
      throw new ForbiddenError("Unauthorized.");
    }
    const customAppUrl = process.env.APP_URL || "https://happenins.com";
    const message = WhatsAppService.formatTicketConfirmation(booking, booking.user, customAppUrl);
    const directPhone = targetPhone || booking.user?.phone || WhatsAppService.SENDER_NUMBER;
    const directUrl = WhatsAppService.getDirectWhatsAppLink(directPhone, message);
    return {
      senderNumber: WhatsAppService.SENDER_NUMBER,
      senderNumberFormatted: WhatsAppService.SENDER_NUMBER_FORMATTED,
      toPhoneNumber: directPhone,
      message,
      directUrl,
      type: "TICKET_CONFIRMATION",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  async sendWhatsAppConfirmation(bookingId, userId, targetPhone) {
    const preview = await this.getWhatsAppConfirmationMessage(bookingId, userId, targetPhone);
    await WhatsAppService.dispatchWhatsAppNotification(
      preview.toPhoneNumber,
      preview.message,
      "TICKET_CONFIRMATION",
      { bookingId }
    );
    return {
      success: true,
      message: "WhatsApp confirmation dispatched successfully!",
      preview
    };
  }
};

// src/server/services/booking/booking-transfers.ts
var import_crypto21 = __toESM(require("crypto"), 1);
init_crypto();
init_app_error();
var BookingTransfers = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  // --- TICKET TRANSFER & SHARING ---
  async createTicketTransfer(senderUserId, bookingId, recipientEmail, recipientName, note) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) throw new NotFoundError("Booking record not found.");
    if (booking.userId !== senderUserId) throw new ForbiddenError("Unauthorized to transfer this ticket.");
    if (booking.status !== "CONFIRMED") throw new ConflictError("Only confirmed booking tickets can be transferred.");
    if (booking.attendance?.scannedAt) throw new ConflictError("Cannot transfer a ticket that has already been scanned for check-in.");
    const randomHex = import_crypto21.default.randomBytes(3).toString("hex").toUpperCase();
    const transferCode = `TR-${randomHex}`;
    const eventStartsAt = booking.event?.startsAt ? new Date(booking.event.startsAt) : null;
    const defaultExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
    const expiresAt = eventStartsAt && eventStartsAt < defaultExpiry ? eventStartsAt : defaultExpiry;
    const transfer = await this.ctx.bookingRepo.createTransfer({
      bookingId,
      senderUserId,
      recipientEmail,
      recipientName,
      transferCode,
      note,
      expiresAt
    });
    const senderUser = await this.ctx.userRepo.findById(senderUserId);
    const senderName = senderUser?.fullName || "A friend";
    const claimUrl = `${process.env.APP_URL || "http://localhost:3000"}/claim-ticket/${transferCode}`;
    await sendSimulatedEmail(
      recipientEmail,
      `\u{1F39F}\uFE0F ${senderName} sent you a ticket to ${booking.event?.title}!`,
      `Hi ${recipientName || "there"},

${senderName} has transferred a ticket to you for "${booking.event?.title}".

Personal Note: "${note || "Enjoy the show!"}"

Click here to claim your ticket and generate your secure QR pass:
${claimUrl}

Claim Code: ${transferCode}
Expires: ${expiresAt.toLocaleString()}

Team Happenins`
    );
    return {
      id: transfer.id,
      bookingId: transfer.bookingId,
      eventTitle: booking.event?.title || "Event",
      senderName,
      senderEmail: senderUser?.email || "",
      recipientEmail: transfer.recipientEmail,
      recipientName: transfer.recipientName,
      transferCode: transfer.transferCode,
      status: transfer.status,
      note: transfer.note,
      expiresAt: transfer.expiresAt.toISOString(),
      createdAt: transfer.createdAt.toISOString()
    };
  }
  async getTransferDetails(transferCode) {
    const transfer = await this.ctx.bookingRepo.findTransferByCode(transferCode);
    if (!transfer) throw new NotFoundError("Ticket transfer link invalid or not found.");
    return {
      id: transfer.id,
      bookingId: transfer.bookingId,
      eventTitle: transfer.booking?.event?.title || "Special Performance",
      eventBannerUrl: transfer.booking?.event?.bannerUrl || null,
      eventStartsAt: transfer.booking?.event?.startsAt ? transfer.booking.event.startsAt.toISOString() : null,
      eventVenue: transfer.booking?.event?.venue || null,
      tierName: transfer.booking?.items?.[0]?.ticketTier?.name || "Standard Ticket",
      quantity: transfer.booking?.items?.reduce((sum, item) => sum + item.quantity, 0) || 1,
      senderName: transfer.senderUser?.fullName || "A friend",
      senderEmail: transfer.senderUser?.email || "",
      recipientEmail: transfer.recipientEmail,
      recipientName: transfer.recipientName || null,
      transferCode: transfer.transferCode,
      status: transfer.status,
      claimedByUserId: transfer.claimedByUserId,
      claimedAt: transfer.claimedAt ? transfer.claimedAt.toISOString() : null,
      note: transfer.note || null,
      expiresAt: transfer.expiresAt.toISOString(),
      createdAt: transfer.createdAt.toISOString()
    };
  }
  async claimTicketTransfer(recipientUserId, transferCode) {
    const recipientUser = await this.ctx.userRepo.findById(recipientUserId);
    if (!recipientUser) throw new NotFoundError("Recipient user account not found.");
    const transfer = await this.ctx.bookingRepo.findTransferByCode(transferCode);
    if (!transfer) throw new NotFoundError("Transfer link invalid or not found.");
    if (transfer.booking?.event) {
      await this.ctx.institutionOtpService.assertVerifiedForEvent(recipientUserId, transfer.booking.event);
    }
    const newQrHash = generateQRHash(transfer.bookingId, recipientUser.email);
    const result = await this.ctx.bookingRepo.claimTransfer(transferCode, recipientUserId, recipientUser.email, newQrHash);
    const refreshedBooking = await this.ctx.bookingRepo.findById(transfer.bookingId);
    if (!refreshedBooking) throw new NotFoundError("Booking record not found.");
    await sendSimulatedEmail(
      recipientUser.email,
      `\u{1F389} Ticket Transfer Claimed! You're going to ${refreshedBooking.event?.title}!`,
      `Hi ${recipientUser.fullName},

You have successfully claimed your ticket for "${refreshedBooking.event?.title}".

Your dynamic QR pass is ready in your Happenins account under 'My Tickets'.

See you at the event!`
    );
    return this.ctx.mapBookingToDTO(refreshedBooking);
  }
  async cancelTicketTransfer(senderUserId, transferId) {
    return this.ctx.bookingRepo.cancelTransfer(transferId, senderUserId);
  }
  async getUserTransfers(userId) {
    const transfers = await this.ctx.bookingRepo.findTransfersByUserId(userId);
    return transfers.map((t) => ({
      id: t.id,
      bookingId: t.bookingId,
      eventTitle: t.booking?.event?.title || "Event",
      senderName: t.senderUser?.fullName || "Sender",
      senderEmail: t.senderUser?.email || "",
      recipientEmail: t.recipientEmail,
      recipientName: t.recipientName || null,
      transferCode: t.transferCode,
      status: t.status,
      claimedByUserId: t.claimedByUserId || null,
      claimedAt: t.claimedAt ? t.claimedAt.toISOString() : null,
      note: t.note || null,
      expiresAt: t.expiresAt.toISOString(),
      createdAt: t.createdAt.toISOString()
    }));
  }
};

// src/server/services/booking/booking-analytics.ts
init_crypto();
init_app_error();
var BookingAnalytics = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  /**
   * Aggregates and returns core metrics for organizers.
   */
  async getOrganizerAnalytics(userId) {
    const orgProfile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
    const events = orgProfile ? await this.ctx.eventRepo.getOrganizerEvents(orgProfile.id) : [];
    const eventIds = events.map((e) => e.id);
    if (eventIds.length === 0) {
      return {
        totalRevenue: 0,
        ticketsSoldCount: 0,
        ticketsReservedCount: 0,
        totalEventsCount: 0,
        activeEventsCount: 0,
        tierBreakdown: [],
        salesOverTime: [],
        categoryRevenue: [],
        checkInRatio: { checkedIn: 0, pending: 0, total: 0, percentage: 0 }
      };
    }
    const prisma2 = this.ctx.bookingRepo["prisma"];
    let totalRevenue = 0;
    let ticketsSoldCount = 0;
    let ticketsReservedCount = 0;
    const totalEventsCount = events.length;
    const activeEventsCount = events.filter((e) => e.status === "PUBLISHED").length;
    const tierBreakdownMap = {};
    for (const event of events) {
      for (const tier of event.ticketTiers) {
        totalRevenue += tier.sold * tier.price;
        ticketsSoldCount += tier.sold;
        ticketsReservedCount += tier.reserved;
        if (!tierBreakdownMap[tier.name]) {
          tierBreakdownMap[tier.name] = { sold: 0, revenue: 0 };
        }
        tierBreakdownMap[tier.name].sold += tier.sold;
        tierBreakdownMap[tier.name].revenue += tier.sold * tier.price;
      }
    }
    const tierBreakdown = Object.entries(tierBreakdownMap).map(([name, data]) => ({
      name,
      sold: data.sold,
      revenue: data.revenue
    }));
    const confirmedBookings = await prisma2.booking.findMany({
      where: {
        eventId: { in: eventIds },
        status: "CONFIRMED"
      },
      include: {
        event: true,
        items: true
      }
    });
    const categoryRevenueMap = {};
    for (const booking of confirmedBookings) {
      const cat = booking.event?.category || "Other";
      categoryRevenueMap[cat] = (categoryRevenueMap[cat] || 0) + booking.totalAmount;
    }
    const categoryRevenue = Object.entries(categoryRevenueMap).map(([category, amount]) => ({
      category,
      revenue: amount
    }));
    const salesByDayMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = /* @__PURE__ */ new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString([], { month: "short", day: "numeric" });
      salesByDayMap[key] = { ticketsSold: 0, revenue: 0 };
    }
    for (const booking of confirmedBookings) {
      const key = new Date(booking.createdAt).toLocaleDateString([], { month: "short", day: "numeric" });
      const qty = booking.items ? booking.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
      if (salesByDayMap[key] !== void 0) {
        salesByDayMap[key].ticketsSold += qty;
        salesByDayMap[key].revenue += booking.totalAmount;
      }
    }
    const salesOverTime = Object.entries(salesByDayMap).map(([date, data]) => ({
      date,
      ticketsSold: data.ticketsSold,
      revenue: data.revenue
    }));
    const attendances = await prisma2.attendance.findMany({
      where: {
        bookingId: { in: confirmedBookings.map((b) => b.id) }
      }
    });
    const checkedIn = attendances.filter((a) => a.scannedAt !== null).length;
    const totalConfirmed = confirmedBookings.length;
    const pending = Math.max(0, totalConfirmed - checkedIn);
    const percentage = totalConfirmed > 0 ? Math.round(checkedIn / totalConfirmed * 100) : 0;
    return {
      totalRevenue,
      ticketsSoldCount,
      ticketsReservedCount,
      totalEventsCount,
      activeEventsCount,
      tierBreakdown,
      salesOverTime,
      categoryRevenue,
      checkInRatio: {
        checkedIn,
        pending,
        total: totalConfirmed,
        percentage
      }
    };
  }
  /**
   * Returns comprehensive event overview and analytics restricted strictly to the event organizer.
   */
  async getEventAnalyticsForOrganizer(userId, eventId) {
    const orgProfile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
    const user = await this.ctx.userRepo.findById(userId);
    const event = await this.ctx.eventRepo.findById(eventId);
    if (!event) {
      throw new NotFoundError("Event not found.");
    }
    const isOwner = orgProfile && orgProfile.id === event.organizerId;
    const isAdmin = user && user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      throw new ForbiddenError("Forbidden: You are not authorized to view analytics for this event.");
    }
    const prisma2 = this.ctx.bookingRepo["prisma"];
    let totalRevenue = 0;
    let ticketsSold = 0;
    let ticketsReserved = 0;
    let totalCapacity = 0;
    const tierBreakdown = event.ticketTiers.map((tier) => {
      const revenue = tier.sold * tier.price;
      totalRevenue += revenue;
      ticketsSold += tier.sold;
      ticketsReserved += tier.reserved;
      totalCapacity += tier.capacity;
      const remaining = Math.max(0, tier.capacity - tier.sold - tier.reserved);
      const occupancyRate = tier.capacity > 0 ? Math.round(tier.sold / tier.capacity * 100) : 0;
      return {
        id: tier.id,
        name: tier.name,
        description: tier.description,
        price: tier.price,
        capacity: tier.capacity,
        sold: tier.sold,
        reserved: tier.reserved,
        remaining,
        revenue,
        occupancyRate
      };
    });
    const ticketsRemaining = Math.max(0, totalCapacity - ticketsSold - ticketsReserved);
    const overallOccupancyRate = totalCapacity > 0 ? Math.round(ticketsSold / totalCapacity * 100) : 0;
    const bookings = await prisma2.booking.findMany({
      where: {
        eventId,
        status: "CONFIRMED"
      },
      include: {
        user: true,
        items: {
          include: { ticketTier: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    const bookingIds = bookings.map((b) => b.id);
    const attendances = await prisma2.attendance.findMany({
      where: {
        bookingId: { in: bookingIds }
      }
    });
    const checkedInCount = attendances.filter((a) => a.scannedAt !== null).length;
    const totalConfirmedAttendees = bookings.reduce(
      (sum, b) => sum + b.items.reduce((iSum, item) => iSum + item.quantity, 0),
      0
    );
    const pendingCheckIns = Math.max(0, totalConfirmedAttendees - checkedInCount);
    const checkInRate = totalConfirmedAttendees > 0 ? Math.round(checkedInCount / totalConfirmedAttendees * 100) : 0;
    let seatingStats = null;
    if (event.hasSeatingPlan) {
      const seats = await prisma2.eventSeat.findMany({
        where: { eventId }
      });
      const soldSeats = seats.filter((s) => s.status === "SOLD").length;
      const heldSeats = seats.filter((s) => s.status === "HELD").length;
      const availableSeats = seats.filter((s) => s.status === "AVAILABLE").length;
      const totalSeats = (event.seatingRows || 10) * (event.seatingCols || 10);
      seatingStats = {
        totalSeats,
        soldSeats,
        heldSeats,
        availableSeats,
        configuredSeatsCount: seats.length
      };
    }
    const promoCodes = await prisma2.promoCode.findMany({
      where: { eventId },
      orderBy: { createdAt: "desc" }
    });
    const attendeeRoster = bookings.map((b) => {
      const ticketsCount = b.items.reduce((acc, item) => acc + item.quantity, 0);
      const tierNames = b.items.map((item) => `${item.quantity}x ${item.ticketTier.name}`).join(", ");
      const matchingAtt = attendances.find((a) => a.bookingId === b.id);
      const hasCheckedIn = matchingAtt ? matchingAtt.scannedAt !== null : false;
      const passCode = matchingAtt?.qrHash || generateQRHash(b.id, b.user.email);
      return {
        bookingId: b.id,
        invoiceNumber: b.invoiceNumber,
        customerName: b.user.fullName,
        customerEmail: b.user.email,
        passCode,
        ticketsCount,
        tierNames,
        totalAmount: b.totalAmount,
        hasCheckedIn,
        createdAt: b.createdAt.toISOString()
      };
    });
    const isPassed = new Date(event.endsAt).getTime() < Date.now();
    return {
      event: {
        id: event.id,
        title: event.title,
        slug: event.slug,
        category: event.category,
        status: event.status,
        locationType: event.locationType,
        venue: event.venue,
        city: event.city,
        startsAt: event.startsAt.toISOString(),
        endsAt: event.endsAt.toISOString(),
        bannerUrl: event.bannerUrl,
        hasSeatingPlan: event.hasSeatingPlan,
        isPassed
      },
      metrics: {
        totalRevenue,
        ticketsSold,
        ticketsReserved,
        totalCapacity,
        ticketsRemaining,
        overallOccupancyRate
      },
      tierBreakdown,
      checkInRatio: {
        checkedIn: checkedInCount,
        pending: pendingCheckIns,
        total: totalConfirmedAttendees,
        percentage: checkInRate
      },
      seatingStats,
      promoCodes: promoCodes.map((p) => ({
        id: p.id,
        code: p.code,
        discountType: p.discountType,
        discountValue: p.discountValue,
        usedCount: p.usedCount,
        maxUses: p.maxUses,
        expiresAt: p.expiresAt ? p.expiresAt.toISOString() : null
      })),
      attendeeRoster
    };
  }
};

// src/server/services/booking/booking-promo.ts
init_app_error();
var BookingPromo = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  // --- Promo Code Support ---
  async validatePromoCode(bookingId, code) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }
    if (booking.status === "EXPIRED" || booking.status === "CANCELLED") {
      throw new ConflictError("Cannot apply promo code to an expired or cancelled booking.");
    }
    const promo = await this.ctx.promoRepo.findByCode(code);
    if (!promo) {
      return { valid: false, discountAmount: 0, message: "Invalid promo code." };
    }
    if (promo.eventId !== booking.eventId) {
      return { valid: false, discountAmount: 0, message: "Promo code is not valid for this event." };
    }
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: "Promo code has expired." };
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return { valid: false, discountAmount: 0, message: "Promo code usage limit has been reached." };
    }
    const originalTotal = booking.totalAmount + booking.discountAmount;
    let discountAmount = 0;
    if (promo.discountType === "PERCENT") {
      discountAmount = Math.round(originalTotal * (promo.discountValue / 100));
    } else {
      discountAmount = promo.discountValue;
    }
    discountAmount = Math.min(discountAmount, originalTotal);
    return {
      valid: true,
      promoCodeId: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      message: `Promo code successfully applied! Saved $${(discountAmount / 100).toFixed(2)}.`
    };
  }
  async applyPromoCode(bookingId, code) {
    const validation = await this.validatePromoCode(bookingId, code);
    if (!validation.valid) {
      throw new BadRequestError(validation.message || "Invalid promo code.");
    }
    const updated = await this.ctx.bookingRepo.applyPromoCode(bookingId, validation.promoCodeId, validation.discountAmount);
    return this.ctx.mapBookingToDTO(updated);
  }
  async createPromoCode(userId, eventId, data) {
    const orgProfile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenError("Unauthorized. Only event organizers can create promo codes.");
    }
    const event = await this.ctx.eventRepo.findById(eventId);
    if (!event || event.organizerId !== orgProfile.id) {
      throw new NotFoundError("Unauthorized or event not found.");
    }
    const existing = await this.ctx.promoRepo.findByCode(data.code);
    if (existing) {
      throw new ConflictError("Promo code already exists in the system.");
    }
    return this.ctx.promoRepo.createPromoCode({
      code: data.code,
      eventId,
      discountType: data.discountType,
      discountValue: data.discountValue,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : void 0
    });
  }
  async getEventPromoCodes(userId, eventId) {
    const orgProfile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenError("Unauthorized.");
    }
    const event = await this.ctx.eventRepo.findById(eventId);
    if (!event || event.organizerId !== orgProfile.id) {
      throw new NotFoundError("Unauthorized or event not found.");
    }
    return this.ctx.promoRepo.findByEventId(eventId);
  }
  async deletePromoCode(userId, id) {
    const orgProfile = await this.ctx.userRepo.findOrganizerProfileByUserId(userId);
    if (!orgProfile) {
      throw new ForbiddenError("Unauthorized.");
    }
    const promo = await this.ctx.promoRepo.findById(id);
    if (!promo) {
      throw new NotFoundError("Promo code not found.");
    }
    if (promo.event.organizerId !== orgProfile.id) {
      throw new ForbiddenError("Unauthorized to delete this promo code.");
    }
    await this.ctx.promoRepo.deletePromoCode(id);
    return { success: true };
  }
};

// src/server/services/booking/booking-wallet.ts
init_best_effort();
init_app_error();
var BookingWallet = class {
  constructor(ctx) {
    this.ctx = ctx;
  }
  // --- HAPPENINS WALLET & CANCELLATION ENGINE ---
  async getUserWallet(userId) {
    return this.ctx.walletService.getOrCreateWallet(userId);
  }
  async applyWalletToBooking(bookingId, userId) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }
    if (booking.userId !== userId) {
      throw new ForbiddenError("Unauthorized to access this booking.");
    }
    if (booking.status !== "RESERVED" && booking.status !== "PENDING") {
      throw new ConflictError(`Cannot apply wallet to booking in '${booking.status}' status.`);
    }
    const wallet = await this.ctx.walletService.getOrCreateWallet(userId);
    if (wallet.balance <= 0) {
      throw new BadRequestError("No Happenins Wallet balance available.");
    }
    const grossTotal = booking.totalAmount + (booking.walletAmountApplied || 0);
    const amountToApply = Math.min(wallet.balance, grossTotal);
    const newPayableTotal = Math.max(0, grossTotal - amountToApply);
    await this.ctx.prisma.booking.update({
      where: { id: bookingId },
      data: {
        walletAmountApplied: amountToApply,
        totalAmount: newPayableTotal
      }
    });
    if (newPayableTotal === 0) {
      return this.ctx.confirmPayment(bookingId, `WALLET-${bookingId.slice(0, 8)}`, "HAPPENINS_WALLET");
    }
    const refreshed = await this.ctx.bookingRepo.findById(bookingId);
    return this.ctx.mapBookingToDTO(refreshed);
  }
  async removeWalletFromBooking(bookingId, userId) {
    const booking = await this.ctx.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }
    if (booking.userId !== userId) {
      throw new ForbiddenError("Unauthorized to access this booking.");
    }
    if (booking.status !== "RESERVED" && booking.status !== "PENDING") {
      throw new ConflictError(`Cannot modify wallet on booking in '${booking.status}' status.`);
    }
    const restoredTotal = booking.totalAmount + (booking.walletAmountApplied || 0);
    await this.ctx.prisma.booking.update({
      where: { id: bookingId },
      data: {
        walletAmountApplied: 0,
        totalAmount: restoredTotal
      }
    });
    const refreshed = await this.ctx.bookingRepo.findById(bookingId);
    return this.ctx.mapBookingToDTO(refreshed);
  }
  async previewCancellation(bookingId, userId) {
    return this.ctx.walletService.evaluateCancellationPolicy(bookingId, userId);
  }
  async cancelBooking(bookingId, userId, reason) {
    const result = await this.ctx.walletService.cancelBookingAndRefundToWallet(userId, bookingId, reason);
    const refreshed = await this.ctx.bookingRepo.findById(bookingId);
    if (refreshed?.items) {
      await fastPathInventoryService.releaseHold({
        eventId: refreshed.eventId,
        items: refreshed.items.map((it) => ({
          ticketTierId: it.ticketTierId,
          quantity: it.quantity,
          seatNumbers: it.seatNumbers || void 0
        }))
      }).catch(bestEffort("fastPathInventoryService.releaseHold"));
    }
    if (refreshed?.eventId) {
      await queueService.releaseAdmission(userId, refreshed.eventId).catch(bestEffort("queueService.releaseAdmission"));
    }
    return {
      booking: this.ctx.mapBookingToDTO(refreshed),
      cancellationAssessment: result.cancellationAssessment,
      walletBalance: result.walletBalance,
      whatsappMessage: result.whatsappMessage
    };
  }
};

// src/server/services/booking.service.ts
var BookingService = class {
  constructor() {
    this.prisma = getPrisma();
    this.bookingRepo = new BookingRepository();
    this.eventRepo = new EventRepository();
    this.userRepo = new UserRepository();
    this.promoRepo = new PromoCodeRepository();
    this.institutionService = new InstitutionService();
    this.institutionOtpService = new InstitutionOtpService();
    this.ticketService = new TicketService();
    this.walletService = new WalletService();
    const self = this;
    const ctx = {
      get prisma() {
        return self.prisma;
      },
      get bookingRepo() {
        return self.bookingRepo;
      },
      get eventRepo() {
        return self.eventRepo;
      },
      get userRepo() {
        return self.userRepo;
      },
      get promoRepo() {
        return self.promoRepo;
      },
      get institutionOtpService() {
        return self.institutionOtpService;
      },
      get ticketService() {
        return self.ticketService;
      },
      get walletService() {
        return self.walletService;
      },
      mapBookingToDTO: (booking) => self.mapBookingToDTO(booking),
      confirmPayment: (...args) => self.confirmPayment(...args)
    };
    this.reservation = new BookingReservation(ctx);
    this.confirmation = new BookingConfirmation(ctx);
    this.queries = new BookingQueries(ctx);
    this.transfers = new BookingTransfers(ctx);
    this.analytics = new BookingAnalytics(ctx);
    this.promo = new BookingPromo(ctx);
    this.wallet = new BookingWallet(ctx);
  }
  mapBookingToDTO(booking) {
    return mapBookingToDTO(booking);
  }
  reserveTickets(...args) {
    return this.reservation.reserveTickets(...args);
  }
  confirmPayment(...args) {
    return this.confirmation.confirmPayment(...args);
  }
  releaseExpiredLocks() {
    return this.confirmation.releaseExpiredLocks();
  }
  confirmSplitSharePayment(...args) {
    return this.confirmation.confirmSplitSharePayment(...args);
  }
  getBookingDetails(bookingId, userId) {
    return this.queries.getBookingDetails(bookingId, userId);
  }
  getUserBookings(userId) {
    return this.queries.getUserBookings(userId);
  }
  getActiveTestBookings() {
    return this.queries.getActiveTestBookings();
  }
  scanQRCheckIn(scannerUserId, rawQRInput) {
    return this.queries.scanQRCheckIn(scannerUserId, rawQRInput);
  }
  generateOrganizerRosterCSV(eventId, userId) {
    return this.queries.generateOrganizerRosterCSV(eventId, userId);
  }
  getWhatsAppConfirmationMessage(bookingId, userId, targetPhone) {
    return this.queries.getWhatsAppConfirmationMessage(bookingId, userId, targetPhone);
  }
  sendWhatsAppConfirmation(bookingId, userId, targetPhone) {
    return this.queries.sendWhatsAppConfirmation(bookingId, userId, targetPhone);
  }
  createTicketTransfer(...args) {
    return this.transfers.createTicketTransfer(...args);
  }
  getTransferDetails(transferCode) {
    return this.transfers.getTransferDetails(transferCode);
  }
  claimTicketTransfer(recipientUserId, transferCode) {
    return this.transfers.claimTicketTransfer(recipientUserId, transferCode);
  }
  cancelTicketTransfer(senderUserId, transferId) {
    return this.transfers.cancelTicketTransfer(senderUserId, transferId);
  }
  getUserTransfers(userId) {
    return this.transfers.getUserTransfers(userId);
  }
  getOrganizerAnalytics(userId) {
    return this.analytics.getOrganizerAnalytics(userId);
  }
  getEventAnalyticsForOrganizer(userId, eventId) {
    return this.analytics.getEventAnalyticsForOrganizer(userId, eventId);
  }
  validatePromoCode(bookingId, code) {
    return this.promo.validatePromoCode(bookingId, code);
  }
  applyPromoCode(bookingId, code) {
    return this.promo.applyPromoCode(bookingId, code);
  }
  createPromoCode(...args) {
    return this.promo.createPromoCode(...args);
  }
  getEventPromoCodes(userId, eventId) {
    return this.promo.getEventPromoCodes(userId, eventId);
  }
  deletePromoCode(userId, id) {
    return this.promo.deletePromoCode(userId, id);
  }
  getUserWallet(userId) {
    return this.wallet.getUserWallet(userId);
  }
  applyWalletToBooking(bookingId, userId) {
    return this.wallet.applyWalletToBooking(bookingId, userId);
  }
  removeWalletFromBooking(bookingId, userId) {
    return this.wallet.removeWalletFromBooking(bookingId, userId);
  }
  previewCancellation(bookingId, userId) {
    return this.wallet.previewCancellation(bookingId, userId);
  }
  cancelBooking(bookingId, userId, reason) {
    return this.wallet.cancelBooking(bookingId, userId, reason);
  }
};

// src/server/controllers/booking.controller.ts
var import_zod6 = require("zod");
var import_crypto24 = __toESM(require("crypto"), 1);
init_crypto();
init_metrics();
init_best_effort();
init_logger();
init_error_message();
var bookingItemSchema = import_zod6.z.object({
  ticketTierId: import_zod6.z.string().min(1, "Invalid ticket tier ID format"),
  quantity: import_zod6.z.number().int().min(1, "Quantity must be at least 1"),
  seatNumbers: import_zod6.z.string().optional()
});
var reserveSchema = import_zod6.z.object({
  eventId: import_zod6.z.string().min(1, "Invalid event ID format"),
  items: import_zod6.z.array(bookingItemSchema).min(1, "Must reserve at least 1 ticket"),
  isSplitBooking: import_zod6.z.boolean().optional(),
  splitShares: import_zod6.z.array(import_zod6.z.object({
    friendName: import_zod6.z.string().min(1, "Friend name is required"),
    email: import_zod6.z.string().email("Invalid friend email format"),
    amount: import_zod6.z.number().int().min(1, "Split share amount must be valid")
  })).optional(),
  verificationToken: import_zod6.z.string().optional(),
  collegeEmail: import_zod6.z.string().optional(),
  admissionToken: import_zod6.z.string().optional()
});
var confirmSchema = import_zod6.z.object({
  bookingId: import_zod6.z.string().min(1, "Invalid booking ID format"),
  transactionId: import_zod6.z.string().min(1, "Transaction reference required"),
  method: import_zod6.z.string().default("CARD"),
  razorpayPaymentId: import_zod6.z.string().optional(),
  razorpayOrderId: import_zod6.z.string().optional(),
  razorpaySignature: import_zod6.z.string().optional()
});
var scanSchema = import_zod6.z.object({
  qrHash: import_zod6.z.string().min(4, "Invalid QR string format")
});
var BookingController = class {
  constructor() {
    this.bookingService = new BookingService();
    this.reserve = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = reserveSchema.parse(req.body);
        const admissionToken = req.headers["x-queue-admission-token"] || req.headers["x-admission-token"] || body.admissionToken;
        const admissionCheck = await queueService.checkOrAdmit(req.user.id, body.eventId, admissionToken);
        if (!admissionCheck.admitted) {
          return res.status(429).json({
            error: {
              code: "QUEUE_REQUIRED",
              message: "High demand traffic: Virtual Waiting Room entry required.",
              status: "QUEUED",
              eventId: body.eventId
            }
          });
        }
        const idempotencyKey = req.headers["idempotency-key"] || req.headers["idempotency_key"];
        const booking = await this.bookingService.reserveTickets(req.user.id, body.eventId, body.items, {
          isSplitBooking: body.isSplitBooking,
          splitShares: body.splitShares,
          idempotencyKey,
          verificationToken: body.verificationToken,
          collegeEmail: body.collegeEmail
        });
        if (booking?.id && booking?.reservedUntil) {
          const delayMs = Math.max(0, new Date(booking.reservedUntil).getTime() - Date.now());
          jobQueue.enqueueReservationExpiry(
            { bookingId: booking.id, triggerSource: "timeout" },
            { delayMs }
          ).catch(bestEffort("jobQueue.enqueueReservationExpiry"));
        }
        metrics.incrementCounter("bookings_total", { status: "reserved" });
        res.status(201).json({
          ...booking,
          admissionToken: admissionCheck.admissionToken
        });
      } catch (err) {
        if (err instanceof import_zod6.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Reservation failed", 400);
        }
      }
    };
    this.confirm = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const body = confirmSchema.parse(req.body);
        const bookingDetails = await this.bookingService.getBookingDetails(body.bookingId, req.user.id);
        if (bookingDetails.totalAmount > 0) {
          if (!body.razorpaySignature || !body.razorpayOrderId || !body.razorpayPaymentId) {
            return res.status(400).json({ error: "Razorpay order ID, payment ID, and signature are strictly required for paid bookings." });
          }
          if (bookingDetails.razorpayOrderId && body.razorpayOrderId !== bookingDetails.razorpayOrderId) {
            return res.status(400).json({ error: "Razorpay order ID does not match the active booking record." });
          }
          const secret = process.env.RAZORPAY_KEY_SECRET;
          if (!secret) {
            return res.status(500).json({ error: "Server Razorpay configuration is incomplete." });
          }
          const signData = body.razorpayOrderId + "|" + body.razorpayPaymentId;
          const expectedSignature = import_crypto24.default.createHmac("sha256", secret).update(signData).digest("hex");
          if (!safeCompareStrings(expectedSignature, body.razorpaySignature)) {
            return res.status(400).json({ error: "Invalid Razorpay payment signature security check failed." });
          }
          logger.info("Razorpay signature verified; booking confirmed", { bookingId: body.bookingId });
        }
        const Booking = await this.bookingService.confirmPayment(body.bookingId, body.transactionId, body.method, {
          razorpayOrderId: body.razorpayOrderId,
          razorpayPaymentId: body.razorpayPaymentId,
          razorpaySignature: body.razorpaySignature
        });
        metrics.incrementCounter("bookings_total", { status: "confirmed" });
        metrics.incrementCounter("payments_total", { status: "success", method: body.method || "CARD" });
        res.status(200).json(Booking);
      } catch (err) {
        if (err instanceof import_zod6.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Payment verification failed", 400);
        }
      }
    };
    this.getBookingDetails = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const bookingId = req.params.id;
        const details = await this.bookingService.getBookingDetails(bookingId, req.user.id);
        res.status(200).json(details);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.getUserBookings = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const bookings = await this.bookingService.getUserBookings(req.user.id);
        res.status(200).json(bookings);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.getActiveTestBookings = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const bookings = await this.bookingService.getActiveTestBookings();
        res.status(200).json(bookings);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.scanQR = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { qrHash } = scanSchema.parse(req.body);
        const verifiedBooking = await this.bookingService.scanQRCheckIn(req.user.id, qrHash);
        metrics.incrementCounter("qr_scans_total", { result: "success" });
        res.status(200).json({
          message: "Check-in successful!",
          booking: verifiedBooking
        });
      } catch (err) {
        metrics.incrementCounter("qr_scans_total", { result: "failed" });
        if (err instanceof import_zod6.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Check-in failed", 400);
        }
      }
    };
    this.exportRoster = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.eventId;
        const csv = await this.bookingService.generateOrganizerRosterCSV(eventId, req.user.id);
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=attendees_${eventId}.csv`);
        res.status(200).send(csv);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.getAnalytics = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const analytics = await this.bookingService.getOrganizerAnalytics(req.user.id);
        res.status(200).json(analytics);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.getEventAnalytics = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.eventId || req.params.id;
        const analytics = await this.bookingService.getEventAnalyticsForOrganizer(req.user.id, eventId);
        res.status(200).json(analytics);
      } catch (err) {
        respondWithError(res, err, "Failed to retrieve event analytics.", 400);
      }
    };
    this.releaseLocks = async (req, res) => {
      try {
        const released = await this.bookingService.releaseExpiredLocks();
        res.status(200).json({ released });
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.validatePromo = async (req, res) => {
      try {
        const bookingId = req.params.bookingId;
        const { code } = req.body;
        if (!code) {
          return res.status(400).json({ error: "Promo code is required" });
        }
        const result = await this.bookingService.validatePromoCode(bookingId, code);
        res.status(200).json(result);
      } catch (err) {
        respondWithError(res, err, "Failed to validate promo code", 400);
      }
    };
    this.applyPromo = async (req, res) => {
      try {
        const bookingId = req.params.bookingId;
        const { code } = req.body;
        if (!code) {
          return res.status(400).json({ error: "Promo code is required" });
        }
        const booking = await this.bookingService.applyPromoCode(bookingId, code);
        res.status(200).json(booking);
      } catch (err) {
        respondWithError(res, err, "Failed to apply promo code", 400);
      }
    };
    this.createPromo = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.eventId;
        const { code, discountType, discountValue, maxUses, expiresAt } = req.body;
        if (!code || !discountType || discountValue === void 0) {
          return res.status(400).json({ error: "Missing required promo code fields." });
        }
        if (discountType !== "PERCENT" && discountType !== "FIXED") {
          return res.status(400).json({ error: "discountType must be PERCENT or FIXED." });
        }
        const promo = await this.bookingService.createPromoCode(req.user.id, eventId, {
          code,
          discountType,
          discountValue,
          maxUses,
          expiresAt
        });
        res.status(201).json(promo);
      } catch (err) {
        respondWithError(res, err, "Failed to create promo code", 400);
      }
    };
    this.getEventPromos = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const eventId = req.params.eventId;
        const promos = await this.bookingService.getEventPromoCodes(req.user.id, eventId);
        res.status(200).json(promos);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch promo codes", 400);
      }
    };
    this.deletePromo = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const id = req.params.id;
        const result = await this.bookingService.deletePromoCode(req.user.id, id);
        res.status(200).json(result);
      } catch (err) {
        respondWithError(res, err, "Failed to delete promo code", 400);
      }
    };
    this.paySplitShare = async (req, res) => {
      try {
        const { bookingId, shareId } = req.params;
        const { transactionId, method } = import_zod6.z.object({
          transactionId: import_zod6.z.string().min(1, "Transaction ID is required"),
          method: import_zod6.z.string().default("CARD")
        }).parse(req.body);
        const booking = await this.bookingService.confirmSplitSharePayment(
          bookingId,
          shareId,
          transactionId,
          method
        );
        res.status(200).json(booking);
      } catch (err) {
        if (err instanceof import_zod6.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Split share payment failed", 400);
        }
      }
    };
    this.getDynamicQRToken = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const bookingId = req.params.id;
        const booking = await this.bookingService.getBookingDetails(bookingId, req.user.id);
        let qrHash = booking.qrHash;
        if (!qrHash && booking.status === "CONFIRMED") {
          const { generateQRHash: generateQRHash2 } = await Promise.resolve().then(() => (init_crypto(), crypto_exports));
          qrHash = generateQRHash2(booking.id, req.user.email || "attendee@happenins.com");
        }
        if (!qrHash) {
          return res.status(400).json({ error: "Booking ticket QR pass not available yet." });
        }
        const { generateDynamicQRToken: generateDynamicQRToken2 } = await Promise.resolve().then(() => (init_crypto(), crypto_exports));
        const dynamicTokenObj = generateDynamicQRToken2(qrHash);
        res.status(200).json({
          token: dynamicTokenObj.token,
          timeWindow: dynamicTokenObj.timeWindow,
          expiresInSeconds: 30 - Math.floor(Date.now() / 1e3) % 30
        });
      } catch (err) {
        respondWithError(res, err, "Failed to generate dynamic QR token.", 400);
      }
    };
    this.createTransfer = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const bookingId = req.params.id;
        const schema = import_zod6.z.object({
          recipientEmail: import_zod6.z.string().email("Invalid recipient email address"),
          recipientName: import_zod6.z.string().optional(),
          note: import_zod6.z.string().optional()
        });
        const body = schema.parse(req.body);
        const transfer = await this.bookingService.createTicketTransfer(
          req.user.id,
          bookingId,
          body.recipientEmail,
          body.recipientName,
          body.note
        );
        res.status(201).json(transfer);
      } catch (err) {
        if (err instanceof import_zod6.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Transfer initiation failed", 400);
        }
      }
    };
    this.getTransferDetails = async (req, res) => {
      try {
        const { code } = req.params;
        const transfer = await this.bookingService.getTransferDetails(code);
        res.status(200).json(transfer);
      } catch (err) {
        respondWithError(res, err, "Transfer details query failed", 400);
      }
    };
    this.claimTransfer = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { code } = req.params;
        const claimedBooking = await this.bookingService.claimTicketTransfer(req.user.id, code);
        res.status(200).json({
          message: "Ticket successfully claimed!",
          booking: claimedBooking
        });
      } catch (err) {
        respondWithError(res, err, "Claiming ticket transfer failed", 400);
      }
    };
    this.cancelTransfer = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { id } = req.params;
        const cancelled = await this.bookingService.cancelTicketTransfer(req.user.id, id);
        res.status(200).json({ message: "Transfer successfully cancelled", transfer: cancelled });
      } catch (err) {
        respondWithError(res, err, "Transfer cancellation failed", 400);
      }
    };
    this.getUserTransfers = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const transfers = await this.bookingService.getUserTransfers(req.user.id);
        res.status(200).json(transfers);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 400);
      }
    };
    this.handleRazorpayWebhook = async (req, res) => {
      try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
        const signature = req.headers["x-razorpay-signature"];
        if (!webhookSecret) {
          return res.status(500).json({ error: "Razorpay webhook secret not configured on server" });
        }
        if (!signature) {
          return res.status(400).json({ error: "Missing x-razorpay-signature header" });
        }
        const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body));
        const expectedSignature = import_crypto24.default.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
        const sigBuffer = Buffer.from(signature, "utf-8");
        const expectedBuffer = Buffer.from(expectedSignature, "utf-8");
        if (sigBuffer.length !== expectedBuffer.length || !import_crypto24.default.timingSafeEqual(sigBuffer, expectedBuffer)) {
          logger.warn("Razorpay webhook rejected: invalid signature");
          return res.status(400).json({ error: "Invalid webhook signature" });
        }
        const event = JSON.parse(rawBody.toString("utf-8"));
        if (!event || !event.id || !event.event) {
          return res.status(400).json({ error: "Invalid webhook payload: event id and event type are required" });
        }
        const eventId = event.id;
        await jobQueue.enqueueWebhook({
          eventId,
          eventType: event?.event || "unknown",
          payload: event?.payload || event,
          receivedAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (event?.event === "payment.captured" || event?.event === "order.paid") {
          const paymentEntity = event.payload?.payment?.entity;
          const bookingId = paymentEntity?.notes?.bookingId || paymentEntity?.description;
          const transactionId = paymentEntity?.id;
          const orderId = paymentEntity?.order_id;
          if (bookingId && transactionId) {
            await this.bookingService.confirmPayment(bookingId, transactionId, paymentEntity?.method || "WEBHOOK", {
              razorpayOrderId: orderId,
              razorpayPaymentId: transactionId
            });
          }
        }
        res.status(200).json({ status: "ok", queued: true, eventId });
      } catch (err) {
        logger.error("Razorpay webhook processing failed", { message: errorMessage(err) });
        res.status(500).json({ error: "Webhook processing failed" });
      }
    };
    // --- HAPPENINS WALLET & CANCELLATION HANDLERS ---
    this.getUserWallet = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const wallet = await this.bookingService.getUserWallet(req.user.id);
        res.status(200).json(wallet);
      } catch (err) {
        respondWithError(res, err, "Failed to load Happenins Wallet", 400);
      }
    };
    this.applyWallet = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { bookingId } = req.params;
        const updated = await this.bookingService.applyWalletToBooking(bookingId, req.user.id);
        res.status(200).json(updated);
      } catch (err) {
        respondWithError(res, err, "Failed to apply Happenins Wallet balance", 400);
      }
    };
    this.removeWallet = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { bookingId } = req.params;
        const updated = await this.bookingService.removeWalletFromBooking(bookingId, req.user.id);
        res.status(200).json(updated);
      } catch (err) {
        respondWithError(res, err, "Failed to remove Happenins Wallet balance", 400);
      }
    };
    this.previewCancellation = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { id } = req.params;
        const assessment = await this.bookingService.previewCancellation(id, req.user.id);
        res.status(200).json(assessment);
      } catch (err) {
        respondWithError(res, err, "Failed to assess cancellation policy", 400);
      }
    };
    this.cancelBooking = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { id } = req.params;
        const { reason } = req.body || {};
        const result = await this.bookingService.cancelBooking(id, req.user.id, reason);
        metrics.incrementCounter("bookings_total", { status: "cancelled" });
        res.status(200).json({
          message: "Booking successfully cancelled. Refund credited to your Happenins Wallet.",
          ...result
        });
      } catch (err) {
        respondWithError(res, err, "Failed to cancel booking", 400);
      }
    };
    // --- WHATSAPP TICKET CONFIRMATION HANDLERS ---
    this.getWhatsAppConfirmation = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { id } = req.params;
        const targetPhone = req.query.phone;
        const payload = await this.bookingService.getWhatsAppConfirmationMessage(id, req.user.id, targetPhone);
        res.status(200).json(payload);
      } catch (err) {
        respondWithError(res, err, "Failed to prepare WhatsApp message", 400);
      }
    };
    this.sendWhatsAppConfirmation = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Unauthenticated" });
        }
        const { id } = req.params;
        const { phone } = req.body || {};
        const result = await this.bookingService.sendWhatsAppConfirmation(id, req.user.id, phone);
        res.status(200).json(result);
      } catch (err) {
        respondWithError(res, err, "Failed to dispatch WhatsApp confirmation", 400);
      }
    };
  }
};

// src/server/controllers/ticket.controller.ts
var import_zod7 = require("zod");
var transferSchema = import_zod7.z.object({
  recipientEmail: import_zod7.z.string().email("Invalid recipient email address").trim().toLowerCase(),
  recipientName: import_zod7.z.string().optional(),
  note: import_zod7.z.string().optional()
});
var scanSchema2 = import_zod7.z.object({
  qrHash: import_zod7.z.string().min(1, "QR code string is required")
});
var TicketController = class {
  constructor() {
    this.ticketService = new TicketService();
    this.getUserTickets = async (req, res) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
        const tickets = await this.ticketService.getUserTickets(req.user.id);
        res.status(200).json(tickets);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch tickets", 400);
      }
    };
    this.getTicketDetails = async (req, res) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
        const ticketId = req.params.id;
        const ticket = await this.ticketService.getTicketDetails(ticketId, req.user.id);
        res.status(200).json(ticket);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch ticket", 400);
      }
    };
    this.refreshDynamicQR = async (req, res) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
        const ticketId = req.params.id;
        const result = await this.ticketService.refreshDynamicQR(ticketId, req.user.id);
        res.status(200).json(result);
      } catch (err) {
        respondWithError(res, err, "Failed to refresh dynamic QR code", 400);
      }
    };
    this.scanCheckInTicket = async (req, res) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
        const { qrHash } = scanSchema2.parse(req.body);
        const ip = req.ip;
        const userAgent = req.get("User-Agent");
        const result = await this.ticketService.scanCheckInTicket(req.user.id, qrHash, ip, userAgent);
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod7.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Gate check-in failed", 400);
        }
      }
    };
    this.createTicketTransfer = async (req, res) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
        const ticketId = req.params.id;
        const body = transferSchema.parse(req.body);
        const transfer = await this.ticketService.createTicketTransfer(
          req.user.id,
          ticketId,
          body.recipientEmail,
          body.recipientName,
          body.note
        );
        res.status(201).json(transfer);
      } catch (err) {
        if (err instanceof import_zod7.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Ticket transfer creation failed", 400);
        }
      }
    };
    this.getPublicTransferDetails = async (req, res) => {
      try {
        const code = req.params.code;
        const transfer = await this.ticketService.getPublicTransferDetails(code);
        res.status(200).json(transfer);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch transfer details", 400);
      }
    };
    this.claimTicketTransfer = async (req, res) => {
      try {
        if (!req.user) return res.status(401).json({ error: "Unauthenticated" });
        const code = req.params.code;
        const claimed = await this.ticketService.claimTicketTransfer(code, req.user.id);
        res.status(200).json({
          message: "Ticket successfully claimed!",
          ticket: claimed
        });
      } catch (err) {
        respondWithError(res, err, "Failed to claim ticket transfer", 400);
      }
    };
  }
};

// src/server/controllers/admin.controller.ts
init_db();
init_metrics();
var AdminController = class {
  constructor() {
    this.prisma = getPrisma();
    this.getMetrics = async (req, res) => {
      try {
        const snapshot = metrics.getSnapshot();
        const queueStats = await jobQueue.getStats();
        res.status(200).json({
          metrics: snapshot,
          queue: queueStats
        });
      } catch (err) {
        respondWithError(res, err, "Failed to fetch metrics.", 500);
      }
    };
    this.getDeadLetterJobs = async (req, res) => {
      try {
        const queueName = req.query.queue;
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const failedJobs = await jobQueue.getFailedJobs(queueName, limit);
        res.status(200).json(failedJobs);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch dead-letter jobs.", 500);
      }
    };
    this.retryDeadLetterJob = async (req, res) => {
      try {
        const { queue, id } = req.params;
        const success = await jobQueue.retryFailedJob(queue, id);
        if (!success) {
          return res.status(404).json({ error: "Failed job not found or not in failed state." });
        }
        res.status(200).json({ message: "Job successfully retried.", jobId: id, queue });
      } catch (err) {
        respondWithError(res, err, "Failed to retry dead-letter job.", 500);
      }
    };
    this.getAnalytics = async (req, res) => {
      try {
        const bookings = await this.prisma.booking.findMany({
          where: { status: "CONFIRMED" },
          select: {
            totalAmount: true,
            items: {
              select: { quantity: true }
            }
          }
        });
        const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
        const ticketsSoldCount = bookings.reduce(
          (sum, b) => sum + b.items.reduce((acc, i) => acc + i.quantity, 0),
          0
        );
        const eventsCount = await this.prisma.event.count();
        const organizersCount = await this.prisma.organizerProfile.count();
        const statusCounts = await this.prisma.event.groupBy({
          by: ["status"],
          _count: { _all: true }
        });
        const lifecycle = {};
        statusCounts.forEach((group) => {
          lifecycle[group.status] = group._count._all;
        });
        res.status(200).json({
          totalRevenue,
          ticketsSoldCount,
          eventsCount,
          organizersCount,
          lifecycle
        });
      } catch (err) {
        respondWithError(res, err, "Failed to fetch admin billing summary.", 500);
      }
    };
    this.getOrganizers = async (req, res) => {
      try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const organizers = await this.prisma.organizerProfile.findMany({
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit
        });
        res.status(200).json(organizers);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch organizers list.", 500);
      }
    };
    this.verifyOrganizer = async (req, res) => {
      try {
        const { id } = req.params;
        const { isVerified } = req.body;
        const profile = await this.prisma.organizerProfile.update({
          where: { id },
          include: { user: true },
          data: { isVerified }
        });
        await this.prisma.auditLog.create({
          data: {
            userId: req.user?.id || null,
            action: isVerified ? "VERIFY_ORGANIZER" : "UNVERIFY_ORGANIZER",
            entity: "OrganizerProfile",
            entityId: id,
            ipAddress: req.ip
          }
        });
        res.status(200).json(profile);
      } catch (err) {
        respondWithError(res, err, "Failed to progress organizer verification.", 400);
      }
    };
    this.getEvents = async (req, res) => {
      try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
        const events = await this.prisma.event.findMany({
          include: {
            organizer: {
              include: {
                user: {
                  select: {
                    fullName: true,
                    email: true
                  }
                }
              }
            },
            ticketTiers: true
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit
        });
        res.status(200).json(events);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch event audit entries.", 500);
      }
    };
    this.moderateEventStatus = async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        const event = await this.prisma.event.update({
          where: { id },
          data: { status }
        });
        await this.prisma.auditLog.create({
          data: {
            userId: req.user?.id || null,
            action: `MODERATED_EVENT_STATUS_${status}`,
            entity: "Event",
            entityId: id,
            ipAddress: req.ip
          }
        });
        res.status(200).json(event);
      } catch (err) {
        respondWithError(res, err, "Failed to moderate event.", 400);
      }
    };
    this.getAuditLogs = async (req, res) => {
      try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
        const logs = await this.prisma.auditLog.findMany({
          include: {
            user: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit
        });
        res.status(200).json(logs);
      } catch (err) {
        respondWithError(res, err, "Failed to fetch administrative audit logs.", 500);
      }
    };
  }
};

// src/server/controllers/institution.controller.ts
var import_zod8 = require("zod");
var createInstitutionSchema = import_zod8.z.object({
  name: import_zod8.z.string().min(2, "Institution name is required"),
  type: import_zod8.z.enum(["COLLEGE", "UNIVERSITY", "SCHOOL", "COMPANY", "ORGANIZATION", "OTHER"]).default("COLLEGE"),
  primaryDomain: import_zod8.z.string().min(3, "Primary domain is required"),
  logoUrl: import_zod8.z.string().optional(),
  additionalDomains: import_zod8.z.array(import_zod8.z.string()).optional()
});
var sendOtpSchema2 = import_zod8.z.object({
  eventId: import_zod8.z.string().min(1, "Event ID is required"),
  collegeEmail: import_zod8.z.string().email("Please enter a valid college email address")
});
var verifyOtpSchema2 = import_zod8.z.object({
  eventId: import_zod8.z.string().min(1, "Event ID is required"),
  collegeEmail: import_zod8.z.string().email("Please enter a valid college email address"),
  otp: import_zod8.z.string().min(6, "6-digit OTP is required").max(6, "6-digit OTP is required")
});
var InstitutionController = class {
  constructor() {
    this.service = new InstitutionService();
    this.otpService = new InstitutionOtpService();
    this.getInstitutions = async (req, res) => {
      try {
        const search = req.query.search;
        const type = req.query.type;
        const list = await this.service.getInstitutions(search, type);
        res.status(200).json(list);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.checkDomain = async (req, res) => {
      try {
        const domain = req.query.domain;
        if (!domain) {
          return res.status(400).json({ error: "Domain query parameter required" });
        }
        const inst = await this.service.getInstitutionByDomain(domain);
        if (!inst) {
          return res.status(200).json({
            matched: false,
            domain,
            institution: null
          });
        }
        res.status(200).json({
          matched: true,
          domain,
          institution: inst
        });
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
    this.createInstitution = async (req, res) => {
      try {
        const body = createInstitutionSchema.parse(req.body);
        const created = await this.service.createInstitution(body);
        res.status(201).json(created);
      } catch (err) {
        if (err instanceof import_zod8.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to create institution", 400);
        }
      }
    };
    this.sendOtp = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Please log in to verify your college email." });
        }
        const body = sendOtpSchema2.parse(req.body);
        const result = await this.otpService.sendOtp(req.user.id, body.eventId, body.collegeEmail);
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod8.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to dispatch OTP.", 400);
        }
      }
    };
    this.verifyOtp = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Please log in to verify your college email." });
        }
        const body = verifyOtpSchema2.parse(req.body);
        const result = await this.otpService.verifyOtp(
          req.user.id,
          body.eventId,
          body.collegeEmail,
          body.otp
        );
        res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod8.z.ZodError) {
          res.status(400).json({ error: err.issues[0].message });
        } else {
          respondWithError(res, err, "Failed to verify OTP.", 400);
        }
      }
    };
    this.getOtpStatus = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(200).json({ isVerified: false });
        }
        const eventId = req.query.eventId;
        if (!eventId) {
          return res.status(400).json({ error: "eventId query parameter is required." });
        }
        const result = await this.otpService.getVerificationStatus(req.user.id, eventId);
        res.status(200).json(result);
      } catch (err) {
        respondWithError(res, err, "Request failed. Please try again.", 500);
      }
    };
  }
};

// src/server/repositories/staff-scanner.repository.ts
init_db();
var StaffScannerRepository = class {
  constructor() {
    this.prisma = getPrisma();
  }
  async findById(id) {
    return this.prisma.staffScanner.findUnique({
      where: { id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startsAt: true,
            endsAt: true,
            organizerId: true,
            ticketTiers: {
              select: { id: true, name: true, price: true }
            }
          }
        },
        organizer: true
      }
    });
  }
  async findByPin(pin, eventId) {
    const cleanPin = pin.trim();
    if (eventId) {
      return this.prisma.staffScanner.findFirst({
        where: {
          pin: cleanPin,
          eventId,
          isActive: true
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              venue: true,
              startsAt: true,
              endsAt: true,
              organizerId: true,
              ticketTiers: {
                select: { id: true, name: true, price: true }
              }
            }
          }
        }
      });
    }
    return this.prisma.staffScanner.findFirst({
      where: {
        pin: cleanPin,
        isActive: true
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startsAt: true,
            endsAt: true,
            organizerId: true,
            ticketTiers: {
              select: { id: true, name: true, price: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });
  }
  /** PINs of every active scanner on any event. PINs must be unique across events so a PIN-only login is unambiguous. */
  async findAllActivePins() {
    const rows = await this.prisma.staffScanner.findMany({ where: { isActive: true }, select: { pin: true } });
    return new Set(rows.map((r) => r.pin));
  }
  /** Number of active scanners sharing this PIN (used to refuse ambiguous PIN-only logins). */
  async countActiveByPin(pin) {
    return this.prisma.staffScanner.count({ where: { pin: pin.trim(), isActive: true } });
  }
  async findByEventId(eventId) {
    return this.prisma.staffScanner.findMany({
      where: { eventId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startsAt: true,
            endsAt: true
          }
        }
      },
      orderBy: [
        { gateName: "asc" },
        { createdAt: "desc" }
      ]
    });
  }
  async create(data) {
    return this.prisma.staffScanner.create({
      data: {
        eventId: data.eventId,
        organizerId: data.organizerId,
        staffName: data.staffName,
        pin: data.pin,
        gateName: data.gateName,
        allowedTiers: data.allowedTiers || "ALL",
        expiresAt: data.expiresAt || null,
        notes: data.notes || null
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startsAt: true,
            endsAt: true
          }
        }
      }
    });
  }
  async createMany(items) {
    const created = [];
    for (const item of items) {
      const rec = await this.prisma.staffScanner.create({
        data: {
          eventId: item.eventId,
          organizerId: item.organizerId,
          staffName: item.staffName,
          pin: item.pin,
          gateName: item.gateName,
          allowedTiers: item.allowedTiers || "ALL",
          expiresAt: item.expiresAt || null,
          notes: item.notes || null
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              venue: true,
              startsAt: true,
              endsAt: true
            }
          }
        }
      });
      created.push(rec);
    }
    return created;
  }
  async update(id, data) {
    return this.prisma.staffScanner.update({
      where: { id },
      data,
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            venue: true,
            startsAt: true,
            endsAt: true
          }
        }
      }
    });
  }
  async delete(id) {
    return this.prisma.staffScanner.delete({
      where: { id }
    });
  }
  async incrementScanCount(id) {
    return this.prisma.staffScanner.update({
      where: { id },
      data: {
        scansCount: { increment: 1 },
        lastScannedAt: /* @__PURE__ */ new Date()
      }
    });
  }
  async getGateStats(eventId) {
    const staffScanners = await this.prisma.staffScanner.findMany({
      where: { eventId },
      orderBy: { scansCount: "desc" }
    });
    const attendanceLogs = await this.prisma.attendanceLog.findMany({
      where: {
        eventId,
        scanOutcome: "SUCCESS"
      },
      select: {
        id: true,
        gateName: true,
        scannedAt: true,
        staffScannerId: true
      }
    });
    return {
      staffScanners,
      attendanceLogs
    };
  }
};

// src/server/services/staff-scanner.service.ts
init_crypto();
init_app_error();
init_db();
var StaffScannerService = class {
  constructor() {
    this.staffRepo = new StaffScannerRepository();
    this.ticketRepo = new TicketRepository();
    this.userRepo = new UserRepository();
    this.eventRepo = new EventRepository();
    this.prisma = getPrisma();
  }
  mapToDTO(staff) {
    let allowedTierNames = [];
    if (staff.allowedTiers && staff.allowedTiers !== "ALL") {
      try {
        allowedTierNames = JSON.parse(staff.allowedTiers);
      } catch {
        allowedTierNames = staff.allowedTiers.split(",").map((s) => s.trim());
      }
    }
    return {
      id: staff.id,
      eventId: staff.eventId,
      eventTitle: staff.event?.title || "Event Gate Pass",
      eventSlug: staff.event?.slug || "",
      eventVenue: staff.event?.venue || null,
      eventStartsAt: staff.event?.startsAt ? staff.event.startsAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      eventEndsAt: staff.event?.endsAt ? staff.event.endsAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      staffName: staff.staffName,
      pin: staff.pin,
      gateName: staff.gateName,
      allowedTiers: staff.allowedTiers,
      allowedTierNames,
      isActive: staff.isActive,
      expiresAt: staff.expiresAt ? staff.expiresAt.toISOString() : null,
      scansCount: staff.scansCount || 0,
      lastScannedAt: staff.lastScannedAt ? staff.lastScannedAt.toISOString() : null,
      notes: staff.notes || null,
      createdAt: staff.createdAt ? staff.createdAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Scanner tokens live at most 12h and never outlive the scanner's own expiry or the event (+2h grace).
   */
  scannerTokenTtlSeconds(staff) {
    const now = Date.now();
    const caps = [12 * 60 * 60];
    if (staff.expiresAt) caps.push((new Date(staff.expiresAt).getTime() - now) / 1e3);
    if (staff.event?.endsAt) caps.push((new Date(staff.event.endsAt).getTime() + 2 * 60 * 60 * 1e3 - now) / 1e3);
    return Math.max(60, Math.min(...caps));
  }
  /**
   * Quick Volunteer Login via 6-digit PIN
   */
  async loginWithPin(pin, eventId) {
    const cleanPin = pin.trim();
    if (!cleanPin || cleanPin.length !== 6 || !/^\d{6}$/.test(cleanPin)) {
      throw new BadRequestError("Please provide a valid 6-digit numerical staff PIN.");
    }
    if (!eventId && await this.staffRepo.countActiveByPin(cleanPin) > 1) {
      throw new UnauthorizedError("This PIN is shared by more than one event. Ask the organizer to issue a new PIN.");
    }
    const staff = await this.staffRepo.findByPin(cleanPin, eventId);
    if (!staff) {
      const ventureStaff = await this.prisma.ventureStaffScanner.findUnique({
        where: { pin: cleanPin },
        include: { ventureEvent: true }
      });
      if (!ventureStaff) {
        throw new UnauthorizedError("Invalid staff PIN or scanner account is not active.");
      }
      if (!ventureStaff.isActive) {
        throw new ForbiddenError("This staff PIN has been disabled by the event organizer.");
      }
      if (ventureStaff.expiresAt && /* @__PURE__ */ new Date() > new Date(ventureStaff.expiresAt)) {
        throw new ForbiddenError("This temporary staff PIN has expired. Request a new PIN from the event organizer.");
      }
      const ttl = ventureStaff.expiresAt ? Math.max(60, Math.min(12 * 3600, (new Date(ventureStaff.expiresAt).getTime() - Date.now()) / 1e3)) : 12 * 3600;
      const token2 = signStaffToken({
        staffScannerId: ventureStaff.id,
        eventId: ventureStaff.ventureEventId,
        staffName: ventureStaff.staffName,
        gateName: ventureStaff.gateName,
        allowedTiers: "ALL",
        allowedTierNames: []
      }, ttl);
      return {
        staffScannerId: ventureStaff.id,
        eventId: ventureStaff.ventureEventId,
        eventTitle: ventureStaff.ventureEvent?.title || "Venture Vault Summit",
        eventSlug: "venture-vault",
        eventVenue: "Campus Auditorium",
        eventStartsAt: (/* @__PURE__ */ new Date()).toISOString(),
        eventEndsAt: new Date(Date.now() + 864e5).toISOString(),
        staffName: ventureStaff.staffName,
        gateName: ventureStaff.gateName,
        allowedTiers: "ALL",
        allowedTierNames: [],
        token: token2,
        expiresAt: ventureStaff.expiresAt ? ventureStaff.expiresAt.toISOString() : null,
        isVenture: true
      };
    }
    if (!staff.isActive) {
      throw new ForbiddenError("This staff PIN has been disabled by the event organizer.");
    }
    if (staff.expiresAt && /* @__PURE__ */ new Date() > new Date(staff.expiresAt)) {
      throw new ForbiddenError("This temporary staff PIN has expired. Request a new PIN from the event organizer.");
    }
    let allowedTierNames = [];
    if (staff.allowedTiers && staff.allowedTiers !== "ALL") {
      try {
        allowedTierNames = JSON.parse(staff.allowedTiers);
      } catch {
        allowedTierNames = staff.allowedTiers.split(",").map((s) => s.trim());
      }
    }
    const token = signStaffToken({
      staffScannerId: staff.id,
      eventId: staff.eventId,
      staffName: staff.staffName,
      gateName: staff.gateName,
      allowedTiers: staff.allowedTiers,
      allowedTierNames
    }, this.scannerTokenTtlSeconds(staff));
    return {
      staffScannerId: staff.id,
      eventId: staff.eventId,
      eventTitle: staff.event?.title || "Live Event",
      eventSlug: staff.event?.slug || "",
      eventVenue: staff.event?.venue || null,
      eventStartsAt: staff.event?.startsAt ? staff.event.startsAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      eventEndsAt: staff.event?.endsAt ? staff.event.endsAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString(),
      staffName: staff.staffName,
      gateName: staff.gateName,
      allowedTiers: staff.allowedTiers,
      allowedTierNames,
      token,
      expiresAt: staff.expiresAt ? staff.expiresAt.toISOString() : null
    };
  }
  /**
   * Organizer creates 1 or multiple staff scanner PINs (decide how many volunteers)
   */
  async createStaffScanners(userId, eventId, payload) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedError("User not found.");
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Event not found.");
    if (user.role !== "ADMIN") {
      const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
      if (!orgProfile || event.organizerId !== orgProfile.id) {
        throw new ForbiddenError("You do not have permission to manage staff for this event.");
      }
    }
    const count = Math.max(1, Math.min(payload.count || 1, 50));
    const gateName = (payload.gateName || "General Gate").trim();
    let allowedTiersStr = "ALL";
    if (Array.isArray(payload.allowedTiers) && payload.allowedTiers.length > 0) {
      allowedTiersStr = JSON.stringify(payload.allowedTiers);
    } else if (typeof payload.allowedTiers === "string" && payload.allowedTiers.trim() && payload.allowedTiers !== "ALL") {
      allowedTiersStr = payload.allowedTiers.trim();
    }
    const expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : null;
    const existingScanners = await this.staffRepo.findByEventId(eventId);
    const existingPins = new Set(existingScanners.map((s) => s.pin));
    for (const pin of await this.staffRepo.findAllActivePins()) existingPins.add(pin);
    const activeVenturePins = await this.prisma.ventureStaffScanner.findMany({
      where: { isActive: true },
      select: { pin: true }
    });
    for (const vp of activeVenturePins) existingPins.add(vp.pin);
    const itemsToCreate = [];
    for (let i = 1; i <= count; i++) {
      let pin = "";
      if (count === 1 && payload.customPin && /^\d{6}$/.test(payload.customPin.trim())) {
        pin = payload.customPin.trim();
        if (existingPins.has(pin)) {
          throw new ConflictError(`PIN ${pin} is already in use for this event. Please choose another 6-digit PIN.`);
        }
      } else {
        let attempts = 0;
        do {
          pin = generateStaffPin();
          attempts++;
        } while (existingPins.has(pin) && attempts < 100);
      }
      existingPins.add(pin);
      let volunteerName = "";
      if (count === 1 && payload.staffName?.trim()) {
        volunteerName = payload.staffName.trim();
      } else {
        const prefix = payload.namePrefix?.trim() || `${gateName} Volunteer`;
        volunteerName = count === 1 ? prefix : `${prefix} #${i}`;
      }
      itemsToCreate.push({
        eventId,
        organizerId: event.organizerId,
        staffName: volunteerName,
        pin,
        gateName,
        allowedTiers: allowedTiersStr,
        expiresAt,
        notes: payload.notes || null
      });
    }
    const created = await this.staffRepo.createMany(itemsToCreate);
    return created.map((c) => this.mapToDTO(c));
  }
  /**
   * List all Staff Scanners for an event
   */
  async getStaffScannersForEvent(userId, eventId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedError("User not found.");
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Event not found.");
    if (user.role !== "ADMIN") {
      const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
      if (!orgProfile || event.organizerId !== orgProfile.id) {
        throw new ForbiddenError("You do not have permission to view staff for this event.");
      }
    }
    const scanners = await this.staffRepo.findByEventId(eventId);
    return scanners.map((s) => this.mapToDTO(s));
  }
  /**
   * Update Staff Scanner (e.g. rename, change gate, regenerate PIN, toggle active)
   */
  async updateStaffScanner(userId, scannerId, data) {
    const staff = await this.staffRepo.findById(scannerId);
    if (!staff) throw new NotFoundError("Staff scanner account not found.");
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedError("User not found.");
    if (user.role !== "ADMIN") {
      const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
      if (!orgProfile || staff.event?.organizerId !== orgProfile.id) {
        throw new ForbiddenError("You do not have permission to modify this staff scanner.");
      }
    }
    let newPin = staff.pin;
    if (data.regeneratePin) {
      newPin = generateStaffPin();
    } else if (data.customPin && /^\d{6}$/.test(data.customPin.trim())) {
      newPin = data.customPin.trim();
    }
    let allowedTiersStr = staff.allowedTiers;
    if (Array.isArray(data.allowedTiers)) {
      allowedTiersStr = data.allowedTiers.length > 0 ? JSON.stringify(data.allowedTiers) : "ALL";
    } else if (typeof data.allowedTiers === "string") {
      allowedTiersStr = data.allowedTiers.trim() || "ALL";
    }
    const updated = await this.staffRepo.update(scannerId, {
      staffName: data.staffName?.trim() || staff.staffName,
      gateName: data.gateName?.trim() || staff.gateName,
      allowedTiers: allowedTiersStr,
      isActive: data.isActive !== void 0 ? data.isActive : staff.isActive,
      pin: newPin,
      expiresAt: data.expiresAt !== void 0 ? data.expiresAt ? new Date(data.expiresAt) : null : staff.expiresAt,
      notes: data.notes !== void 0 ? data.notes : staff.notes
    });
    return this.mapToDTO(updated);
  }
  /**
   * Delete / Revoke Staff Scanner PIN
   */
  async deleteStaffScanner(userId, scannerId) {
    const staff = await this.staffRepo.findById(scannerId);
    if (!staff) throw new NotFoundError("Staff scanner account not found.");
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedError("User not found.");
    if (user.role !== "ADMIN") {
      const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
      if (!orgProfile || staff.event?.organizerId !== orgProfile.id) {
        throw new ForbiddenError("You do not have permission to delete this staff scanner.");
      }
    }
    await this.staffRepo.delete(scannerId);
    return {
      success: true,
      message: `Staff PIN for ${staff.staffName} (${staff.gateName}) was permanently revoked.`
    };
  }
  /**
   * Process Gate Ticket Scan with Gate Separation & Restricted Financial Access
   */
  async scanTicketAtGate(authContext, rawQRInput, ipAddress, userAgent) {
    const assignedGate = authContext.gateName || "Main Entrance";
    const scannerStaffId = authContext.staffScannerId || null;
    const scannerUserId = authContext.userId || (scannerStaffId ? `staff_${scannerStaffId}` : "unknown");
    const scannerType = authContext.staffScannerId ? "STAFF_PIN" : authContext.isOrganizerOrAdmin ? "ORGANIZER" : "USER";
    const dynamicResult = parseAndVerifyDynamicQRToken(rawQRInput);
    if (!dynamicResult.valid) {
      await this.prisma.attendanceLog.create({
        data: {
          eventId: "unknown",
          scannerUserId,
          scannerType,
          staffScannerId: scannerStaffId,
          gateName: assignedGate,
          scanOutcome: "INVALID_QR",
          ipAddress,
          userAgent
        }
      });
      throw new BadRequestError(dynamicResult.reason || "Invalid QR code signature. Please scan a valid ticket pass.");
    }
    const ticketRef = dynamicResult.qrHash;
    const ticket = await this.ticketRepo.findByQrToken(ticketRef);
    if (!ticket) {
      await this.prisma.attendanceLog.create({
        data: {
          eventId: "unknown",
          scannerUserId,
          scannerType,
          staffScannerId: scannerStaffId,
          gateName: assignedGate,
          scanOutcome: "INVALID_QR",
          ipAddress,
          userAgent
        }
      });
      throw new NotFoundError("Ticket not found in active database registry.");
    }
    const eventId = ticket.booking?.eventId;
    if (!eventId) {
      throw new BadRequestError("Ticket is not linked to any valid event.");
    }
    if (authContext.staffScannerId) {
      const staff = await this.staffRepo.findById(authContext.staffScannerId);
      if (!staff || !staff.isActive) {
        throw new ForbiddenError("This staff scanner session is no longer active.");
      }
      if (staff.eventId !== eventId) {
        await this.prisma.attendanceLog.create({
          data: {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            eventId,
            scannerUserId,
            scannerType: "STAFF_PIN",
            staffScannerId: staff.id,
            gateName: staff.gateName,
            scanOutcome: "WRONG_EVENT",
            ipAddress,
            userAgent
          }
        });
        throw new BadRequestError(`WRONG EVENT: This ticket is for '${ticket.booking?.event?.title || "another event"}', not this gate.`);
      }
    }
    const ticketTierName = ticket.ticketTier?.name || "General Admission";
    const allowedTierNames = authContext.allowedTierNames || [];
    if (allowedTierNames.length > 0) {
      const tierLower = ticketTierName.toLowerCase();
      const isAllowed = allowedTierNames.some((t) => tierLower.includes(t.toLowerCase()) || t.toLowerCase().includes(tierLower));
      if (!isAllowed) {
        await this.prisma.attendanceLog.create({
          data: {
            ticketId: ticket.id,
            ticketNumber: ticket.ticketNumber,
            eventId,
            scannerUserId,
            scannerType,
            staffScannerId: scannerStaffId,
            gateName: assignedGate,
            scanOutcome: "GATE_MISMATCH",
            ipAddress,
            userAgent
          }
        });
        throw new BadRequestError(
          `GATE MISMATCH: This attendee has a "${ticketTierName}" pass. This gate (${assignedGate}) is restricted to [${allowedTierNames.join(", ")}]. Please direct them to the standard entrance gate.`
        );
      }
    }
    const event = ticket.booking?.event;
    if (event && event.startsAt) {
      const now = /* @__PURE__ */ new Date();
      const eventStart = new Date(event.startsAt);
      const dayStart = new Date(eventStart);
      dayStart.setHours(0, 0, 0, 0);
      const fourHoursBefore = new Date(eventStart.getTime() - 4 * 60 * 60 * 1e3);
      const openTime = fourHoursBefore < dayStart ? fourHoursBefore : dayStart;
      const eventEnd = event.endsAt ? new Date(event.endsAt) : new Date(eventStart.getTime() + 12 * 60 * 60 * 1e3);
      const dayEnd = new Date(eventEnd);
      dayEnd.setHours(23, 59, 59, 999);
      const closeTime = new Date(eventEnd.getTime() + 6 * 60 * 60 * 1e3);
      const maxClose = closeTime > dayEnd ? closeTime : dayEnd;
      if (now < openTime) {
        throw new BadRequestError("Gate admittance has not opened yet for this event.");
      }
      if (now > maxClose) {
        throw new BadRequestError("Gate check-in for this event is closed.");
      }
    }
    if (ticket.status !== "CONFIRMED") {
      await this.prisma.attendanceLog.create({
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          eventId,
          scannerUserId,
          scannerType,
          staffScannerId: scannerStaffId,
          gateName: assignedGate,
          scanOutcome: `INELIGIBLE_STATUS_${ticket.status}`,
          ipAddress,
          userAgent
        }
      });
      throw new BadRequestError(`Cannot admit ticket with status: '${ticket.status}'. Pass is invalid or refunded.`);
    }
    const updateResult = await this.prisma.ticket.updateMany({
      where: {
        id: ticket.id,
        scannedAt: null,
        status: "CONFIRMED"
      },
      data: {
        scannedAt: /* @__PURE__ */ new Date(),
        scannedByUserId: scannerUserId
      }
    });
    if (updateResult.count === 0) {
      await this.prisma.attendanceLog.create({
        data: {
          ticketId: ticket.id,
          ticketNumber: ticket.ticketNumber,
          eventId,
          scannerUserId,
          scannerType,
          staffScannerId: scannerStaffId,
          gateName: assignedGate,
          scanOutcome: "ALREADY_CHECKED_IN",
          ipAddress,
          userAgent
        }
      });
      const existing = await this.ticketRepo.findById(ticket.id);
      const scannedTimeStr = existing?.scannedAt ? formatTimeIST(existing.scannedAt) : "earlier";
      throw new ConflictError(`TICKET ALREADY SCANNED! This pass was admitted at ${scannedTimeStr}.`);
    }
    let totalGateScans = 1;
    if (scannerStaffId) {
      const updatedStaff = await this.staffRepo.incrementScanCount(scannerStaffId);
      totalGateScans = updatedStaff.scansCount;
    }
    await this.prisma.attendanceLog.create({
      data: {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
        eventId,
        scannerUserId,
        scannerType,
        staffScannerId: scannerStaffId,
        gateName: assignedGate,
        scanOutcome: "SUCCESS",
        ipAddress,
        userAgent
      }
    });
    return {
      success: true,
      message: `Admitted at ${assignedGate}! Valid ${ticketTierName} pass.`,
      gateName: assignedGate,
      scannerType,
      staffName: authContext.staffName || "Staff Gate Usher",
      scannedAt: (/* @__PURE__ */ new Date()).toISOString(),
      gateScansCount: totalGateScans,
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        tierName: ticketTierName,
        seatNumber: ticket.seatNumber || null,
        ownerName: ticket.ownerUser?.fullName || "Attendee",
        eventTitle: ticket.booking?.event?.title || "Event",
        status: "CONFIRMED",
        scannedAt: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  /**
   * Organizer Gate Overview & Live Throughput Analytics
   */
  async getGateOverviewStats(userId, eventId) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new UnauthorizedError("User not found.");
    const event = await this.eventRepo.findById(eventId);
    if (!event) throw new NotFoundError("Event not found.");
    if (user.role !== "ADMIN") {
      const orgProfile = await this.userRepo.findOrganizerProfileByUserId(userId);
      if (!orgProfile || event.organizerId !== orgProfile.id) {
        throw new ForbiddenError("You do not have permission to view gate analytics for this event.");
      }
    }
    const { staffScanners, attendanceLogs } = await this.staffRepo.getGateStats(eventId);
    const gateMap = /* @__PURE__ */ new Map();
    for (const staff of staffScanners) {
      const gate = staff.gateName || "General Gate";
      if (!gateMap.has(gate)) {
        gateMap.set(gate, {
          gateName: gate,
          scansCount: 0,
          activeScannersCount: 0,
          lastScannedAt: null,
          staffMembers: []
        });
      }
      const gateStat = gateMap.get(gate);
      if (staff.isActive) {
        gateStat.activeScannersCount++;
      }
      gateStat.scansCount += staff.scansCount;
      if (staff.lastScannedAt) {
        if (!gateStat.lastScannedAt || new Date(staff.lastScannedAt) > new Date(gateStat.lastScannedAt)) {
          gateStat.lastScannedAt = staff.lastScannedAt.toISOString();
        }
      }
      gateStat.staffMembers.push({
        id: staff.id,
        staffName: staff.staffName,
        pin: staff.pin,
        scansCount: staff.scansCount,
        isActive: staff.isActive,
        lastScannedAt: staff.lastScannedAt ? staff.lastScannedAt.toISOString() : null
      });
    }
    for (const log of attendanceLogs) {
      const gate = log.gateName || "General Gate";
      if (!gateMap.has(gate)) {
        gateMap.set(gate, {
          gateName: gate,
          scansCount: 1,
          activeScannersCount: 0,
          lastScannedAt: log.scannedAt.toISOString(),
          staffMembers: []
        });
      }
    }
    const totalEventTicketsSold = event.ticketTiers.reduce((acc, t) => acc + (t.sold || 0), 0);
    const totalAdmittedCount = attendanceLogs.length;
    const pendingCount = Math.max(0, totalEventTicketsSold - totalAdmittedCount);
    const overallAdmittanceRate = totalEventTicketsSold > 0 ? Math.round(totalAdmittedCount / totalEventTicketsSold * 100) : 0;
    return {
      eventId: event.id,
      eventTitle: event.title,
      totalEventTicketsSold,
      totalAdmittedCount,
      pendingCount,
      overallAdmittanceRate,
      gates: Array.from(gateMap.values())
    };
  }
};

// src/server/controllers/staff-scanner.controller.ts
init_app_error();
var StaffScannerController = class {
  constructor() {
    this.staffService = new StaffScannerService();
    this.loginWithPin = async (req, res, next) => {
      try {
        const { pin, eventId } = req.body;
        const session = await this.staffService.loginWithPin(pin, eventId);
        res.json({
          success: true,
          message: `Welcome ${session.staffName}! Logged into ${session.gateName}.`,
          session
        });
      } catch (err) {
        next(err);
      }
    };
    this.scanTicket = async (req, res, next) => {
      try {
        const { qrHash, gateName: customGate } = req.body;
        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
        const userAgent = req.headers["user-agent"];
        let authContext = {};
        if (req.staffScanner) {
          authContext = {
            staffScannerId: req.staffScanner.id,
            userId: `staff_${req.staffScanner.id}`,
            gateName: req.staffScanner.gateName,
            staffName: req.staffScanner.staffName,
            allowedTierNames: req.staffScanner.allowedTierNames,
            isOrganizerOrAdmin: false
          };
        } else if (req.user) {
          const isOrganizerOrAdmin = req.user.role === "ORGANIZER" || req.user.role === "ADMIN";
          authContext = {
            userId: req.user.id,
            gateName: customGate || "Organizer Master Gate",
            staffName: req.user.fullName || "Organizer",
            allowedTierNames: [],
            // ALL allowed
            isOrganizerOrAdmin
          };
        } else {
          throw new UnauthorizedError("Scanner authentication or volunteer staff PIN session required.");
        }
        const result = await this.staffService.scanTicketAtGate(
          authContext,
          qrHash,
          ip,
          userAgent
        );
        res.json(result);
      } catch (err) {
        next(err);
      }
    };
    this.getStaffScannersForEvent = async (req, res, next) => {
      try {
        if (!req.user) throw new UnauthorizedError("Authentication required.");
        const { eventId } = req.params;
        const scanners = await this.staffService.getStaffScannersForEvent(req.user.id, eventId);
        res.json(scanners);
      } catch (err) {
        next(err);
      }
    };
    this.createStaffScanners = async (req, res, next) => {
      try {
        if (!req.user) throw new UnauthorizedError("Authentication required.");
        const { eventId } = req.params;
        const created = await this.staffService.createStaffScanners(req.user.id, eventId, req.body);
        res.status(201).json({
          success: true,
          count: created.length,
          message: `Successfully generated ${created.length} volunteer staff scanner account${created.length > 1 ? "s" : ""}.`,
          scanners: created
        });
      } catch (err) {
        next(err);
      }
    };
    this.updateStaffScanner = async (req, res, next) => {
      try {
        if (!req.user) throw new UnauthorizedError("Authentication required.");
        const { id } = req.params;
        const updated = await this.staffService.updateStaffScanner(req.user.id, id, req.body);
        res.json(updated);
      } catch (err) {
        next(err);
      }
    };
    this.deleteStaffScanner = async (req, res, next) => {
      try {
        if (!req.user) throw new UnauthorizedError("Authentication required.");
        const { id } = req.params;
        const result = await this.staffService.deleteStaffScanner(req.user.id, id);
        res.json(result);
      } catch (err) {
        next(err);
      }
    };
    this.getGateStats = async (req, res, next) => {
      try {
        if (!req.user) throw new UnauthorizedError("Authentication required.");
        const { eventId } = req.params;
        const stats = await this.staffService.getGateOverviewStats(req.user.id, eventId);
        res.json(stats);
      } catch (err) {
        next(err);
      }
    };
  }
};

// src/server/controllers/queue.controller.ts
var import_zod9 = require("zod");
var enterQueueSchema = import_zod9.z.object({
  eventId: import_zod9.z.string().min(1, "Event ID is required")
});
var leaveQueueSchema = import_zod9.z.object({
  eventId: import_zod9.z.string().min(1, "Event ID is required")
});
var QueueController = class {
  constructor() {
    /**
     * Request entry into the Virtual Waiting Room or checkout fast-pass.
     */
    this.enterQueue = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Authentication required to enter checkout queue." });
        }
        const body = enterQueueSchema.parse(req.body);
        const result = await queueService.requestEntry(req.user.id, body.eventId);
        return res.status(200).json(result);
      } catch (err) {
        if (err instanceof import_zod9.z.ZodError) {
          return res.status(400).json({ error: err.issues[0].message });
        }
        return respondWithError(res, err, "Failed to process waiting room request", 500);
      }
    };
    /**
     * Status polling endpoint called every 5 seconds by the Virtual Waiting Room UI.
     */
    this.getQueueStatus = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Authentication required to check queue status." });
        }
        const eventId = req.query.eventId || req.body?.eventId;
        if (!eventId) {
          return res.status(400).json({ error: "Query parameter 'eventId' is required." });
        }
        const result = await queueService.getQueueStatus(req.user.id, eventId);
        return res.status(200).json(result);
      } catch (err) {
        return respondWithError(res, err, "Failed to retrieve waiting room status", 500);
      }
    };
    /**
     * Leaves the waiting room or releases active session.
     */
    this.leaveQueue = async (req, res) => {
      try {
        if (!req.user) {
          return res.status(401).json({ error: "Authentication required." });
        }
        const body = leaveQueueSchema.parse(req.body);
        await queueService.releaseAdmission(req.user.id, body.eventId);
        return res.status(200).json({ success: true, message: "Queue session released successfully." });
      } catch (err) {
        if (err instanceof import_zod9.z.ZodError) {
          return res.status(400).json({ error: err.issues[0].message });
        }
        return respondWithError(res, err, "Failed to leave queue", 500);
      }
    };
    /**
     * Diagnostic / monitoring statistics for event checkout queue.
     */
    this.getEventStats = async (req, res) => {
      try {
        const eventId = req.params.eventId;
        if (!eventId) {
          return res.status(400).json({ error: "Event ID is required." });
        }
        const max = queueService.getMaxActiveSessions();
        return res.status(200).json({
          eventId,
          maxCapacity: max
        });
      } catch (err) {
        return respondWithError(res, err, "Failed to get queue statistics", 500);
      }
    };
  }
};

// src/server/services/venture.service.ts
var import_crypto27 = __toESM(require("crypto"), 1);
init_db();
init_redis2();
init_logger();
init_error_message();
var VentureService = class {
  /**
   * Initializes or retrieves the singleton active Venture Vault event.
   */
  async getOrCreateMasterEvent() {
    const prisma2 = getPrisma();
    let event = await prisma2.ventureEvent.findFirst({
      where: { status: { not: "ARCHIVED" } },
      include: {
        subEvents: {
          orderBy: { roundNumber: "asc" }
        }
      }
    });
    if (!event) {
      event = await prisma2.ventureEvent.create({
        data: {
          title: "Venture Vault 2026",
          description: "Exclusive 3-Stage Elite Delegation Summit & Innovation Competition.",
          masterBannerUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80",
          isPrivate: true,
          status: "ACTIVE",
          subEvents: {
            create: [
              {
                roundNumber: 1,
                title: "Round 1: Preliminary Pitch & Strategy Defense",
                bannerUrl: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80",
                scheduledTime: "10:00 AM - 01:00 PM",
                status: "LOCKED"
              },
              {
                roundNumber: 2,
                title: "Round 2: Prototype Showcase & Architectural Review",
                bannerUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
                scheduledTime: "02:00 PM - 05:00 PM",
                status: "LOCKED"
              },
              {
                roundNumber: 3,
                title: "Round 3: Grand Finale Showcase & Awards Ceremony",
                bannerUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
                scheduledTime: "06:00 PM - 08:30 PM",
                status: "LOCKED"
              }
            ]
          }
        },
        include: {
          subEvents: {
            orderBy: { roundNumber: "asc" }
          }
        }
      });
    }
    return event;
  }
  /**
   * Retrieves safe public metadata for the summit preview on the homepage (non-sensitive only).
   */
  async getPublicPreview() {
    const prisma2 = getPrisma();
    const event = await prisma2.ventureEvent.findFirst({
      where: { status: { not: "ARCHIVED" } },
      include: {
        subEvents: {
          orderBy: { roundNumber: "asc" },
          select: {
            roundNumber: true,
            title: true,
            bannerUrl: true,
            scheduledTime: true,
            status: true
          }
        }
      }
    });
    if (!event) return null;
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      masterBannerUrl: event.masterBannerUrl,
      subEvents: event.subEvents,
      delegationInfo: {
        totalTeams: 70,
        delegatesPerTeam: 4,
        totalDelegates: 280,
        isRestricted: true,
        supportEmail: process.env.VENTURE_SUPPORT_EMAIL || "happenins.co.in@gmail.com"
      }
    };
  }
  /**
   * Updates master event details and sub-event metadata (banners, timings, titles).
   */
  async updateMasterEvent(data) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    if (data.title || data.description || data.masterBannerUrl) {
      await prisma2.ventureEvent.update({
        where: { id: event.id },
        data: {
          title: data.title ?? event.title,
          description: data.description ?? event.description,
          masterBannerUrl: data.masterBannerUrl ?? event.masterBannerUrl
        }
      });
    }
    if (data.subEvents && Array.isArray(data.subEvents)) {
      for (const se of data.subEvents) {
        await prisma2.ventureSubEvent.upsert({
          where: {
            ventureEventId_roundNumber: {
              ventureEventId: event.id,
              roundNumber: se.roundNumber
            }
          },
          update: {
            title: se.title,
            bannerUrl: se.bannerUrl,
            scheduledTime: se.scheduledTime,
            status: se.status
          },
          create: {
            ventureEventId: event.id,
            roundNumber: se.roundNumber,
            title: se.title,
            bannerUrl: se.bannerUrl,
            scheduledTime: se.scheduledTime,
            status: se.status || "LOCKED"
          }
        });
      }
    }
    return this.getOrCreateMasterEvent();
  }
  /**
   * Resets/clears all existing Venture Vault teams, members, and passes for this event.
   */
  async resetRoster() {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const existingTeams = await prisma2.ventureTeam.findMany({
      where: { ventureEventId: event.id },
      select: { id: true }
    });
    const teamIds = existingTeams.map((t) => t.id);
    let deletedMembers = 0;
    let deletedPasses = 0;
    if (teamIds.length > 0) {
      const existingMembers = await prisma2.ventureMember.findMany({
        where: { teamId: { in: teamIds } },
        select: { id: true }
      });
      const memberIds = existingMembers.map((m) => m.id);
      if (memberIds.length > 0) {
        const passResult = await prisma2.venturePass.deleteMany({
          where: { memberId: { in: memberIds } }
        });
        deletedPasses = passResult.count;
        const memberResult = await prisma2.ventureMember.deleteMany({
          where: { id: { in: memberIds } }
        });
        deletedMembers = memberResult.count;
      }
      await prisma2.ventureTeam.deleteMany({
        where: { id: { in: teamIds } }
      });
    }
    return {
      success: true,
      teamsDeleted: teamIds.length,
      membersDeleted: deletedMembers,
      passesDeleted: deletedPasses
    };
  }
  /**
   * Ingests parsed roster teams into the database, generating uniqueTokens and 3 VenturePasses per member.
   * By default, cleanly replaces existing teams so re-uploads never create duplicate ghost teams.
   */
  async uploadRoster(teams, replaceExisting = true) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const subEvents = event.subEvents;
    if (replaceExisting) {
      await this.resetRoster();
    }
    const teamsData = [];
    const membersData = [];
    const passesData = [];
    for (const t of teams) {
      const teamName = (t.teamName || "Unnamed Team").trim();
      if (!teamName || !t.members || t.members.length === 0) continue;
      const teamId = import_crypto27.default.randomUUID();
      teamsData.push({
        id: teamId,
        ventureEventId: event.id,
        teamName
      });
      for (let i = 0; i < t.members.length; i++) {
        const m = t.members[i];
        const cleanEmail = (m.email || "").trim().toLowerCase();
        const cleanName = (m.fullName || "Candidate").trim();
        if (!cleanEmail) continue;
        const memberId = import_crypto27.default.randomUUID();
        const role = m.role || (i === 0 ? "LEADER" : "MEMBER");
        const uniqueToken = "vv_" + import_crypto27.default.randomBytes(12).toString("hex");
        membersData.push({
          id: memberId,
          teamId,
          fullName: cleanName,
          email: cleanEmail,
          role,
          uniqueToken
        });
        for (const sub of subEvents) {
          const qrHash = `VV:${sub.roundNumber}:${uniqueToken}:${import_crypto27.default.randomBytes(6).toString("hex")}`;
          passesData.push({
            id: import_crypto27.default.randomUUID(),
            memberId,
            subEventId: sub.id,
            qrHash,
            status: "UNSENT"
          });
        }
      }
    }
    if (teamsData.length > 0) {
      const CHUNK_SIZE = 100;
      for (let i = 0; i < teamsData.length; i += CHUNK_SIZE) {
        await prisma2.ventureTeam.createMany({ data: teamsData.slice(i, i + CHUNK_SIZE) });
      }
      for (let i = 0; i < membersData.length; i += CHUNK_SIZE) {
        await prisma2.ventureMember.createMany({ data: membersData.slice(i, i + CHUNK_SIZE) });
      }
      for (let i = 0; i < passesData.length; i += CHUNK_SIZE) {
        await prisma2.venturePass.createMany({ data: passesData.slice(i, i + CHUNK_SIZE) });
      }
    }
    return {
      success: true,
      teamsCreated: teamsData.length,
      membersCreated: membersData.length
    };
  }
  /**
   * Retrieves full attendance matrix and telemetry for the organizer console.
   */
  async getAttendanceMatrix() {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const teams = await prisma2.ventureTeam.findMany({
      where: { ventureEventId: event.id },
      include: {
        members: {
          include: {
            passes: {
              include: {
                subEvent: true
              }
            }
          },
          orderBy: { role: "asc" }
        }
      },
      orderBy: { teamName: "asc" }
    });
    let totalMembers = 0;
    let round1CheckedIn = 0;
    let round2CheckedIn = 0;
    let round3CheckedIn = 0;
    let round1Sent = 0;
    let round2Sent = 0;
    let round3Sent = 0;
    const flattenedTeams = teams.map((team) => {
      const members = team.members.map((m) => {
        totalMembers++;
        const p1 = m.passes.find((p) => p.subEvent.roundNumber === 1);
        const p2 = m.passes.find((p) => p.subEvent.roundNumber === 2);
        const p3 = m.passes.find((p) => p.subEvent.roundNumber === 3);
        if (p1?.status === "CHECKED_IN") round1CheckedIn++;
        if (p2?.status === "CHECKED_IN") round2CheckedIn++;
        if (p3?.status === "CHECKED_IN") round3CheckedIn++;
        if (p1?.status === "SENT" || p1?.status === "CHECKED_IN") round1Sent++;
        if (p2?.status === "SENT" || p2?.status === "CHECKED_IN") round2Sent++;
        if (p3?.status === "SENT" || p3?.status === "CHECKED_IN") round3Sent++;
        return {
          id: m.id,
          fullName: m.fullName,
          email: m.email,
          role: m.role,
          uniqueToken: m.uniqueToken,
          round1: {
            passId: p1?.id,
            status: p1?.status || "UNSENT",
            checkedInAt: p1?.checkedInAt,
            checkedInByGate: p1?.checkedInByGate,
            emailSentAt: p1?.emailSentAt
          },
          round2: {
            passId: p2?.id,
            status: p2?.status || "UNSENT",
            checkedInAt: p2?.checkedInAt,
            checkedInByGate: p2?.checkedInByGate,
            emailSentAt: p2?.emailSentAt
          },
          round3: {
            passId: p3?.id,
            status: p3?.status || "UNSENT",
            checkedInAt: p3?.checkedInAt,
            checkedInByGate: p3?.checkedInByGate,
            emailSentAt: p3?.emailSentAt
          }
        };
      });
      return {
        id: team.id,
        teamName: team.teamName,
        membersCount: members.length,
        members
      };
    });
    return {
      event: {
        id: event.id,
        title: event.title,
        description: event.description,
        masterBannerUrl: event.masterBannerUrl,
        subEvents: event.subEvents
      },
      stats: {
        totalTeams: teams.length,
        totalMembers,
        round1: { checkedIn: round1CheckedIn, sent: round1Sent },
        round2: { checkedIn: round2CheckedIn, sent: round2Sent },
        round3: { checkedIn: round3CheckedIn, sent: round3Sent }
      },
      teams: flattenedTeams
    };
  }
  /**
   * Micro-batch pass email dispatcher (sends ~15 emails at a time to stay under Vercel 10s limit).
   */
  async dispatchBatch(data) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const subEvent = event.subEvents.find((s) => s.roundNumber === data.roundNumber);
    if (!subEvent) {
      throw new Error(`Sub-event for Round ${data.roundNumber} not found.`);
    }
    const passes = await prisma2.venturePass.findMany({
      where: {
        subEventId: subEvent.id,
        memberId: { in: data.memberIds }
      },
      include: {
        member: {
          include: {
            team: true
          }
        }
      }
    });
    const existingMemberIds = new Set(passes.map((p) => p.memberId));
    const missingMemberIds = data.memberIds.filter((id) => !existingMemberIds.has(id));
    if (missingMemberIds.length > 0) {
      const membersToCreateFor = await prisma2.ventureMember.findMany({
        where: { id: { in: missingMemberIds } },
        include: { team: true }
      });
      for (const m of membersToCreateFor) {
        const qrHash = `VV:${data.roundNumber}:${m.uniqueToken}:${import_crypto27.default.randomBytes(6).toString("hex")}`;
        const newPass = await prisma2.venturePass.create({
          data: {
            memberId: m.id,
            subEventId: subEvent.id,
            qrHash,
            status: "UNSENT"
          },
          include: {
            member: {
              include: { team: true }
            }
          }
        });
        passes.push(newPass);
      }
    }
    const origin = (data.originUrl || process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");
    let sentCount = 0;
    let failedCount = 0;
    const errors = [];
    if (passes.length === 0) {
      return {
        roundNumber: data.roundNumber,
        sentCount: 0,
        failedCount: data.memberIds.length,
        errors: [{ email: "unknown", error: "Candidate not found in the live roster." }]
      };
    }
    for (const pass of passes) {
      const member = pass.member;
      const team = member.team;
      try {
        const mobilePassUrl = `${origin}/venture-pass/${member.uniqueToken}?round=${data.roundNumber}`;
        const idMatch = team.teamName.match(/^(?:Team\s*#?\s*|ID\s*#?\s*|#\s*)(\d+)/i);
        const teamId = idMatch ? idMatch[1] : void 0;
        const html = this.buildVentureEmailHtml({
          masterTitle: event.title || "Venture Vault 2026",
          candidateName: member.fullName,
          teamId,
          teamName: team.teamName,
          role: member.role,
          roundNumber: data.roundNumber,
          roundTitle: subEvent.title,
          scheduledTime: subEvent.scheduledTime || "Schedule as per event handbook",
          bannerUrl: subEvent.bannerUrl || event.masterBannerUrl || "",
          mobilePassUrl,
          uniqueToken: member.uniqueToken,
          contactEmail: process.env.VENTURE_SUPPORT_EMAIL || "happenins.co.in@gmail.com"
        });
        const teamTag = teamId ? `[Team ID #${teamId} \u2022 ${team.teamName}]` : `[${team.teamName}]`;
        const sendRes = await sendVentureMail({
          stage: data.roundNumber,
          to: member.email,
          subject: `Official Admission Pass: ${event.title} - ${subEvent.title} ${teamTag}`,
          html
        });
        if (sendRes.success) {
          await prisma2.venturePass.update({
            where: { id: pass.id },
            data: {
              status: pass.status === "CHECKED_IN" ? "CHECKED_IN" : "SENT",
              emailSentAt: /* @__PURE__ */ new Date()
            }
          });
          sentCount++;
        } else {
          failedCount++;
          errors.push({ email: member.email, error: sendRes.error || "Failed to dispatch" });
        }
      } catch (err) {
        failedCount++;
        errors.push({ email: member.email, error: errorMessage(err) });
      }
    }
    return {
      roundNumber: data.roundNumber,
      sentCount,
      failedCount,
      errors
    };
  }
  /**
   * Dispatches pass email to an individual member on-demand.
   */
  async sendIndividualPassEmail(data) {
    const round = data.roundNumber || 3;
    const res = await this.dispatchBatch({
      roundNumber: round,
      memberIds: [data.memberId],
      originUrl: data.originUrl
    });
    if (res.sentCount === 1) {
      return { success: true, message: `Pass email sent successfully for Round ${round}.` };
    } else {
      const errMsg = res.errors?.[0]?.error || "Failed to dispatch email.";
      throw new Error(errMsg);
    }
  }
  /**
   * On-Spot Full Team Registration: Creates a new team with Leader and members.
   * Optionally sends pass emails immediately.
   */
  async createOnSpotTeam(data) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const subEvents = event.subEvents;
    const teamName = (data.teamName || "Unnamed Team").trim();
    if (!teamName) {
      throw new Error("Team Name / ID is required.");
    }
    if (!data.members || data.members.length === 0) {
      throw new Error("At least one team member (Leader) is required.");
    }
    const createdTeam = await prisma2.ventureTeam.create({
      data: {
        ventureEventId: event.id,
        teamName
      }
    });
    const createdMembers = [];
    const memberIdsForEmail = [];
    for (let i = 0; i < data.members.length; i++) {
      const m = data.members[i];
      const cleanEmail = (m.email || "").trim().toLowerCase();
      const cleanName = (m.fullName || "Candidate").trim();
      if (!cleanEmail) continue;
      const role = m.role || (i === 0 ? "LEADER" : "MEMBER");
      const uniqueToken = "vv_" + import_crypto27.default.randomBytes(12).toString("hex");
      const member = await prisma2.ventureMember.create({
        data: {
          teamId: createdTeam.id,
          fullName: cleanName,
          email: cleanEmail,
          role,
          uniqueToken
        }
      });
      for (const sub of subEvents) {
        const qrHash = `VV:${sub.roundNumber}:${member.uniqueToken}:${import_crypto27.default.randomBytes(6).toString("hex")}`;
        await prisma2.venturePass.create({
          data: {
            memberId: member.id,
            subEventId: sub.id,
            qrHash,
            status: "UNSENT"
          }
        });
      }
      createdMembers.push(member);
      memberIdsForEmail.push(member.id);
    }
    let emailDispatchResult = null;
    if (data.sendEmailNow && memberIdsForEmail.length > 0) {
      try {
        emailDispatchResult = await this.dispatchBatch({
          roundNumber: data.roundNumber || 3,
          memberIds: memberIdsForEmail,
          originUrl: data.originUrl
        });
      } catch (err) {
        logger.error("Failed to auto-dispatch emails for on-spot team:", { error: errorMessage(err) });
      }
    }
    return {
      success: true,
      team: createdTeam,
      members: createdMembers,
      emailDispatchResult
    };
  }
  /**
   * Adds / diverts a member into an existing team (e.g. filling a vacant spot).
   */
  async addMemberToTeam(data) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const subEvents = event.subEvents;
    const team = await prisma2.ventureTeam.findUnique({
      where: { id: data.teamId },
      include: { members: true }
    });
    if (!team) {
      throw new Error("Team not found.");
    }
    const cleanEmail = (data.email || "").trim().toLowerCase();
    const cleanName = (data.fullName || "Candidate").trim();
    if (!cleanEmail) throw new Error("Email is required.");
    if (!cleanName) throw new Error("Full Name is required.");
    const role = data.role || (team.members.length === 0 ? "LEADER" : "MEMBER");
    const uniqueToken = "vv_" + import_crypto27.default.randomBytes(12).toString("hex");
    const member = await prisma2.ventureMember.create({
      data: {
        teamId: team.id,
        fullName: cleanName,
        email: cleanEmail,
        role,
        uniqueToken
      }
    });
    for (const sub of subEvents) {
      const qrHash = `VV:${sub.roundNumber}:${member.uniqueToken}:${import_crypto27.default.randomBytes(6).toString("hex")}`;
      await prisma2.venturePass.create({
        data: {
          memberId: member.id,
          subEventId: sub.id,
          qrHash,
          status: "UNSENT"
        }
      });
    }
    let emailDispatchResult = null;
    if (data.sendEmailNow) {
      try {
        emailDispatchResult = await this.dispatchBatch({
          roundNumber: data.roundNumber || 3,
          memberIds: [member.id],
          originUrl: data.originUrl
        });
      } catch (err) {
        logger.error("Failed to auto-dispatch email for new member:", { error: errorMessage(err) });
      }
    }
    return {
      success: true,
      member,
      emailDispatchResult
    };
  }
  /**
   * Updates an existing team's name or Team ID.
   */
  async updateTeam(teamId, data) {
    const prisma2 = getPrisma();
    const cleanName = (data.teamName || "").trim();
    if (!cleanName) throw new Error("Team name cannot be empty.");
    const updated = await prisma2.ventureTeam.update({
      where: { id: teamId },
      data: { teamName: cleanName }
    });
    return { success: true, team: updated };
  }
  /**
   * Updates an existing delegate's details (Name, Email, Role, or transfers them to another team).
   */
  async updateMember(memberId, data) {
    const prisma2 = getPrisma();
    const member = await prisma2.ventureMember.findUnique({
      where: { id: memberId }
    });
    if (!member) {
      throw new Error("Delegate / Member not found.");
    }
    const updatePayload = {};
    if (data.fullName !== void 0) {
      const n = data.fullName.trim();
      if (n) updatePayload.fullName = n;
    }
    if (data.email !== void 0) {
      const e = data.email.trim().toLowerCase();
      if (e) updatePayload.email = e;
    }
    if (data.role !== void 0) {
      const r = data.role.toUpperCase();
      if (["LEADER", "MEMBER"].includes(r)) {
        updatePayload.role = r;
      }
    }
    if (data.teamId !== void 0 && data.teamId !== member.teamId) {
      const targetTeam = await prisma2.ventureTeam.findUnique({
        where: { id: data.teamId }
      });
      if (!targetTeam) {
        throw new Error("Target team does not exist.");
      }
      updatePayload.teamId = data.teamId;
    }
    const updated = await prisma2.ventureMember.update({
      where: { id: memberId },
      data: updatePayload
    });
    return { success: true, member: updated };
  }
  /**
   * Removes a member and their passes from a team.
   */
  async removeMember(memberId) {
    const prisma2 = getPrisma();
    await prisma2.venturePass.deleteMany({
      where: { memberId }
    });
    await prisma2.ventureMember.delete({
      where: { id: memberId }
    });
    return { success: true, message: "Member removed successfully." };
  }
  /**
   * Retrieves member pass details for the public attendee mobile view.
   */
  async getAttendeePass(token, roundNumber = 1) {
    const prisma2 = getPrisma();
    const member = await prisma2.ventureMember.findUnique({
      where: { uniqueToken: token },
      include: {
        team: {
          include: {
            ventureEvent: {
              include: {
                subEvents: {
                  orderBy: { roundNumber: "asc" }
                }
              }
            }
          }
        },
        passes: {
          include: {
            subEvent: true
          }
        }
      }
    });
    if (!member) {
      return null;
    }
    const subEvents = member.team.ventureEvent.subEvents || [];
    const targetSubEvent = subEvents.find((s) => s.roundNumber === roundNumber) || subEvents[0];
    const passForRound = member.passes.find((p) => p.subEvent.roundNumber === roundNumber);
    const isLocked = !passForRound || passForRound.status === "UNSENT";
    const status = isLocked ? "LOCKED" : passForRound.status;
    const qrHash = status === "SENT" ? passForRound.qrHash : null;
    const currentPass = {
      id: passForRound?.id || null,
      roundNumber: targetSubEvent ? targetSubEvent.roundNumber : roundNumber,
      roundTitle: targetSubEvent ? targetSubEvent.title : `Round ${roundNumber}`,
      bannerUrl: passForRound?.subEvent?.bannerUrl || targetSubEvent?.bannerUrl || null,
      scheduledTime: passForRound?.subEvent?.scheduledTime || targetSubEvent?.scheduledTime || null,
      qrHash,
      status,
      isLocked,
      checkedInAt: passForRound?.checkedInAt || null,
      checkedInByGate: passForRound?.checkedInByGate || null
    };
    return {
      member: {
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        role: member.role,
        uniqueToken: member.uniqueToken
      },
      team: {
        id: member.team.id,
        teamName: member.team.teamName
      },
      event: {
        title: member.team.ventureEvent.title,
        description: member.team.ventureEvent.description,
        masterBannerUrl: member.team.ventureEvent.masterBannerUrl,
        subEvents: member.team.ventureEvent.subEvents
      },
      currentPass,
      allPasses: subEvents.map((sub) => {
        const p = member.passes.find((pass) => pass.subEvent.roundNumber === sub.roundNumber);
        const pLocked = !p || p.status === "UNSENT";
        return {
          roundNumber: sub.roundNumber,
          roundTitle: sub.title,
          status: pLocked ? "LOCKED" : p?.status || "LOCKED",
          isLocked: pLocked,
          checkedInAt: p?.checkedInAt || null,
          checkedInByGate: p?.checkedInByGate || null
        };
      })
    };
  }
  /**
   * Ultra-lightweight 1-millisecond check-in status check for high-frequency mobile polling.
   * Directly queries the pass status without 5-table joins to preserve DB connection pool.
   */
  async getAttendeePassCheckinStatus(token, roundNumber = 3) {
    const prisma2 = getPrisma();
    const pass = await prisma2.venturePass.findFirst({
      where: {
        member: { uniqueToken: token },
        subEvent: { roundNumber }
      },
      select: {
        id: true,
        status: true,
        checkedInAt: true,
        checkedInByGate: true
      }
    });
    if (!pass) {
      return { status: "LOCKED", checkedInAt: null, checkedInByGate: null };
    }
    return {
      id: pass.id,
      status: pass.status,
      checkedInAt: pass.checkedInAt ? pass.checkedInAt.toISOString() : null,
      checkedInByGate: pass.checkedInByGate
    };
  }
  /**
   * Validates and checks in an attendee at the gate with atomic duplicate protection.
   */
  async scanGatePass(data) {
    const prisma2 = getPrisma();
    const redis = initRedis();
    const cleanHash = (data.qrHash || "").trim();
    if (!cleanHash) {
      return { success: false, code: "INVALID_FORMAT", message: "Empty QR code detected." };
    }
    const lockKey = `venture:scan:lock:${cleanHash}`;
    if (redis) {
      try {
        const acquired = await redis.set(lockKey, "1", "EX", 8, "NX");
        if (!acquired) {
          return {
            success: false,
            code: "CONCURRENT_SCAN",
            message: "Scan already in progress. Please pause for a moment."
          };
        }
      } catch {
      }
    }
    try {
      let pass = await prisma2.venturePass.findUnique({
        where: { qrHash: cleanHash },
        include: {
          member: {
            include: {
              team: true
            }
          },
          subEvent: true
        }
      });
      if (!pass) {
        const cleanRef = cleanHash.replace(/^vv[:-]/i, "").toLowerCase();
        const roundPrefixMatch = cleanHash.match(/^vv:(\d+):/i);
        const targetRound = roundPrefixMatch ? Number(roundPrefixMatch[1]) : data.roundNumber || 3;
        pass = await prisma2.venturePass.findFirst({
          where: {
            subEvent: { roundNumber: targetRound },
            OR: [
              { qrHash: { contains: cleanHash, mode: "insensitive" } },
              { member: { uniqueToken: { equals: cleanHash, mode: "insensitive" } } },
              { member: { uniqueToken: { contains: cleanRef, mode: "insensitive" } } },
              { member: { email: { equals: cleanHash, mode: "insensitive" } } }
            ]
          },
          include: {
            member: {
              include: {
                team: true
              }
            },
            subEvent: true
          }
        });
      }
      if (!pass) {
        const cleanRef = cleanHash.replace(/^vv[:-]/i, "").toLowerCase();
        const anyPass = await prisma2.venturePass.findFirst({
          where: {
            OR: [
              { qrHash: { contains: cleanHash, mode: "insensitive" } },
              { member: { uniqueToken: { equals: cleanHash, mode: "insensitive" } } },
              { member: { uniqueToken: { contains: cleanRef, mode: "insensitive" } } },
              { member: { email: { equals: cleanHash, mode: "insensitive" } } }
            ]
          },
          include: {
            member: {
              include: {
                team: true
              }
            },
            subEvent: true
          }
        });
        if (anyPass) {
          const r3Pass = await prisma2.venturePass.findFirst({
            where: {
              memberId: anyPass.memberId,
              subEvent: { roundNumber: 3 }
            },
            include: {
              member: { include: { team: true } },
              subEvent: true
            }
          });
          pass = r3Pass || anyPass;
        } else {
          return {
            success: false,
            code: "PASS_NOT_FOUND",
            message: "Unrecognized pass or token. Not registered for Venture Vault."
          };
        }
      }
      if (pass.status === "CHECKED_IN") {
        await prisma2.ventureScanLog.create({
          data: {
            passId: pass.id,
            gateOperator: data.gateOperator || "Security Gate",
            result: "DUPLICATE_BLOCKED",
            errorReason: `Already checked in at ${pass.checkedInAt ? formatTimeIST(pass.checkedInAt) : "Earlier"}`
          }
        });
        return {
          success: false,
          code: "DUPLICATE_SCAN",
          message: `ALREADY CHECKED IN: ${pass.member.fullName} checked in at ${pass.checkedInAt ? formatTimeIST(pass.checkedInAt) : "earlier"} (${pass.checkedInByGate || "Gate"}).`,
          member: {
            fullName: pass.member.fullName,
            teamName: pass.member.team.teamName,
            role: pass.member.role
          },
          checkedInAt: pass.checkedInAt,
          checkedInByGate: pass.checkedInByGate
        };
      }
      const now = /* @__PURE__ */ new Date();
      const gateName = data.gateOperator || "Gate 1 (Main Entrance)";
      await prisma2.venturePass.update({
        where: { id: pass.id },
        data: {
          status: "CHECKED_IN",
          checkedInAt: now,
          checkedInByGate: gateName
        }
      });
      await prisma2.ventureScanLog.create({
        data: {
          passId: pass.id,
          gateOperator: gateName,
          result: "SUCCESS"
        }
      });
      if (data.staffScannerId) {
        await prisma2.ventureStaffScanner.update({
          where: { id: data.staffScannerId },
          data: {
            scansCount: { increment: 1 },
            lastScannedAt: now
          }
        }).catch(() => {
        });
      } else if (data.gateOperator) {
        await prisma2.ventureStaffScanner.updateMany({
          where: {
            isActive: true,
            OR: [
              { staffName: { equals: data.gateOperator, mode: "insensitive" } },
              { gateName: { equals: data.gateOperator, mode: "insensitive" } }
            ]
          },
          data: {
            scansCount: { increment: 1 },
            lastScannedAt: now
          }
        }).catch(() => {
        });
      }
      const teamMembersCount = await prisma2.ventureMember.count({
        where: { teamId: pass.member.teamId }
      });
      const teamCheckedInCount = await prisma2.venturePass.count({
        where: {
          subEventId: pass.subEventId,
          status: "CHECKED_IN",
          member: {
            teamId: pass.member.teamId
          }
        }
      });
      return {
        success: true,
        code: "APPROVED",
        message: `VALID ENTRY: ${pass.member.fullName} admitted to Round ${pass.subEvent.roundNumber} (${pass.subEvent.title}).`,
        member: {
          fullName: pass.member.fullName,
          teamName: pass.member.team.teamName,
          role: pass.member.role
        },
        teamStats: {
          teamName: pass.member.team.teamName,
          presentCount: teamCheckedInCount,
          totalMembers: teamMembersCount
        },
        checkedInAt: now,
        gate: gateName
      };
    } finally {
      if (redis) {
        await redis.del(lockKey).catch(() => {
        });
      }
    }
  }
  /**
   * Emergency Manual Check-In for candidates with dead phone batteries or lost emails.
   */
  async manualCheckIn(data) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const subEvent = event.subEvents.find((s) => s.roundNumber === data.roundNumber);
    if (!subEvent) {
      throw new Error(`Round ${data.roundNumber} sub-event not found.`);
    }
    let pass = await prisma2.venturePass.findUnique({
      where: {
        memberId_subEventId: {
          memberId: data.memberId,
          subEventId: subEvent.id
        }
      },
      include: {
        member: {
          include: {
            team: true
          }
        },
        subEvent: true
      }
    });
    if (!pass) {
      const member = await prisma2.ventureMember.findUnique({
        where: { id: data.memberId },
        include: { team: true }
      });
      if (!member) {
        throw new Error("Delegate record not found.");
      }
      const qrHash = `VV:${subEvent.roundNumber}:${member.uniqueToken}:${import_crypto27.default.randomBytes(6).toString("hex")}`;
      pass = await prisma2.venturePass.create({
        data: {
          memberId: member.id,
          subEventId: subEvent.id,
          qrHash,
          status: "UNSENT"
        },
        include: {
          member: {
            include: {
              team: true
            }
          },
          subEvent: true
        }
      });
    }
    if (pass.status === "CHECKED_IN") {
      return {
        success: false,
        code: "ALREADY_CHECKED_IN",
        message: `${pass.member.fullName} was already admitted at ${pass.checkedInAt ? formatTimeIST(pass.checkedInAt) : "earlier"}.`,
        member: {
          fullName: pass.member.fullName,
          teamName: pass.member.team.teamName,
          role: pass.member.role
        },
        checkedInAt: pass.checkedInAt,
        gate: pass.checkedInByGate
      };
    }
    const now = /* @__PURE__ */ new Date();
    const gate = data.gateOperator || "Admin Manual Override";
    await prisma2.venturePass.update({
      where: { id: pass.id },
      data: {
        status: "CHECKED_IN",
        checkedInAt: now,
        checkedInByGate: gate
      }
    });
    await prisma2.ventureScanLog.create({
      data: {
        passId: pass.id,
        gateOperator: gate,
        result: "SUCCESS"
      }
    });
    const totalMembers = await prisma2.ventureMember.count({
      where: { teamId: pass.member.teamId }
    });
    const presentCount = await prisma2.venturePass.count({
      where: {
        subEventId: pass.subEventId,
        status: "CHECKED_IN",
        member: {
          teamId: pass.member.teamId
        }
      }
    });
    return {
      success: true,
      code: "APPROVED",
      message: `Manual check-in confirmed: ${pass.member.fullName} (${pass.member.team.teamName}) admitted.`,
      member: {
        fullName: pass.member.fullName,
        teamName: pass.member.team.teamName,
        role: pass.member.role
      },
      teamStats: {
        teamName: pass.member.team.teamName,
        presentCount,
        totalMembers
      },
      checkedInAt: now,
      gate
    };
  }
  /**
   * Generates a complete CSV audit ledger with second-level timestamps for all 3 rounds.
   */
  async exportAuditLedger() {
    const data = await this.getAttendanceMatrix();
    const rows = [
      [
        "Team ID",
        "Team Name",
        "Member Name",
        "Email",
        "Role",
        "Round 1 Status",
        "Round 1 Check-In Time (IST)",
        "Round 1 Gate",
        "Round 2 Status",
        "Round 2 Check-In Time (IST)",
        "Round 2 Gate",
        "Round 3 Status",
        "Round 3 Check-In Time (IST)",
        "Round 3 Gate"
      ].map((v) => `"${v}"`).join(",")
    ];
    let teamCounter = 1;
    for (const team of data.teams) {
      const idMatch = team.teamName.match(/^(?:Team\s*#?\s*|ID\s*#?\s*|#\s*)(\d+)/i);
      const teamId = idMatch ? idMatch[1] : String(teamCounter);
      for (const m of team.members) {
        const r1Time = m.round1.checkedInAt ? formatCSVDateTimeIST(m.round1.checkedInAt) : "N/A";
        const r2Time = m.round2.checkedInAt ? formatCSVDateTimeIST(m.round2.checkedInAt) : "N/A";
        const r3Time = m.round3.checkedInAt ? formatCSVDateTimeIST(m.round3.checkedInAt) : "N/A";
        rows.push(
          [
            teamId,
            team.teamName,
            m.fullName,
            m.email,
            m.role,
            m.round1.status,
            r1Time,
            m.round1.checkedInByGate || "N/A",
            m.round2.status,
            r2Time,
            m.round2.checkedInByGate || "N/A",
            m.round3.status,
            r3Time,
            m.round3.checkedInByGate || "N/A"
          ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
        );
      }
      teamCounter++;
    }
    return rows.join("\n");
  }
  /**
   * Purges all Venture Vault test data (teams, members, passes, logs) to prepare for the live event.
   */
  async purgeTestEvent() {
    const prisma2 = getPrisma();
    const redis = initRedis();
    const event = await prisma2.ventureEvent.findFirst({
      where: { status: { not: "ARCHIVED" } }
    });
    if (!event) return { success: true, message: "No active event to purge." };
    await prisma2.ventureScanLog.deleteMany({});
    await prisma2.venturePass.deleteMany({});
    await prisma2.ventureMember.deleteMany({});
    await prisma2.ventureTeam.deleteMany({
      where: { ventureEventId: event.id }
    });
    await prisma2.ventureSubEvent.updateMany({
      where: { ventureEventId: event.id },
      data: { status: "LOCKED" }
    });
    if (redis) {
      try {
        const keys = await redis.keys("happenins:venture:*");
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (err) {
        logger.warn("Could not flush Redis venture keys:", err);
      }
    }
    return {
      success: true,
      message: "Venture Vault test event purged cleanly. Ready for official roster upload."
    };
  }
  /**
   * High-contrast District-themed HTML email template with embedded QR, mobile link, and support helpdesk.
   */
  buildVentureEmailHtml(params) {
    const supportEmail = params.contactEmail || "happenins.co.in@gmail.com";
    const refId = `VV-${(params.uniqueToken || "").slice(0, 8).toUpperCase()}`;
    const issuedAtIST = formatCSVDateTimeIST(/* @__PURE__ */ new Date());
    const rawTime = params.scheduledTime || "Schedule as per event handbook";
    const reportingTimeIST = rawTime.toUpperCase().includes("IST") ? rawTime : `${rawTime} (IST)`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>${params.masterTitle} - ${params.roundTitle}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #08080a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #f4f4f5; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #08080a; padding: 32px 14px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #0f0f14; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.75);">
          
          <!-- Banner Hero (If Provided) -->
          ${params.bannerUrl ? `<tr>
                  <td style="background-color: #060608; text-align: center;">
                    <img src="${params.bannerUrl}" alt="${params.roundTitle}" style="width: 100%; height: auto; max-height: 240px; object-fit: contain; margin: 0 auto; display: block; border-bottom: 1px solid rgba(255, 255, 255, 0.08);" />
                  </td>
                </tr>` : ""}

          <!-- Header & Stage Indicator -->
          <tr>
            <td style="padding: 28px 32px 16px 32px; text-align: left;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #e23744; background-color: rgba(226, 55, 68, 0.08); border: 1px solid rgba(226, 55, 68, 0.25); padding: 4px 10px; border-radius: 6px;">
                      OFFICIAL DELEGATION CREDENTIALS
                    </span>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="font-size: 11px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; color: #a1a1aa; letter-spacing: 0.5px;">
                      ${refId}
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 16px 0 0 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.4px; line-height: 1.3;">
                ${params.masterTitle}
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 14px; font-weight: 600; color: #d4d4d8;">
                ${params.roundTitle}
              </p>
            </td>
          </tr>

          <!-- Accreditation Ledger -->
          <tr>
            <td style="padding: 8px 32px 20px 32px;">
              <div style="background-color: #14141b; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 14px; padding: 20px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align: top; padding-bottom: 14px;">
                      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #71717a; font-weight: 700; display: block;">Accredited Delegate</span>
                      <span style="font-size: 16px; font-weight: 700; color: #ffffff; margin-top: 3px; display: block;">${params.candidateName}</span>
                    </td>
                    <td align="right" style="vertical-align: top; padding-bottom: 14px;">
                      <span style="display: inline-block; background-color: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #e4e4e7; font-size: 11px; font-weight: 700; text-transform: uppercase; padding: 4px 10px; border-radius: 6px; letter-spacing: 0.8px;">
                        ${params.role}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top: 14px; border-top: 1px solid rgba(255, 255, 255, 0.06);">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tr>
                          <td style="width: 50%; vertical-align: top;">
                            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; font-weight: 700; display: block;">Team ID & Delegation</span>
                            <span style="font-size: 13px; font-weight: 600; color: #f4f4f5; margin-top: 2px; display: block;">
                              ${params.teamId ? `<span style="color: #ff2a54; font-weight: 800; font-family: monospace;">[Team ID #${params.teamId}]</span> ` : ""}${params.teamName}
                            </span>
                          </td>
                          <td style="width: 50%; vertical-align: top; text-align: right;">
                            <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #71717a; font-weight: 700; display: block;">Reporting Window</span>
                            <span style="font-size: 12px; font-weight: 600; color: #d4d4d8; margin-top: 2px; display: block; font-family: 'SFMono-Regular', Consolas, monospace;">${reportingTimeIST}</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Primary CTA Button -->
          <tr>
            <td style="padding: 4px 32px 24px 32px; text-align: center;">
              <a href="${params.mobilePassUrl}" style="display: block; background-color: #e23744; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 1.2px; padding: 15px 24px; border-radius: 12px; box-shadow: 0 4px 16px rgba(226, 55, 68, 0.35);">
                ACCESS DIGITAL ENTRY PASS
              </a>
              <p style="margin: 10px 0 0 0; font-size: 11px; color: #71717a; line-height: 1.5;">
                Present your secure dynamic pass at entrance security. Dynamic check-in is required for venue entry.
              </p>
            </td>
          </tr>

          <!-- Security Notice -->
          <tr>
            <td style="padding: 0 32px 20px 32px; text-align: center;">
              <div style="background-color: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 10px; padding: 10px 14px;">
                <p style="margin: 0; font-size: 11px; color: #a1a1aa; line-height: 1.5;">
                  <strong>SECURITY CLEARANCE NOTICE:</strong> Each pass is linked to your verified delegation credentials. Admission is single-entry per stage and voided upon gate check-in.
                </p>
              </div>
            </td>
          </tr>

          <!-- Institutional Secretariat Footer -->
          <tr>
            <td style="padding: 20px 32px 28px 32px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.06); background-color: #0b0b0f;">
              <p style="margin: 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #d4d4d8;">
                Organizing Secretariat & Helpdesk
              </p>
              <p style="margin: 6px 0 0 0; font-size: 12px; color: #71717a; line-height: 1.5;">
                For candidate roster inquiries or admission support, reach the secretariat directly:
              </p>
              <div style="margin-top: 8px;">
                <a href="mailto:${supportEmail}?subject=Support%20Request%20-%20${encodeURIComponent(params.teamName)}%20[${refId}]" style="color: #e23744; text-decoration: none; font-size: 12px; font-weight: 600; font-family: 'SFMono-Regular', Consolas, monospace;">
                  ${supportEmail}
                </a>
              </div>
              <p style="margin: 12px 0 0 0; font-size: 10px; color: #52525b; font-family: 'SFMono-Regular', Consolas, monospace;">
                Candidate Ref: ${refId} \u2022 Delegation: ${params.teamName} \u2022 Issued: ${issuedAtIST}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }
  mapVolunteerPinToDTO(pin) {
    return {
      id: pin.id,
      ventureEventId: pin.ventureEventId,
      staffName: pin.staffName,
      pin: pin.pin,
      gateName: pin.gateName,
      isActive: pin.isActive,
      scansCount: pin.scansCount || 0,
      lastScannedAt: pin.lastScannedAt ? pin.lastScannedAt.toISOString() : null,
      expiresAt: pin.expiresAt ? pin.expiresAt.toISOString() : null,
      notes: pin.notes || null,
      createdAt: pin.createdAt ? pin.createdAt.toISOString() : (/* @__PURE__ */ new Date()).toISOString()
    };
  }
  /**
   * Create a Venture Vault Volunteer PIN
   */
  async createVolunteerPin(data) {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const gateName = (data.gateName || "Main Gate").trim();
    const staffName = data.staffName.trim();
    if (!staffName) {
      throw new Error("Volunteer name is required.");
    }
    let finalPin = "";
    if (data.customPin && /^\d{6}$/.test(data.customPin.trim())) {
      finalPin = data.customPin.trim();
      const existing = await prisma2.ventureStaffScanner.findUnique({
        where: { pin: finalPin }
      });
      if (existing) {
        throw new Error(`PIN ${finalPin} is already in use. Please choose a different 6-digit PIN.`);
      }
    } else {
      let attempts = 0;
      do {
        finalPin = Math.floor(1e5 + Math.random() * 9e5).toString();
        const exists = await prisma2.ventureStaffScanner.findUnique({
          where: { pin: finalPin }
        });
        if (!exists) break;
        attempts++;
      } while (attempts < 100);
    }
    let expiresAt = null;
    if (data.expiresHours && data.expiresHours > 0) {
      expiresAt = new Date(Date.now() + data.expiresHours * 3600 * 1e3);
    }
    const created = await prisma2.ventureStaffScanner.create({
      data: {
        ventureEventId: event.id,
        staffName,
        gateName,
        pin: finalPin,
        isActive: true,
        expiresAt,
        notes: data.notes || null
      }
    });
    return this.mapVolunteerPinToDTO(created);
  }
  /**
   * List all volunteer PINs for Venture Vault
   */
  async listVolunteerPins() {
    const prisma2 = getPrisma();
    const event = await this.getOrCreateMasterEvent();
    const pins = await prisma2.ventureStaffScanner.findMany({
      where: { ventureEventId: event.id },
      orderBy: { createdAt: "desc" }
    });
    return pins.map((p) => this.mapVolunteerPinToDTO(p));
  }
  /**
   * Delete / Revoke Volunteer PIN
   */
  async deleteVolunteerPin(id) {
    const prisma2 = getPrisma();
    const existing = await prisma2.ventureStaffScanner.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new Error("Volunteer PIN account not found.");
    }
    await prisma2.ventureStaffScanner.delete({
      where: { id }
    });
    return {
      success: true,
      message: `Revoked volunteer PIN for ${existing.staffName} (${existing.gateName}).`
    };
  }
  /**
   * Toggle Active status for Volunteer PIN
   */
  async toggleVolunteerPin(id) {
    const prisma2 = getPrisma();
    const existing = await prisma2.ventureStaffScanner.findUnique({
      where: { id }
    });
    if (!existing) {
      throw new Error("Volunteer PIN account not found.");
    }
    const updated = await prisma2.ventureStaffScanner.update({
      where: { id },
      data: { isActive: !existing.isActive }
    });
    return this.mapVolunteerPinToDTO(updated);
  }
};
var ventureService = new VentureService();

// src/server/controllers/venture.controller.ts
init_logger();
var VentureController = class {
  async getEvent(req, res) {
    try {
      const event = await ventureService.getOrCreateMasterEvent();
      res.status(200).json({ event });
    } catch (err) {
      logger.error("Failed to get Venture event:", { error: publicErrorMessage(err, "Failed to retrieve event") });
      respondWithError(res, err, "Failed to retrieve Venture Vault event details.", 500);
    }
  }
  async getPublicPreview(req, res) {
    try {
      const preview = await ventureService.getPublicPreview();
      res.status(200).json(preview);
    } catch (err) {
      logger.error("Failed to get public Venture preview:", { error: publicErrorMessage(err, "Failed to retrieve preview") });
      respondWithError(res, err, "Failed to retrieve summit preview details.", 500);
    }
  }
  async updateEvent(req, res) {
    try {
      const { title, description, masterBannerUrl, subEvents } = req.body;
      const updated = await ventureService.updateMasterEvent({
        title,
        description,
        masterBannerUrl,
        subEvents
      });
      res.status(200).json({ success: true, event: updated });
    } catch (err) {
      logger.error("Failed to update Venture event:", { error: publicErrorMessage(err, "Failed to update event") });
      respondWithError(res, err, "Failed to update Venture Vault event settings.", 500);
    }
  }
  async uploadRoster(req, res) {
    try {
      const { teams, replaceExisting } = req.body;
      if (!teams || !Array.isArray(teams) || teams.length === 0) {
        return res.status(400).json({ error: "Teams array is required and must not be empty." });
      }
      const shouldReplace = replaceExisting !== void 0 ? Boolean(replaceExisting) : true;
      const result = await ventureService.uploadRoster(teams, shouldReplace);
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to upload Venture roster:", { error: publicErrorMessage(err, "Failed to upload roster") });
      respondWithError(res, err, "Failed to upload and parse team roster spreadsheet.", 500);
    }
  }
  async resetRoster(req, res) {
    try {
      const result = await ventureService.resetRoster();
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to reset Venture roster:", { error: publicErrorMessage(err, "Failed to reset roster") });
      respondWithError(res, err, "Failed to reset team roster.", 500);
    }
  }
  async getStatus(req, res) {
    try {
      const matrix = await ventureService.getAttendanceMatrix();
      res.status(200).json(matrix);
    } catch (err) {
      logger.error("Failed to get Venture attendance matrix:", { error: publicErrorMessage(err, "Failed to get status") });
      respondWithError(res, err, "Failed to retrieve live attendance matrix.", 500);
    }
  }
  async dispatchBatch(req, res) {
    try {
      const { roundNumber, memberIds } = req.body;
      const round = Number(roundNumber);
      if (![1, 2, 3].includes(round)) {
        return res.status(400).json({ error: "roundNumber must be 1, 2, or 3." });
      }
      if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
        return res.status(400).json({ error: "memberIds array is required." });
      }
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const originUrl = process.env.APP_URL || `${protocol}://${host}`;
      const result = await ventureService.dispatchBatch({
        roundNumber: round,
        memberIds,
        originUrl
      });
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to dispatch Venture batch:", { error: publicErrorMessage(err, "Failed to dispatch batch") });
      respondWithError(res, err, "Failed to dispatch pass email batch.", 500);
    }
  }
  async getAttendeePass(req, res) {
    try {
      const { token } = req.params;
      const roundNumber = Number(req.query.round) || 1;
      if (!token) {
        return res.status(400).json({ error: "Token is required." });
      }
      const passData = await ventureService.getAttendeePass(token, roundNumber);
      if (!passData) {
        return res.status(404).json({ error: "Access pass not found or token is invalid." });
      }
      res.status(200).json(passData);
    } catch (err) {
      logger.error("Failed to retrieve attendee pass:", { error: publicErrorMessage(err, "Failed to retrieve pass") });
      respondWithError(res, err, "Failed to retrieve delegate pass.", 500);
    }
  }
  async getAttendeePassCheckinStatus(req, res) {
    try {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      const { token } = req.params;
      const roundNumber = Number(req.query.round) || 3;
      if (!token) {
        return res.status(400).json({ error: "Token is required." });
      }
      const statusData = await ventureService.getAttendeePassCheckinStatus(token, roundNumber);
      res.status(200).json(statusData);
    } catch (err) {
      respondWithError(res, err, "Failed to check pass status.", 500);
    }
  }
  async scanPass(req, res) {
    try {
      const { qrHash, roundNumber, gateOperator, staffScannerId } = req.body;
      const round = Number(roundNumber) || 1;
      if (!qrHash) {
        return res.status(400).json({ error: "qrHash is required." });
      }
      const operator = gateOperator || (req.user ? `${req.user.fullName} (${req.user.role})` : "Gate Scanner");
      const result = await ventureService.scanGatePass({
        qrHash,
        roundNumber: round,
        gateOperator: operator,
        staffScannerId: staffScannerId || (req.staffScanner ? req.staffScanner.id : void 0)
      });
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to scan Venture pass:", { error: publicErrorMessage(err, "Failed to scan pass") });
      respondWithError(res, err, "Failed to process gate scan.", 500);
    }
  }
  async manualCheckIn(req, res) {
    try {
      const { memberId, roundNumber, gateOperator } = req.body;
      if (!memberId) {
        return res.status(400).json({ error: "memberId is required." });
      }
      const operator = gateOperator || (req.user ? `${req.user.fullName} (Admin Override)` : "Admin Console");
      const result = await ventureService.manualCheckIn({
        memberId,
        roundNumber: Number(roundNumber) || 1,
        gateOperator: operator
      });
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to manual check-in Venture delegate:", { error: publicErrorMessage(err, "Manual check-in failed") });
      respondWithError(res, err, "Failed to process manual check-in.", 500);
    }
  }
  async exportLedger(req, res) {
    try {
      const csv = await ventureService.exportAuditLedger();
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="venture_vault_attendance_${getISTDateString()}.csv"`);
      res.status(200).send(csv);
    } catch (err) {
      logger.error("Failed to export Venture ledger:", { error: publicErrorMessage(err, "Failed to export ledger") });
      respondWithError(res, err, "Failed to export attendance audit ledger.", 500);
    }
  }
  async purgeEvent(req, res) {
    try {
      const result = await ventureService.purgeTestEvent();
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to purge Venture test event:", { error: publicErrorMessage(err, "Failed to purge event") });
      respondWithError(res, err, "Failed to purge test event data.", 500);
    }
  }
  async createVolunteerPin(req, res) {
    try {
      const { staffName, gateName, customPin, expiresHours, notes } = req.body;
      if (!staffName || !staffName.trim()) {
        return res.status(400).json({ error: "Volunteer name is required." });
      }
      const pin = await ventureService.createVolunteerPin({
        staffName: staffName.trim(),
        gateName: gateName ? gateName.trim() : void 0,
        customPin: customPin ? customPin.trim() : void 0,
        expiresHours: expiresHours ? Number(expiresHours) : void 0,
        notes: notes ? notes.trim() : void 0
      });
      res.status(201).json({ success: true, message: "Volunteer PIN created successfully.", pin });
    } catch (err) {
      logger.error("Failed to create volunteer PIN:", { error: publicErrorMessage(err, "Failed to create PIN") });
      respondWithError(res, err, "Failed to create volunteer PIN.", 400);
    }
  }
  async listVolunteerPins(req, res) {
    try {
      const pins = await ventureService.listVolunteerPins();
      res.status(200).json({ success: true, pins });
    } catch (err) {
      logger.error("Failed to list volunteer PINs:", { error: publicErrorMessage(err, "Failed to list PINs") });
      respondWithError(res, err, "Failed to list volunteer PINs.", 500);
    }
  }
  async deleteVolunteerPin(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "PIN ID is required." });
      }
      const result = await ventureService.deleteVolunteerPin(id);
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to delete volunteer PIN:", { error: publicErrorMessage(err, "Failed to delete PIN") });
      respondWithError(res, err, "Failed to revoke volunteer PIN.", 500);
    }
  }
  async toggleVolunteerPin(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ error: "PIN ID is required." });
      }
      const pin = await ventureService.toggleVolunteerPin(id);
      res.status(200).json({ success: true, message: `PIN is now ${pin.isActive ? "active" : "disabled"}.`, pin });
    } catch (err) {
      logger.error("Failed to toggle volunteer PIN:", { error: publicErrorMessage(err, "Failed to toggle PIN") });
      respondWithError(res, err, "Failed to update volunteer PIN.", 500);
    }
  }
  async createOnSpotTeam(req, res) {
    try {
      const { teamName, members, sendEmailNow, roundNumber } = req.body;
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const originUrl = process.env.APP_URL || `${protocol}://${host}`;
      const result = await ventureService.createOnSpotTeam({
        teamName,
        members,
        sendEmailNow: Boolean(sendEmailNow),
        roundNumber: roundNumber ? Number(roundNumber) : 3,
        originUrl
      });
      res.status(201).json(result);
    } catch (err) {
      logger.error("Failed to create on-spot team:", { error: publicErrorMessage(err, "Failed to create team") });
      respondWithError(res, err, "Failed to register team on the spot.", 400);
    }
  }
  async updateTeam(req, res) {
    try {
      const { id } = req.params;
      const { teamName } = req.body;
      if (!id) return res.status(400).json({ error: "Team ID is required." });
      const result = await ventureService.updateTeam(id, { teamName });
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to update team:", { error: publicErrorMessage(err, "Failed to update team") });
      respondWithError(res, err, "Failed to update team name.", 400);
    }
  }
  async addMemberToTeam(req, res) {
    try {
      const { id } = req.params;
      const { fullName, email, role, sendEmailNow, roundNumber } = req.body;
      if (!id) return res.status(400).json({ error: "Team ID is required." });
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const originUrl = process.env.APP_URL || `${protocol}://${host}`;
      const result = await ventureService.addMemberToTeam({
        teamId: id,
        fullName,
        email,
        role,
        sendEmailNow: Boolean(sendEmailNow),
        roundNumber: roundNumber ? Number(roundNumber) : 3,
        originUrl
      });
      res.status(201).json(result);
    } catch (err) {
      logger.error("Failed to add member to team:", { error: publicErrorMessage(err, "Failed to add member") });
      respondWithError(res, err, "Failed to add attendee to team.", 400);
    }
  }
  async updateMember(req, res) {
    try {
      const { id } = req.params;
      const { fullName, email, role, teamId } = req.body;
      if (!id) return res.status(400).json({ error: "Member ID is required." });
      const result = await ventureService.updateMember(id, {
        fullName,
        email,
        role,
        teamId
      });
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to update delegate details:", { error: publicErrorMessage(err, "Failed to update member") });
      respondWithError(res, err, "Failed to update delegate details.", 400);
    }
  }
  async removeMember(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Member ID is required." });
      const result = await ventureService.removeMember(id);
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to remove member:", { error: publicErrorMessage(err, "Failed to remove member") });
      respondWithError(res, err, "Failed to remove delegate.", 400);
    }
  }
  async sendIndividualPass(req, res) {
    try {
      const { id } = req.params;
      const { roundNumber } = req.body;
      if (!id) return res.status(400).json({ error: "Member ID is required." });
      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol === "https" || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
      const originUrl = process.env.APP_URL || `${protocol}://${host}`;
      const result = await ventureService.sendIndividualPassEmail({
        memberId: id,
        roundNumber: roundNumber ? Number(roundNumber) : 3,
        originUrl
      });
      res.status(200).json(result);
    } catch (err) {
      logger.error("Failed to dispatch pass to delegate:", { error: publicErrorMessage(err, "Failed to send pass") });
      respondWithError(res, err, "Failed to dispatch pass to attendee.", 400);
    }
  }
};
var ventureController = new VentureController();

// src/server/middleware/auth.middleware.ts
init_crypto();
init_app_error();
init_db();
init_session_revocation_service();
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    let token;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }
    if (!token) {
      return next();
    }
    let decoded = token ? verifyToken(token) : null;
    if (!decoded && req.cookies?.refreshToken) {
      try {
        const { SessionService: SessionService2 } = await Promise.resolve().then(() => (init_session_service(), session_service_exports));
        const sessionService = new SessionService2();
        const rotated = await sessionService.rotateSession(req.cookies.refreshToken, req.ip, req.get("User-Agent"));
        if (rotated) {
          const { getSecurityConfig: getSecurityConfig2 } = await Promise.resolve().then(() => (init_security(), security_exports));
          const { cookieSameSite: sameSite, cookieSecure: secure } = getSecurityConfig2();
          res.cookie("refreshToken", rotated.newRawRefreshToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1e3
          });
          res.cookie("token", rotated.accessToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1e3
          });
          token = rotated.accessToken;
          decoded = verifyToken(token);
        }
      } catch {
      }
    }
    if (!decoded) {
      return next();
    }
    if (decoded.role === "STAFF_SCANNER" && decoded.staffScannerId && decoded.eventId) {
      let staff = await sessionRevocationService.getStaffScannerCache(decoded.staffScannerId);
      if (!staff) {
        staff = await getPrisma().staffScanner.findUnique({
          where: { id: decoded.staffScannerId },
          select: { id: true, pin: true, isActive: true, expiresAt: true, gateName: true, staffName: true, eventId: true, allowedTiers: true }
        });
        if (staff) {
          await sessionRevocationService.setStaffScannerCache(decoded.staffScannerId, staff, 60);
        }
      }
      if (staff && staff.isActive && (!staff.expiresAt || new Date(staff.expiresAt) > /* @__PURE__ */ new Date())) {
        let allowedTierNames = [];
        if (staff.allowedTiers && staff.allowedTiers !== "ALL") {
          try {
            allowedTierNames = JSON.parse(staff.allowedTiers);
          } catch {
            allowedTierNames = staff.allowedTiers.split(",").map((s) => s.trim());
          }
        }
        req.staffScanner = {
          id: staff.id,
          eventId: staff.eventId,
          staffName: staff.staffName,
          gateName: staff.gateName,
          allowedTiers: staff.allowedTiers,
          allowedTierNames
        };
        req.user = {
          id: `staff_${staff.id}`,
          email: `volunteer_${staff.id.substring(0, 8)}@gate.internal`,
          fullName: `${staff.staffName} (${staff.gateName})`,
          avatarUrl: null,
          role: "USER"
        };
        return next();
      }
    }
    if (decoded.id && decoded.email && decoded.role) {
      if (decoded.sessionId) {
        const isRevoked = await sessionRevocationService.isSessionRevoked(decoded.sessionId, decoded.id, decoded.iat);
        if (isRevoked) {
          req.user = void 0;
          req.sessionId = void 0;
          return next();
        }
        req.user = {
          id: decoded.id,
          email: decoded.email,
          fullName: decoded.fullName || decoded.email.split("@")[0],
          avatarUrl: decoded.avatarUrl || null,
          role: decoded.role
        };
        req.sessionId = decoded.sessionId;
      }
    }
    next();
  } catch (err) {
    next();
  }
}
function requireAuth(req, res, next) {
  if (!req.user) {
    throw new UnauthorizedError("Authentication required to perform this action.");
  }
  next();
}
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required.");
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("Forbidden: Insufficient privileges for this endpoint.");
    }
    next();
  };
}
var requireAdmin = restrictTo("ADMIN");
var requireOrganizerOrAdmin = restrictTo("ORGANIZER", "ADMIN");
var VENTURE_MASTER_ADMIN_EMAIL = "pacific2306@gmail.com";
function requireVentureMasterAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Authentication required to access Venture Vault." } });
  }
  const email = (req.user.email || "").trim().toLowerCase();
  if (email !== VENTURE_MASTER_ADMIN_EMAIL.toLowerCase() && req.user.role !== "ADMIN") {
    return res.status(403).json({ error: { code: "FORBIDDEN", message: "Access restricted to Venture Vault Master Admin." } });
  }
  next();
}

// src/server/app.ts
init_db();
init_error_message();
async function createApp(options = {}) {
  const env = validateEnv();
  const securityConfig = getSecurityConfig();
  registerLocalFallbackHandlers();
  const app = (0, import_express.default)();
  app.set("trust proxy", Number(process.env.TRUST_PROXY_HOPS ?? 1));
  app.use(tracingMiddleware);
  app.use(accessLogMiddleware);
  const isProduction = env.NODE_ENV === "production";
  const isLocalOrLanOrigin = (origin) => {
    try {
      const u = new URL(origin);
      if (u.protocol !== "http:" && u.protocol !== "https:") return false;
      const h = u.hostname;
      return ["localhost", "127.0.0.1", "[::1]"].includes(h) || h.startsWith("192.168.") || h.startsWith("10.") || h.startsWith("172.");
    } catch {
      return false;
    }
  };
  const resolveAllowedOrigin = (origin, reqHost) => {
    const approved = securityConfig.corsAllowedOrigins.find((o) => o === origin);
    if (approved) return approved;
    if (!isProduction && isLocalOrLanOrigin(origin)) return new URL(origin).origin;
    if (reqHost) {
      try {
        const parsedOrigin = new URL(origin);
        const hostWithoutPort = reqHost.split(":")[0].toLowerCase();
        if (parsedOrigin.hostname.toLowerCase() === hostWithoutPort && (parsedOrigin.protocol === "https:" || parsedOrigin.protocol === "http:")) {
          return parsedOrigin.origin;
        }
      } catch {
      }
    }
    return null;
  };
  const isOriginAllowed = (origin, reqHost) => resolveAllowedOrigin(origin, reqHost) !== null;
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const reqHost = req.get("host");
    const allowedOrigin = origin ? resolveAllowedOrigin(origin, reqHost) : null;
    if (allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Idempotency-Key, X-Idempotency-Key, X-Request-Id"
      );
    }
    if (req.method === "OPTIONS") {
      return res.status(204).end();
    }
    if (origin && !["GET", "HEAD"].includes(req.method) && !isOriginAllowed(origin, reqHost)) {
      return res.status(403).json({ error: { code: "ORIGIN_NOT_ALLOWED", message: "Cross-origin request blocked." } });
    }
    next();
  });
  app.use(
    (0, import_helmet.default)({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: [
            "'self'",
            // The production bundle has no inline scripts; dev needs them for Vite's HMR preamble
            ...isProduction ? [] : ["'unsafe-inline'", "'unsafe-eval'"],
            "https://checkout.razorpay.com",
            "https://accounts.google.com",
            "https://apis.google.com"
          ],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com"
          ],
          fontSrc: [
            "'self'",
            "data:",
            "https://fonts.gstatic.com",
            "https://fonts.googleapis.com"
          ],
          imgSrc: [
            "'self'",
            "data:",
            "blob:",
            "https:",
            // organizer-provided banner URLs can be any https host
            ...isProduction ? [] : ["http:"]
          ],
          mediaSrc: ["'self'", "data:", "blob:", "https:"],
          connectSrc: isProduction ? ["'self'", "https://api.razorpay.com", "https://lumberjack.razorpay.com", "https://checkout.razorpay.com", "https://accounts.google.com"] : ["'self'", "http:", "https:", "wss:", "ws:", "data:"],
          frameSrc: [
            "'self'",
            "https://api.razorpay.com",
            "https://checkout.razorpay.com",
            "https://accounts.google.com",
            "https://maps.google.com",
            "https://www.google.com"
          ],
          frameAncestors: isProduction ? ["'self'"] : ["*"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'", "https://accounts.google.com", "https://api.razorpay.com"],
          // In development/local LAN over HTTP, do NOT force browser to upgrade to HTTPS
          upgradeInsecureRequests: isProduction ? [] : null
        }
      },
      crossOriginEmbedderPolicy: false,
      // Isolates the app from other windows while still allowing the Google sign-in popup to talk back
      crossOriginOpenerPolicy: isProduction ? { policy: "same-origin-allow-popups" } : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: { allow: false },
      frameguard: isProduction ? { action: "sameorigin" } : false,
      // non-prod: allow AI Studio preview
      hidePoweredBy: true,
      // Disable HSTS in local development so mobile browsers do not force HTTPS on plain HTTP LAN
      hsts: isProduction ? {
        maxAge: 31536e3,
        includeSubDomains: true,
        preload: true
      } : false,
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: false,
      permittedCrossDomainPolicies: { permittedPolicies: "none" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true
    })
  );
  app.use((req, res, next) => {
    if (!isProduction) res.removeHeader("X-Frame-Options");
    res.setHeader(
      "Permissions-Policy",
      "camera=(self), microphone=(), geolocation=(), payment=(self 'https://checkout.razorpay.com')"
    );
    next();
  });
  if (!options.skipRateLimiting && getRedisClient()) {
    try {
      const ready = await waitForRedisReady(1500);
      if (!ready) {
        logger.warn("Redis not ready at boot: rate limiters are using per-instance memory fallback.");
      }
    } catch {
      logger.warn("Redis check encountered error: rate limiters are using per-instance memory fallback.");
    }
  }
  const createRateLimitStore = (scope) => {
    const redis = getRedisClient();
    if (redis && isRedisAvailable()) {
      return new import_rate_limit_redis.RedisStore({
        // @ts-ignore
        sendCommand: (...args) => redis.call(...args),
        prefix: `happenins:ratelimit:${scope}:`
      });
    }
    return void 0;
  };
  const requirePaymentsEnabled = (req, res, next) => arePaymentsEnabled() ? next() : res.status(404).json({ error: "Not found" });
  const noopMiddleware = (_req, _res, next) => next();
  const globalLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("global"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Too many requests from this client, please try again later." } }
  });
  const authRateLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("auth"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Too many authentication attempts. Please try again after 15 minutes." } }
  });
  const registerRateLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 60 * 60 * 1e3,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("register"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Registration rate limit exceeded. Please try again later." } }
  });
  const passwordResetLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 60 * 60 * 1e3,
    max: 20,
    // per IP (shared campus NAT); per-account limits are enforced separately
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("password_reset"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Password reset request limit exceeded. Please try again later." } }
  });
  const staffPinFailureLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 10,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("staff_pin_fail"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Too many incorrect PIN attempts. Please wait 15 minutes." } }
  });
  const accountLimiter = (scope, max, windowMs, field, message, keyFn) => options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore(scope),
    validate: { trustProxy: false },
    keyGenerator: (req) => {
      const custom = keyFn?.(req);
      if (custom) return `k:${custom.slice(0, 254)}`;
      const v = typeof req.body?.[field] === "string" ? req.body[field].trim().toLowerCase() : "";
      return v ? `acct:${v.slice(0, 254)}` : (0, import_express_rate_limit.ipKeyGenerator)(req.ip || "");
    },
    message: { error: { code: "RATE_LIMITED", message } }
  });
  const institutionOtpByUserLimiter = accountLimiter("inst_otp_user", 5, 10 * 60 * 1e3, "", "Too many verification code requests. Please wait a few minutes.", (req) => req.user?.id);
  const institutionOtpByMailboxLimiter = accountLimiter("inst_otp_mailbox", 5, 60 * 60 * 1e3, "collegeEmail", "This mailbox has received too many verification codes. Please try again later.");
  const institutionOtpVerifyLimiter = accountLimiter("inst_otp_verify", 20, 10 * 60 * 1e3, "", "Too many verification attempts. Please wait a few minutes.", (req) => req.user?.id);
  const loginAccountLimiter = accountLimiter("login_acct", 10, 15 * 60 * 1e3, "email", "Too many attempts for this account. Please try again later.");
  const resetAccountLimiter = accountLimiter("reset_acct", 10, 60 * 60 * 1e3, "email", "Too many password reset attempts for this account. Please try again later.");
  const otpAccountLimiter = accountLimiter("otp_acct", 10, 15 * 60 * 1e3, "identifier", "Too many code requests for this account. Please try again later.");
  const bookingRateLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 15 * 60 * 1e3,
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("booking"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Booking request volume limit reached. Please wait a moment." } }
  });
  const qrScanLimiter = options.skipRateLimiting ? noopMiddleware : (0, import_express_rate_limit.default)({
    windowMs: 1 * 60 * 1e3,
    max: 120,
    standardHeaders: true,
    legacyHeaders: false,
    store: createRateLimitStore("qr_scan"),
    validate: { trustProxy: false },
    message: { error: { code: "RATE_LIMITED", message: "Gate scanning rate limit exceeded. Please pause scanning momentarily." } }
  });
  app.use(globalLimiter);
  app.use((0, import_compression.default)());
  app.use("/api/webhooks/razorpay", import_express.default.raw({ type: "application/json", limit: "1mb" }));
  app.use("/api/v1/webhooks/razorpay", import_express.default.raw({ type: "application/json", limit: "1mb" }));
  app.use(import_express.default.json({ limit: env.BODY_LIMIT }));
  app.use(import_express.default.urlencoded({ extended: false, limit: env.BODY_LIMIT, parameterLimit: 100 }));
  app.use((0, import_cookie_parser.default)());
  const hasOpsAccess = (req) => {
    if (!isProduction) return true;
    const expected = process.env.METRICS_TOKEN;
    const auth = req.headers.authorization || "";
    if (!expected || !auth.startsWith("Bearer ")) return false;
    const given = Buffer.from(auth.slice(7));
    const want = Buffer.from(expected);
    return given.length === want.length && import_crypto29.default.timingSafeEqual(given, want);
  };
  const healthHandler = (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!hasOpsAccess(req)) {
      return res.status(200).json({ status: "ok" });
    }
    res.status(200).json({
      status: "ok",
      uptimeSeconds: Math.floor(process.uptime()),
      processType: env.PROCESS_TYPE,
      environment: env.NODE_ENV,
      timestamp: (/* @__PURE__ */ new Date()).toISOString(),
      requestId: req.id
    });
  };
  const readinessHandler = async (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    const requestId = req.id;
    if (options.isShuttingDown && options.isShuttingDown()) {
      return res.status(503).json({
        status: "shutting_down",
        message: "Instance is shutting down, not accepting new requests",
        requestId
      });
    }
    try {
      const dbHealth = await checkDatabaseHealth();
      if (dbHealth.status !== "ok") {
        return res.status(503).json({
          status: "error",
          database: "unavailable",
          message: "Database connection unavailable",
          requestId
        });
      }
      const redisConfig = getRedisConfig();
      let redisHealth = {
        status: "ok",
        message: "Redis disabled via configuration; operating in direct PostgreSQL mode"
      };
      if (redisConfig.enabled) {
        redisHealth = await pingRedis();
        if (isProduction && redisHealth.status !== "ok") {
          return res.status(503).json({ status: "error", message: "Service dependencies not ready", requestId });
        }
      }
      if (!hasOpsAccess(req)) {
        return res.status(200).json({ status: "ready" });
      }
      const queueHealth = await jobQueue.getStats();
      res.status(200).json({
        status: "ready",
        database: "connected",
        databaseLatencyMs: dbHealth.latencyMs,
        redis: redisConfig.enabled ? redisHealth.status === "ok" ? "connected" : "standalone/fallback" : "disabled (direct postgres)",
        redisLatencyMs: redisHealth.latencyMs,
        queues: {
          mode: queueHealth.mode,
          isDistributed: queueHealth.isDistributed,
          totalWaiting: queueHealth.totalWaiting,
          totalActive: queueHealth.totalActive,
          totalFailed: queueHealth.totalFailed
        },
        processType: env.PROCESS_TYPE,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        requestId
      });
    } catch (err) {
      logger.error("Readiness check failed", { requestId, message: errorMessage(err) });
      res.status(503).json({
        status: "error",
        message: "Service dependencies not ready",
        requestId
      });
    }
  };
  const metricsHandler = (req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!hasOpsAccess(req)) {
      return res.status(404).json({ error: "Not found" });
    }
    const format = req.query.format?.toLowerCase();
    const acceptsJson = req.headers.accept?.includes("application/json");
    if (format === "json" || acceptsJson && format !== "prometheus") {
      return res.status(200).json(metrics.getSnapshot());
    }
    res.setHeader("Content-Type", "text/plain; version=0.0.4; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    return res.status(200).send(metrics.getPrometheusFormat());
  };
  app.get("/health", healthHandler);
  app.get("/ready", readinessHandler);
  app.get("/metrics", metricsHandler);
  app.use(authMiddleware);
  const authController = new AuthController();
  const eventController = new EventController();
  const bookingController = new BookingController();
  const ticketController = new TicketController();
  const adminController = new AdminController();
  const institutionController = new InstitutionController();
  const staffScannerController = new StaffScannerController();
  const queueController = new QueueController();
  const apiRouter = import_express.default.Router();
  apiRouter.use(featureGate);
  apiRouter.get("/config/features", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ environment: env.NODE_ENV, features: getPublicFeatures() });
  });
  apiRouter.use(idempotencyMiddleware);
  apiRouter.use((req, res, next) => {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    next();
  });
  apiRouter.get("/health", healthHandler);
  apiRouter.get("/ready", readinessHandler);
  apiRouter.get("/metrics", metricsHandler);
  apiRouter.post("/auth/register", registerRateLimiter, resetAccountLimiter, authController.register);
  apiRouter.post("/auth/register/verify", authRateLimiter, loginAccountLimiter, authController.verifyRegistration);
  apiRouter.post("/auth/login", authRateLimiter, loginAccountLimiter, authController.login);
  apiRouter.post("/auth/otp/send", authRateLimiter, otpAccountLimiter, authController.sendOtp);
  apiRouter.post("/auth/otp/verify", authRateLimiter, otpAccountLimiter, authController.verifyOtp);
  apiRouter.post("/auth/refresh", authController.refresh);
  apiRouter.post("/auth/logout", authController.logout);
  apiRouter.post("/auth/forgot-password", passwordResetLimiter, resetAccountLimiter, authController.forgotPassword);
  apiRouter.post("/auth/reset-password", passwordResetLimiter, resetAccountLimiter, authController.resetPassword);
  apiRouter.get("/auth/google/url", authController.getGoogleUrl);
  apiRouter.post("/auth/google/callback", authRateLimiter, authController.googleCallback);
  apiRouter.get("/auth/me", authController.getCurrentUser);
  apiRouter.get("/auth/organizer-profile", requireAuth, authController.getOrganizerProfile);
  apiRouter.post("/auth/onboard", requireAuth, authController.onboardOrganizer);
  apiRouter.put("/auth/profile", requireAuth, authController.updateProfile);
  apiRouter.put("/auth/profile/password", requireAuth, authController.changePassword);
  apiRouter.put("/auth/profile/avatar", requireAuth, authController.updateAvatar);
  apiRouter.delete("/auth/profile", requireAuth, authController.deleteAccount);
  if (isFeatureEnabled("DEV_EMAIL_INBOX")) {
    apiRouter.get("/emails", (req, res) => {
      const queryEmail = req.query.email || req.user?.email;
      if (!queryEmail && !req.user) {
        return res.status(200).json([]);
      }
      const list = getEmailsForUser(queryEmail || req.user?.email || "");
      res.status(200).json(list);
    });
    apiRouter.post("/emails/test", async (req, res) => {
      const targetEmail = req.body?.email || req.query?.email || "";
      if (!targetEmail) {
        return res.status(400).json({ error: "email is required" });
      }
      try {
        const emailConfig = getEmailConfig();
        const messageId = `test_${Date.now()}`;
        await deliverTransactionalEmail({
          to: targetEmail,
          subject: "Happenins Email System Test (Live Dispatch)",
          body: "Hello!\n\nThis is a verification email sent from the Happenins Ticketing Platform.\n\nYour automated email dispatch system is operational and ready to send tickets, OTPs, and notifications to all recipients.\n\nWarm regards,\nThe Happenins Team",
          messageId
        });
        return res.status(200).json({
          success: true,
          message: `Live test email successfully dispatched to: ${targetEmail}`,
          to: targetEmail,
          from: emailConfig.from,
          user: emailConfig.user,
          messageId
        });
      } catch (err) {
        logger.error("[TEST EMAIL DISPATCH ERROR]:", { error: errorMessage(err), targetEmail });
        return res.status(500).json({
          success: false,
          error: "Failed to dispatch test email. Please check SMTP configuration and credentials.",
          target: targetEmail
        });
      }
    });
  }
  apiRouter.get("/events", eventController.getEvents);
  apiRouter.get("/events/slug/:slug", eventController.getEventBySlug);
  apiRouter.get("/events/:eventId/eligibility", eventController.checkEligibility);
  apiRouter.post("/events", requireAuth, restrictTo("ORGANIZER", "ADMIN"), eventController.createEvent);
  apiRouter.put("/events/:id", requireAuth, restrictTo("ORGANIZER", "ADMIN"), eventController.updateEvent);
  apiRouter.delete("/events/:id", requireAuth, restrictTo("ORGANIZER", "ADMIN"), eventController.deleteEvent);
  apiRouter.get("/organizer/events", requireAuth, restrictTo("ORGANIZER", "ADMIN"), eventController.getOrganizerEvents);
  apiRouter.get("/organizer/events/:eventId/analytics", requireAuth, restrictTo("ORGANIZER", "ADMIN"), bookingController.getEventAnalytics);
  apiRouter.patch("/events/:id/lifecycle", requireAuth, eventController.changeLifecycle);
  apiRouter.get("/events/:eventId/occupied-seats", eventController.getOccupiedSeats);
  apiRouter.get("/events/:eventId/review-eligibility", eventController.getReviewEligibility);
  apiRouter.get("/events/:eventId/reviews", eventController.getReviews);
  apiRouter.post("/events/:eventId/reviews", requireAuth, eventController.createReview);
  apiRouter.get("/institutions", institutionController.getInstitutions);
  apiRouter.get("/institutions/check-domain", institutionController.checkDomain);
  apiRouter.post("/institutions", requireAuth, restrictTo("ORGANIZER", "ADMIN"), institutionController.createInstitution);
  apiRouter.post("/institutions/otp/send", requireAuth, institutionOtpByUserLimiter, institutionOtpByMailboxLimiter, institutionController.sendOtp);
  apiRouter.post("/institutions/otp/verify", requireAuth, institutionOtpVerifyLimiter, institutionController.verifyOtp);
  apiRouter.get("/institutions/otp/status", requireAuth, institutionController.getOtpStatus);
  apiRouter.get("/tickets", requireAuth, ticketController.getUserTickets);
  apiRouter.get("/tickets/:id", requireAuth, ticketController.getTicketDetails);
  apiRouter.get("/tickets/:id/qr", requireAuth, ticketController.refreshDynamicQR);
  apiRouter.post("/tickets/scan", qrScanLimiter, requireAuth, ticketController.scanCheckInTicket);
  apiRouter.post("/tickets/:id/transfer", requireAuth, ticketController.createTicketTransfer);
  apiRouter.post("/queue/enter", requireAuth, queueController.enterQueue);
  apiRouter.get("/queue/status", requireAuth, queueController.getQueueStatus);
  apiRouter.post("/queue/leave", requireAuth, queueController.leaveQueue);
  apiRouter.get("/queue/stats/:eventId", requireAuth, queueController.getEventStats);
  apiRouter.post("/bookings/reserve", bookingRateLimiter, requireAuth, bookingController.reserve);
  apiRouter.post("/bookings/confirm", bookingRateLimiter, requireAuth, bookingController.confirm);
  apiRouter.post("/bookings/:bookingId/split-shares/:shareId/pay", requirePaymentsEnabled, requireAuth, bookingController.paySplitShare);
  apiRouter.get("/bookings", requireAuth, bookingController.getUserBookings);
  apiRouter.get("/bookings/active-test-hashes", requireAuth, restrictTo("ORGANIZER", "ADMIN"), (req, res) => {
    if (env.NODE_ENV === "production") {
      return res.status(403).json({ error: "Active test hashes endpoint is disabled in production." });
    }
    return bookingController.getActiveTestBookings(req, res);
  });
  apiRouter.get("/bookings/:id", requireAuth, bookingController.getBookingDetails);
  apiRouter.get("/bookings/:id/qr-token", requireAuth, bookingController.getDynamicQRToken);
  apiRouter.post("/bookings/:id/transfer", requireAuth, bookingController.createTransfer);
  apiRouter.get("/transfers/my-transfers", requireAuth, bookingController.getUserTransfers);
  apiRouter.get("/transfers/:code", ticketController.getPublicTransferDetails);
  apiRouter.post("/transfers/:code/claim", requireAuth, ticketController.claimTicketTransfer);
  apiRouter.post("/transfers/:id/cancel", requireAuth, bookingController.cancelTransfer);
  apiRouter.post("/bookings/:bookingId/promo/validate", requireAuth, bookingController.validatePromo);
  apiRouter.post("/bookings/:bookingId/promo/apply", requireAuth, bookingController.applyPromo);
  apiRouter.post("/events/:eventId/promo-codes", requireAuth, restrictTo("ORGANIZER", "ADMIN"), bookingController.createPromo);
  apiRouter.get("/events/:eventId/promo-codes", requireAuth, restrictTo("ORGANIZER", "ADMIN"), bookingController.getEventPromos);
  apiRouter.delete("/promo-codes/:id", requireAuth, restrictTo("ORGANIZER", "ADMIN"), bookingController.deletePromo);
  apiRouter.post("/attendance/check-in", qrScanLimiter, requireAuth, bookingController.scanQR);
  apiRouter.get("/organizer/events/:eventId/export", requireAuth, restrictTo("ORGANIZER", "ADMIN"), bookingController.exportRoster);
  apiRouter.get("/organizer/analytics", requireAuth, restrictTo("ORGANIZER", "ADMIN"), bookingController.getAnalytics);
  apiRouter.post("/webhooks/razorpay", requirePaymentsEnabled, bookingController.handleRazorpayWebhook);
  apiRouter.get("/wallet", requireAuth, bookingController.getUserWallet);
  apiRouter.post("/bookings/:bookingId/wallet/apply", requirePaymentsEnabled, requireAuth, bookingController.applyWallet);
  apiRouter.post("/bookings/:bookingId/wallet/remove", requireAuth, bookingController.removeWallet);
  apiRouter.get("/bookings/:id/cancellation-preview", requireAuth, bookingController.previewCancellation);
  apiRouter.post("/bookings/:id/cancel", requireAuth, bookingController.cancelBooking);
  apiRouter.get("/bookings/:id/whatsapp", requireAuth, bookingController.getWhatsAppConfirmation);
  apiRouter.post("/bookings/:id/send-whatsapp", requireAuth, bookingController.sendWhatsAppConfirmation);
  apiRouter.post("/staff-scanners/login", staffPinFailureLimiter, staffScannerController.loginWithPin);
  apiRouter.post("/staff-scanners/scan", qrScanLimiter, staffScannerController.scanTicket);
  apiRouter.get("/organizer/events/:eventId/staff-scanners", requireAuth, restrictTo("ORGANIZER", "ADMIN"), staffScannerController.getStaffScannersForEvent);
  apiRouter.post("/organizer/events/:eventId/staff-scanners", requireAuth, restrictTo("ORGANIZER", "ADMIN"), staffScannerController.createStaffScanners);
  apiRouter.patch("/organizer/staff-scanners/:id", requireAuth, restrictTo("ORGANIZER", "ADMIN"), staffScannerController.updateStaffScanner);
  apiRouter.delete("/organizer/staff-scanners/:id", requireAuth, restrictTo("ORGANIZER", "ADMIN"), staffScannerController.deleteStaffScanner);
  apiRouter.get("/organizer/events/:eventId/gate-stats", requireAuth, restrictTo("ORGANIZER", "ADMIN"), staffScannerController.getGateStats);
  apiRouter.get("/admin/metrics", requireAuth, restrictTo("ADMIN"), adminController.getMetrics);
  apiRouter.get("/admin/analytics", requireAuth, restrictTo("ADMIN"), adminController.getAnalytics);
  apiRouter.get("/admin/dead-letter-jobs", requireAuth, restrictTo("ADMIN"), adminController.getDeadLetterJobs);
  apiRouter.post("/admin/dead-letter-jobs/:queue/:id/retry", requireAuth, restrictTo("ADMIN"), adminController.retryDeadLetterJob);
  apiRouter.get("/admin/organizers", requireAuth, restrictTo("ADMIN"), adminController.getOrganizers);
  apiRouter.patch("/admin/organizers/:id/verify", requireAuth, restrictTo("ADMIN"), adminController.verifyOrganizer);
  apiRouter.get("/admin/events", requireAuth, restrictTo("ADMIN"), adminController.getEvents);
  apiRouter.patch("/admin/events/:id/status", requireAuth, restrictTo("ADMIN"), adminController.moderateEventStatus);
  apiRouter.get("/admin/audit-logs", requireAuth, restrictTo("ADMIN"), adminController.getAuditLogs);
  apiRouter.get("/venture/preview", ventureController.getPublicPreview);
  apiRouter.get("/venture/event", requireVentureMasterAdmin, ventureController.getEvent);
  apiRouter.put("/venture/event", requireVentureMasterAdmin, ventureController.updateEvent);
  apiRouter.post("/venture/roster", requireVentureMasterAdmin, ventureController.uploadRoster);
  apiRouter.post("/venture/roster/reset", requireVentureMasterAdmin, ventureController.resetRoster);
  apiRouter.get("/venture/status", requireVentureMasterAdmin, ventureController.getStatus);
  apiRouter.post("/venture/dispatch-batch", requireVentureMasterAdmin, ventureController.dispatchBatch);
  apiRouter.get("/venture/pass/:token", ventureController.getAttendeePass);
  apiRouter.get("/venture/pass/:token/checkin-status", ventureController.getAttendeePassCheckinStatus);
  apiRouter.post("/venture/scan", ventureController.scanPass);
  apiRouter.post("/venture/manual-checkin", requireVentureMasterAdmin, ventureController.manualCheckIn);
  apiRouter.get("/venture/export-ledger", requireVentureMasterAdmin, ventureController.exportLedger);
  apiRouter.delete("/venture/purge", requireVentureMasterAdmin, ventureController.purgeEvent);
  apiRouter.post("/venture/volunteers/pins", requireVentureMasterAdmin, ventureController.createVolunteerPin);
  apiRouter.get("/venture/volunteers/pins", requireVentureMasterAdmin, ventureController.listVolunteerPins);
  apiRouter.delete("/venture/volunteers/pins/:id", requireVentureMasterAdmin, ventureController.deleteVolunteerPin);
  apiRouter.patch("/venture/volunteers/pins/:id/toggle", requireVentureMasterAdmin, ventureController.toggleVolunteerPin);
  apiRouter.post("/venture/teams", requireVentureMasterAdmin, ventureController.createOnSpotTeam);
  apiRouter.patch("/venture/teams/:id", requireVentureMasterAdmin, ventureController.updateTeam);
  apiRouter.post("/venture/teams/:id/members", requireVentureMasterAdmin, ventureController.addMemberToTeam);
  apiRouter.patch("/venture/members/:id", requireVentureMasterAdmin, ventureController.updateMember);
  apiRouter.delete("/venture/members/:id", requireVentureMasterAdmin, ventureController.removeMember);
  apiRouter.post("/venture/members/:id/send-pass", requireVentureMasterAdmin, ventureController.sendIndividualPass);
  app.use("/api", apiRouter);
  app.use("/api/v1", apiRouter);
  app.use(errorHandler);
  const shouldEnableVite = options.enableVite ?? env.NODE_ENV !== "production";
  if (shouldEnableVite) {
    logger.info("Starting server with Vite Middleware...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0" },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    logger.info("Starting server with static assets serving...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/health") || req.path.startsWith("/ready") || req.path.startsWith("/metrics")) {
        return next();
      }
      res.sendFile(import_path.default.join(distPath, "index.html"), (err) => {
        if (err) {
          next(err);
        }
      });
    });
  }
  return app;
}

// src/server/server.ts
init_error_message();
process.env.NODE_NO_WARNINGS = "1";
process.removeAllListeners("warning");
process.on("warning", (warning) => {
  if (warning.name === "DeprecationWarning") return;
  console.warn(`[${warning.name}] ${warning.message}`);
});
async function startServer() {
  const env = validateEnv();
  const PORT = env.PORT;
  let isShuttingDown = false;
  const enabled = getFeatures();
  logger.info("Feature flags", {
    on: FEATURE_KEYS.filter((k) => enabled[k]),
    off: FEATURE_KEYS.filter((k) => !enabled[k])
  });
  for (const warning of validateFeatureFlags().warnings) logger.warn(warning);
  if (env.PROCESS_TYPE === "worker") {
    logger.info("Starting instance in dedicated WORKER mode (BullMQ job processing only)...");
    registerJobWorkers();
    const workerApp = (0, import_express2.default)();
    workerApp.get("/health", (req, res) => {
      res.status(200).json({ status: "ok", processType: "worker", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
    });
    workerApp.get("/ready", async (req, res) => {
      if (isShuttingDown) {
        return res.status(503).json({
          status: "shutting_down",
          processType: "worker",
          message: "Worker process is shutting down",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
      try {
        const dbHealth = await checkDatabaseHealth();
        if (dbHealth.status !== "ok") {
          return res.status(503).json({
            status: "error",
            processType: "worker",
            database: "unavailable",
            timestamp: (/* @__PURE__ */ new Date()).toISOString()
          });
        }
        res.status(200).json({
          status: "ready",
          processType: "worker",
          database: "connected",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      } catch (err) {
        res.status(503).json({
          status: "error",
          processType: "worker",
          message: errorMessage(err) || "Worker dependencies unavailable",
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        });
      }
    });
    const server2 = workerApp.listen(PORT, "0.0.0.0", () => {
      logger.info(`Happenins WORKER process running on http://0.0.0.0:${PORT} (health endpoint active)`);
    });
    server2.keepAliveTimeout = env.SERVER_KEEP_ALIVE_TIMEOUT_MS;
    server2.headersTimeout = env.SERVER_HEADERS_TIMEOUT_MS;
    server2.requestTimeout = env.SERVER_REQUEST_TIMEOUT_MS;
    setupGracefulShutdown(server2, () => isShuttingDown, (val) => {
      isShuttingDown = val;
    });
    return;
  }
  if (env.PROCESS_TYPE === "combined") {
    logger.info("Starting instance in COMBINED mode (API + local workers)...");
    registerJobWorkers();
  } else {
    logger.info("Starting instance in dedicated API mode (Queue producer only)...");
  }
  const HOST = process.env.HOST || "0.0.0.0";
  const app = await createApp({
    isShuttingDown: () => isShuttingDown,
    // Allow the rebuilt application to run locally without weakening production validation.
    enableVite: process.env.SERVE_BUILT_ASSETS === "true" ? false : void 0
  });
  const server = app.listen(PORT, HOST, () => {
    logger.info(`Happenins server listening on http://${HOST}:${PORT}`);
  });
  server.keepAliveTimeout = env.SERVER_KEEP_ALIVE_TIMEOUT_MS;
  server.headersTimeout = env.SERVER_HEADERS_TIMEOUT_MS;
  server.requestTimeout = env.SERVER_REQUEST_TIMEOUT_MS;
  setupGracefulShutdown(server, () => isShuttingDown, (val) => {
    isShuttingDown = val;
  });
}
function setupGracefulShutdown(server, getShuttingDown, setShuttingDown) {
  const gracefulShutdown = (signal) => {
    if (getShuttingDown()) return;
    setShuttingDown(true);
    logger.warn(`Received ${signal}. Initiating graceful shutdown...`);
    server.close(async (err) => {
      if (err) {
        logger.error("Error closing HTTP server:", { error: err.message });
      } else {
        logger.info("HTTP server closed successfully.");
      }
      try {
        logger.info("Stopping background workers and queues...");
        await stopJobWorkers();
        logger.info("Disconnecting Prisma database client...");
        await disconnectPrisma();
        logger.info("Closing Redis connections...");
        await closeRedis();
        logger.info("Background workers, Database, and Redis disconnected cleanly. Exit complete.");
      } catch (dbErr) {
        logger.error("Error during graceful shutdown cleanup:", { error: errorMessage(dbErr) });
      }
      process.exit(err ? 1 : 0);
    });
    setTimeout(() => {
      logger.error("Graceful shutdown timeout exceeded (10s). Forcing termination.");
      process.exit(1);
    }, 1e4).unref();
  };
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled Promise Rejection detected:", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : void 0
    });
  });
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception detected:", {
      message: error.message,
      stack: error.stack
    });
    gracefulShutdown("uncaughtException");
  });
}
startServer().catch((err) => {
  logger.error("Critical failure during server boot initialization:", { error: err.message });
  process.exit(1);
});
//# sourceMappingURL=server.cjs.map
