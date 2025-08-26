const request = require("supertest");
const app = require("../src/app");
const FacebookService = require("../src/services/facebookService");

describe("Facebook API Tests", () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    authToken = loginResponse.body.data.token;
  });

  describe("POST /api/facebook/create-post", () => {
    it("should create a Facebook post successfully", async () => {
      const postData = {
        message: "Test Facebook post from API",
        sector: "education",
        link: "https://example.com",
        scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      };

      const response = await request(app)
        .post("/api/facebook/create-post")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Facebook post created successfully");
      expect(response.body.data).toHaveProperty("postId");
    });

    it("should return 400 for missing required fields", async () => {
      const postData = {
        sector: "education",
        // Missing message
      };

      const response = await request(app)
        .post("/api/facebook/create-post")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      const postData = {
        message: "Test post",
        sector: "education",
      };

      const response = await request(app)
        .post("/api/facebook/create-post")
        .send(postData);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/facebook/posts", () => {
    it("should retrieve Facebook posts", async () => {
      const response = await request(app)
        .get("/api/facebook/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          sector: "education",
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter posts by sector", async () => {
      const response = await request(app)
        .get("/api/facebook/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          sector: "hospitality",
          limit: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(
        response.body.data.every((post) => post.sector === "hospitality")
      ).toBe(true);
    });
  });

  describe("POST /api/facebook/create-lead-form", () => {
    it("should create a lead form successfully", async () => {
      const formData = {
        name: "Test Lead Form",
        sector: "education",
        questions: [
          { type: "SHORT_ANSWER", label: "Name" },
          { type: "EMAIL", label: "Email" },
          { type: "PHONE", label: "Phone" },
        ],
      };

      const response = await request(app)
        .post("/api/facebook/create-lead-form")
        .set("Authorization", `Bearer ${authToken}`)
        .send(formData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Lead form created successfully");
      expect(response.body.data).toHaveProperty("formId");
    });
  });

  describe("GET /api/facebook/leads", () => {
    it("should retrieve lead data", async () => {
      const response = await request(app)
        .get("/api/facebook/leads")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          formId: "test_form_id",
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /api/facebook/analytics", () => {
    it("should retrieve Facebook analytics", async () => {
      const response = await request(app)
        .get("/api/facebook/analytics")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          sector: "education",
          metric: "reach",
          period: "week",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("metric");
      expect(response.body.data).toHaveProperty("value");
    });
  });

  describe("GET /api/facebook/status", () => {
    it("should return Facebook API status", async () => {
      const response = await request(app)
        .get("/api/facebook/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("connected");
    });
  });
});

describe("Facebook Service Tests", () => {
  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const result = await FacebookService.createPost({
        message: "Test post",
        sector: "education",
      });

      expect(result).toHaveProperty("postId");
      expect(result).toHaveProperty("status");
      expect(result.status).toBe("published");
    });

    it("should handle scheduled posts", async () => {
      const scheduledTime = new Date(Date.now() + 3600000);
      const result = await FacebookService.createPost({
        message: "Scheduled test post",
        sector: "education",
        scheduledTime: scheduledTime.toISOString(),
      });

      expect(result).toHaveProperty("postId");
      expect(result).toHaveProperty("scheduledTime");
    });
  });

  describe("getPosts", () => {
    it("should return posts for education sector", async () => {
      const posts = await FacebookService.getPosts("education", 10);

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.every((post) => post.sector === "education")).toBe(true);
    });

    it("should return posts for hospitality sector", async () => {
      const posts = await FacebookService.getPosts("hospitality", 10);

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.every((post) => post.sector === "hospitality")).toBe(true);
    });
  });

  describe("createLeadForm", () => {
    it("should create a lead form successfully", async () => {
      const formData = {
        name: "Test Form",
        sector: "education",
        questions: [
          { type: "SHORT_ANSWER", label: "Name" },
          { type: "EMAIL", label: "Email" },
        ],
      };

      const result = await FacebookService.createLeadForm(formData);

      expect(result).toHaveProperty("formId");
      expect(result).toHaveProperty("name");
      expect(result.name).toBe("Test Form");
    });
  });

  describe("getLeads", () => {
    it("should return leads for a form", async () => {
      const leads = await FacebookService.getLeads("test_form_id", 10);

      expect(Array.isArray(leads)).toBe(true);
      expect(leads.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getAnalytics", () => {
    it("should return analytics data", async () => {
      const analytics = await FacebookService.getAnalytics(
        "education",
        "reach",
        "week"
      );

      expect(analytics).toHaveProperty("metric");
      expect(analytics).toHaveProperty("value");
      expect(analytics).toHaveProperty("sector");
    });
  });

  describe("getStatus", () => {
    it("should return API status", async () => {
      const status = await FacebookService.getStatus();

      expect(status).toHaveProperty("connected");
      expect(typeof status.connected).toBe("boolean");
    });
  });
});
