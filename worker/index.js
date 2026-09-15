const ADMIN_EMAIL = "sinan.targay@besiktas.bel.tr";
const SESSION_MAX_AGE_SECONDS = 315360000;
const encoder = new TextEncoder();
const ROLE_DEFINITIONS = {
  super_admin: { level: 1, name: "Sistem Yöneticisi", description: "Bilgi İşlem Müdürlüğü · sistemin tamamı", restriction: "Kullanıcı, rol, güvenlik, yedekleme ve tüm teknik ayarlarda tam yetkilidir.", scope: "all", permissions: ["view", "download", "print", "edit_metadata", "approve_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department", "confidential", "manage_users", "manage_roles", "system_settings", "backup", "audit", "manage_news", "publish_social"] },
  archive_manager: { level: 2, name: "Arşiv Birimi Sorumlusu", description: "Basın Yayın ve Halkla İlişkiler Müdürlüğü · işleyişte tam yetki", restriction: "Arşiv içeriği, analiz onayı, raporlama ve operasyon kullanıcılarını yönetir; sistem ayarlarını değiştiremez.", scope: "all", permissions: ["view", "download", "print", "edit_metadata", "approve_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department", "confidential", "manage_users", "audit", "manage_news", "publish_social"] },
  department_manager: { level: 3, name: "Müdürlük Yetkilisi", description: "Diğer müdürlüklerin arşiv sorumlusu", restriction: "Yalnızca kendi müdürlüğünün kayıtları ve görevlendirdiği standart personel üzerinde yetkilidir.", scope: "department", permissions: ["view", "download", "print", "edit_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department", "manage_department_users"] },
  bio_media_staff: { level: 3, name: "BİO Fotoğraf / Video Sorumlusu", description: "Görsel üretim, yükleme, veri girişi ve arşiv taraması", restriction: "Kullanıcı, rol ve sistem ayarlarını yönetemez; analiz kimlik onayı veremez.", scope: "all", permissions: ["view", "download", "print", "edit_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department"] },
  bio_news_staff: { level: 3, name: "BİO Haber Bültenleri Sorumlusu", description: "Haber bülteni hazırlama, yükleme, veri girişi ve arşiv taraması", restriction: "Kullanıcı, rol ve sistem ayarlarını yönetemez; analiz kimlik onayı veremez.", scope: "all", permissions: ["view", "download", "print", "edit_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department", "manage_news"] },
  bio_graphic_staff: { level: 3, name: "BİO Grafik Tasarım Sorumlusu", description: "Grafik tasarım üretimi, yükleme, veri girişi ve arşiv taraması", restriction: "Kullanıcı, rol ve sistem ayarlarını yönetemez; analiz kimlik onayı veremez.", scope: "all", permissions: ["view", "download", "print", "edit_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department"] },
  bio_social_media: { level: 3, name: "BİO Sosyal Medya Personeli", description: "Görsel arşiv ve Başkan/Belediye paylaşım akışı", restriction: "Paylaşımı kuyruğa hazırlar; yönetici veya arşiv sorumlusu onayı olmadan yayımlandı sayılmaz.", scope: "all", permissions: ["view", "download", "print", "edit_metadata", "add_document", "delete_asset", "view_reports", "public", "internal", "department", "publish_social"] },
  standard_user: { level: 4, name: "Standart Kullanıcı", description: "Personel / Halkla İlişkiler kullanıcısı", restriction: "Yalnızca kendi müdürlüğünde arama, görüntüleme ve indirme yapabilir; yükleme, düzenleme ve silme yapamaz.", scope: "department", permissions: ["view", "download", "public", "department"] },
};

const PERMISSION_GROUPS = {
  "Arşiv İşlemleri": { view: "Görüntüle / Ara", download: "İndir", print: "Rapor / Çıktı", edit_metadata: "Bilgi ve Etiket Düzenle", approve_metadata: "Analiz ve Kişi Etiketi Onayla", add_document: "İçerik Yükle", delete_asset: "İçerik Sil", view_reports: "Faaliyet Raporlarını Gör" },
  "Arşiv Kapsamı": { public: "Kamuya Açık", internal: "Kurum İçi", department: "Müdürlük Kayıtları", confidential: "Hassas / Yönetici Onaylı" },
  "Yönetim ve Yayın": { manage_users: "Tüm Kullanıcıları Yönet", manage_department_users: "Müdürlük Personelini Yönet", manage_roles: "Rol Hiyerarşisini Yönet", system_settings: "Sistem Ayarları", backup: "Yedekleme", audit: "İşlem Kayıtları", manage_news: "Haber Bülteni Yönetimi", publish_social: "Sosyal Medya Kuyruğu" },
};

// Beşiktaş Belediyesi'nin 14.09.2026 tarihli resmî Müdürlükler ve Faaliyetleri listesi.
const DEPARTMENTS = ["Afet İşleri ve Risk Yönetimi Müdürlüğü","Basın Yayın ve Halkla İlişkiler Müdürlüğü","Bilgi İşlem Müdürlüğü","Destek Hizmetleri Müdürlüğü","Dış İlişkiler Müdürlüğü","Emlak ve İstimlak Müdürlüğü","Fen İşleri Müdürlüğü","Gelirler Müdürlüğü","Gençlik ve Spor Hizmetleri Müdürlüğü","Hukuk İşleri Müdürlüğü","İklim Değişikliği ve Sıfır Atık Müdürlüğü","İmar ve Şehircilik Müdürlüğü","İnsan Kaynakları ve Eğitim Müdürlüğü","İşletme ve İştirakler Müdürlüğü","Kadın ve Aile Hizmetleri Müdürlüğü","Kentsel Dönüşüm Müdürlüğü","Kültür, Sanat ve Sosyal İşler Müdürlüğü","Mali Hizmetler Müdürlüğü","Muhtarlık İşleri Müdürlüğü","Özel Kalem Müdürlüğü","Park ve Bahçeler Müdürlüğü","Rehberlik ve Teftiş Kurulu Müdürlüğü","Ruhsat ve Denetim Müdürlüğü","Sağlık İşleri Müdürlüğü","Sosyal Hizmetler Müdürlüğü","Temizlik İşleri Müdürlüğü","Veteriner İşleri Müdürlüğü","Yazı İşleri Müdürlüğü","Zabıta Müdürlüğü"];

function isAdminRole(role) {
  return role === "admin" || role === "super_admin";
}

function roleDefinition(role) {
  return ROLE_DEFINITIONS[role] || (role === "admin" ? ROLE_DEFINITIONS.super_admin : null);
}

function hasPermission(user, permission) {
  return Boolean(user && roleDefinition(user.role)?.permissions.includes(permission));
}

function canManageUserTarget(actor, target, requestedRole) {
  if (!actor || !target) return false;
  if (isAdminRole(actor.role)) return true;
  if (actor.role === "archive_manager") return !["super_admin", "archive_manager"].includes(requestedRole);
  return actor.role === "department_manager" && target.department === actor.department && requestedRole === "standard_user";
}

const UPLOAD_EXTENSIONS = new Set(["jpg","jpeg","png","tif","tiff","webp","gif","heic","heif","dng","nef","nrw","cr2","cr3","arw","raf","orf","rw2","pef","raw","mp4","mov","m4v","avi","mkv","webm","mts","m2ts","pdf"]);
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024 * 1024;
const MEDIA_TYPES = new Set(["photo", "video", "graphic", "news"]);
const SUBJECT_CATEGORIES = new Set(["president", "municipality"]);
const DEFAULT_MEDIA_STAFF = [
  { name: "Sinan Targay", duty: "Fotoğrafçı / Kameraman" },
  { name: "Okan Fındık", duty: "Fotoğrafçı / Kameraman" },
  { name: "İbrahim Göksu", duty: "Fotoğrafçı / Kameraman" },
  { name: "Oktay Erginoğlu", duty: "Fotoğrafçı / Kameraman" },
  { name: "Eser Köse", duty: "Fotoğrafçı / Kameraman" },
  { name: "Sumru Gökçe Uçak", duty: "Fotoğrafçı / Kameraman" },
  { name: "Sertaç Erdi Aydın", duty: "Fotoğrafçı / Kameraman" },
  { name: "Fırat Akyol", duty: "Fotoğrafçı / Kameraman" },
  { name: "Kadir Altun", duty: "Fotoğrafçı / Kameraman" },
  { name: "Barış Görgün", duty: "Fotoğrafçı / Kameraman" },
  { name: "Sencer Şeker", duty: "Fotoğrafçı / Kameraman" },
  { name: "Ahmet Okyar Okatan", duty: "Muhabir" },
  { name: "Nihat İlbeyoğlu", duty: "Muhabir" },
  { name: "Emrecan Okman", duty: "Grafiker" },
];

function safeFileName(value) {
  return String(value || "dosya").replace(/[\\/\0-\x1f\x7f]/g, "_").replace(/\s+/g, " ").trim().slice(0, 220) || "dosya";
}

function allowedUpload(fileName, contentType) {
  const ext = safeFileName(fileName).split(".").pop().toLowerCase();
  return UPLOAD_EXTENSIONS.has(ext) && (!contentType || contentType.startsWith("image/") || contentType.startsWith("video/") || contentType === "application/pdf" || contentType === "application/octet-stream");
}

function validTckn(value) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!/^[1-9]\d{10}$/.test(digits)) return false;
  const n = [...digits].map(Number);
  return ((n[0] + n[2] + n[4] + n[6] + n[8]) * 7 - (n[1] + n[3] + n[5] + n[7])) % 10 === n[9] && n.slice(0, 10).reduce((a, b) => a + b, 0) % 10 === n[10];
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });
}

function normalizeEmail(value) {
  return String(value || "").trim().toLocaleLowerCase("tr-TR");
}

function validEmail(email) {
  return /^[^\s@]+@besiktas\.bel\.tr$/i.test(email);
}

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function largeBytesToBase64(bytes) {
  const chunks = [];
  const size = 0x8000;
  for (let index = 0; index < bytes.length; index += size) {
    chunks.push(String.fromCharCode(...bytes.subarray(index, Math.min(index + size, bytes.length))));
  }
  return btoa(chunks.join(""));
}

function base64ToBytes(value) {
  const binary = atob(value);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function randomToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return bytesToBase64(bytes).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return bytesToBase64(new Uint8Array(digest));
}

async function hashPassword(password, salt = null, iterations = 100000) {
  const saltBytes = salt ? base64ToBytes(salt) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, key, 256);
  return { hash: bytesToBase64(new Uint8Array(bits)), salt: bytesToBase64(saltBytes), iterations };
}

async function encryptionKey(secret) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptTckn(value, secret) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, await encryptionKey(secret), encoder.encode(value));
  return { cipher: bytesToBase64(new Uint8Array(cipher)), iv: bytesToBase64(iv) };
}

async function decryptTckn(cipher, iv, secret) {
  if (!cipher || !iv) return "***********";
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: base64ToBytes(iv) }, await encryptionKey(secret), base64ToBytes(cipher));
  return new TextDecoder().decode(plain);
}

async function audit(env, request, userId, action, targetType = null, targetId = null, details = {}) {
  const ip = request.headers.get("cf-connecting-ip") || null;
  await env.DB.prepare("INSERT INTO audit_logs (user_id, action, target_type, target_id, details_json, ip_address) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(userId, action, targetType, targetId == null ? null : String(targetId), JSON.stringify(details), ip).run();
}

function parseCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  for (const item of cookie.split(";")) {
    const [key, ...rest] = item.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return null;
}

async function currentUser(request, env) {
  const token = parseCookie(request, "arsiv_session");
  if (!token) return null;
  const tokenHash = await sha256(token);
  const user = await env.DB.prepare(`
    SELECT u.id, u.email, u.name, u.surname, u.phone, u.extension, u.department, u.department_scope, u.job_title, u.job_description, u.role, u.status, u.tc_identity_cipher, u.tc_identity_iv
    FROM sessions s JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.status = 'active'
  `).bind(tokenHash).first();
  if (user) {
    await env.DB.prepare("UPDATE sessions SET expires_at = datetime('now', '+3650 days') WHERE token_hash = ?").bind(tokenHash).run();
  }
  return user;
}

async function register(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return json({ error: "Geçersiz başvuru." }, 400);
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const tckn = String(body.tckn || "").replace(/\D/g, "");
  const required = [body.name, body.surname, email, body.phone, body.department, body.jobTitle, body.jobDescription, password, tckn];
  if (required.some((value) => !String(value || "").trim())) return json({ error: "Zorunlu alanların tamamını doldurun." }, 400);
  if (!validEmail(email)) return json({ error: "Yalnızca @besiktas.bel.tr adresleri kabul edilir." }, 400);
  if (!validTckn(tckn)) return json({ error: "Geçerli bir T.C. kimlik numarası girin." }, 400);
  if (!env.WATERMARK_SECRET) return json({ error: "Güvenli kimlik saklama anahtarı yapılandırılmamış." }, 503);
  if (!/^(?=.*[a-zçğıöşü])(?=.*[A-ZÇĞİÖŞÜ])(?=.*\d).{8,}$/.test(password)) return json({ error: "Parola kurallara uygun değil." }, 400);
  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return json({ error: "Bu e-posta adresiyle daha önce başvuru yapılmış." }, 409);
  const secured = await hashPassword(password);
  const identity = await encryptTckn(tckn, env.WATERMARK_SECRET);
  const isAdmin = email === ADMIN_EMAIL;
  const result = await env.DB.prepare(`
    INSERT INTO users (email, password_hash, password_salt, password_iterations, name, surname, phone, extension, department, department_scope, job_title, job_description, tc_identity_cipher, tc_identity_iv, status, role, approved_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CASE WHEN ? = 'active' THEN datetime('now') ELSE NULL END)
  `).bind(email, secured.hash, secured.salt, secured.iterations, String(body.name).trim(), String(body.surname).trim(), String(body.phone).trim(), String(body.extension || "").trim(), String(body.department).trim(), String(body.department).trim(), String(body.jobTitle).trim(), String(body.jobDescription).trim(), identity.cipher, identity.iv, isAdmin ? "active" : "pending", isAdmin ? "super_admin" : "standard_user", isAdmin ? "active" : "pending").run();
  await audit(env, request, result.meta.last_row_id, "membership_registered", "user", result.meta.last_row_id, { status: isAdmin ? "active" : "pending" });
  return json({ ok: true, status: isAdmin ? "active" : "pending", id: result.meta.last_row_id }, 201);
}

async function login(request, env, portal = "member") {
  const body = await request.json().catch(() => null);
  const email = normalizeEmail(body?.email);
  const password = String(body?.password || "");
  if (!validEmail(email) || !password) return json({ error: "E-posta veya parola hatalı." }, 401);
  const user = await env.DB.prepare("SELECT * FROM users WHERE email = ?").bind(email).first();
  if (!user) return json({ error: "Bu e-posta adresiyle kayıtlı hesap bulunamadı." }, 401);
  if (user.status === "pending") return json({ error: "Üyelik başvurunuz yönetici onayı bekliyor." }, 403);
  if (user.status !== "active") return json({ error: "Hesabınız aktif değil." }, 403);
  if (portal === "admin" && !isAdminRole(user.role)) return json({ error: "Bu hesapta yönetici yetkisi bulunmuyor." }, 403);
  if (portal === "member" && isAdminRole(user.role)) return json({ error: "Yönetici hesabıyla Yönetici Girişi bağlantısını kullanın." }, 403);
  const secured = await hashPassword(password, user.password_salt, user.password_iterations);
  if (secured.hash !== user.password_hash) return json({ error: "E-posta veya parola hatalı." }, 401);
  const token = randomToken();
  const tokenHash = await sha256(token);
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, datetime('now', '+3650 days'))").bind(tokenHash, user.id).run();
  await audit(env, request, user.id, "login_success", "session", null, { portal });
  const tckn = env.WATERMARK_SECRET ? await decryptTckn(user.tc_identity_cipher, user.tc_identity_iv, env.WATERMARK_SECRET) : "***********";
  const definition = roleDefinition(user.role);
  return json({ ok: true, user: { email: user.email, name: user.name, surname: user.surname, department: user.department, departmentScope: user.department_scope || user.department, role: isAdminRole(user.role) ? "super_admin" : user.role, roleName: definition?.name || user.role, permissions: definition?.permissions || [], watermark: `${tckn} - ${user.name} ${user.surname}` } }, 200, {
    "set-cookie": `arsiv_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
  });
}

async function listUsers(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "manage_users") && !hasPermission(user, "manage_department_users")) return json({ error: "Yetkisiz işlem." }, 403);
  const fields = "id, email, name, surname, phone, extension, department, department_scope, job_title, job_description, role, status, created_at";
  const result = isAdminRole(user.role)
    ? await env.DB.prepare(`SELECT ${fields} FROM users ORDER BY created_at DESC`).all()
    : user.role === "archive_manager"
      ? await env.DB.prepare(`SELECT ${fields} FROM users WHERE role NOT IN ('admin','super_admin','archive_manager') ORDER BY created_at DESC`).all()
      : await env.DB.prepare(`SELECT ${fields} FROM users WHERE department=? ORDER BY created_at DESC`).bind(user.department).all();
  return json({ users: result.results || [] });
}

async function approveUser(request, env, id) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "manage_users") && !hasPermission(user, "manage_department_users")) return json({ error: "Yetkisiz işlem." }, 403);
  const body = await request.json().catch(() => ({}));
  const role = String(body.role || "standard_user");
  if (!ROLE_DEFINITIONS[role]) return json({ error: "Geçersiz kullanıcı rolü." }, 400);
  const target = await env.DB.prepare("SELECT id, department, status FROM users WHERE id = ?").bind(id).first();
  if (!target) return json({ error: "Kullanıcı bulunamadı." }, 404);
  if (!canManageUserTarget(user, target, role)) return json({ error: "Bu kullanıcıya seçilen rolü verme yetkiniz bulunmuyor." }, 403);
  const department = user.role === "department_manager" ? user.department : String(body.departmentScope || target.department).trim();
  if (!DEPARTMENTS.includes(department)) return json({ error: "Geçersiz müdürlük seçimi." }, 400);
  const departmentScope = ROLE_DEFINITIONS[role].scope === "department" ? department : null;
  await env.DB.prepare("UPDATE users SET status = 'active', role = ?, department = ?, department_scope = ?, approved_at = datetime('now'), approved_by = ? WHERE id = ? AND status = 'pending'").bind(role, department, departmentScope, user.id, id).run();
  await audit(env, request, user.id, "membership_approved", "user", id, { role, department, departmentScope });
  return json({ ok: true });
}

async function updateUserRole(request, env, id) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "manage_users") && !hasPermission(user, "manage_department_users")) return json({ error: "Yetkisiz işlem." }, 403);
  if (Number(user.id) === Number(id)) return json({ error: "Kendi yönetici rolünüzü bu ekrandan değiştiremezsiniz." }, 400);
  const body = await request.json().catch(() => ({}));
  const role = String(body.role || "");
  if (!ROLE_DEFINITIONS[role]) return json({ error: "Geçersiz kullanıcı rolü." }, 400);
  const department = user.role === "department_manager" ? user.department : String(body.department || "").trim();
  const status = String(body.status || "active");
  if (!DEPARTMENTS.includes(department)) return json({ error: "Geçersiz müdürlük seçimi." }, 400);
  if (!["active", "inactive"].includes(status)) return json({ error: "Geçersiz üyelik durumu." }, 400);
  const target = await env.DB.prepare("SELECT id,department FROM users WHERE id = ?").bind(id).first();
  if (!target) return json({ error: "Kullanıcı bulunamadı." }, 404);
  if (!canManageUserTarget(user, target, role)) return json({ error: "Bu kullanıcıya seçilen rolü verme yetkiniz bulunmuyor." }, 403);
  const departmentScope = ROLE_DEFINITIONS[role].scope === "department" ? department : null;
  await env.DB.prepare("UPDATE users SET role = ?, department = ?, department_scope = ?, status = ? WHERE id = ?").bind(role, department, departmentScope, status, id).run();
  if (status === "inactive") await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(id).run();
  await audit(env, request, user.id, "user_access_changed", "user", id, { role, department, departmentScope, status });
  return json({ ok: true });
}

async function profile(request, env) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Oturum bulunamadı." }, 401);
  const definition = roleDefinition(user.role);
  if (request.method === "GET") return json({ user: { name: user.name, surname: user.surname, email: user.email, phone: user.phone, extension: user.extension, department: user.department, jobTitle: user.job_title, jobDescription: user.job_description, role: isAdminRole(user.role) ? "super_admin" : user.role, roleName: definition?.name || user.role, permissions: definition?.permissions || [] }, permissionGroups: PERMISSION_GROUPS });
  const body = await request.json().catch(() => ({}));
  const name = String(body.name || "").trim(), surname = String(body.surname || "").trim(), phone = String(body.phone || "").trim(), extension = String(body.extension || "").trim(), jobTitle = String(body.jobTitle || "").trim(), jobDescription = String(body.jobDescription || "").trim();
  if (!name || !surname || !phone || !jobTitle || !jobDescription) return json({ error: "Zorunlu üyelik bilgilerini doldurun." }, 400);
  await env.DB.prepare("UPDATE users SET name = ?, surname = ?, phone = ?, extension = ?, job_title = ?, job_description = ? WHERE id = ?").bind(name, surname, phone, extension, jobTitle, jobDescription, user.id).run();
  await audit(env, request, user.id, "profile_updated", "user", user.id, { fields: ["name", "surname", "phone", "extension", "job_title", "job_description"] });
  return json({ ok: true });
}

async function startUpload(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "add_document")) return json({ error: "Fotoğraf veya video yükleme yetkiniz bulunmuyor." }, 403);
  if (!env.BUCKET) return json({ error: "Dosya depolama alanı henüz bağlı değil." }, 503);
  const body = await request.json().catch(() => null);
  const fileName = safeFileName(body?.fileName);
  const contentType = String(body?.contentType || "application/octet-stream").slice(0, 150);
  const fileSize = Number(body?.fileSize || 0);
  const eventName = String(body?.eventName || "").trim().slice(0, 250);
  const eventDate = String(body?.eventDate || "").trim();
  const department = String(body?.department || "").trim().slice(0, 250);
  const location = String(body?.location || "").trim().slice(0, 300);
  const inferredMediaType = contentType.startsWith("video/") ? "video" : "photo";
  const mediaType = MEDIA_TYPES.has(body?.mediaType) ? body.mediaType : inferredMediaType;
  const subjectCategory = SUBJECT_CATEGORIES.has(body?.subjectCategory) ? body.subjectCategory : "municipality";
  if (!eventName || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || !department || !location) return json({ error: "Etkinlik adı, tarih, müdürlük ve konum zorunludur." }, 400);
  if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > MAX_UPLOAD_BYTES) return json({ error: "Dosya boyutu geçersiz veya 20 GB sınırını aşıyor." }, 400);
  if (!allowedUpload(fileName, contentType)) return json({ error: `${fileName} desteklenen bir fotoğraf veya video dosyası değil.` }, 415);
  const id = crypto.randomUUID();
  const r2Key = `${eventDate.slice(0, 4)}/${eventDate}/${id}-${fileName}`;
  const upload = await env.BUCKET.createMultipartUpload(r2Key, { httpMetadata: { contentType } });
  await env.DB.prepare(`INSERT INTO upload_sessions (id,r2_key,r2_upload_id,user_id,file_name,content_type,file_size,event_name,event_date,department,location,photographer,keywords,description,media_type,subject_category) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(id,r2Key,upload.uploadId,user.id,fileName,contentType,fileSize,eventName,eventDate,department,location,String(body.photographer||"").trim(),String(body.keywords||"").trim(),String(body.description||"").trim(),mediaType,subjectCategory).run();
  await audit(env, request, user.id, "upload_started", "upload", id, { fileName, fileSize, eventName });
  return json({ id, partSize: 8 * 1024 * 1024 });
}

async function uploadStatus(request, env) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Oturum bulunamadı. Lütfen yeniden giriş yapın." }, 401);
  if (!hasPermission(user, "add_document")) return json({ error: "Fotoğraf veya video yükleme yetkiniz bulunmuyor." }, 403);
  if (!env.DB) return json({ error: "Veritabanı bağlantısı hazır değil." }, 503);
  if (!env.BUCKET) return json({ error: "Dosya depolama bağlantısı hazır değil." }, 503);
  return json({ ok: true, service: "upload", storage: "ready", metadataMode: "json-sidecar", visualAnalysis: env.OPENAI_API_KEY ? "ready" : "not_configured" });
}

async function analyzeUploadedImage(env, assetId, session) {
  const supported = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
  const contentType = String(session.content_type || "").toLowerCase();
  if (!env.OPENAI_API_KEY || !supported.has(contentType) || Number(session.file_size) > 15 * 1024 * 1024) {
    await env.DB.prepare("UPDATE assets SET analysis_status=? WHERE id=?").bind(env.OPENAI_API_KEY ? "unsupported" : "waiting_provider", assetId).run();
    return;
  }
  await env.DB.prepare("UPDATE assets SET analysis_status='analyzing' WHERE id=?").bind(assetId).run();
  try {
    const object = await env.BUCKET.get(session.r2_key);
    if (!object) throw new Error("uploaded object missing");
    const imageBase64 = largeBytesToBase64(new Uint8Array(await object.arrayBuffer()));
    const prompt = `Bu belediye görsel arşivi fotoğrafını Türkçe analiz et. JSON dışında hiçbir şey yazma. Şema: {"keywords":["..."],"description":"...","locationSuggestion":"...","locationConfidence":"high|medium|low|none","faceCount":0}. 8-18 somut ve arşivlenebilir anahtar kelime üret; etkinlik türü, kurum hizmeti, ortam, nesneler, hava/ışık ve görünür eylemleri kapsa. Kişilerin kimliğini tahmin etme veya isim verme. description, kurumsal basın bülteni üslubunda; tarafsız, doğrulanabilir, abartısız ve 2-3 cümle olsun. İlk cümlede etkinliği ve belediye hizmetini, ikinci cümlede görünür faaliyeti anlat. Yalnızca açıkça görülen, ayırt edici bir yapı/yer işareti varsa locationSuggestion yaz; emin değilsen boş bırak ve none kullan. Dosya bağlamı: etkinlik=${session.event_name}; tarih=${session.event_date}; müdürlük=${session.department}; kullanıcı konumu=${session.location || "belirtilmedi"}; kategori=${session.subject_category || "municipality"}; medya=${session.media_type || "photo"}.`;
    const requestAnalysis = model => fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "authorization": `Bearer ${env.OPENAI_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        model,
        input: [{ role: "user", content: [{ type: "input_text", text: prompt }, { type: "input_image", image_url: `data:${contentType};base64,${imageBase64}`, detail: "low" }] }],
        max_output_tokens: 500,
      }),
    });
    let response = await requestAnalysis(env.OPENAI_VISION_MODEL || "gpt-4.1-mini");
    if (response.status === 404 && !env.OPENAI_VISION_MODEL) response = await requestAnalysis("gpt-4o-mini");
    if (!response.ok) {
      const apiError = await response.text();
      const failure = new Error(`OpenAI ${response.status}: ${apiError.slice(0, 400)}`);
      failure.status = response.status;
      throw failure;
    }
    const result = await response.json();
    const outputText = result.output_text || (result.output || []).flatMap(item => item.content || []).map(item => item.text || "").join("");
    const clean = String(outputText).trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const analysis = JSON.parse(clean);
    const visualKeywords = Array.isArray(analysis.keywords) ? analysis.keywords.map(value => String(value).trim()).filter(Boolean).slice(0, 15) : [];
    const combinedKeywords = [...new Set([session.event_name, session.department, session.location, ...visualKeywords].filter(Boolean))].join(", ");
    const locationSuggestion = analysis.locationConfidence === "high" ? String(analysis.locationSuggestion || "").trim() : "";
    const description = String(analysis.description || "").trim().slice(0, 1000);
    const suggestedDescription = `${description}${locationSuggestion ? ` Tahmini çekim yeri: ${locationSuggestion}.` : ""}`.trim();
    const faceCount = Math.max(0, Math.min(100, Number(analysis.faceCount) || 0));
    await env.DB.prepare(`UPDATE assets SET analysis_status='complete', suggested_keywords=?, suggested_description=?, detected_people=?, analysis_review_status='pending', keywords=CASE WHEN trim(coalesce(keywords,''))='' THEN ? ELSE keywords END, description=CASE WHEN trim(coalesce(description,''))='' THEN ? ELSE description END WHERE id=?`)
      .bind(combinedKeywords, suggestedDescription, faceCount ? `${faceCount} yüz algılandı; kişi etiketi yönetici onayı bekliyor` : "", combinedKeywords, description, assetId).run();
    return { ok: true };
  } catch (error) {
    const status = Number(error?.status) || 0;
    const userMessage = status === 429 ? "OpenAI kullanım kotası veya bakiyesi yetersiz." : status === 401 ? "OpenAI API anahtarı geçersiz." : status === 400 ? "Görsel analiz isteği kabul edilmedi." : "Görsel analiz geçici olarak tamamlanamadı.";
    console.error(`visual analysis failed asset=${assetId} status=${status} message=${String(error?.message || error).slice(0, 700)}`);
    await env.DB.prepare("UPDATE assets SET analysis_status='failed', suggested_description=? WHERE id=?").bind(userMessage, assetId).run();
    return { ok: false, status, error: userMessage };
  }
}

async function retryAssetAnalysis(request, env, id) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "edit_metadata")) return json({ error: "Analizi yeniden başlatma yetkiniz bulunmuyor." }, 403);
  const asset = await env.DB.prepare("SELECT id,r2_key,file_name,content_type,file_size,event_name,event_date,department,location,photographer,keywords,description FROM assets WHERE id=?").bind(id).first();
  if (!asset) return json({ error: "Arşiv kaydı bulunamadı." }, 404);
  const result = await analyzeUploadedImage(env, id, asset);
  await audit(env, request, user.id, "visual_analysis_retried", "asset", id, { ok: result?.ok === true, status: result?.status || 200 });
  return result?.ok ? json({ ok: true }) : json({ error: result?.error || "Analiz tamamlanamadı." }, result?.status === 429 ? 429 : 502);
}

async function updateAssetReview(request, env, id) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "approve_metadata")) return json({ error: "Analiz ve kişi etiketi onaylama yetkiniz bulunmuyor." }, 403);
  const definition = roleDefinition(user.role);
  const asset = definition?.scope === "department"
    ? await env.DB.prepare("SELECT id FROM assets WHERE id=? AND department=?").bind(id,user.department_scope || user.department).first()
    : await env.DB.prepare("SELECT id FROM assets WHERE id=?").bind(id).first();
  if (!asset) return json({ error: "Arşiv kaydı bulunamadı." }, 404);
  const body = await request.json().catch(() => ({}));
  const keywords = String(body.keywords || "").trim().slice(0, 2000);
  const description = String(body.description || "").trim().slice(0, 3000);
  const people = String(body.people || "").trim().slice(0, 1000);
  const reviewStatus = body.approved === true ? "approved" : "pending";
  await env.DB.prepare("UPDATE assets SET keywords=?, description=?, detected_people=?, analysis_review_status=? WHERE id=?")
    .bind(keywords, description, people, reviewStatus, id).run();
  await audit(env, request, user.id, reviewStatus === "approved" ? "visual_analysis_approved" : "visual_analysis_edited", "asset", id, { keywords, people });
  return json({ ok: true, reviewStatus });
}

async function deleteAsset(request, env, id) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "delete_asset")) return json({ error: "Arşiv içeriği silme yetkiniz bulunmuyor." }, 403);
  const definition = roleDefinition(user.role);
  const asset = definition?.scope === "department"
    ? await env.DB.prepare("SELECT id,r2_key,file_name FROM assets WHERE id=? AND department=?").bind(id,user.department_scope || user.department).first()
    : await env.DB.prepare("SELECT id,r2_key,file_name FROM assets WHERE id=?").bind(id).first();
  if (!asset) return json({ error: "Arşiv kaydı bulunamadı." }, 404);
  await audit(env, request, user.id, "asset_deleted", "asset", id, { fileName: asset.file_name });
  if (env.BUCKET) await Promise.all([env.BUCKET.delete(asset.r2_key), env.BUCKET.delete(`${asset.r2_key}.json`)]);
  await env.DB.prepare("DELETE FROM assets WHERE id=?").bind(id).run();
  return json({ ok: true });
}

async function resetMediaArchive(request, env) {
  const user = await currentUser(request, env);
  if (!isAdminRole(user?.role)) return json({ error: "Bu işlem yalnızca sistem yöneticisi tarafından yapılabilir." }, 403);
  const body = await request.json().catch(() => ({}));
  if (body.confirmation !== "TÜM MEDYAYI SİL") return json({ error: "Silme onayı doğrulanamadı." }, 400);
  const result = await env.DB.prepare("SELECT r2_key FROM assets").all();
  const keys = (result.results || []).flatMap(item => [item.r2_key, `${item.r2_key}.json`]);
  if (env.BUCKET) for (let index = 0; index < keys.length; index += 500) await env.BUCKET.delete(keys.slice(index, index + 500));
  await env.DB.batch([
    env.DB.prepare("DELETE FROM assets"),
    env.DB.prepare("DELETE FROM upload_sessions"),
  ]);
  await audit(env, request, user.id, "media_archive_reset", "archive", null, { deletedObjects: keys.length });
  return json({ ok: true, deletedRecords: result.results?.length || 0 });
}

async function newsPortal(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "manage_news") && !hasPermission(user, "publish_social")) return json({ error: "Haber ve yayın alanına erişim yetkiniz bulunmuyor." }, 403);
  if (request.method === "GET") {
    const [items, sources, assignments] = await Promise.all([
      env.DB.prepare("SELECT * FROM news_items ORDER BY created_at DESC LIMIT 200").all(),
      env.DB.prepare("SELECT * FROM news_sources ORDER BY name").all(),
      env.DB.prepare("SELECT * FROM notification_assignments ORDER BY subject_category").all(),
    ]);
    return json({ items: items.results || [], sources: sources.results || [], assignments: assignments.results || [], integrations: { web: "connection_required", social: "connection_required", email: "connection_required" } });
  }
  const body = await request.json().catch(() => ({}));
  if (request.method === "POST" && body.action === "assign") {
    const category = SUBJECT_CATEGORIES.has(body.subjectCategory) ? body.subjectCategory : "municipality";
    const email = String(body.recipientEmail || "").trim().slice(0, 250);
    const department = String(body.department || "").trim().slice(0, 250);
    await env.DB.prepare(`INSERT INTO notification_assignments (subject_category,recipient_email,department,updated_at) VALUES (?,?,?,datetime('now')) ON CONFLICT(subject_category) DO UPDATE SET recipient_email=excluded.recipient_email,department=excluded.department,updated_at=datetime('now')`).bind(category,email,department).run();
    await audit(env, request, user.id, "news_assignment_updated", "news", category, { email, department });
    return json({ ok: true });
  }
  return json({ error: "Geçersiz haber portalı işlemi." }, 400);
}

async function uploadPart(request, env, id, partNumber) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "add_document")) return json({ error: "Yükleme yetkiniz bulunmuyor." }, 403);
  if (!env.BUCKET || !request.body) return json({ error: "Dosya verisi alınamadı." }, 400);
  const session = await env.DB.prepare("SELECT * FROM upload_sessions WHERE id=? AND user_id=? AND status='uploading'").bind(id,user.id).first();
  if (!session) return json({ error: "Yükleme oturumu bulunamadı veya süresi doldu." }, 404);
  const number = Number(partNumber);
  if (!Number.isInteger(number) || number < 1 || number > 10000) return json({ error: "Geçersiz dosya parçası." }, 400);
  const multipart = env.BUCKET.resumeMultipartUpload(session.r2_key, session.r2_upload_id);
  const uploaded = await multipart.uploadPart(number, request.body);
  return json({ partNumber: uploaded.partNumber, etag: uploaded.etag });
}

async function completeUpload(request, env, id, ctx) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "add_document")) return json({ error: "Yükleme yetkiniz bulunmuyor." }, 403);
  if (!env.BUCKET) return json({ error: "Dosya depolama alanı bağlı değil." }, 503);
  const session = await env.DB.prepare("SELECT * FROM upload_sessions WHERE id=? AND user_id=? AND status='uploading'").bind(id,user.id).first();
  if (!session) return json({ error: "Yükleme oturumu bulunamadı." }, 404);
  const body = await request.json().catch(() => null);
  const parts = Array.isArray(body?.parts) ? body.parts.map(p => ({ partNumber:Number(p.partNumber), etag:String(p.etag||"") })).filter(p => Number.isInteger(p.partNumber) && p.partNumber > 0 && p.etag) : [];
  if (!parts.length) return json({ error: "Yüklenen dosya parçaları bulunamadı." }, 400);
  const multipart = env.BUCKET.resumeMultipartUpload(session.r2_key, session.r2_upload_id);
  await multipart.complete(parts.sort((a,b) => a.partNumber-b.partNumber));
  const metadataSuggestions = [session.event_name, session.location, session.department].filter(Boolean).join(", ");
  const suggestedDescription = `${session.event_name} etkinliğine ait ${String(session.content_type).startsWith("video/") ? "video" : "fotoğraf"} kaydı${session.location ? `; çekim yeri ${session.location}` : ""}.`;
  const manifestKey = `${session.r2_key}.json`;
  const manifest = {
    schemaVersion: 1,
    uploadId: id,
    objectKey: session.r2_key,
    fileName: session.file_name,
    contentType: session.content_type,
    fileSize: session.file_size,
    event: {
      name: session.event_name,
      date: session.event_date,
      department: session.department,
      location: session.location || "",
      photographer: session.photographer || "",
    },
    keywords: session.keywords || "",
    description: session.description || "",
    analysis: {
      status: "waiting_provider",
      suggestedKeywords: metadataSuggestions,
      suggestedDescription,
    },
    uploadedBy: user.id,
    uploadedAt: new Date().toISOString(),
  };
  await env.BUCKET.put(manifestKey, JSON.stringify(manifest, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
  });
  const statements = [
    env.DB.prepare(`INSERT INTO assets (r2_key,file_name,content_type,file_size,event_name,event_date,department,location,photographer,keywords,description,uploaded_by,analysis_status,suggested_keywords,suggested_description,analysis_review_status,media_type,subject_category) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).bind(session.r2_key,session.file_name,session.content_type,session.file_size,session.event_name,session.event_date,session.department,session.location,session.photographer,session.keywords,session.description,user.id,"waiting_provider",metadataSuggestions,suggestedDescription,"pending",session.media_type || "photo",session.subject_category || "municipality"),
    env.DB.prepare("UPDATE upload_sessions SET status='complete' WHERE id=?").bind(id)
  ];
  const result = await env.DB.batch(statements);
  const assetId = result[0]?.meta?.last_row_id || null;
  await audit(env, request, user.id, "upload_completed", "asset", assetId, { fileName: session.file_name, fileSize: session.file_size });
  if (assetId && ctx?.waitUntil) ctx.waitUntil(analyzeUploadedImage(env, assetId, session));
  return json({ ok:true, assetId, fileName:session.file_name, archivePath:session.r2_key, storageName:"Kurumsal Görsel Arşiv", manifestKey, analysisStatus:env.OPENAI_API_KEY?"queued":"waiting_provider", suggestedKeywords:metadataSuggestions, suggestedDescription });
}

async function listAssets(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "view")) return json({ error: "Arşivi görüntüleme yetkiniz bulunmuyor." }, 403);
  const definition = roleDefinition(user.role);
  const query = definition?.scope === "department"
    ? env.DB.prepare("SELECT id,file_name,content_type,file_size,event_name,event_date,department,location,photographer,keywords,description,analysis_status,suggested_keywords,suggested_description,detected_people,analysis_review_status,media_type,subject_category,created_at FROM assets WHERE department=? ORDER BY created_at DESC LIMIT 200").bind(user.department_scope || user.department)
    : env.DB.prepare("SELECT id,file_name,content_type,file_size,event_name,event_date,department,location,photographer,keywords,description,analysis_status,suggested_keywords,suggested_description,detected_people,analysis_review_status,media_type,subject_category,created_at FROM assets ORDER BY created_at DESC LIMIT 200");
  const result = await query.all();
  return json({ assets: result.results || [] });
}

async function assetContent(request, env, id) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "view")) return json({ error: "Görseli görüntüleme yetkiniz bulunmuyor." }, 403);
  const wantsDownload = new URL(request.url).searchParams.get("download") === "1";
  if (wantsDownload && !hasPermission(user, "download")) return json({ error: "Dosya indirme yetkiniz bulunmuyor." }, 403);
  const definition = roleDefinition(user.role);
  const query = definition?.scope === "department"
    ? env.DB.prepare("SELECT r2_key,file_name,content_type FROM assets WHERE id=? AND department=?").bind(id, user.department_scope || user.department)
    : env.DB.prepare("SELECT r2_key,file_name,content_type FROM assets WHERE id=?").bind(id);
  const asset = await query.first();
  if (!asset) return json({ error: "Arşiv kaydı bulunamadı." }, 404);
  const object = await env.BUCKET.get(asset.r2_key);
  if (!object) return json({ error: "Dosya depolama alanında bulunamadı." }, 404);
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("content-type", asset.content_type || headers.get("content-type") || "application/octet-stream");
  headers.set("content-disposition", `${wantsDownload ? "attachment" : "inline"}; filename*=UTF-8''${encodeURIComponent(asset.file_name)}`);
  headers.set("cache-control", "private, max-age=300");
  headers.set("x-content-type-options", "nosniff");
  return new Response(object.body, { headers });
}

async function socialWorkspace(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "publish_social")) return json({ error: "Sosyal medya çalışma alanına erişim yetkiniz bulunmuyor." }, 403);
  if (request.method === "GET") {
    const [accounts, assignments, staffAssignments, posts, users, mediaStaff] = await Promise.all([
      env.DB.prepare("SELECT * FROM social_accounts ORDER BY account_category,platform,account_name").all(),
      env.DB.prepare(`SELECT r.id,r.user_id,r.account_category,r.active,trim(u.name || ' ' || u.surname) user_name,u.email
        FROM social_responsibilities r JOIN users u ON u.id=r.user_id WHERE r.active=1 ORDER BY user_name`).all(),
      env.DB.prepare("SELECT id,NULL user_id,staff_name user_name,'' email,account_category,active FROM social_staff_responsibilities WHERE active=1 ORDER BY staff_name").all(),
      env.DB.prepare(`SELECT p.*,trim(u.name || ' ' || u.surname) created_by_name,trim(r.name || ' ' || r.surname) reviewed_by_name FROM social_posts p
        LEFT JOIN users u ON u.id=p.created_by LEFT JOIN users r ON r.id=p.reviewed_by ORDER BY p.created_at DESC LIMIT 100`).all(),
      hasPermission(user, "manage_users") ? env.DB.prepare("SELECT id,trim(name || ' ' || surname) name,email FROM users WHERE status='active' ORDER BY name,surname").all() : Promise.resolve({ results: [] }),
      hasPermission(user, "manage_users") ? env.DB.prepare("SELECT id,name,duty FROM media_staff WHERE active=1 ORDER BY name").all() : Promise.resolve({ results: [] }),
    ]);
    const normalizedPosts = (posts.results || []).map((post) => ({
      ...post,
      status: post.status === "awaiting_connection" && post.review_status === "approved" ? "ready" : post.status,
    }));
    return json({ accounts: accounts.results || [], assignments: [...(assignments.results || []), ...(staffAssignments.results || [])], posts: normalizedPosts, users: users.results || [], mediaStaff: mediaStaff.results || [], canManage: hasPermission(user, "manage_users") });
  }
  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "");
  if (action === "account") {
    if (!isAdminRole(user.role)) return json({ error: "Hesap tanımlama yalnızca yönetici tarafından yapılabilir." }, 403);
    const category = ["president","municipality"].includes(body.category) ? body.category : "municipality";
    const platform = String(body.platform || "").trim().slice(0,80), accountName = String(body.accountName || "").trim().replace(/\/$/, "").slice(0,180);
    if (!platform || !accountName) return json({ error: "Platform ve hesap adı zorunludur." }, 400);
    const existing = await env.DB.prepare("SELECT id FROM social_accounts WHERE account_category=? AND lower(platform)=lower(?) AND lower(account_name)=lower(?)").bind(category,platform,accountName).first();
    if (existing) return json({ error: "Bu sosyal medya hesabı zaten tanımlı." }, 409);
    const result = await env.DB.prepare("INSERT INTO social_accounts (account_category,platform,account_name,created_by) VALUES (?,?,?,?)").bind(category,platform,accountName,user.id).run();
    await audit(env, request, user.id, "social_account_added", "social_account", result.meta.last_row_id, { category, platform, accountName });
    return json({ ok: true, id: result.meta.last_row_id }, 201);
  }
  if (action === "assign") {
    if (!hasPermission(user, "manage_users")) return json({ error: "Sosyal medya sorumlusu atama yetkiniz bulunmuyor." }, 403);
    const userId = Number(body.userId), staffName = String(body.staffName || "").trim().slice(0,180), category = ["president","municipality","both"].includes(body.category) ? body.category : "both";
    if (staffName) {
      const staff = await env.DB.prepare("SELECT name FROM media_staff WHERE active=1 AND name=?").bind(staffName).first();
      if (!staff) return json({ error: "Aktif medya personeli bulunamadı." }, 404);
      await env.DB.prepare("DELETE FROM social_staff_responsibilities WHERE staff_name=?").bind(staffName).run();
      await env.DB.prepare("INSERT INTO social_staff_responsibilities (staff_name,account_category,assigned_by) VALUES (?,?,?)").bind(staffName,category,user.id).run();
      await audit(env, request, user.id, "social_responsible_assigned", "media_staff", staffName, { category });
      return json({ ok: true });
    }
    const target = await env.DB.prepare("SELECT id FROM users WHERE id=? AND status='active'").bind(userId).first();
    if (!target) return json({ error: "Aktif kullanıcı bulunamadı." }, 404);
    await env.DB.prepare("DELETE FROM social_responsibilities WHERE user_id=?").bind(userId).run();
    await env.DB.prepare("INSERT INTO social_responsibilities (user_id,account_category,assigned_by) VALUES (?,?,?)").bind(userId,category,user.id).run();
    await env.DB.prepare("UPDATE users SET role='bio_social_media',department_scope=NULL WHERE id=? AND role='standard_user'").bind(userId).run();
    await audit(env, request, user.id, "social_responsible_assigned", "user", userId, { category });
    return json({ ok: true });
  }
  if (action === "delete_account") {
    if (!isAdminRole(user.role)) return json({ error: "Hesap silme yalnızca yönetici tarafından yapılabilir." }, 403);
    const accountId = Number(body.accountId);
    if (!Number.isInteger(accountId)) return json({ error: "Geçersiz hesap kaydı." }, 400);
    const account = await env.DB.prepare("SELECT platform,account_name FROM social_accounts WHERE id=?").bind(accountId).first();
    if (!account) return json({ error: "Sosyal medya hesabı bulunamadı." }, 404);
    await env.DB.prepare("DELETE FROM social_accounts WHERE id=?").bind(accountId).run();
    await audit(env, request, user.id, "social_account_deleted", "social_account", accountId, account);
    return json({ ok: true });
  }
  if (action === "review") {
    if (!hasPermission(user, "approve_metadata")) return json({ error: "Paylaşım onayı yalnızca sistem yöneticisi veya arşiv birimi sorumlusu tarafından verilebilir." }, 403);
    const postId = Number(body.postId), decision = String(body.decision || ""), note = String(body.note || "").trim().slice(0,1000);
    if (!Number.isInteger(postId) || !["approve","reject","edit"].includes(decision)) return json({ error: "Geçersiz onay işlemi." }, 400);
    const post = await env.DB.prepare("SELECT * FROM social_posts WHERE id=?").bind(postId).first();
    if (!post) return json({ error: "Paylaşım kaydı bulunamadı." }, 404);
    if (decision === "edit") {
      const caption = String(body.caption || "").trim().slice(0,5000);
      if (!caption) return json({ error: "Paylaşım metni boş bırakılamaz." }, 400);
      await env.DB.prepare("UPDATE social_posts SET caption=?,review_status='pending',reviewer_note=?,reviewed_by=NULL,reviewed_at=NULL WHERE id=?").bind(caption,note || null,postId).run();
      await audit(env, request, user.id, "social_post_edited", "social_post", postId);
      return json({ ok: true, reviewStatus: "pending" });
    }
    const reviewStatus = decision === "approve" ? "approved" : "rejected";
    const publishStatus = decision === "approve" ? "ready" : "draft";
    await env.DB.prepare("UPDATE social_posts SET review_status=?,reviewer_note=?,reviewed_by=?,reviewed_at=datetime('now'),status=? WHERE id=?")
      .bind(reviewStatus,note || null,user.id,publishStatus,postId).run();
    await audit(env, request, user.id, decision === "approve" ? "social_post_approved" : "social_post_rejected", "social_post", postId, { note });
    return json({ ok: true, reviewStatus, status: publishStatus });
  }
  if (action === "manual_complete") {
    const postId = Number(body.postId);
    if (!Number.isInteger(postId)) return json({ error: "Geçersiz paylaşım kaydı." }, 400);
    const post = await env.DB.prepare("SELECT id,review_status,status FROM social_posts WHERE id=?").bind(postId).first();
    if (!post) return json({ error: "Paylaşım kaydı bulunamadı." }, 404);
    if (post.review_status !== "approved") return json({ error: "Yalnızca yönetici tarafından onaylanan içerik paylaşıldı olarak işaretlenebilir." }, 409);
    await env.DB.prepare("UPDATE social_posts SET status='published' WHERE id=?").bind(postId).run();
    await audit(env, request, user.id, "social_post_manually_published", "social_post", postId, { method: "metricool_manual" });
    return json({ ok: true, status: "published" });
  }
  if (action === "queue") {
    const category = ["president","municipality"].includes(body.category) ? body.category : "municipality";
    const caption = String(body.caption || "").trim().slice(0,5000);
    const assetIds = [...new Set((Array.isArray(body.assetIds) ? body.assetIds : []).map(Number).filter(Number.isInteger))].slice(0,50);
    const accountIds = [...new Set((Array.isArray(body.accountIds) ? body.accountIds : []).map(Number).filter(Number.isInteger))].slice(0,20);
    if (!caption || !assetIds.length) return json({ error: "Paylaşım metni ve en az bir medya seçimi zorunludur." }, 400);
    const status = "draft";
    const result = await env.DB.prepare("INSERT INTO social_posts (account_category,caption,asset_ids_json,account_ids_json,scheduled_at,status,created_by) VALUES (?,?,?,?,?,?,?)")
      .bind(category,caption,JSON.stringify(assetIds),JSON.stringify(accountIds),body.scheduledAt || null,status,user.id).run();
    await audit(env, request, user.id, "social_post_queued", "social_post", result.meta.last_row_id, { category, assetCount: assetIds.length, status });
    return json({ ok: true, id: result.meta.last_row_id, status }, 201);
  }
  return json({ error: "Geçersiz sosyal medya işlemi." }, 400);
}

async function createDisposalRequest(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "open_disposal")) return json({ error: "Bu işlem için yetkiniz bulunmuyor." }, 403);
  const body = await request.json().catch(() => ({}));
  const documentId = String(body.documentId || "").trim();
  const reason = String(body.reason || "").trim();
  if (!documentId || !reason) return json({ error: "Belge ve gerekçe zorunludur." }, 400);
  const result = await env.DB.prepare("INSERT INTO disposal_requests (document_id, reason, requested_by) VALUES (?, ?, ?)").bind(documentId, reason, user.id).run();
  await audit(env, request, user.id, "disposal_requested", "document", documentId, { requestId: result.meta.last_row_id, reason });
  return json({ ok: true, id: result.meta.last_row_id, status: "pending" }, 201);
}

async function approveDisposal(request, env, id) {
  const user = await currentUser(request, env);
  const item = await env.DB.prepare("SELECT * FROM disposal_requests WHERE id = ?").bind(id).first();
  if (!item || item.status !== "pending") return json({ error: "Bekleyen tasfiye talebi bulunamadı." }, 404);
  if (Number(item.requested_by) === Number(user?.id)) return json({ error: "Talebi açan kişi kendi talebini onaylayamaz." }, 403);
  if (user?.role === "archive_manager" && !item.archive_manager_approved_by) {
    await env.DB.prepare("UPDATE disposal_requests SET archive_manager_approved_by = ? WHERE id = ?").bind(user.id, id).run();
    await audit(env, request, user.id, "disposal_first_approval", "disposal_request", id);
    return json({ ok: true, status: "awaiting_second_approval" });
  }
  if (!["department_manager", "auditor", "super_admin", "admin"].includes(user?.role) || !item.archive_manager_approved_by || Number(item.archive_manager_approved_by) === Number(user.id)) return json({ error: "İkinci onay için Arşiv Müdürü onayı ve farklı bir yetkili gerekir." }, 403);
  await env.DB.prepare("UPDATE disposal_requests SET second_approved_by = ?, status = 'approved' WHERE id = ?").bind(user.id, id).run();
  await audit(env, request, user.id, "disposal_second_approval", "disposal_request", id);
  return json({ ok: true, status: "approved", softDeleteOnly: true });
}

const FACILITY_CATEGORIES = new Set(["social", "sports", "park", "service", "culture", "other"]);
async function facilityRecords(request, env, id = null, content = false) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Oturum bulunamadı." }, 401);
  if (request.method === "GET" && content && id) {
    const record = await env.DB.prepare("SELECT image_r2_key,image_content_type,name FROM facility_records WHERE id=?").bind(id).first();
    if (!record?.image_r2_key) return json({ error: "Görsel bulunamadı." }, 404);
    const object = await env.BUCKET.get(record.image_r2_key);
    if (!object) return json({ error: "Görsel depoda bulunamadı." }, 404);
    return new Response(object.body, { headers: { "content-type": record.image_content_type || "image/jpeg", "cache-control": "private, max-age=300", "x-content-type-options": "nosniff" } });
  }
  if (request.method === "GET") {
    const result = await env.DB.prepare(`SELECT f.id,f.category,f.name,f.address,f.description,f.year,f.image_r2_key,f.created_at,
      trim(coalesce(u.name,'') || ' ' || coalesce(u.surname,'')) created_by_name
      FROM facility_records f LEFT JOIN users u ON u.id=f.created_by ORDER BY f.category,f.name`).all();
    return json({ records: result.results || [] });
  }
  if (!isAdminRole(user.role) && !hasPermission(user, "add_document")) return json({ error: "Yeni tesis veya alan kaydı ekleme yetkiniz bulunmuyor." }, 403);
  if (request.method === "POST") {
    const form = await request.formData().catch(() => null);
    if (!form) return json({ error: "Form verisi alınamadı." }, 400);
    const category = FACILITY_CATEGORIES.has(String(form.get("category"))) ? String(form.get("category")) : "other";
    const name = String(form.get("name") || "").trim().slice(0, 200);
    const address = String(form.get("address") || "").trim().slice(0, 500);
    const description = String(form.get("description") || "").trim().slice(0, 3000);
    const yearValue = Number(form.get("year"));
    const year = Number.isInteger(yearValue) && yearValue >= 1800 && yearValue <= 2100 ? yearValue : null;
    if (!name) return json({ error: "Yerin adı zorunludur." }, 400);
    const image = form.get("image");
    let imageKey = null, imageType = null;
    if (image && typeof image === "object" && Number(image.size) > 0) {
      if (Number(image.size) > 25 * 1024 * 1024 || !String(image.type || "").startsWith("image/")) return json({ error: "Görsel JPEG, PNG veya WebP biçiminde ve en fazla 25 MB olmalıdır." }, 415);
      imageType = String(image.type).slice(0, 100);
      imageKey = `facility-records/${crypto.randomUUID()}-${safeFileName(image.name || "gorsel")}`;
      await env.BUCKET.put(imageKey, await image.arrayBuffer(), { httpMetadata: { contentType: imageType } });
    }
    const result = await env.DB.prepare("INSERT INTO facility_records (category,name,address,description,year,image_r2_key,image_content_type,created_by) VALUES (?,?,?,?,?,?,?,?)")
      .bind(category,name,address,description,year,imageKey,imageType,user.id).run();
    await audit(env, request, user.id, "facility_record_added", "facility", result.meta.last_row_id, { category, name });
    return json({ ok: true, id: result.meta.last_row_id }, 201);
  }
  if (request.method === "DELETE" && id) {
    if (!hasPermission(user, "delete_asset")) return json({ error: "Tesis veya alan kaydı silme yetkiniz bulunmuyor." }, 403);
    const record = await env.DB.prepare("SELECT id,name,image_r2_key FROM facility_records WHERE id=?").bind(id).first();
    if (!record) return json({ error: "Kayıt bulunamadı." }, 404);
    if (record.image_r2_key) await env.BUCKET.delete(record.image_r2_key);
    await env.DB.prepare("DELETE FROM facility_records WHERE id=?").bind(id).run();
    await audit(env, request, user.id, "facility_record_deleted", "facility", id, { name: record.name });
    return json({ ok: true });
  }
  return json({ error: "Geçersiz tesis işlemi." }, 400);
}

async function auditLogFeed(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "audit")) return json({ error: "İşlem kayıtlarını görüntüleme yetkiniz bulunmuyor." }, 403);
  const url = new URL(request.url), action = String(url.searchParams.get("action") || "").trim(), date = String(url.searchParams.get("date") || "").trim();
  let sql = `SELECT a.id,a.action,a.target_type,a.target_id,a.details_json,a.ip_address,a.created_at,
    trim(coalesce(u.name,'') || ' ' || coalesce(u.surname,'')) user_name,u.email
    FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id WHERE a.created_at >= '2026-09-14 09:50:00'`;
  const values = [];
  if (action) { sql += " AND a.action=?"; values.push(action); }
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) { sql += " AND date(a.created_at)=?"; values.push(date); }
  sql += " ORDER BY a.created_at DESC LIMIT 1000";
  const statement = env.DB.prepare(sql);
  const result = values.length ? await statement.bind(...values).all() : await statement.all();
  return json({ logs: result.results || [], retainedFrom: "2026-09-14T09:50:00Z" });
}

async function mediaStaff(request, env, id = null) {
  const user = await currentUser(request, env);
  if (!user) return json({ error: "Oturum bulunamadı." }, 401);
  if (request.method === "GET") {
    const [custom, registered] = await Promise.all([
      env.DB.prepare("SELECT id,name,duty,'custom' source FROM media_staff WHERE active=1 ORDER BY duty,name").all(),
      env.DB.prepare(`SELECT id, trim(name || ' ' || surname) name, coalesce(nullif(trim(job_title),''),'Medya personeli') duty, 'registered' source
        FROM users WHERE status='active' AND (
          lower(job_title) LIKE '%fotoğraf%' OR lower(job_title) LIKE '%kameraman%' OR lower(job_title) LIKE '%muhabir%' OR lower(job_title) LIKE '%grafik%'
          OR lower(job_description) LIKE '%fotoğraf%' OR lower(job_description) LIKE '%kamera%' OR lower(job_description) LIKE '%muhabir%' OR lower(job_description) LIKE '%grafik%'
        ) ORDER BY name,surname`).all(),
    ]);
    const combined = [...DEFAULT_MEDIA_STAFF.map((item, index) => ({ id: `default-${index + 1}`, ...item, source: "default" })), ...(registered.results || []), ...(custom.results || [])];
    const unique = [...new Map(combined.map(item => [String(item.name).trim().toLocaleLowerCase("tr-TR"), item])).values()];
    return json({ staff: unique });
  }
  if (!hasPermission(user, "manage_users")) return json({ error: "Medya personeli yönetme yetkiniz bulunmuyor." }, 403);
  if (request.method === "POST") {
    const body = await request.json().catch(() => ({}));
    const name = String(body.name || "").trim().slice(0, 180);
    const duty = String(body.duty || "").trim().slice(0, 120);
    if (!name || !duty) return json({ error: "Ad soyad ve görev zorunludur." }, 400);
    const result = await env.DB.prepare("INSERT INTO media_staff (name,duty,created_by) VALUES (?,?,?)").bind(name,duty,user.id).run();
    await audit(env, request, user.id, "media_staff_added", "media_staff", result.meta.last_row_id, { name, duty });
    return json({ ok: true, id: result.meta.last_row_id }, 201);
  }
  if (request.method === "DELETE" && id) {
    const item = await env.DB.prepare("SELECT id,name FROM media_staff WHERE id=?").bind(id).first();
    if (!item) return json({ error: "Personel kaydı bulunamadı." }, 404);
    await env.DB.prepare("UPDATE media_staff SET active=0 WHERE id=?").bind(id).run();
    await audit(env, request, user.id, "media_staff_removed", "media_staff", id, { name: item.name });
    return json({ ok: true });
  }
  return json({ error: "Geçersiz personel işlemi." }, 400);
}

async function activityReport(request, env) {
  const user = await currentUser(request, env);
  if (!hasPermission(user, "view_reports")) return json({ error: "Faaliyet raporlarını görüntüleme yetkiniz bulunmuyor." }, 403);
  const url = new URL(request.url);
  const requestedYear = Number(url.searchParams.get("year"));
  const year = Number.isInteger(requestedYear) && requestedYear >= 2019 && requestedYear <= 2100 ? requestedYear : new Date().getUTCFullYear();
  const from = `${year}-01-01`, to = `${year + 1}-01-01`;
  const [summary, departments, personnel, monthly, daily, weekly] = await Promise.all([
    env.DB.prepare(`SELECT count(*) total,
      sum(CASE WHEN media_type='photo' THEN 1 ELSE 0 END) photos,
      sum(CASE WHEN media_type='video' THEN 1 ELSE 0 END) videos,
      sum(CASE WHEN media_type='graphic' THEN 1 ELSE 0 END) graphics,
      sum(CASE WHEN media_type='news' THEN 1 ELSE 0 END) bulletins
      FROM assets WHERE event_date>=? AND event_date<?`).bind(from,to).first(),
    env.DB.prepare(`SELECT department, count(*) total,
      sum(CASE WHEN media_type='photo' THEN 1 ELSE 0 END) photos,
      sum(CASE WHEN media_type='video' THEN 1 ELSE 0 END) videos,
      sum(CASE WHEN media_type='graphic' THEN 1 ELSE 0 END) graphics,
      sum(CASE WHEN media_type='news' THEN 1 ELSE 0 END) bulletins
      FROM assets WHERE event_date>=? AND event_date<? GROUP BY department ORDER BY total DESC, department`).bind(from,to).all(),
    env.DB.prepare(`SELECT coalesce(nullif(trim(a.photographer),''), trim(coalesce(u.name,'') || ' ' || coalesce(u.surname,'')), 'Belirtilmemiş') personnel, count(*) total,
      sum(CASE WHEN a.media_type='photo' THEN 1 ELSE 0 END) photos,
      sum(CASE WHEN a.media_type='video' THEN 1 ELSE 0 END) videos,
      sum(CASE WHEN a.media_type='graphic' THEN 1 ELSE 0 END) graphics,
      sum(CASE WHEN a.media_type='news' THEN 1 ELSE 0 END) bulletins
      FROM assets a LEFT JOIN users u ON u.id=a.uploaded_by WHERE a.event_date>=? AND a.event_date<? GROUP BY personnel ORDER BY total DESC, personnel`).bind(from,to).all(),
    env.DB.prepare(`SELECT substr(event_date,1,7) period, count(*) total FROM assets WHERE event_date>=? AND event_date<? GROUP BY period ORDER BY period`).bind(from,to).all(),
    env.DB.prepare(`SELECT event_date period, count(*) total FROM assets WHERE event_date>=? AND event_date<? GROUP BY period ORDER BY period DESC LIMIT 366`).bind(from,to).all(),
    env.DB.prepare(`SELECT strftime('%Y-W%W',event_date) period, count(*) total FROM assets WHERE event_date>=? AND event_date<? GROUP BY period ORDER BY period`).bind(from,to).all(),
  ]);
  await audit(env, request, user.id, "activity_report_viewed", "report", String(year));
  return json({ year, generatedAt: new Date().toISOString(), summary: summary || {}, departments: departments.results || [], personnel: personnel.results || [], monthly: monthly.results || [], weekly: weekly.results || [], daily: daily.results || [], departmentCatalog: DEPARTMENTS });
}

async function api(request, env, path, ctx) {
  if (request.method === "POST" && path === "/api/register") return register(request, env);
  if (request.method === "POST" && path === "/api/login") return login(request, env, "member");
  if (request.method === "POST" && path === "/api/admin/login") return login(request, env, "admin");
  if (request.method === "GET" && path === "/api/me") {
    const token = parseCookie(request, "arsiv_session");
    const user = await currentUser(request, env);
    if (!user || !token) return json({ error: "Oturum bulunamadı." }, 401);
    const definition = roleDefinition(user.role);
    const tckn = env.WATERMARK_SECRET ? await decryptTckn(user.tc_identity_cipher, user.tc_identity_iv, env.WATERMARK_SECRET) : "***********";
    const sessionUser = {
      email: user.email,
      name: user.name,
      surname: user.surname,
      department: user.department,
      departmentScope: user.department_scope || user.department,
      role: isAdminRole(user.role) ? "super_admin" : user.role,
      roleName: definition?.name || user.role,
      permissions: definition?.permissions || [],
      watermark: `${tckn} - ${user.name} ${user.surname}`,
    };
    return json({ user: sessionUser }, 200, {
      "set-cookie": `arsiv_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    });
  }
  if (request.method === "POST" && path === "/api/session/refresh") {
    const token = parseCookie(request, "arsiv_session");
    const user = await currentUser(request, env);
    if (!token || !user) return json({ error: "Oturum bulunamadı." }, 401);
    return json({ ok: true }, 200, {
      "set-cookie": `arsiv_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_MAX_AGE_SECONDS}`,
    });
  }
  if ((request.method === "GET" || request.method === "PUT") && path === "/api/profile") return profile(request, env);
  if (request.method === "GET" && path === "/api/uploads/status") return uploadStatus(request, env);
  if (request.method === "POST" && path === "/api/uploads/start") return startUpload(request, env);
  const uploadPartMatch = path.match(/^\/api\/uploads\/([0-9a-f-]+)\/parts\/(\d+)$/i);
  if (request.method === "PUT" && uploadPartMatch) return uploadPart(request, env, uploadPartMatch[1], uploadPartMatch[2]);
  const uploadCompleteMatch = path.match(/^\/api\/uploads\/([0-9a-f-]+)\/complete$/i);
  if (request.method === "POST" && uploadCompleteMatch) return completeUpload(request, env, uploadCompleteMatch[1], ctx);
  if (request.method === "GET" && path === "/api/assets") return listAssets(request, env);
  if ((request.method === "GET" || request.method === "POST") && path === "/api/social-workspace") return socialWorkspace(request, env);
  const assetContentMatch = path.match(/^\/api\/assets\/(\d+)\/content$/);
  if (request.method === "GET" && assetContentMatch) return assetContent(request, env, Number(assetContentMatch[1]));
  const assetAnalyzeMatch = path.match(/^\/api\/assets\/(\d+)\/analyze$/);
  if (request.method === "POST" && assetAnalyzeMatch) return retryAssetAnalysis(request, env, Number(assetAnalyzeMatch[1]));
  const assetReviewMatch = path.match(/^\/api\/assets\/(\d+)\/review$/);
  if (request.method === "PUT" && assetReviewMatch) return updateAssetReview(request, env, Number(assetReviewMatch[1]));
  const assetDeleteMatch = path.match(/^\/api\/assets\/(\d+)$/);
  if (request.method === "DELETE" && assetDeleteMatch) return deleteAsset(request, env, Number(assetDeleteMatch[1]));
  if (request.method === "POST" && path === "/api/assets/reset") return resetMediaArchive(request, env);
  if ((request.method === "GET" || request.method === "POST") && path === "/api/news") return newsPortal(request, env);
  if (request.method === "GET" && path === "/api/reports/activity") return activityReport(request, env);
  if (request.method === "GET" && path === "/api/audit-logs") return auditLogFeed(request, env);
  if ((request.method === "GET" || request.method === "POST") && path === "/api/facilities") return facilityRecords(request, env);
  const facilityContentMatch = path.match(/^\/api\/facilities\/(\d+)\/content$/);
  if (request.method === "GET" && facilityContentMatch) return facilityRecords(request, env, Number(facilityContentMatch[1]), true);
  const facilityMatch = path.match(/^\/api\/facilities\/(\d+)$/);
  if (request.method === "DELETE" && facilityMatch) return facilityRecords(request, env, Number(facilityMatch[1]));
  if ((request.method === "GET" || request.method === "POST") && path === "/api/media-staff") return mediaStaff(request, env);
  const mediaStaffMatch = path.match(/^\/api\/media-staff\/(\d+)$/);
  if (request.method === "DELETE" && mediaStaffMatch) return mediaStaff(request, env, Number(mediaStaffMatch[1]));
  if (request.method === "GET" && path === "/api/users") return listUsers(request, env);
  if (request.method === "GET" && path === "/api/roles") {
    const user = await currentUser(request, env);
    if (!hasPermission(user, "manage_users") && !hasPermission(user, "manage_department_users")) return json({ error: "Yetkisiz işlem." }, 403);
    const roles = user.role === "department_manager"
      ? { standard_user: ROLE_DEFINITIONS.standard_user }
      : user.role === "archive_manager"
        ? Object.fromEntries(Object.entries(ROLE_DEFINITIONS).filter(([key]) => !["super_admin","archive_manager"].includes(key)))
        : ROLE_DEFINITIONS;
    return json({ roles, permissionGroups: PERMISSION_GROUPS, departments: DEPARTMENTS });
  }
  const approveMatch = path.match(/^\/api\/users\/(\d+)\/approve$/);
  if (request.method === "POST" && approveMatch) return approveUser(request, env, Number(approveMatch[1]));
  const roleMatch = path.match(/^\/api\/users\/(\d+)\/role$/);
  if (request.method === "PUT" && roleMatch) return updateUserRole(request, env, Number(roleMatch[1]));
  if (request.method === "POST" && path === "/api/disposal-requests") return createDisposalRequest(request, env);
  const disposalApproveMatch = path.match(/^\/api\/disposal-requests\/(\d+)\/approve$/);
  if (request.method === "POST" && disposalApproveMatch) return approveDisposal(request, env, Number(disposalApproveMatch[1]));
  if (request.method === "POST" && path === "/api/audit-event") {
    const user = await currentUser(request, env);
    if (!user) return json({ error: "Oturum bulunamadı." }, 401);
    const body = await request.json().catch(() => ({}));
    if (!["search", "view", "download", "print", "page_open"].includes(body.action)) return json({ error: "Geçersiz işlem." }, 400);
    await audit(env, request, user.id, body.action, body.targetType || "archive", body.targetId || null);
    return json({ ok: true });
  }
  if (request.method === "POST" && path === "/api/logout") {
    const token = parseCookie(request, "arsiv_session");
    if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "set-cookie": "arsiv_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0" });
  }
  return json({ error: "Bulunamadı." }, 404);
}

export default {
  async fetch(request, env, ctx) {
    const path = new URL(request.url).pathname;
    try {
      if (path.startsWith("/api/")) return await api(request, env, path, ctx);
      if (path === "/besiktas-belediyesi-logo.png") return new Response(LOGO_BYTES, { headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" } });
      if (path === "/turk-bayragi.png") return new Response(FLAG_BYTES, { headers: { "content-type": "image/png", "cache-control": "public, max-age=86400" } });
      if (path === "/ortakoy.jpg") return new Response(ORTAKOY_BYTES, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } });
      if (path === "/dolmabahce.jpg") return new Response(DOLMABAHCE_BYTES, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } });
      if (path === "/kartal.jpg") return new Response(KARTAL_BYTES, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } });
      if (path.startsWith("/reference-people/")) {
        const name = decodeURIComponent(path.slice("/reference-people/".length));
        const bytes = REFERENCE_IMAGES[name];
        return bytes ? new Response(bytes, { headers: { "content-type": "image/jpeg", "cache-control": "private, max-age=3600", "x-content-type-options": "nosniff" } }) : new Response("Not found", { status: 404 });
      }
      if (path !== "/") return new Response("Not found", { status: 404 });
      return new Response(PAGE, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store, no-cache, must-revalidate", "pragma": "no-cache", "expires": "0" } });
    } catch (error) {
      console.error(error);
      return path.startsWith("/api/") ? json({ error: "Sistem geçici olarak kullanılamıyor." }, 500) : new Response("Sistem geçici olarak kullanılamıyor.", { status: 500 });
    }
  },
};
