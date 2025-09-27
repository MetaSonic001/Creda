import {
  Blur,
  Canvas,
  RadialGradient,
  Rect,
  vec
} from "@shopify/react-native-skia";
import { useEffect, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useDerivedValue, useSharedValue, withRepeat, withSpring, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("screen");

const Colors = {
  primary: "hsl(165, 100%, 35%)",
  primaryLight: "hsl(165, 100%, 45%)",
  primaryLighter: "hsl(165, 100%, 60%)",
  primaryLightest: "hsl(165, 100%, 85%)",
  white: "rgba(255, 255, 255, 1)",
};

const VISUAL_CONFIG = {
  blur: 9,
  center: {
    x: width / 2,
    y: height / 2,
  },
} as const;

const ANIMATION_CONFIG = {
  duration: {
    MOUNT: 2000,
    SPEAKING_TRANSITION: 600,
    QUIET_TRANSITION: 400,
    PULSE: 1000,
    BACKGROUND_TRANSITION: 1000,
  },
  spring: {
    damping: 10,
    stiffness: 50,
  },
} as const;

const RADIUS_CONFIG = {
  minScale: 0.6,
  maxScale: 1.4,
  speakingScale: 1.0,
  quietScale: 0.6,
  baseRadius: {
    default: width,
    speaking: width / 4,
  },
} as const;

type GradientPosition = "top" | "center" | "bottom";

interface GradientProps {
  position: GradientPosition;
  isSpeaking: boolean;
}

const getTargetY = (pos: GradientPosition): number => {
  switch (pos) {
    case "top":
      return 0;
    case "center":
      return VISUAL_CONFIG.center.y;
    case "bottom":
      return height;
    default:
      return VISUAL_CONFIG.center.y;
  }
}

const calculateRadiusBounds = (baseRadius: number) => {
  "worklet";
  return {
    min: baseRadius * RADIUS_CONFIG.minScale,
    max: baseRadius * RADIUS_CONFIG.maxScale,
  };
};

const calculateTargetRadius = (baseRadius: number, isSpeaking: boolean) => {
  "worklet";
  const { min, max } = calculateRadiusBounds(baseRadius);
  const scale = isSpeaking ? RADIUS_CONFIG.speakingScale : RADIUS_CONFIG.quietScale;
  return min + (max - min) * scale;
}

export function Gradient({ position, isSpeaking }: GradientProps) {
  const [showBackground, setShowBackground] = useState(false);
  const animatedY = useSharedValue(0);
  const radiusScale = useSharedValue(1);
  const baseRadiusValue = useSharedValue(RADIUS_CONFIG.baseRadius.default);
  const mountRadius = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  const center = useDerivedValue(() => {
    return vec(VISUAL_CONFIG.center.x, animatedY.value);
  });

  const animatedRadius = useDerivedValue(() => {
    const { min, max } = calculateRadiusBounds(baseRadiusValue.value);
    const calculatedRadius = min + (max - min) * radiusScale.value;
    return mountRadius.value < calculatedRadius ? mountRadius.value : calculatedRadius;
  });

  const backgroundAnimatedStyle = useDerivedValue(() => {
    return backgroundOpacity.value;
  });

  useEffect(() => {
    const targetY = getTargetY(position);
    animatedY.value = withSpring(targetY, ANIMATION_CONFIG.spring);
  }, [position, animatedY]);

  useEffect(() => {
    animatedY.value = getTargetY(position);
  }, []);

  useEffect(() => {
    const targetRadius = calculateTargetRadius(RADIUS_CONFIG.baseRadius.default, isSpeaking);
    mountRadius.value = withTiming(targetRadius, {
      duration: ANIMATION_CONFIG.duration.MOUNT,
    });
  }, []);

  useEffect(() => {
    const duration = ANIMATION_CONFIG.duration.SPEAKING_TRANSITION;
    if (isSpeaking) {
      baseRadiusValue.value = withTiming(RADIUS_CONFIG.baseRadius.speaking)
      animatedY.value = withTiming(getTargetY("center"), { duration });
    }
    else {
      baseRadiusValue.value = withTiming(RADIUS_CONFIG.baseRadius.default);
      animatedY.value = withTiming(getTargetY(position), { duration });
    }
  }, [isSpeaking, baseRadiusValue, animatedY, position]);

  useEffect(() => {
    if (isSpeaking) {
      radiusScale.value = withRepeat(
        withTiming(RADIUS_CONFIG.speakingScale, { duration: ANIMATION_CONFIG.duration.PULSE }),
        -1,
        true
      )
    }
    else {
      radiusScale.value = withTiming(RADIUS_CONFIG.quietScale, { duration: ANIMATION_CONFIG.duration.QUIET_TRANSITION })
    }
  }, [isSpeaking, radiusScale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      backgroundOpacity.value = withTiming(1, {
        duration: ANIMATION_CONFIG.duration.BACKGROUND_TRANSITION,
      });
      setShowBackground(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]}>
      <Canvas style={{ flex: 1 }}>
        {/* Background Rectangle with Primary Color Gradient */}
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={center}
            r={animatedRadius}
            colors={[
              Colors.primary,
              Colors.primaryLight,
              Colors.primaryLighter,
              Colors.primaryLightest,
              Colors.white
            ]}
          />
          <Blur blur={VISUAL_CONFIG.blur} mode={"clamp"} />
        </Rect>

        {/* Optional: Overlay white rectangle with opacity */}
        {showBackground && (
          <Rect x={0} y={0} width={width} height={height} color={`rgba(255, 255, 255, ${backgroundOpacity.value})`} />
        )}
      </Canvas>
    </View>
  );
}

