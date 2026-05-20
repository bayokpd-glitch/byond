import React from "react";
import {
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadBebasNeue } from "@remotion/google-fonts/BebasNeue";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { CONFIG } from "../config";

const { fontFamily: titleFont } = loadBebasNeue("normal", {
  subsets: ["latin"],
});

const { fontFamily: subtitleFont } = loadInter("normal", {
  weights: ["500", "700", "800"],
  subsets: ["latin"],
});

const IN_FRAMES = 22;
const OUT_FRAMES = 22;

const BANNER_WIDTH = 540;
const BANNER_HEIGHT = 96;
const START_OFFSCREEN_LEFT = -720;

type ChannelBannerProps = {
  durationInFrames?: number;
};

export const ChannelBanner: React.FC<ChannelBannerProps> = ({
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: videoWidth, durationInFrames: compositionDuration } =
    useVideoConfig();

  const bannerDuration = durationInFrames ?? compositionDuration;
  const outStart = Math.max(bannerDuration - OUT_FRAMES, IN_FRAMES + 18);

  const enterSpring = spring({
    frame,
    fps,
    config: {
      damping: 19,
      stiffness: 125,
      mass: 0.68,
    },
    durationInFrames: IN_FRAMES,
  });

  const enterX = interpolate(enterSpring, [0, 1], [START_OFFSCREEN_LEFT, 0], {
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

  const exitX = interpolate(
    outProgress,
    [0, 1],
    [0, videoWidth + BANNER_WIDTH + 160],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const translateX = frame < outStart ? enterX : exitX;

  const opacityIn = interpolate(frame, [0, 7], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const opacityOut = interpolate(
    frame,
    [outStart, outStart + OUT_FRAMES * 0.75, outStart + OUT_FRAMES],
    [1, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const opacity = opacityIn * opacityOut;

  const scaleIn = interpolate(enterSpring, [0, 1], [0.965, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const motionBlur = interpolate(
    frame,
    [0, 5, 13, outStart, outStart + 7, outStart + OUT_FRAMES],
    [7, 4, 0, 0, 6, 10],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const sweepOpacity = interpolate(frame, [0, 9, 24], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const outSweepOpacity = interpolate(
    frame,
    [outStart, outStart + 7, outStart + OUT_FRAMES],
    [0, 1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const shineX = interpolate(frame, [8, 42], [-160, 630], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const livePulse = interpolate(
    frame % 42,
    [0, 8, 18, 42],
    [0.72, 1, 0.82, 0.72],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const scanX = interpolate(frame % 80, [0, 80], [-120, 560], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: 30,
        left: 34,
        width: BANNER_WIDTH,
        height: BANNER_HEIGHT,
        transform: `translateX(${translateX}px) scale(${scaleIn})`,
        opacity,
        pointerEvents: "none",
        userSelect: "none",
        zIndex: 100,
        filter: `blur(${motionBlur}px)`,
      }}
    >
      {/* Fast broadcast entry/exit streak */}
      <div
        style={{
          position: "absolute",
          left: -230,
          top: 47,
          width: 900,
          height: 4,
          background:
            "linear-gradient(90deg, rgba(0,170,255,0), rgba(0,170,255,0.9), rgba(255,255,255,0.95), rgba(0,170,255,0.85), rgba(0,170,255,0))",
          filter: "blur(1.1px)",
          opacity: Math.min(sweepOpacity + outSweepOpacity, 1),
          transform: "skewX(-24deg)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(0 0, 94% 0, 100% 50%, 94% 100%, 0 100%, 4% 50%)",
          background:
            "linear-gradient(110deg, rgba(6,8,12,0.96), rgba(18,24,32,0.94) 48%, rgba(4,5,8,0.98))",
          border: "1px solid rgba(255,255,255,0.32)",
          boxShadow:
            "0 18px 42px rgba(0,0,0,0.55), 0 0 26px rgba(0,145,255,0.26)",
          overflow: "hidden",
        }}
      >
        {/* Blue news block */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 142,
            height: "100%",
            clipPath: "polygon(0 0, 86% 0, 100% 50%, 86% 100%, 0 100%)",
            background:
              "linear-gradient(135deg, rgba(0,145,255,0.98), rgba(0,78,160,0.98))",
            boxShadow: "12px 0 24px rgba(0,145,255,0.16)",
          }}
        />

        {/* Inner steel frame */}
        <div
          style={{
            position: "absolute",
            inset: 5,
            clipPath:
              "polygon(0 0, 93.5% 0, 100% 50%, 93.5% 100%, 0 100%, 4% 50%)",
            border: "1px solid rgba(255,255,255,0.16)",
          }}
        />

        {/* Technical grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.38) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.38) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            maskImage:
              "linear-gradient(90deg, transparent 0%, black 16%, black 86%, transparent 100%)",
          }}
        />

        {/* Moving scanner highlight */}
        <div
          style={{
            position: "absolute",
            top: -30,
            left: scanX,
            width: 58,
            height: 160,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12), rgba(255,255,255,0))",
            transform: "skewX(-22deg)",
            opacity: 0.55,
          }}
        />

        {/* Main shine pass */}
        <div
          style={{
            position: "absolute",
            top: -24,
            left: shineX,
            width: 96,
            height: 150,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.18), rgba(255,255,255,0))",
            transform: "skewX(-22deg)",
            opacity: 0.8,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 40,
            top: 30,
            fontFamily: titleFont,
            fontSize: 35,
            lineHeight: 1,
            color: "rgba(255,255,255,0.96)",
            letterSpacing: "0.06em",
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          NEWS
        </div>

        {/* Channel name */}
        <div
          style={{
            position: "absolute",
            left: 162,
            top: 19,
            right: 32,
            fontFamily: titleFont,
            fontSize: 43,
            lineHeight: 1,
            color: "rgba(247,249,252,0.98)",
            letterSpacing: "0.045em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            textShadow:
              "0 2px 10px rgba(0,0,0,0.85), 0 0 16px rgba(255,255,255,0.14)",
          }}
        >
          {CONFIG.channelName || "Uncover Truth"}
        </div>

        {/* Underline with hot flare */}
        <div
          style={{
            position: "absolute",
            left: 163,
            top: 59,
            width: 272,
            height: 3,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.95), rgba(0,145,255,0.95), rgba(0,145,255,0))",
            boxShadow: "0 0 14px rgba(0,145,255,0.86)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 151,
            top: 52,
            width: 58,
            height: 18,
            background:
              "radial-gradient(ellipse, rgba(255,255,255,0.98), rgba(85,205,255,0.85) 35%, rgba(0,145,255,0) 74%)",
            filter: "blur(2px)",
            opacity: livePulse,
          }}
        />

        {/* Tagline */}
        <div
          style={{
            position: "absolute",
            left: 164,
            top: 69,
            right: 38,
            fontFamily: subtitleFont,
            fontSize: 11,
            fontWeight: 800,
            color: "rgba(230,235,242,0.84)",
            letterSpacing: "0.11em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {CONFIG.channelTagline || "Breaking News • Analysis • Reports"}
        </div>

        {/* Right edge accent marks */}
        <div
          style={{
            position: "absolute",
            right: 34,
            top: 16,
            display: "flex",
            gap: 5,
            opacity: 0.88,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 45,
                background:
                  i === 1 ? "rgba(255,255,255,0.82)" : "rgba(0,145,255,0.92)",
                transform: "skewX(-22deg)",
                boxShadow: i === 1 ? "0 0 12px rgba(255,255,255,0.24)" : undefined,
              }}
            />
          ))}
        </div>

        {/* Bottom broadcast bar */}
        <div
          style={{
            position: "absolute",
            left: 7,
            right: 28,
            bottom: 0,
            height: 4,
            background:
              "linear-gradient(90deg, rgba(255,255,255,0), rgba(0,145,255,0.98), rgba(255,255,255,0.95), rgba(0,145,255,0))",
            boxShadow: "0 0 16px rgba(0,145,255,0.76)",
          }}
        />
      </div>
    </div>
  );
};
