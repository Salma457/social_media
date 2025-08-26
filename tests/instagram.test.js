const request = require("supertest");
const app = require("../src/app");
const InstagramService = require("../src/services/instagramService");

describe("Instagram API Tests", () => {
  let authToken;

  beforeAll(async () => {
    // Login to get auth token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    authToken = loginResponse.body.data.token;
  });

  describe("POST /api/instagram/create-post", () => {
    it("should create an Instagram post successfully", async () => {
      const postData = {
        caption: "Test Instagram post from API",
        imageUrl: "https://example.com/test-image.jpg",
        sector: "education",
        location: "School District A",
      };

      const response = await request(app)
        .post("/api/instagram/create-post")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Instagram post created successfully");
      expect(response.body.data).toHaveProperty("id");
    });

    it("should return 400 for missing required fields", async () => {
      const postData = {
        sector: "education",
        // Missing caption and imageUrl
      };

      const response = await request(app)
        .post("/api/instagram/create-post")
        .set("Authorization", `Bearer ${authToken}`)
        .send(postData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 without authentication", async () => {
      const postData = {
        caption: "Test post",
        imageUrl: "https://example.com/test.jpg",
        sector: "education",
      };

      const response = await request(app)
        .post("/api/instagram/create-post")
        .send(postData);

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/instagram/posts", () => {
    it("should retrieve Instagram posts", async () => {
      const response = await request(app)
        .get("/api/instagram/posts")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          sector: "education",
          limit: 10,
          offset: 0,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it("should filter posts by sector", async () => {
      const response = await request(app)
        .get("/api/instagram/posts")
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

  describe("POST /api/instagram/create-story", () => {
    it("should create an Instagram story successfully", async () => {
      const storyData = {
        imageUrl: "https://example.com/story-image.jpg",
        text: "Test story text",
        sector: "education",
        stickers: ["location", "mention"],
      };

      const response = await request(app)
        .post("/api/instagram/create-story")
        .set("Authorization", `Bearer ${authToken}`)
        .send(storyData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Instagram story created successfully"
      );
      expect(response.body.data).toHaveProperty("id");
    });
  });

  describe("GET /api/instagram/stories", () => {
    it("should retrieve Instagram stories", async () => {
      const response = await request(app)
        .get("/api/instagram/stories")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          sector: "education",
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("POST /api/instagram/create-shopping-post", () => {
    it("should create a shopping post successfully", async () => {
      const shoppingData = {
        caption: "Check out our new coffee products!",
        imageUrl: "https://example.com/coffee-products.jpg",
        productIds: ["prod_001", "prod_002"],
        sector: "hospitality",
      };

      const response = await request(app)
        .post("/api/instagram/create-shopping-post")
        .set("Authorization", `Bearer ${authToken}`)
        .send(shoppingData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Instagram shopping post created successfully"
      );
      expect(response.body.data).toHaveProperty("id");
    });
  });

  describe("GET /api/instagram/products", () => {
    it("should retrieve Instagram products", async () => {
      const response = await request(app)
        .get("/api/instagram/products")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ sector: "hospitality" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(
        response.body.data.every((product) => product.sector === "hospitality")
      ).toBe(true);
    });
  });

  describe("GET /api/instagram/hashtags", () => {
    it("should retrieve recommended hashtags", async () => {
      const response = await request(app)
        .get("/api/instagram/hashtags")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          sector: "education",
          count: 15,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(15);
    });
  });

  describe("GET /api/instagram/analytics", () => {
    it("should retrieve Instagram analytics", async () => {
      const response = await request(app)
        .get("/api/instagram/analytics")
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

  describe("GET /api/instagram/engagement", () => {
    it("should retrieve engagement metrics", async () => {
      const response = await request(app)
        .get("/api/instagram/engagement")
        .set("Authorization", `Bearer ${authToken}`)
        .query({
          postId: "test_post_id",
          sector: "education",
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("likes");
      expect(response.body.data).toHaveProperty("comments");
      expect(response.body.data).toHaveProperty("engagementRate");
    });
  });

  describe("POST /api/instagram/schedule-post", () => {
    it("should schedule an Instagram post", async () => {
      const scheduleData = {
        caption: "Scheduled test post",
        imageUrl: "https://example.com/scheduled-image.jpg",
        sector: "education",
        scheduledTime: new Date(Date.now() + 86400000).toISOString(),
        hashtags: ["#test", "#scheduled"],
      };

      const response = await request(app)
        .post("/api/instagram/schedule-post")
        .set("Authorization", `Bearer ${authToken}`)
        .send(scheduleData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Instagram post scheduled successfully"
      );
      expect(response.body.data).toHaveProperty("id");
    });
  });

  describe("GET /api/instagram/scheduled-posts", () => {
    it("should retrieve scheduled posts", async () => {
      const response = await request(app)
        .get("/api/instagram/scheduled-posts")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ sector: "education" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("DELETE /api/instagram/scheduled-posts/:postId", () => {
    it("should cancel a scheduled post", async () => {
      const response = await request(app)
        .delete("/api/instagram/scheduled-posts/test_post_id")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Scheduled post cancelled successfully"
      );
    });
  });

  describe("POST /api/instagram/automated-content", () => {
    it("should create automated content", async () => {
      const contentData = {
        sector: "education",
        contentType: "menu",
        customMessage: "Custom automated message",
      };

      const response = await request(app)
        .post("/api/instagram/automated-content")
        .set("Authorization", `Bearer ${authToken}`)
        .send(contentData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Automated content created successfully"
      );
      expect(response.body.data).toHaveProperty("content");
    });
  });

  describe("GET /api/instagram/status", () => {
    it("should return Instagram API status", async () => {
      const response = await request(app)
        .get("/api/instagram/status")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("connected");
    });
  });
});

describe("Instagram Service Tests", () => {
  describe("createPost", () => {
    it("should create a post successfully", async () => {
      const result = await InstagramService.createPost({
        caption: "Test post",
        imageUrl: "https://example.com/test.jpg",
        sector: "education",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("status");
      expect(result.status).toBe("published");
    });
  });

  describe("getPosts", () => {
    it("should return posts for education sector", async () => {
      const posts = await InstagramService.getPosts("education", 10, 0);

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.every((post) => post.sector === "education")).toBe(true);
    });

    it("should return posts for hospitality sector", async () => {
      const posts = await InstagramService.getPosts("hospitality", 10, 0);

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.every((post) => post.sector === "hospitality")).toBe(true);
    });
  });

  describe("createStory", () => {
    it("should create a story successfully", async () => {
      const result = await InstagramService.createStory({
        imageUrl: "https://example.com/story.jpg",
        text: "Test story",
        sector: "education",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("status");
      expect(result.status).toBe("created");
    });
  });

  describe("getStories", () => {
    it("should return stories for a sector", async () => {
      const stories = await InstagramService.getStories("education", 10);

      expect(Array.isArray(stories)).toBe(true);
      expect(stories.every((story) => story.sector === "education")).toBe(true);
    });
  });

  describe("createShoppingPost", () => {
    it("should create a shopping post successfully", async () => {
      const result = await InstagramService.createShoppingPost({
        caption: "Shop our products!",
        imageUrl: "https://example.com/products.jpg",
        productIds: ["prod_001", "prod_002"],
        sector: "hospitality",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("productIds");
      expect(result.status).toBe("created");
    });
  });

  describe("getProducts", () => {
    it("should return products for hospitality sector", async () => {
      const products = await InstagramService.getProducts("hospitality");

      expect(Array.isArray(products)).toBe(true);
      expect(
        products.every((product) => product.sector === "hospitality")
      ).toBe(true);
    });
  });

  describe("getRecommendedHashtags", () => {
    it("should return hashtags for education sector", async () => {
      const hashtags = await InstagramService.getRecommendedHashtags(
        "education",
        10
      );

      expect(Array.isArray(hashtags)).toBe(true);
      expect(hashtags.length).toBeLessThanOrEqual(10);
    });

    it("should return hashtags for hospitality sector", async () => {
      const hashtags = await InstagramService.getRecommendedHashtags(
        "hospitality",
        15
      );

      expect(Array.isArray(hashtags)).toBe(true);
      expect(hashtags.length).toBeLessThanOrEqual(15);
    });
  });

  describe("getAnalytics", () => {
    it("should return analytics data", async () => {
      const analytics = await InstagramService.getAnalytics(
        "education",
        "reach",
        "week"
      );

      expect(analytics).toHaveProperty("metric");
      expect(analytics).toHaveProperty("value");
      expect(analytics).toHaveProperty("sector");
    });
  });

  describe("getEngagement", () => {
    it("should return engagement metrics", async () => {
      const engagement = await InstagramService.getEngagement(
        "test_post_id",
        "education"
      );

      expect(engagement).toHaveProperty("likes");
      expect(engagement).toHaveProperty("comments");
      expect(engagement).toHaveProperty("engagementRate");
    });
  });

  describe("schedulePost", () => {
    it("should schedule a post successfully", async () => {
      const scheduledTime = new Date(Date.now() + 86400000);
      const result = await InstagramService.schedulePost({
        caption: "Scheduled test post",
        imageUrl: "https://example.com/scheduled.jpg",
        scheduledTime: scheduledTime.toISOString(),
        sector: "education",
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("scheduledTime");
      expect(result.status).toBe("scheduled");
    });
  });

  describe("getScheduledPosts", () => {
    it("should return scheduled posts", async () => {
      const posts = await InstagramService.getScheduledPosts("education");

      expect(Array.isArray(posts)).toBe(true);
      expect(posts.every((post) => post.status === "scheduled")).toBe(true);
    });
  });

  describe("cancelScheduledPost", () => {
    it("should cancel a scheduled post", async () => {
      const result = await InstagramService.cancelScheduledPost("test_post_id");

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("status");
      expect(result.status).toBe("cancelled");
    });
  });

  describe("createAutomatedContent", () => {
    it("should create automated content", async () => {
      const result = await InstagramService.createAutomatedContent(
        "education",
        "menu",
        "Custom message"
      );

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("content");
      expect(result).toHaveProperty("sector");
      expect(result.sector).toBe("education");
    });
  });

  describe("getStatus", () => {
    it("should return API status", async () => {
      const status = await InstagramService.getStatus();

      expect(status).toHaveProperty("connected");
      expect(typeof status.connected).toBe("boolean");
    });
  });
});
