import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import session from "express-session";
import connectPg from "connect-pg-simple";
import type { Express } from "express";
import { db } from "./db";
import { users, type User as DbUser } from "@shared/schema";
import { eq, or } from "drizzle-orm";

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function comparePasswords(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

export function setupAuth(app: Express) {
  // Setup express-session
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });

  app.set("trust proxy", 1);
  app.use(session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  }));

  // Setup passport
  passport.use(
    new LocalStrategy(
      {
        usernameField: "username", // will accept phone or email
        passwordField: "password",
      },
      async (username, password, done) => {
        try {
          // Find user by phone or email
          const [user] = await db
            .select()
            .from(users)
            .where(
              or(
                eq(users.phone, username),
                eq(users.email, username)
              )
            )
            .limit(1);

          if (!user) {
            return done(null, false, { message: "Неверный телефон/email или пароль" });
          }

          const isValidPassword = comparePasswords(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Неверный телефон/email или пароль" });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (!user) {
        return done(null, false);
      }

      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  app.use(passport.initialize());
  app.use(passport.session());
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Требуется авторизация" });
}

export function requireAdmin(req: any, res: any, next: any) {
  console.log("[DEBUG requireAdmin] isAuthenticated:", req.isAuthenticated());
  console.log("[DEBUG requireAdmin] user:", req.user);
  console.log("[DEBUG requireAdmin] user.role:", req.user?.role);
  
  if (req.isAuthenticated() && req.user.role === 'admin') {
    console.log("[DEBUG requireAdmin] Access granted");
    return next();
  }
  console.log("[DEBUG requireAdmin] Access denied");
  res.status(403).json({ message: "Доступ запрещён. Требуются права администратора" });
}

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}
