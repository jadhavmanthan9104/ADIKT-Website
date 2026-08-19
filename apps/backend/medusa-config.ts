import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:9000,http://localhost:5173",
      authCors: process.env.AUTH_CORS || "http://localhost:3000,http://localhost:9000",
      jwtSecret: process.env.JWT_SECRET || "super_secret_jwt_key_at_least_32_characters_long_12345",
      cookieSecret: process.env.COOKIE_SECRET || "super_secret_cookie_key_must_be_random_and_secure_67890",
    },
  },
  admin: {
    disable: false,
    backendUrl: process.env.BACKEND_URL || "http://localhost:9000",
  },
  modules: [
    {
      resolve: "./src/modules/clothing-spec",
    },
    {
      resolve: "./src/modules/reviews",
    },
    {
      resolve: "./src/modules/wishlist",
    },
    {
      resolve: "./src/modules/content-cms",
    },
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/payment-razorpay",
            id: "razorpay",
            options: {
              key_id: process.env.RAZORPAY_KEY_ID,
              key_secret: process.env.RAZORPAY_KEY_SECRET,
              webhook_secret: process.env.RAZORPAY_WEBHOOK_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: "@medusajs/medusa/fulfillment",
      options: {
        providers: [
          {
            resolve: "./src/modules/fulfillment-shiprocket",
            id: "shiprocket",
          },
        ],
      },
    },
  ],
})
