#!/bin/bash
# PestSense Academy LMS Regression Tests
# Run from host: bash tests/regression.sh

BASE="http://192.168.1.157:3000"
PASS=0
FAIL=0
WARN=0

# ─── Helpers ──────────────────────────────────────────────────────────────────

pass() { echo "  ✓ $1"; PASS=$((PASS+1)); }
fail() { echo "  ✗ FAIL: $1"; FAIL=$((FAIL+1)); }
warn() { echo "  ⚠ WARN: $1"; WARN=$((WARN+1)); }
section() { echo ""; echo "── $1 ──────────────────────────────────────"; }

# Authenticate against NextAuth and return a cookie jar path
get_session() {
  local email="$1" password="$2"
  local jar csrf
  jar=$(mktemp)
  csrf=$(curl -s -c "$jar" "$BASE/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null)
  curl -s -b "$jar" -c "$jar" -L \
    -X POST "$BASE/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=${email}&password=${password}&csrfToken=${csrf}&callbackUrl=${BASE}/dashboard&json=true" \
    -o /dev/null
  echo "$jar"
}

auth_get()      { curl -s -b "$1" -o /dev/null -w "%{http_code}" "$BASE$2"; }
auth_get_body() { curl -s -b "$1" "$BASE$2"; }
auth_post_body() {
  curl -s -b "$1" -c "$1" \
    -X POST "$BASE$2" \
    -H "Content-Type: application/json" \
    -d "$3"
}
unauth_get()  { curl -s -o /dev/null -w "%{http_code}" "$BASE$1"; }
unauth_post() { curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE$1" -H "Content-Type: application/json" -d "$2"; }

db() { docker exec pestsense_db psql -U pestsense -d pestsense_academy -tAc "$1" 2>/dev/null | tr -d '[:space:]'; }

echo "═══════════════════════════════════════════════════════"
echo "  PestSense Academy LMS — Regression Test Suite"
echo "  Target: $BASE"
echo "  Date: $(date)"
echo "═══════════════════════════════════════════════════════"

# ─── 1. Server Health ─────────────────────────────────────────────────────────
section "1. Server Health"

code=$(unauth_get "/")
[ "$code" = "307" ] && pass "Root / redirects unauthenticated users (307)" || fail "Root / returned $code (expected 307)"

code=$(unauth_get "/login")
[ "$code" = "200" ] && pass "Login page returns 200" || fail "Login page returned $code"

code=$(unauth_get "/api/auth/csrf")
[ "$code" = "200" ] && pass "CSRF endpoint returns 200" || fail "CSRF endpoint returned $code"

code=$(unauth_get "/api/auth/providers")
[ "$code" = "200" ] && pass "Auth providers endpoint returns 200" || fail "Auth providers returned $code"

# ─── 2. Authentication ────────────────────────────────────────────────────────
section "2. Authentication"

# Bad credentials should redirect back with error
bad_jar=$(mktemp)
bad_csrf=$(curl -s -c "$bad_jar" "$BASE/api/auth/csrf" | python3 -c "import sys,json; print(json.load(sys.stdin)['csrfToken'])" 2>/dev/null)
bad_result=$(curl -s -b "$bad_jar" -c "$bad_jar" -L \
  -X POST "$BASE/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=wrong@test.com&password=wrongpass&csrfToken=${bad_csrf}&callbackUrl=${BASE}/dashboard&json=true" \
  -w "\n%{http_code}")
bad_code=$(echo "$bad_result" | tail -1)
grep -q "session-token" "$bad_jar" && fail "Bad credentials set a session cookie (security issue!)" || pass "Bad credentials did not set a session cookie"
rm -f "$bad_jar"

# Get authenticated sessions for all roles
ADMIN_JAR=$(get_session "admin@example.internal" "ChangeMe123!")
MANAGER_JAR=$(get_session "manager@pestsense.com" "Manager1234!")
TECH_JAR=$(get_session "tech@pestsense.com" "Tech1234!")

# Verify each session has a cookie
grep -q "session-token" "$ADMIN_JAR"  && pass "Admin session cookie obtained"  || fail "Admin login failed — no session cookie"
grep -q "session-token" "$MANAGER_JAR" && pass "Manager session cookie obtained" || fail "Manager login failed — no session cookie"
grep -q "session-token" "$TECH_JAR"  && pass "Technician session cookie obtained" || fail "Technician login failed — no session cookie"

# Verify sessions actually work
code=$(auth_get "$ADMIN_JAR" "/dashboard"); [ "$code" = "200" ] && pass "Admin can reach /dashboard" || fail "Admin /dashboard → $code"
code=$(auth_get "$MANAGER_JAR" "/dashboard"); [ "$code" = "200" ] && pass "Manager can reach /dashboard" || fail "Manager /dashboard → $code"
code=$(auth_get "$TECH_JAR" "/dashboard"); [ "$code" = "200" ] && pass "Technician can reach /dashboard" || fail "Technician /dashboard → $code"

# ─── 3. Unauthenticated Redirect Guard ───────────────────────────────────────
section "3. Unauthenticated Access Blocking"

for path in "/dashboard" "/learn" "/admin" "/admin/users" "/admin/analytics" "/manager"; do
  code=$(unauth_get "$path")
  [ "$code" = "307" ] || [ "$code" = "302" ] \
    && pass "Unauthenticated $path redirects ($code)" \
    || fail "Unauthenticated $path returned $code (expected redirect)"
done

# /lessons without ID should 404 (no session needed since notFound fires before auth in page)
code=$(unauth_get "/lessons/nonexistentid")
[ "$code" = "307" ] || [ "$code" = "302" ] || [ "$code" = "404" ] \
  && pass "Unauthenticated /lessons/fake → $code (acceptable)" \
  || fail "/lessons/fake returned $code"

# ─── 4. Role-Based Access Control ────────────────────────────────────────────
section "4. Role-Based Access Control"

# Technician blocked from admin + manager
for path in "/admin" "/admin/users" "/admin/analytics" "/admin/content" "/admin/requirements" "/manager"; do
  code=$(auth_get "$TECH_JAR" "$path")
  [ "$code" = "307" ] || [ "$code" = "302" ] \
    && pass "Technician blocked from $path" \
    || fail "Technician accessed $path (got $code)"
done

# Manager can reach /manager but NOT /admin
code=$(auth_get "$MANAGER_JAR" "/manager"); [ "$code" = "200" ] && pass "Manager can access /manager" || fail "Manager /manager → $code"
code=$(auth_get "$MANAGER_JAR" "/admin"); [ "$code" = "307" ] || [ "$code" = "302" ] && pass "Manager blocked from /admin" || fail "Manager accessed /admin (got $code)"
code=$(auth_get "$MANAGER_JAR" "/admin/users"); [ "$code" = "307" ] || [ "$code" = "302" ] && pass "Manager blocked from /admin/users" || fail "Manager accessed /admin/users (got $code)"

# Admin can reach everything
for path in "/admin" "/admin/users" "/admin/analytics" "/admin/content" "/admin/requirements" "/manager"; do
  code=$(auth_get "$ADMIN_JAR" "$path")
  [ "$code" = "200" ] && pass "Admin can access $path" || fail "Admin blocked from $path (got $code)"
done

# ─── 5. API Route Authentication ─────────────────────────────────────────────
section "5. API Route Authentication"

# All these should return 401 without a session
for path in "/api/progress" "/api/progress/video" "/api/analytics/login-event"; do
  code=$(unauth_post "$path" '{}')
  [ "$code" = "401" ] && pass "Unauthenticated POST $path → 401" || fail "Unauthenticated POST $path → $code (expected 401)"
done

# Admin-only API returns 403 for non-admin (not 401 since they are authenticated)
code=$(curl -s -o /dev/null -w "%{http_code}" -b "$TECH_JAR" \
  -X POST "$BASE/api/admin/users" -H "Content-Type: application/json" \
  -d '{"name":"hack","email":"h@h.com","password":"pass","role":"TECHNICIAN"}')
[ "$code" = "403" ] && pass "Technician POST /api/admin/users → 403 (correct)" || fail "Technician /api/admin/users → $code (expected 403)"

# Admin can GET users
code=$(curl -s -o /dev/null -w "%{http_code}" -b "$ADMIN_JAR" "$BASE/api/admin/users")
[ "$code" = "200" ] && pass "Admin GET /api/admin/users → 200" || fail "Admin GET /api/admin/users → $code"

# ─── 6. Content Pages ────────────────────────────────────────────────────────
section "6. Content Page Access"

LESSON_ID=$(db "SELECT id FROM \"Lesson\" WHERE status='PUBLISHED' LIMIT 1;")
COURSE_SLUG=$(db "SELECT c.slug FROM \"Course\" c JOIN \"Category\" cat ON c.\"categoryId\"=cat.id WHERE c.status='PUBLISHED' LIMIT 1;")
CATEGORY_SLUG=$(db "SELECT cat.slug FROM \"Course\" c JOIN \"Category\" cat ON c.\"categoryId\"=cat.id WHERE c.status='PUBLISHED' LIMIT 1;")

if [ -n "$LESSON_ID" ]; then
  code=$(auth_get "$TECH_JAR" "/lessons/$LESSON_ID")
  [ "$code" = "200" ] && pass "Technician can view published lesson" || fail "Technician lesson → $code"

  code=$(auth_get "$ADMIN_JAR" "/lessons/$LESSON_ID")
  [ "$code" = "200" ] && pass "Admin can view published lesson" || fail "Admin lesson → $code"

  code=$(auth_get "$TECH_JAR" "/lessons/$LESSON_ID/print")
  [ "$code" = "200" ] && pass "Print view renders for lesson" || fail "Lesson print view → $code"
else
  warn "No published lessons found — skipping content tests"
fi

code=$(auth_get "$TECH_JAR" "/lessons/this-id-does-not-exist-at-all")
[ "$code" = "404" ] && pass "Non-existent lesson returns 404" || fail "Non-existent lesson → $code (expected 404)"

code=$(auth_get "$TECH_JAR" "/learn")
[ "$code" = "200" ] && pass "Technician can access /learn" || fail "/learn → $code"

if [ -n "$CATEGORY_SLUG" ] && [ -n "$COURSE_SLUG" ]; then
  code=$(auth_get "$TECH_JAR" "/learn/$CATEGORY_SLUG/$COURSE_SLUG")
  [ "$code" = "200" ] && pass "Course detail page renders" || fail "Course detail → $code"
fi

# ─── 7. Progress Tracking API ─────────────────────────────────────────────────
section "7. Progress Tracking"

if [ -n "$LESSON_ID" ]; then
  # Mark lesson as complete via API
  # Note: progress API returns {progress: {...}} on success, {error: "..."} on failure
  result=$(auth_post_body "$TECH_JAR" "/api/progress" "{\"lessonId\":\"$LESSON_ID\",\"completed\":true}")
  echo "$result" | grep -q '"progress"' \
    && pass "POST /api/progress returns progress object" \
    || fail "POST /api/progress returned: $result"

  sleep 1
  # Verify DB record
  comp=$(db "SELECT completed FROM \"LessonProgress\" WHERE \"lessonId\"='$LESSON_ID' AND completed=true LIMIT 1;")
  [ "$comp" = "t" ] && pass "LessonProgress.completed=true persisted to DB" || fail "LessonProgress not found in DB (got: '$comp')"

  started=$(db "SELECT started FROM \"LessonProgress\" WHERE \"lessonId\"='$LESSON_ID' LIMIT 1;")
  [ "$started" = "t" ] && pass "LessonProgress.started=true when completed" || fail "LessonProgress.started not set"

  # Video progress — 80% should auto-mark complete
  result=$(auth_post_body "$TECH_JAR" "/api/progress/video" \
    "{\"lessonId\":\"$LESSON_ID\",\"currentTime\":720,\"duration\":900,\"completed\":false}")
  echo "$result" | grep -q '"ok":true' \
    && pass "POST /api/progress/video → ok:true" \
    || fail "POST /api/progress/video returned: $result"

  sleep 1
  vp_comp=$(db "SELECT completed FROM \"VideoProgress\" WHERE \"lessonId\"='$LESSON_ID' LIMIT 1;")
  [ "$vp_comp" = "t" ] && pass "VideoProgress.completed=true at 80% threshold" \
    || fail "VideoProgress.completed not set at 80% (got: '$vp_comp')"

  vp_pct=$(db "SELECT \"percentWatched\" FROM \"VideoProgress\" WHERE \"lessonId\"='$LESSON_ID' LIMIT 1;")
  python3 -c "exit(0 if float('${vp_pct:-0}') >= 79 else 1)" 2>/dev/null \
    && pass "VideoProgress.percentWatched ≥ 79% (got $vp_pct)" \
    || fail "VideoProgress.percentWatched unexpectedly low: $vp_pct"

  # Idempotency — posting same progress twice should succeed (upsert)
  result2=$(auth_post_body "$TECH_JAR" "/api/progress" "{\"lessonId\":\"$LESSON_ID\",\"completed\":true}")
  echo "$result2" | grep -q '"progress"' && pass "Progress API is idempotent (double-submit ok)" || fail "Second submit failed: $result2"

  # Missing lessonId rejected with error
  bad=$(auth_post_body "$TECH_JAR" "/api/progress" '{"completed":true}')
  echo "$bad" | grep -q '"error"' && pass "Progress API rejects missing lessonId" || fail "Progress API accepted missing lessonId: $bad"

  bad2=$(auth_post_body "$TECH_JAR" "/api/progress/video" '{"currentTime":100,"duration":900}')
  echo "$bad2" | grep -q '"ok":false' && pass "Video progress API rejects missing lessonId" || fail "Video progress accepted missing lessonId: $bad2"

  # Un-complete: posting completed=false should succeed (returns updated progress)
  result3=$(auth_post_body "$TECH_JAR" "/api/progress" "{\"lessonId\":\"$LESSON_ID\",\"completed\":false}")
  echo "$result3" | grep -q '"progress"' && pass "Progress API accepts completed=false (uncomplete)" || fail "Uncomplete returned: $result3"
else
  warn "Skipping progress tests — no lesson ID available"
fi

# ─── 8. Login Event Analytics ─────────────────────────────────────────────────
section "8. Analytics Tracking"

result=$(auth_post_body "$TECH_JAR" "/api/analytics/login-event" \
  '{"userAgent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120","screenWidth":1920}')
echo "$result" | grep -q '"ok":true' && pass "Desktop login event recorded" || fail "Desktop login event: $result"

result=$(auth_post_body "$TECH_JAR" "/api/analytics/login-event" \
  '{"userAgent":"Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)","screenWidth":390}')
echo "$result" | grep -q '"ok":true' && pass "Mobile login event recorded" || fail "Mobile login event: $result"

result=$(auth_post_body "$TECH_JAR" "/api/analytics/login-event" \
  '{"userAgent":"Mozilla/5.0 (iPad; CPU OS 17_0)","screenWidth":810}')
echo "$result" | grep -q '"ok":true' && pass "Tablet login event recorded" || fail "Tablet login event: $result"

sleep 1
device_types=$(db "SELECT DISTINCT \"deviceType\" FROM \"LoginEvent\" ORDER BY 1;" | tr '\n' ',')
echo "$device_types" | grep -q "desktop" && pass "LoginEvent has desktop records" || warn "No desktop LoginEvent records in DB"
echo "$device_types" | grep -q "mobile"  && pass "LoginEvent has mobile records"  || warn "No mobile LoginEvent records in DB"
echo "$device_types" | grep -q "tablet"  && pass "LoginEvent has tablet records"  || warn "No tablet LoginEvent records in DB"

# Empty body should still work (fallback device detection from headers)
result=$(auth_post_body "$TECH_JAR" "/api/analytics/login-event" '{}')
echo "$result" | grep -q '"ok":true' && pass "Login event accepts empty body (UA fallback)" || fail "Login event empty body: $result"

# ─── 9. File Serving ──────────────────────────────────────────────────────────
section "9. File Serving"

IMAGE_URL=$(db "SELECT url FROM \"Asset\" WHERE type='IMAGE' LIMIT 1;")
VIDEO_URL=$(db "SELECT url FROM \"Asset\" WHERE type='VIDEO' LIMIT 1;")

if [ -n "$IMAGE_URL" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$IMAGE_URL")
  [ "$code" = "200" ] && pass "Image asset serves 200 ($IMAGE_URL)" || fail "Image asset → $code"

  ct=$(curl -s -o /dev/null -w "%{content_type}" "$BASE$IMAGE_URL")
  echo "$ct" | grep -q "image/" && pass "Image content-type is image/* ($ct)" || fail "Image content-type wrong: $ct"
else
  warn "No image assets in DB"
fi

if [ -n "$VIDEO_URL" ]; then
  code=$(curl -s -o /dev/null -w "%{http_code}" -H "Range: bytes=0-1048575" "$BASE$VIDEO_URL")
  [ "$code" = "206" ] && pass "Video serves 206 Partial Content for range request" || fail "Video range request → $code (expected 206)"

  code_full=$(curl -s -o /dev/null -w "%{http_code}" "$BASE$VIDEO_URL")
  [ "$code_full" = "200" ] || [ "$code_full" = "206" ] && pass "Video serves without Range header ($code_full)" || fail "Video no-range → $code_full"

  accept_ranges=$(curl -sI "$BASE$VIDEO_URL" -H "Range: bytes=0-0" | grep -i "accept-ranges" | tr -d '\r')
  echo "$accept_ranges" | grep -qi "bytes" && pass "Video response includes Accept-Ranges: bytes" || fail "No Accept-Ranges header on video"
else
  warn "No video assets in DB"
fi

# Path traversal protection
code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/uploads/../../../etc/passwd")
[ "$code" = "400" ] || [ "$code" = "403" ] || [ "$code" = "404" ] \
  && pass "Path traversal attempt blocked ($code)" \
  || fail "Path traversal returned $code (should be 400/403/404)"

code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/uploads/%2e%2e%2f%2e%2e%2fetc%2fpasswd")
[ "$code" = "400" ] || [ "$code" = "403" ] || [ "$code" = "404" ] \
  && pass "Encoded path traversal blocked ($code)" \
  || fail "Encoded path traversal returned $code"

# ─── 10. Admin Pages ──────────────────────────────────────────────────────────
section "10. Admin Pages"

for path in "/admin" "/admin/users" "/admin/analytics" "/admin/content" "/admin/content/lessons" "/admin/content/courses" "/admin/content/modules" "/admin/assets" "/admin/requirements"; do
  code=$(auth_get "$ADMIN_JAR" "$path")
  [ "$code" = "200" ] && pass "Admin $path → 200" || fail "Admin $path → $code"
done

# ─── 11. Manager Pages ────────────────────────────────────────────────────────
section "11. Manager Pages"

TECH_USER_ID=$(db "SELECT id FROM \"User\" WHERE role='TECHNICIAN' LIMIT 1;")

code=$(auth_get "$MANAGER_JAR" "/manager"); [ "$code" = "200" ] && pass "Manager /manager → 200" || fail "Manager /manager → $code"

if [ -n "$TECH_USER_ID" ]; then
  code=$(auth_get "$MANAGER_JAR" "/manager/technicians/$TECH_USER_ID")
  [ "$code" = "200" ] && pass "Manager technician detail → 200" || fail "Manager technician detail → $code"

  code=$(auth_get "$MANAGER_JAR" "/manager/technicians/$TECH_USER_ID/report")
  [ "$code" = "200" ] && pass "Manager print report → 200" || fail "Manager print report → $code"

  # Admin can also view manager pages
  code=$(auth_get "$ADMIN_JAR" "/manager/technicians/$TECH_USER_ID")
  [ "$code" = "200" ] && pass "Admin can view technician detail" || fail "Admin technician detail → $code"

  # Bogus ID should 404
  code=$(auth_get "$MANAGER_JAR" "/manager/technicians/fake-id-xyz")
  [ "$code" = "404" ] && pass "Non-existent technician → 404" || fail "Non-existent technician → $code"
fi

code=$(auth_get "$TECH_JAR" "/manager"); [ "$code" = "307" ] || [ "$code" = "302" ] && pass "Technician blocked from /manager" || fail "Technician accessed /manager (got $code)"

# ─── 12. Requirements / Compliance ───────────────────────────────────────────
section "12. Course Requirements (Compliance)"

COURSE_ID=$(db "SELECT id FROM \"Course\" WHERE status='PUBLISHED' LIMIT 1;")

if [ -n "$COURSE_ID" ]; then
  # Admin can set a requirement via server action — test via page render
  code=$(auth_get "$ADMIN_JAR" "/admin/requirements")
  [ "$code" = "200" ] && pass "Requirements page renders for admin" || fail "Requirements page → $code"

  # Verify DB interaction — insert a requirement directly and check manager sees it
  db "INSERT INTO \"CourseRequirement\" (id, \"courseId\", role, \"createdAt\") VALUES ('test-req-001', '$COURSE_ID', 'TECHNICIAN', NOW()) ON CONFLICT (\"courseId\", role) DO NOTHING;" >/dev/null

  req_count=$(db "SELECT count(*) FROM \"CourseRequirement\" WHERE role='TECHNICIAN';")
  [ "$req_count" -ge "1" ] 2>/dev/null && pass "CourseRequirement record exists for TECHNICIAN" || fail "CourseRequirement not found (count: $req_count)"

  # Manager page should reflect this
  code=$(auth_get "$MANAGER_JAR" "/manager")
  [ "$code" = "200" ] && pass "Manager compliance page renders with requirements set" || fail "Manager page with requirements → $code"

  # Clean up test requirement
  db "DELETE FROM \"CourseRequirement\" WHERE id='test-req-001';" >/dev/null
fi

# ─── 13. Database Integrity ───────────────────────────────────────────────────
section "13. Database Integrity"

check_count() {
  local label="$1" query="$2"
  local count
  count=$(db "$query")
  [ "$count" = "0" ] && pass "$label" || fail "$label — found $count violations"
}

check_count "No orphaned lessons (missing moduleId)" \
  "SELECT count(*) FROM \"Lesson\" l LEFT JOIN \"Module\" m ON l.\"moduleId\"=m.id WHERE m.id IS NULL;"

check_count "No orphaned modules (missing courseId)" \
  "SELECT count(*) FROM \"Module\" m LEFT JOIN \"Course\" c ON m.\"courseId\"=c.id WHERE c.id IS NULL;"

check_count "No orphaned LessonProgress records" \
  "SELECT count(*) FROM \"LessonProgress\" lp LEFT JOIN \"User\" u ON lp.\"userId\"=u.id LEFT JOIN \"Lesson\" l ON lp.\"lessonId\"=l.id WHERE u.id IS NULL OR l.id IS NULL;"

check_count "No orphaned VideoProgress records" \
  "SELECT count(*) FROM \"VideoProgress\" vp LEFT JOIN \"User\" u ON vp.\"userId\"=u.id LEFT JOIN \"Lesson\" l ON vp.\"lessonId\"=l.id WHERE u.id IS NULL OR l.id IS NULL;"

check_count "No duplicate lesson slugs" \
  "SELECT count(*) FROM (SELECT slug FROM \"Lesson\" GROUP BY slug HAVING count(*)>1) t;"

check_count "No duplicate course slugs" \
  "SELECT count(*) FROM (SELECT slug FROM \"Course\" GROUP BY slug HAVING count(*)>1) t;"

check_count "No duplicate category slugs" \
  "SELECT count(*) FROM (SELECT slug FROM \"Category\" GROUP BY slug HAVING count(*)>1) t;"

check_count "All users have password hashes" \
  "SELECT count(*) FROM \"User\" WHERE \"passwordHash\" IS NULL OR \"passwordHash\"='';"

check_count "No duplicate sortOrders within a module" \
  "SELECT count(*) FROM (SELECT \"moduleId\", \"sortOrder\" FROM \"Lesson\" GROUP BY \"moduleId\", \"sortOrder\" HAVING count(*)>1) t;"

check_count "No LessonProgress: completed=true but started=false" \
  "SELECT count(*) FROM \"LessonProgress\" WHERE completed=true AND started=false;"

check_count "No LessonProgress: completed=true with NULL completedAt" \
  "SELECT count(*) FROM \"LessonProgress\" WHERE completed=true AND \"completedAt\" IS NULL;"

check_count "No VideoProgress percentWatched out of range" \
  "SELECT count(*) FROM \"VideoProgress\" WHERE \"percentWatched\" < 0 OR \"percentWatched\" > 100;"

check_count "No VideoProgress: completed=true with <50% watched" \
  "SELECT count(*) FROM \"VideoProgress\" WHERE completed=true AND \"percentWatched\" < 50;"

check_count "All published courses have category" \
  "SELECT count(*) FROM \"Course\" c LEFT JOIN \"Category\" cat ON c.\"categoryId\"=cat.id WHERE cat.id IS NULL AND c.status='PUBLISHED';"

# ─── 14. Business Logic Checks ───────────────────────────────────────────────
section "14. Business Logic"

# Every published course should have at least one published lesson
courses_no_lessons=$(db "SELECT count(*) FROM \"Course\" c WHERE c.status='PUBLISHED' AND NOT EXISTS (SELECT 1 FROM \"Module\" m JOIN \"Lesson\" l ON l.\"moduleId\"=m.id WHERE m.\"courseId\"=c.id AND l.status='PUBLISHED');")
[ "$courses_no_lessons" = "0" ] && pass "All published courses have at least one published lesson" || warn "$courses_no_lessons published courses have no published lessons"

# Every published module should have at least one published lesson
modules_no_lessons=$(db "SELECT count(*) FROM \"Module\" m WHERE m.status='PUBLISHED' AND NOT EXISTS (SELECT 1 FROM \"Lesson\" l WHERE l.\"moduleId\"=m.id AND l.status='PUBLISHED');")
[ "$modules_no_lessons" = "0" ] && pass "All published modules have at least one published lesson" || warn "$modules_no_lessons published modules have no published lessons"

# Every published course should have at least one module
courses_no_modules=$(db "SELECT count(*) FROM \"Course\" c WHERE c.status='PUBLISHED' AND NOT EXISTS (SELECT 1 FROM \"Module\" m WHERE m.\"courseId\"=c.id);")
[ "$courses_no_modules" = "0" ] && pass "All published courses have at least one module" || warn "$courses_no_modules published courses have no modules"

# CourseRequirement should only reference published courses
bad_reqs=$(db "SELECT count(*) FROM \"CourseRequirement\" cr JOIN \"Course\" c ON cr.\"courseId\"=c.id WHERE c.status != 'PUBLISHED';")
[ "$bad_reqs" = "0" ] && pass "All CourseRequirements reference published courses" || warn "$bad_reqs CourseRequirements point to non-published courses"

# Lessons with videoUrl should have videoProvider set
missing_provider=$(db "SELECT count(*) FROM \"Lesson\" WHERE \"videoUrl\" IS NOT NULL AND \"videoProvider\" IS NULL;")
[ "$missing_provider" = "0" ] && pass "All lessons with videoUrl have videoProvider set" || warn "$missing_provider lessons have videoUrl but no videoProvider"

# LessonAssets — all should reference valid assets
bad_assets=$(db "SELECT count(*) FROM \"LessonAsset\" la LEFT JOIN \"Asset\" a ON la.\"assetId\"=a.id WHERE a.id IS NULL;")
[ "$bad_assets" = "0" ] && pass "No LessonAssets referencing missing assets" || fail "$bad_assets LessonAssets reference non-existent assets"

# ─── 15. Performance ──────────────────────────────────────────────────────────
section "15. Response Times"

for entry in "TECH_JAR:/dashboard" "TECH_JAR:/learn" "ADMIN_JAR:/admin" "ADMIN_JAR:/admin/analytics" "ADMIN_JAR:/admin/users" "MANAGER_JAR:/manager"; do
  jar_var="${entry%%:*}"
  path="${entry##*:}"
  jar="${!jar_var}"

  time_ms=$(curl -s -b "$jar" -o /dev/null -w "%{time_total}" "$BASE$path" \
    | python3 -c "import sys; print(int(float(sys.stdin.read())*1000))")

  if   [ "$time_ms" -lt 2000 ] 2>/dev/null; then pass "$path ${time_ms}ms"
  elif [ "$time_ms" -lt 5000 ] 2>/dev/null; then warn "$path ${time_ms}ms (slow, <5s)"
  else fail "$path ${time_ms}ms (>5s — too slow)"
  fi
done

# ─── Cleanup ──────────────────────────────────────────────────────────────────
rm -f "$ADMIN_JAR" "$MANAGER_JAR" "$TECH_JAR" 2>/dev/null

# ─── Summary ──────────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════"
TOTAL=$((PASS + FAIL + WARN))
echo "  Results: $TOTAL tests   ✓ $PASS passed   ✗ $FAIL failed   ⚠ $WARN warnings"
[ $FAIL -gt 0 ] && echo "  STATUS: FAILED" || echo "  STATUS: PASSED"
echo "═══════════════════════════════════════════════════════"
[ $FAIL -eq 0 ] && exit 0 || exit 1
