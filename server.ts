import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const PASSWORD = process.env.SUNNY_PASSWORD || "sunnyiu";

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for Vite dev server compatibility
    crossOriginEmbedderPolicy: false,
  }));

  // Rate Limiting for Login
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 login requests per windowMs
    message: { error: "Em bé thử lại sau 15 phút nhé, anh Nhím sợ bị hack quá nè!" },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    if (req.cookies.sunny_auth === "true") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  };

  // Login Route
  app.post("/api/auth/login", loginLimiter, (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
      res.cookie("sunny_auth", "true", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });
      res.json({ success: true });
    } else {
      res.status(401).json({ error: "Sai mật khẩu rồi em bé ơi!" });
    }
  });

  // Check Auth Status
  app.get("/api/auth/status", (req, res) => {
    res.json({ authenticated: req.cookies.sunny_auth === "true" });
  });

  // Logout Route
  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("sunny_auth");
    res.json({ success: true });
  });

  // Protected AI Suggestion Route
  app.post("/api/ai/suggest", authenticate, async (req, res) => {
    const { mood, foods } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OpenRouter API Key is not configured." });
    }

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "Sunny Foodie Love",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "google/gemini-2.0-flash-001",
          messages: [
            {
              role: "system",
              content: `Bạn là anh Nhím iu, đang tư vấn món ăn cho Sunny (em bé). 
              Dưới đây là danh sách các món ăn hiện có: ${JSON.stringify(foods)}.
              
              PHONG CÁCH NÓI CHUYỆN CỦA BẠN (BẮT BUỘC):
              - Ngôn ngữ: Tiếng Việt, dùng các từ ngữ như: "nhó", "nghennn", "nhennn", "nhóaâ", "nho", "chội ôiii", "thương nghennn".
              - Cách xưng hô: Gọi Sunny là "em bé", "cục cưng yêu".
              - Thái độ: Cực kỳ quan tâm, dỗ dành, ngọt ngào theo kiểu riêng của anh Nhím.
              - Độ dài: Ngắn gọn, tầm 2 câu.
              - Ràng buộc: Ưu tiên chọn món trong danh sách. Nếu em bé "đến ngày", có thể gợi ý thêm socola.
              
              VÍ DỤ MẪU:
              - Sunny mệt: "Em mệt hả, chội ôiii anh thương nghennn, ăn thử phở gà nhó."
              - Sunny đau bụng: "Vậy ăn đồ ấm nóng lành như phở gà nhé cục cưng yêu."
              - Sunny thèm đồ hàn: "Em thèm đồ hàn hả, thử xem tobokki nhennn."
              - Sunny đến ngày: "Em bé đến ngày hả, ăn socola nháaâ, bảo anh đặt cho nho."`
            },
            {
              role: "user",
              content: `Tâm trạng của Sunny: "${mood}". Hãy trả lời đúng phong cách anh Nhím iu.`
            }
          ]
        })
      });

      const data = await response.json();
      res.json({ suggestion: data.choices[0].message.content });
    } catch (error) {
      console.error("OpenRouter Error:", error);
      res.status(500).json({ error: "Failed to get AI suggestion." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
