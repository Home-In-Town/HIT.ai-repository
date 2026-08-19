import React, { useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { captureRef } from 'react-native-view-shot';

interface MarkerData {
  id: string;
  price: string;
}

interface MarkerGeneratorProps {
  markers: MarkerData[];
  onImagesReady: (images: Record<string, string>) => void;
}

/**
 * Renders marker views offscreen, captures them as PNG images,
 * then passes the image URIs back via onImagesReady callback.
 * This avoids the Android react-native-maps custom marker clipping bug.
 */
export default function MarkerGenerator({ markers, onImagesReady }: MarkerGeneratorProps) {
  const refs = useRef<Record<string, View | null>>({});
  const captured = useRef(false);

  useEffect(() => {
    if (markers.length === 0 || captured.current) return;
    // Wait for views to render, then capture
    const timer = setTimeout(() => captureAll(), 500);
    return () => clearTimeout(timer);
  }, [markers]);

  const captureAll = useCallback(async () => {
    if (captured.current) return;
    const images: Record<string, string> = {};

    for (const marker of markers) {
      const ref = refs.current[marker.id];
      if (ref) {
        try {
          const uri = await captureRef(ref, {
            format: 'png',
            quality: 1,
            result: 'tmpfile',
          });
          images[marker.id] = uri;
        } catch {
          // Skip this marker, will use fallback pin
        }
      }
    }

    if (Object.keys(images).length > 0) {
      captured.current = true;
      onImagesReady(images);
    }
  }, [markers, onImagesReady]);

  return (
    <View style={styles.offscreen} pointerEvents="none">
      {markers.map((marker) => (
        <View
          key={marker.id}
          ref={(r) => { refs.current[marker.id] = r; }}
          collapsable={false}
          style={styles.markerView}
        >
          <View style={styles.pill}>
            <View style={styles.dot} />
            <Text style={styles.price}>{marker.price}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  offscreen: {
    position: 'absolute',
    top: -2000,
    left: -2000,
  },
  markerView: {
    marginBottom: 10,
    backgroundColor: 'transparent',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  price: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
});
