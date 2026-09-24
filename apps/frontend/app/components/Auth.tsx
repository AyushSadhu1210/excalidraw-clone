"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";
import styles from "./Auth.module.css";

// From packages/env/.env via next.config.js — never import @repo/env in client code
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000/api/v1";

export const Auth = ({ isLogin }: { isLogin: boolean }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE}/${isLogin ? "signin" : "signup"}`,
        {
          email: email.trim(),
          password,
          ...(isLogin ? {} : { name: name.trim() }),
        },
      );

      const token = response.data?.token;
      if (!token) {
        throw new Error("No token received from server");
      }

      localStorage.setItem("token", token);
      toast.success(isLogin ? "Signed in successfully" : "Account created");
      router.push("/");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || err.message
        : err instanceof Error
          ? err.message
          : "Something went wrong";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          <h1 className={styles.logo}>
            Sketch<span className={styles.logoMark}>Board</span>
          </h1>
          <p className={styles.tagline}>
            Draw together on a shared infinite canvas.
          </p>
        </div>

        <div className={styles.panel}>
          <h2 className={styles.title}>
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>
          <p className={styles.subtitle}>
            {isLogin
              ? "Sign in to join rooms and keep drawing."
              : "A few details and you are ready to sketch."}
          </p>

          <form
            className={styles.form}
            onSubmit={handleSubmit}
            method="post"
            noValidate
          >
            {!isLogin && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  className={styles.input}
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                  minLength={1}
                />
              </div>
            )}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder={
                  isLogin ? "Your password" : "At least 6 characters"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? "current-password" : "new-password"}
                required
                minLength={isLogin ? 1 : 6}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.submit} type="submit" disabled={loading}>
              {loading
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          <p className={styles.switch}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link href={isLogin ? "/signup" : "/signin"}>
              {isLogin ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
