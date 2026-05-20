import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import type { QuoteScene } from "../types";

const { fontFamily: bodyFont } = loadInter("normal", {
  weights: ["400", "500", "700", "800"],
  subsets: ["latin"],
});

const { fontFamily: labelFont } = loadBebasNeue("normal", {
  subsets: ["latin"],
});

function extractQuote(text: string): string {
  const matches = text.match(
    /[\u201C\u201D]([^\u201C\u201D]+)[\u201C\u201D]|"([^"]+)"/g
  );

  if (matches && matches.length > 0) {
    return matches
      .map((m) =>
        m.replace(/^[\u201C\u201D]|[\u201C\u201D]$|^"|"$/g, "").trim()
      )
      .filter(Boolean)
      .join("  ·  ");
  }

  return text;
}

function quoteFontSize(text: string): number {
  const len = text.length;

  if (len <= 42) return 58;
  if (len <= 76) return 50;
  if (len <= 120) return 42;
  if (len <= 180) return 35;
  return 30;
}

const IN_FRAMES = 24;
const OUT_FRAMES = 24;

export const QuoteOverlay: React.FC<{ scene: QuoteScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const {
    fps,
    width,
    height,
    durationInFrames: compositionDuration,
  } = useVideoConfig();

  const quote = extractQuote(scene.text);
  const fontSize = quoteFontSize(quote);

  const outStart = Math.max(compositionDuration - OUT_FRAMES, IN_FRAMES + 24);

  const inSpring = spring({
    frame,
    fps,
    config: {
      damping: 18,
      stiffness: 118,
      mass: 0.78,
    },
    durationInFrames: IN_FRAMES,
  });

  const enterY = interpolate(inSpring, [0, 1], [86, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const enterScale = interpolate(inSpring, [0, 1], [0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outProgress = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.bezier(0.16, 1, 0.3, 1),
    }
  );

  const exitY = interpolate(outProgress, [0, 1], [0, 58], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const exitScale = interpolate(outProgress, [0, 1], [1, 0.985], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityOut = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES * 0.7, outStart + OUT_FRAMES],
    [1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = opacityIn * opacityOut;

  const motionBlur = interpolate(
    frame,
    [0, 6, 16, outStart, outStart + 8, outStart + OUT_FRAMES],
    [7, 4, 0, 0, 5, 9],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const lineSweep = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const glowPulse = interpolate(
    frame % 76,
    [0, 18, 38, 76],
    [0.72, 1, 0.82, 0.72],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const shineX = interpolate(frame, [9, 48], [-240, 1180], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const scanX = interpolate(frame % 100, [0, 100], [-160, 1280], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const CARD_WIDTH = Math.min(1160, width - 170);
  const CARD_MIN_HEIGHT = 315;

  const x = (width - CARD_WIDTH) / 2;
  const y = height * 0.56 - CARD_MIN_HEIGHT / 2;

  return (
    <AbsoluteFill style={{ background: "transparent" }}>
      {/* Blur keeps the avatar/background visible but pushes the quote forward */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "rgba(0,0,0,0.16)",
        }}
      />

      {/* News vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 62% at 50% 46%, rgba(20,24,30,0.04) 0%, rgba(4,6,10,0.18) 62%, rgba(0,0,0,0.32) 100%)",
        }}
      />

      {/* Broadcast grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Blue side glow */}
      <div
        style={{
          position: "absolute",
          right: -120,
          top: height * 0.38,
          width: 540,
          height: 260,
          background:
            "radial-gradient(ellipse, rgba(0,145,255,0.18), rgba(0,145,255,0) 70%)",
          filter: "blur(22px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: CARD_WIDTH,
          minHeight: CARD_MIN_HEIGHT,
          transform: `translateY(${enterY + exitY}px) scale(${enterScale * exitScale})`,
          opacity,
          pointerEvents: "none",
          userSelect: "none",
          filter: `blur(${motionBlur}px)`,
        }}
      >
        {/* Top fast sweep */}
        <div
          style={{
            position: "absolute",
            left: -180,
            top: 42,
            width: CARD_WIDTH + 360,
            height: 4,
            background:
              "linear-gradient(90deg, rgba(0,145,255,0), rgba(0,145,255,0.72), rgba(255,255,255,0.95), rgba(0,145,255,0.72), rgba(0,145,255,0))",
            filter: "blur(1.1px)",
            opacity: 0.72 * lineSweep,
            transform: "skewX(-22deg)",
          }}
        />

        {/* Main card */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            clipPath:
              "polygon(0 0, 96% 0, 100% 10%, 100% 100%, 4% 100%, 0 90%)",
            background:
              "linear-gradient(135deg, rgba(5,7,11,0.94), rgba(18,24,32,0.86) 44%, rgba(5,6,10,0.95))",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow:
              "0 24px 70px rgba(0,0,0,0.52), 0 0 34px rgba(0,145,255,0.16)",
          }}
        >
          {/* Blue headline header */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: "100%",
              height: 62,
              background:
                "linear-gradient(90deg, rgba(0,145,255,0.98), rgba(0,88,170,0.92) 36%, rgba(14,18,24,0.2) 78%)",
            }}
          />

          {/* Left blue accent block */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 128,
              background:
                "linear-gradient(180deg, rgba(0,145,255,0.92), rgba(0,60,122,0.96))",
              clipPath: "polygon(0 0, 100% 0, 72% 100%, 0 100%)",
              boxShadow: "14px 0 30px rgba(0,145,255,0.16)",
            }}
          />

          {/* Inner frame */}
          <div
            style={{
              position: "absolute",
              inset: 8,
              clipPath:
                "polygon(0 0, 95.5% 0, 100% 10%, 100% 100%, 4% 100%, 0 90%)",
              border: "1px solid rgba(255,255,255,0.13)",
            }}
          />

          {/* Technical texture */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 0.065,
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.65) 1px, transparent 1px)",
              backgroundSize: "11px 11px",
              maskImage:
                "linear-gradient(90deg, transparent 0%, black 17%, black 84%, transparent 100%)",
            }}
          />

          {/* Scanner */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: scanX,
              width: 70,
              height: 460,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.095), rgba(255,255,255,0))",
              transform: "skewX(-20deg)",
              opacity: 0.52,
            }}
          />

          {/* Main shine */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: shineX,
              width: 120,
              height: 460,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.14), rgba(255,255,255,0))",
              transform: "skewX(-20deg)",
              opacity: 0.74,
            }}
          />

          {/* Header label */}
          <div
            style={{
              position: "absolute",
              left: 160,
              top: 18,
              fontFamily: labelFont,
              fontSize: 29,
              color: "rgba(255,255,255,0.96)",
              letterSpacing: "0.08em",
              textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            }}
          >
            BREAKING STATEMENT
          </div>

          {/* Giant quotation mark */}
          <div
            style={{
              position: "absolute",
              left: 29,
              top: 60,
              fontFamily: labelFont,
              fontSize: 190,
              lineHeight: 1,
              color: "rgba(255,255,255,0.18)",
              textShadow: "0 0 22px rgba(255,255,255,0.09)",
            }}
          >
            “
          </div>

          {/* Quote text */}
          <div
            style={{
              position: "absolute",
              left: 160,
              right: 78,
              top: 89,
              fontFamily: bodyFont,
              fontWeight: 800,
              fontSize,
              lineHeight: 1.16,
              color: "rgba(250,252,255,0.98)",
              textShadow: "0 3px 10px rgba(0,0,0,0.62)",
            }}
          >
            {quote}
          </div>

          {/* Blue divider / flare */}
          <div
            style={{
              position: "absolute",
              left: 160,
              bottom: 82,
              width: 320,
              height: 3,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(0,145,255,0.98), rgba(0,145,255,0))",
              boxShadow: "0 0 16px rgba(0,145,255,0.84)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 144,
              bottom: 73,
              width: 65,
              height: 23,
              background:
                "radial-gradient(ellipse, rgba(255,255,255,1), rgba(85,205,255,0.92) 34%, rgba(0,145,255,0) 75%)",
              filter: "blur(2px)",
              opacity: glowPulse,
            }}
          />

          {/* Speaker lower third */}
          <div
            style={{
              position: "absolute",
              left: 160,
              bottom: 28,
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                fontFamily: labelFont,
                fontSize: 34,
                letterSpacing: "0.05em",
                color: "rgba(255,255,255,0.98)",
                whiteSpace: "nowrap",
                textShadow: "0 2px 8px rgba(0,0,0,0.55)",
              }}
            >
              {scene.speaker || "Source"}
            </div>

            <div
              style={{
                width: 1,
                height: 28,
                background: "rgba(255,255,255,0.32)",
              }}
            />

            <div
              style={{
                fontFamily: bodyFont,
                fontSize: 15,
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "rgba(235,239,245,0.76)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Verified statement
            </div>
          </div>

          {/* Right alert marks */}
          <div
            style={{
              position: "absolute",
              right: 34,
              top: 20,
              display: "flex",
              gap: 6,
              opacity: 0.88,
            }}
          >
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: 5,
                  height: 30,
                  background:
                    i === 2 ? "rgba(255,255,255,0.78)" : "rgba(0,145,255,0.9)",
                  transform: "skewX(-20deg)",
                }}
              />
            ))}
          </div>

          {/* Bottom broadcast line */}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 34,
              bottom: 0,
              height: 4,
              background:
                "linear-gradient(90deg, rgba(255,255,255,0), rgba(0,145,255,0.92), rgba(255,255,255,0.9), rgba(0,145,255,0))",
              boxShadow: "0 0 18px rgba(0,145,255,0.72)",
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
