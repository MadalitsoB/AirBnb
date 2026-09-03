const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");

const { protect, generateToken } = require("../middleware/authmiddleware");

const testSecret = "test-only-jwt-secret";

function responseRecorder() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

test.beforeEach(() => {
  process.env.JWT_SECRET = testSecret;
});

test("protect rejects requests without a bearer token", () => {
  const req = { headers: {} };
  const res = responseRecorder();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(nextCalled, false);
});

test("protect rejects an invalid token", () => {
  const req = { headers: { authorization: "Bearer invalid-token" } };
  const res = responseRecorder();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});

test("protect accepts a valid token and exposes its claims", () => {
  const token = generateToken("user-123", "host");
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = responseRecorder();
  let nextCalled = false;

  protect(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.id, "user-123");
  assert.equal(req.user.role, "host");
});

test("JWT operations fail when JWT_SECRET is missing", () => {
  const previousSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  assert.throws(() => generateToken("user-123"), /JWT_SECRET is required/);

  process.env.JWT_SECRET = previousSecret;
});

test("protect rejects a token signed with a different secret", () => {
  const token = jwt.sign({ id: "user-123" }, "wrong-secret");
  const req = { headers: { authorization: `Bearer ${token}` } };
  const res = responseRecorder();

  protect(req, res, () => {});

  assert.equal(res.statusCode, 401);
});
