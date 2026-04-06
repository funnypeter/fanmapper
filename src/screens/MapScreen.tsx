import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../components/Text';
import { useTheme } from '../theme/ThemeContext';

interface MapMarkerCategory {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}

const DEFAULT_CATEGORIES: MapMarkerCategory[] = [
  { id: 'bosses', name: 'Bosses', icon: 'skull', enabled: true },
  { id: 'graces', name: 'Sites of Grace', icon: 'bonfire', enabled: true },
  { id: 'items', name: 'Items', icon: 'cube', enabled: true },
  { id: 'dungeons', name: 'Dungeons', icon: 'business', enabled: true },
  { id: 'npcs', name: 'NPCs', icon: 'people', enabled: false },
  { id: 'merchants', name: 'Merchants', icon: 'cart', enabled: false },
];

function buildMapHtml(wiki: string, mapName: string, categories: MapMarkerCategory[]): string {
  const enabledIds = categories.filter((c) => c.enabled).map((c) => `"${c.id}"`).join(',');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0D1117; overflow: hidden; }
    #map { width: 100vw; height: 100vh; background: #0D1117; }
    .leaflet-popup-content-wrapper {
      background: #161B22;
      color: #F0F6FC;
      border: 1px solid #30363D;
      border-radius: 12px;
    }
    .leaflet-popup-tip { background: #161B22; }
    .leaflet-popup-content { font-family: -apple-system, sans-serif; font-size: 14px; }
    .leaflet-popup-content h3 { margin: 0 0 4px; font-size: 15px; }
    .leaflet-popup-content p { margin: 0; color: #8B949E; font-size: 12px; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      crs: L.CRS.Simple,
      minZoom: -2,
      maxZoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    // Set initial view
    map.setView([0, 0], 0);

    // Try loading Fandom interactive map data
    fetch('https://${wiki}.fandom.com/api.php?action=getmap&name=${encodeURIComponent(mapName)}&format=json')
      .then(r => r.json())
      .then(data => {
        if (data && data.markers) {
          const enabledCategories = [${enabledIds}];
          data.markers.forEach(marker => {
            if (marker.categoryId && !enabledCategories.includes(marker.categoryId)) return;
            const m = L.marker([marker.lat || 0, marker.lng || 0]);
            const popup = '<h3>' + (marker.title || 'Unknown') + '</h3>' +
                         (marker.description ? '<p>' + marker.description + '</p>' : '');
            m.bindPopup(popup);
            m.addTo(map);
          });
        }

        // If tile layers available
        if (data && data.tileLayers) {
          data.tileLayers.forEach(layer => {
            L.tileLayer(layer.url, {
              bounds: layer.bounds ? L.latLngBounds(layer.bounds) : undefined,
            }).addTo(map);
          });
        }
      })
      .catch(err => {
        // Fallback: show placeholder
        document.getElementById('map').innerHTML =
          '<div style="display:flex;align-items:center;justify-content:center;height:100vh;color:#8B949E;font-family:sans-serif;">' +
          '<p>Map data loading failed. Check connection.</p></div>';
      });

    // Send marker tap events to React Native
    map.on('popupopen', function(e) {
      const content = e.popup.getContent();
      window.ReactNativeWebView?.postMessage(JSON.stringify({
        type: 'marker_tap',
        content: content,
      }));
    });
  </script>
</body>
</html>`;
}

export default function MapScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ Map: { wiki: string; mapName: string; gameTitle: string } }, 'Map'>>();
  const { wiki, mapName, gameTitle } = route.params;

  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [showFilters, setShowFilters] = useState(false);
  const webviewRef = useRef<WebView>(null);

  function toggleCategory(id: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  }

  const html = buildMapHtml(wiki, mapName, categories);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header overlay */}
      <View style={[styles.headerOverlay, { backgroundColor: theme.colors.bg + 'DD' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text variant="body" style={{ marginLeft: 12, flex: 1, fontWeight: '600' }} numberOfLines={1}>
          {gameTitle} — {mapName}
        </Text>
        <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
          <Ionicons name="filter" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter panel */}
      {showFilters && (
        <View style={[styles.filterPanel, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text variant="caption" style={{ fontWeight: '600', marginBottom: 8 }}>Filter Markers</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => toggleCategory(cat.id)}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: cat.enabled ? theme.colors.primary : theme.colors.surfaceElevated,
                    borderColor: cat.enabled ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Text variant="caption" style={{ color: cat.enabled ? '#FFF' : theme.colors.textSecondary }}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Map WebView */}
      <WebView
        ref={webviewRef}
        source={{ html }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
      />

      {/* Attribution */}
      <View style={[styles.attribution, { backgroundColor: theme.colors.bg + 'CC' }]}>
        <Text variant="caption" style={{ color: theme.colors.textMuted, fontSize: 9 }}>
          Map: {wiki}.fandom.com — CC BY-SA 3.0 | Leaflet
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterPanel: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    zIndex: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  webview: { flex: 1, marginTop: 90 },
  attribution: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
});
