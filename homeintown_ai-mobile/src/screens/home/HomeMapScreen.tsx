import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Platform,
  Linking,
  Alert,
  Modal,
  Image,
} from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { Colors, Typography, Spacing, BorderRadius, Shadows, CATEGORY_TABS } from '../../constants';
import { projectService } from '../../services';
import { ProjectProperty } from '../../types';
import MarkerGenerator from '../../components/map/MarkerGenerator';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.72;

// Default center: Pune, India (common real estate location)
const DEFAULT_REGION: Region = {
  latitude: 18.5204,
  longitude: 73.8567,
  latitudeDelta: 0.3,
  longitudeDelta: 0.3,
};

// Fallback sample properties when API is unavailable
const FALLBACK_PROPERTIES: ProjectProperty[] = [
  {
    id: 'demo-1',
    property_name: 'Green Valley Residency',
    description: 'Premium 2/3 BHK apartments',
    property_location: 'Hinjewadi, Pune',
    address: 'Hinjewadi Phase 2, Pune',
    price: '₹85 L',
    price_short: '₹85L',
    type: 'flat',
    builder: 'ABC Developers',
    rating: 4.5,
    amenities: ['Swimming Pool', 'Gym', 'Garden', 'Parking', 'Club House', '24/7 Security'],
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600',
    status: 'published',
    lat: 18.5913,
    lng: 73.7389,
    slug: 'green-valley-residency',
    cta: { callNumber: '9876543210', whatsappNumber: '9876543210', buttonText: 'Book Site Visit' },
    bhkOptions: ['2 BHK', '3 BHK'],
    projectStatus: 'under-construction',
    carpetAreaRange: '850 - 1250 sqft',
    floorRange: '1 - 22',
    startingPrice: 8500000,
    pricePerSqFt: 7500,
    reraApproved: true,
    reraNumber: '52100012345',
    gatedCommunity: true,
    bankLoanAvailable: true,
    facingOptions: ['East', 'North'],
    city: 'Pune',
    location: 'Hinjewadi',
  },
  {
    id: 'demo-2',
    property_name: 'Sunrise Heights',
    description: 'Luxury 3/4 BHK apartments',
    property_location: 'Baner, Pune',
    address: 'Baner Road, Pune',
    price: '₹1.2 Cr',
    price_short: '₹1.2Cr',
    type: 'flat',
    builder: 'XYZ Builders',
    rating: 4.8,
    amenities: ['Rooftop Pool', 'Spa', 'Gym', 'Jogging Track', 'Tennis Court'],
    image: 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?w=600',
    status: 'published',
    lat: 18.5596,
    lng: 73.7868,
    slug: 'sunrise-heights',
    cta: { callNumber: '9876543211', whatsappNumber: '9876543211', buttonText: 'Book Visit' },
    bhkOptions: ['3 BHK', '4 BHK'],
    projectStatus: 'ready-to-move',
    carpetAreaRange: '1200 - 1800 sqft',
    floorRange: '1 - 30',
    startingPrice: 12000000,
    pricePerSqFt: 9200,
    reraApproved: true,
    reraNumber: '52100067890',
    gatedCommunity: true,
    bankLoanAvailable: true,
    facingOptions: ['West', 'South'],
    city: 'Pune',
    location: 'Baner',
  },
  {
    id: 'demo-3',
    property_name: 'Royal Orchid Plots',
    description: 'NA Plots with clear title',
    property_location: 'Wagholi, Pune',
    address: 'Wagholi, Pune',
    price: '₹35 L',
    price_short: '₹35L',
    type: 'plot',
    builder: 'Royal Group',
    rating: 4.2,
    amenities: ['Garden', 'Compound Wall', 'Road', 'Water Supply', 'Electricity'],
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600',
    status: 'published',
    lat: 18.5806,
    lng: 73.9771,
    slug: 'royal-orchid-plots',
    cta: { callNumber: '9876543212', whatsappNumber: '9876543212', buttonText: 'Book Visit' },
    bhkOptions: [],
    projectStatus: 'ready-to-move',
    plotSizeRange: '1500 - 3000 sqft',
    startingPrice: 3500000,
    pricePerSqFt: 2500,
    reraApproved: true,
    reraNumber: '52100011122',
    city: 'Pune',
    location: 'Wagholi',
  },
  {
    id: 'demo-4',
    property_name: 'Paradise Villa',
    description: 'Independent villas with garden',
    property_location: 'Kharadi, Pune',
    address: 'Kharadi, Pune',
    price: '₹2.5 Cr',
    price_short: '₹2.5Cr',
    type: 'villa',
    builder: 'Paradise Homes',
    rating: 4.7,
    amenities: ['Private Garden', 'Swimming Pool', 'Parking', 'Terrace', 'Servant Quarter'],
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600',
    status: 'published',
    lat: 18.5525,
    lng: 73.9432,
    slug: 'paradise-villa',
    cta: { callNumber: '9876543213', whatsappNumber: '9876543213', buttonText: 'Schedule Visit' },
    bhkOptions: ['4 BHK', '5 BHK'],
    projectStatus: 'under-construction',
    carpetAreaRange: '2500 - 4000 sqft',
    startingPrice: 25000000,
    pricePerSqFt: 8500,
    reraApproved: true,
    reraNumber: '52100033344',
    gatedCommunity: true,
    bankLoanAvailable: true,
    facingOptions: ['North', 'East'],
    city: 'Pune',
    location: 'Kharadi',
  },
  {
    id: 'demo-5',
    property_name: 'Metro Park Apartments',
    description: 'Budget-friendly 1/2 BHK near metro',
    property_location: 'Wakad, Pune',
    address: 'Wakad, Pune',
    price: '₹45 L',
    price_short: '₹45L',
    type: 'flat',
    builder: 'Metro Developers',
    rating: 4.0,
    amenities: ['Gym', 'Parking', 'Lift', 'CCTV', 'Power Backup'],
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600',
    status: 'published',
    lat: 18.5986,
    lng: 73.7603,
    slug: 'metro-park-apartments',
    cta: { callNumber: '9876543214', whatsappNumber: '9876543214', buttonText: 'Book Visit' },
    bhkOptions: ['1 BHK', '2 BHK'],
    projectStatus: 'pre-launch',
    carpetAreaRange: '450 - 750 sqft',
    floorRange: '1 - 15',
    startingPrice: 4500000,
    pricePerSqFt: 6500,
    reraApproved: false,
    city: 'Pune',
    location: 'Wakad',
  },
];

export default function HomeMapScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);

  const [properties, setProperties] = useState<ProjectProperty[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<ProjectProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [region, setRegion] = useState<Region>(DEFAULT_REGION);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showDirectionsPanel, setShowDirectionsPanel] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const cardListRef = useRef<FlatList>(null);
  const [markerImages, setMarkerImages] = useState<Record<string, string>>({});
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [incompleteProperties, setIncompleteProperties] = useState<{ name: string; reason: string }[]>([]);
  const [showIncompletePanel, setShowIncompletePanel] = useState(false);

  // Fetch properties on mount
  useEffect(() => {
    fetchProperties();
    requestLocation();
  }, []);

  // Filter properties when category or search changes
  useEffect(() => {
    filterProperties();
  }, [activeCategory, searchQuery, properties]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { properties: data, incompleteProperties: incomplete } = await projectService.getAllProjects();
      setIncompleteCount(incomplete.length);
      setIncompleteProperties(incomplete);
      if (data && data.length > 0) {
        setProperties(data);
        setFilteredProperties(data);
        fitMapToProperties(data);
      } else {
        // No data from API, use fallback
        loadFallbackProperties();
      }
    } catch (error) {
      // API failed — use fallback properties silently
      loadFallbackProperties();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackProperties = () => {
    setProperties(FALLBACK_PROPERTIES);
    setFilteredProperties(FALLBACK_PROPERTIES);
    fitMapToProperties(FALLBACK_PROPERTIES);
  };

  const fitMapToProperties = (data: ProjectProperty[]) => {
    if (data.length > 0 && mapRef.current) {
      const coords = data.map((p) => ({ latitude: p.lat, longitude: p.lng }));
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 150, right: 50, bottom: 100, left: 50 },
          animated: true,
        });
      }, 500);
    }
  };

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch {
      // Use default region
    }
  };

  const filterProperties = useCallback(() => {
    let filtered = [...properties];

    // Category filter
    if (activeCategory !== 'All') {
      const categoryMap: Record<string, string> = {
        Flat: 'flat',
        Plot: 'plot',
        Villa: 'villa',
        Rent: 'rent',
      };
      const target = categoryMap[activeCategory];
      if (target) {
        filtered = filtered.filter(
          (p) => p.type.toLowerCase().includes(target)
        );
      }
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.property_name.toLowerCase().includes(query) ||
          p.property_location.toLowerCase().includes(query) ||
          (p.city && p.city.toLowerCase().includes(query)) ||
          (p.location && p.location.toLowerCase().includes(query))
      );
    }

    setFilteredProperties(filtered);
  }, [properties, activeCategory, searchQuery]);

  const handleSearch = () => {
    filterProperties();

    // Zoom to first result
    if (filteredProperties.length > 0 && mapRef.current) {
      const first = filteredProperties[0];
      mapRef.current.animateToRegion({
        latitude: first.lat,
        longitude: first.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  };

  const handleCategoryChange = (name: string) => {
    setActiveCategory(name);
  };

  const handleMarkerPress = (property: ProjectProperty) => {
    navigation.navigate('PropertyDetail', { property });
  };

  const handleMyLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    } catch {
      Alert.alert('Location Error', 'Unable to get your location. Please enable location services.');
    }
  };

  const handleDirections = () => {
    setShowDirectionsPanel(true);
  };

  const handleNavigateToProperty = (property: ProjectProperty) => {
    setShowDirectionsPanel(false);
    // Open Google Maps for directions to this specific property
    const url = Platform.select({
      android: `google.navigation:q=${property.lat},${property.lng}`,
      ios: `maps://app?daddr=${property.lat},${property.lng}`,
      default: `https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`
        );
      });
    }
  };

  const renderCategoryChip = ({ item }: { item: typeof CATEGORY_TABS[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        activeCategory === item.name && styles.categoryChipActive,
      ]}
      onPress={() => handleCategoryChange(item.name)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryText,
          activeCategory === item.name && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: 140, right: 0, bottom: 0, left: 0 }}
      >
        {filteredProperties.map((property, index) => (
          <Marker
            key={property.id}
            coordinate={{ latitude: property.lat, longitude: property.lng }}
            onPress={() => {
              setSelectedIndex(index);
              cardListRef.current?.scrollToIndex({ index, animated: true });
            }}
            pinColor={selectedIndex === index ? '#1877F2' : '#15803D'}
            title={property.property_name}
            description={property.price_short}
          />
        ))}
      </MapView>

      {/* Search Overlay */}
      <View style={styles.searchOverlay}>
        {/* Logo */}
        <View style={styles.logoRow}>
          <Text style={styles.logoText}>HomeInTown</Text>
          <Text style={styles.logoAi}>.ai</Text>
        </View>

        {/* Search Bar Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search Area, City, Town"
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearch} style={styles.searchButton}>
              <Ionicons name="arrow-forward" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.micButton}>
              <Ionicons name="mic" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={[styles.filterButton, incompleteCount > 0 && styles.filterButtonWarning]} onPress={() => setShowIncompletePanel(true)} activeOpacity={0.7}>
            <Ionicons name="warning" size={18} color={incompleteCount > 0 ? '#FFFFFF' : Colors.textPrimary} />
            {incompleteCount > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{incompleteCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Category Chips */}
        <FlatList
          data={CATEGORY_TABS}
          renderItem={renderCategoryChip}
          keyExtractor={(item) => item.name}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Right Side FABs */}
      <View style={styles.fabColumn}>
        {/* Directions Button */}
        <TouchableOpacity style={styles.fab} onPress={handleDirections} activeOpacity={0.8}>
          <Ionicons name="navigate" size={20} color={Colors.primary} />
        </TouchableOpacity>

        {/* My Location FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleMyLocation} activeOpacity={0.8}>
          <Ionicons name="locate" size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* AI Guide Button */}
      <TouchableOpacity style={styles.aiGuideButton} activeOpacity={0.8}>
        <Text style={styles.aiGuideIcon}>🎧</Text>
        <Text style={styles.aiGuideText}>24/7 AI Guide</Text>
      </TouchableOpacity>

      {/* Property Count Badge */}
      {!loading && filteredProperties.length > 0 && (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
          </Text>
        </View>
      )}

      {/* Bottom Property Cards Carousel */}
      {!loading && filteredProperties.length > 0 && (
        <View style={styles.cardCarousel}>
          <FlatList
            ref={cardListRef}
            data={filteredProperties}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_WIDTH + 12}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardListContent}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 12));
              if (index >= 0 && index < filteredProperties.length) {
                setSelectedIndex(index);
                const prop = filteredProperties[index];
                mapRef.current?.animateToRegion({
                  latitude: prop.lat,
                  longitude: prop.lng,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }, 300);
              }
            }}
            keyExtractor={(item) => `card-${item.id}`}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[styles.propertyCard, selectedIndex === index && styles.propertyCardActive]}
                activeOpacity={0.9}
                onPress={() => handleMarkerPress(item)}
              >
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/100x80/f3f4f6/9ca3af?text=No+Image' }}
                  style={styles.cardImage}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.property_name}</Text>
                  <Text style={styles.cardLocation} numberOfLines={1}>📍 {item.property_location}</Text>
                  <View style={styles.cardPriceRow}>
                    <Text style={styles.cardPrice}>{item.price_short}</Text>
                    {item.bhkOptions && item.bhkOptions.length > 0 && (
                      <Text style={styles.cardBhk}>{item.bhkOptions[0]}</Text>
                    )}
                  </View>
                  <View style={styles.cardCtaRow}>
                    {item.cta?.callNumber && (
                      <TouchableOpacity
                        style={styles.cardCtaBtn}
                        onPress={(e) => {
                          e.stopPropagation();
                          Linking.openURL(`tel:${item.cta!.callNumber}`);
                        }}
                      >
                        <Text style={styles.cardCtaText}>📞 Call</Text>
                      </TouchableOpacity>
                    )}
                    {item.cta?.whatsappNumber && (
                      <TouchableOpacity
                        style={[styles.cardCtaBtn, styles.cardCtaWhatsapp]}
                        onPress={(e) => {
                          e.stopPropagation();
                          Linking.openURL(`https://wa.me/91${item.cta!.whatsappNumber}`);
                        }}
                      >
                        <Text style={styles.cardCtaTextWhatsapp}>💬 WhatsApp</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading properties...</Text>
        </View>
      )}

      {/* Directions Panel (Bottom Sheet) */}
      {/* Marker Image Generator (offscreen) */}
      <MarkerGenerator
        markers={filteredProperties.map((p) => ({ id: p.id, price: p.price_short }))}
        onImagesReady={(images) => setMarkerImages(images)}
      />

      <Modal
        visible={showDirectionsPanel}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDirectionsPanel(false)}
      >
        <View style={styles.directionsOverlay}>
          <TouchableOpacity
            style={styles.directionsBackdrop}
            onPress={() => setShowDirectionsPanel(false)}
            activeOpacity={1}
          />
          <View style={styles.directionsPanel}>
            {/* Handle bar */}
            <View style={styles.directionsHandle}>
              <View style={styles.handleBar} />
            </View>

            {/* Header */}
            <View style={styles.directionsPanelHeader}>
              <Text style={styles.directionsPanelTitle}>Directions</Text>
              <TouchableOpacity onPress={() => setShowDirectionsPanel(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Properties List */}
            <FlatList
              data={filteredProperties}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.directionsListContent}
              renderItem={({ item }) => (
                <View style={styles.directionsItem}>
                  <Image
                    source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                    style={styles.directionsItemImage}
                  />
                  <View style={styles.directionsItemInfo}>
                    <Text style={styles.directionsItemName} numberOfLines={1}>
                      {item.property_name}
                    </Text>
                    <Text style={styles.directionsItemLocation} numberOfLines={1}>
                      📍 {item.property_location}
                    </Text>
                    <Text style={styles.directionsItemPrice}>{item.price_short}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.navigateButton}
                    onPress={() => handleNavigateToProperty(item)}
                  >
                    <Ionicons name="navigate" size={16} color={Colors.textInverse} />
                  </TouchableOpacity>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Incomplete Properties Panel */}
      <Modal
        visible={showIncompletePanel}
        animationType="slide"
        transparent
        onRequestClose={() => setShowIncompletePanel(false)}
      >
        <View style={styles.directionsOverlay}>
          <TouchableOpacity
            style={styles.directionsBackdrop}
            onPress={() => setShowIncompletePanel(false)}
            activeOpacity={1}
          />
          <View style={styles.directionsPanel}>
            <View style={styles.directionsHandle}>
              <View style={styles.handleBar} />
            </View>

            <View style={styles.directionsPanelHeader}>
              <View>
                <Text style={styles.directionsPanelTitle}>Incomplete Properties</Text>
                <Text style={styles.incompletePanelSubtitle}>
                  Properties that can't be shown on map
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowIncompletePanel(false)}>
                <Ionicons name="close" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={incompleteProperties}
              keyExtractor={(_, i) => `incomplete-${i}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.directionsListContent}
              ListEmptyComponent={
                <View style={styles.emptyIncomplete}>
                  <Ionicons name="checkmark-circle" size={40} color={Colors.primary} />
                  <Text style={styles.emptyIncompleteText}>All properties have valid locations!</Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.incompleteItem}>
                  <View style={styles.incompleteIconWrap}>
                    <Ionicons name="location-outline" size={20} color="#F59E0B" />
                  </View>
                  <View style={styles.incompleteInfo}>
                    <Text style={styles.incompleteItemName}>{item.name}</Text>
                    <Text style={styles.incompleteItemReason}>{item.reason}</Text>
                  </View>
                </View>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },

  // Search Overlay
  searchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingHorizontal: Spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  logoText: {
    fontSize: Typography.h4,
    fontWeight: Typography.black,
    color: Colors.primary,
  },
  logoAi: {
    fontSize: Typography.h4,
    fontWeight: Typography.black,
    color: Colors.textPrimary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.bodySmall,
    color: Colors.textPrimary,
  },
  searchButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
  micButton: {
    padding: Spacing.sm,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  filterButtonWarning: {
    backgroundColor: '#F59E0B',
    borderColor: '#D97706',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },
  categoryList: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  categoryChipActive: {
    backgroundColor: Colors.secondary,
    borderColor: Colors.secondary,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textPrimary,
  },
  categoryTextActive: {
    color: Colors.textInverse,
  },

  // Map Markers
  mapMarker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  mapMarkerActive: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  mapMarkerDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  mapMarkerDotActive: {
    backgroundColor: '#FFFFFF',
  },
  mapMarkerPrice: {
    fontSize: 12,
    fontWeight: '800' as const,
    color: '#111827',
  },
  mapMarkerPriceActive: {
    color: '#FFFFFF',
  },

  // FABs
  fabColumn: {
    position: 'absolute',
    bottom: 185,
    right: Spacing.lg,
    gap: Spacing.md,
  },
  fab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  incompleteFab: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  incompleteBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  incompleteBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: '#FFFFFF',
  },

  // AI Guide
  aiGuideButton: {
    position: 'absolute',
    bottom: 175,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
    ...Shadows.lg,
  },
  aiGuideIcon: {
    fontSize: 16,
  },
  aiGuideText: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.medium,
    color: Colors.textInverse,
  },

  // Count Badge
  countBadge: {
    position: 'absolute',
    bottom: 170,
    alignSelf: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    ...Shadows.md,
  },
  countText: {
    fontSize: Typography.caption,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },

  // Bottom Property Card Carousel
  cardCarousel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
  },
  cardListContent: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
  propertyCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  propertyCardActive: {
    borderColor: '#15803D',
    borderWidth: 2,
  },
  cardImage: {
    width: 90,
    height: '100%',
    minHeight: 110,
    backgroundColor: '#F3F4F6',
  },
  cardInfo: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  cardName: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#111827',
  },
  cardLocation: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  cardPrice: {
    fontSize: 15,
    fontWeight: '900' as const,
    color: '#111827',
  },
  cardBhk: {
    fontSize: 10,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cardCtaRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  cardCtaBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cardCtaText: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#374151',
  },
  cardCtaWhatsapp: {
    backgroundColor: '#22C55E',
    borderColor: '#22C55E',
  },
  cardCtaTextWhatsapp: {
    fontSize: 10,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },

  // Loading
  loadingOverlay: {
    position: 'absolute',
    top: '45%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.lg,
  },
  loadingText: {
    fontSize: Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },

  // Directions Panel
  directionsOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  directionsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  directionsPanel: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '60%',
    paddingBottom: Spacing.xxl,
  },
  directionsHandle: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.divider,
  },
  directionsPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  directionsPanelTitle: {
    fontSize: Typography.h3,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  directionsListContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  directionsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  directionsItemImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surfaceAlt,
  },
  directionsItemInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  directionsItemName: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  directionsItemLocation: {
    fontSize: Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  directionsItemPrice: {
    fontSize: Typography.bodySmall,
    fontWeight: Typography.bold,
    color: Colors.primary,
    marginTop: 2,
  },
  navigateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },

  // Incomplete Panel
  incompletePanelSubtitle: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  emptyIncomplete: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyIncompleteText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500' as const,
  },
  incompleteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.borderLight,
  },
  incompleteIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  incompleteInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  incompleteItemName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textPrimary,
  },
  incompleteItemReason: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});
